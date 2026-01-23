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
    const allProducts = await Product.find().limit(50); // Removed .populate('userId', 'name')

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

export default router;

