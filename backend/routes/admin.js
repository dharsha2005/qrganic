import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../utils/emailService.js';

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).countDocuments();
    const farmers = await User.find({ role: 'farmer' }).countDocuments();
    const fpos = await User.find({ role: 'fpo' }).countDocuments();
    const products = await Product.find().countDocuments();

    const allUsers = await User.find().select('name email role userId address contact fpoId farmerApplication').limit(50);
    const allProducts = await Product.find().select('name quantity quality userId productId').limit(50);

    res.json({
      success: true,
      stats: {
        users,
        farmers,
        fpos,
        products,
      },
      allUsers,
      allProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/admin/fpos
// @desc    Get all FPOs
// @access  Private (Admin)
router.get('/fpos', protect, authorize('admin'), async (req, res) => {
  try {
    const fpos = await User.find({ role: 'fpo' }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: fpos.length,
      fpos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/admin/farmers
// @desc    Get all farmers
// @access  Private (Admin)
router.get('/farmers', protect, authorize('admin'), async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: farmers.length,
      farmers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/admin/fpo
// @desc    Add a new FPO
// @access  Private (Admin)
router.post('/fpo', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, address, contact } = req.body;

    const fpoExists = await User.findOne({ email });
    if (fpoExists) {
      return res.status(400).json({
        success: false,
        message: 'FPO with this email already exists',
      });
    }

    const fpo = await User.create({
      name,
      email,
      password,
      role: 'fpo',
      address: address || '',
      contact: contact || '',
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      if (admin.email !== req.user.email) {
        const emailData = emailTemplates.fpoAdded(req.user.name, fpo.name, admins.map(a => a.name));
        await sendEmail({
          email: admin.email,
          subject: emailData.subject,
          html: emailData.html,
        });
      }
    }

    res.status(201).json({
      success: true,
      fpo: {
        id: fpo._id,
        userId: fpo.userId,
        name: fpo.name,
        email: fpo.email,
        role: fpo.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/admin/farmer
// @desc    Add a new farmer
// @access  Private (Admin)
router.post('/farmer', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, address, contact, fpoId, location } = req.body;

    const farmerExists = await User.findOne({ email });
    if (farmerExists) {
      return res.status(400).json({
        success: false,
        message: 'Farmer with this email already exists',
      });
    }

    const farmer = await User.create({
      name,
      email,
      password,
      role: 'farmer',
      address: address || '',
      contact: contact || '',
      fpoId: fpoId || '',
      farmerApplication: {
        status: 'approved',
        location: location || '',
      },
    });

    // Notify FPO
    if (fpoId) {
      const fpo = await User.findOne({ userId: fpoId });
      if (fpo) {
        const emailData = emailTemplates.farmerAdded(req.user.name, farmer.name, fpo.name);
        await sendEmail({
          email: fpo.email,
          subject: emailData.subject,
          html: emailData.html,
        });
      }
    }

    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      if (admin.email !== req.user.email) {
        const emailData = emailTemplates.farmerAdded(req.user.name, farmer.name, 'System');
        await sendEmail({
          email: admin.email,
          subject: `New Farmer Added: ${farmer.name}`,
          html: emailData.html,
        });
      }
    }

    res.status(201).json({
      success: true,
      farmer: {
        id: farmer._id,
        userId: farmer.userId,
        name: farmer.name,
        email: farmer.email,
        role: farmer.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/admin/users/:userId
// @desc    Remove a user (any role)
// @access  Private (Admin)
router.delete('/users/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If user is a farmer, remove their products
    if (user.role === 'farmer') {
      await Product.deleteMany({ userId: req.params.userId });
    }

    // If user is an FPO, update associated farmers
    if (user.role === 'fpo') {
      await User.updateMany(
        { fpoId: req.params.userId },
        { $unset: { fpoId: 1 } }
      );
    }

    await User.deleteOne({ userId: req.params.userId });

    res.json({
      success: true,
      message: 'User removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/admin/products/:productId
// @desc    Remove a product
// @access  Private (Admin)
router.delete('/products/:productId', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Product.deleteOne({ productId: req.params.productId });

    res.json({
      success: true,
      message: 'Product deleted permanently from system',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/admin/fpos/:fpoId
// @desc    Remove an FPO
// @access  Private (Admin)
router.delete('/fpos/:fpoId', protect, authorize('admin'), async (req, res) => {
  try {
    const fpo = await User.findOne({ userId: req.params.fpoId, role: 'fpo' });

    if (!fpo) {
      return res.status(404).json({
        success: false,
        message: 'FPO not found',
      });
    }

    if (fpo.role !== 'fpo') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove user - not an FPO',
      });
    }

    // Update all farmers associated with this FPO
    await User.updateMany(
      { fpoId: req.params.fpoId },
      { $unset: { fpoId: 1 } }
    );

    await User.deleteOne({ userId: req.params.fpoId });

    res.json({
      success: true,
      message: 'FPO removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/admin/farmers/:farmerId
// @desc    Remove a farmer and their products
// @access  Private (Admin)
router.delete('/farmers/:farmerId', protect, authorize('admin'), async (req, res) => {
  try {
    const farmer = await User.findOne({ userId: req.params.farmerId, role: 'farmer' });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found',
      });
    }

    if (farmer.role !== 'farmer') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove user - not a farmer',
      });
    }

    // Remove all products from this farmer
    await Product.deleteMany({ userId: req.params.farmerId });

    await User.deleteOne({ userId: req.params.farmerId });

    res.json({
      success: true,
      message: 'Farmer and their products removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;

