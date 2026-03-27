import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../utils/emailService.js';

const router = express.Router();

// @route   GET /api/fpo/applications
// @desc    Get all pending farmer applications
// @access  Private (FPO)
router.get('/applications', protect, authorize('fpo'), async (req, res) => {
  try {
    const applications = await User.find({
      'farmerApplication.status': 'pending',
      fpoId: req.user.userId,
    }).select('name email userId farmerApplication address contact');

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/fpo/applications/:userId/approve
// @desc    Approve a farmer application
// @access  Private (FPO)
router.put('/applications/:userId/approve', protect, authorize('fpo'), async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.fpoId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this application',
      });
    }

    user.role = 'farmer';
    user.farmerApplication.status = 'approved';
    user.farmerApplication.reviewedAt = new Date();
    user.farmerApplication.reviewedBy = req.user.userId;
    await user.save();

    // Send approval email
    const emailData = emailTemplates.farmerApplicationApproved(user.name);
    await sendEmail({
      email: user.email,
      subject: emailData.subject,
      html: emailData.html,
    });

    res.json({
      success: true,
      message: 'Application approved successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/fpo/applications/:userId/reject
// @desc    Reject a farmer application
// @access  Private (FPO)
router.put('/applications/:userId/reject', protect, authorize('fpo'), async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.fpoId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this application',
      });
    }

    user.farmerApplication.status = 'rejected';
    user.farmerApplication.reviewedAt = new Date();
    user.farmerApplication.reviewedBy = req.user.userId;
    await user.save();

    // Send rejection email
    const emailData = emailTemplates.farmerApplicationRejected(user.name);
    await sendEmail({
      email: user.email,
      subject: emailData.subject,
      html: emailData.html,
    });

    res.json({
      success: true,
      message: 'Application rejected',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/fpo/farmers
// @desc    Get all farmers under this FPO
// @access  Private (FPO)
router.get('/farmers', protect, authorize('fpo'), async (req, res) => {
  try {
    const startTime = Date.now();
    console.log('🟢 FPO userId requesting farmers:', req.user.userId);
    
    const farmers = await User.find({
      role: 'farmer',
      fpoId: req.user.userId,
    })
    .select('name email userId address contact farmerApplication')
    .lean() // Use lean() for better performance
    .limit(1000); // Add reasonable limit
    
    const endTime = Date.now();
    console.log('🟢 Farmers found:', farmers.length, 'in', endTime - startTime, 'ms');

    res.json({
      success: true,
      count: farmers.length,
      farmers,
    });
  } catch (error) {
    console.error('🟢 Error fetching farmers:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/fpo/products
// @desc    Get all products from farmers under this FPO
// @access  Private (FPO)
router.get('/products', protect, authorize('fpo'), async (req, res) => {
  try {
    const products = await Product.find({ fpoId: req.user.userId })
      .populate('seller', 'name email contact')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/fpo/products/expired
// @desc    Get expired or near-expiry products
// @access  Private (FPO)
router.get('/products/expired', protect, authorize('fpo'), async (req, res) => {
  try {
    const now = new Date();
    const products = await Product.find({
      fpoId: req.user.userId,
      $or: [
        { expirationDate: { $lte: now } },
        { dueDate: { $lte: now } },
      ],
      status: 'active',
    }).populate('seller', 'name email contact');

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/fpo/products/:productId/remove
// @desc    Remove an expired product
// @access  Private (FPO)
router.put('/products/:productId/remove', protect, authorize('fpo'), async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.fpoId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this product',
      });
    }

    // Delete the product completely
    await Product.deleteOne({ productId: req.params.productId });

    // Send email alert
    const farmer = await User.findOne({ userId: product.userId });
    if (farmer) {
      const emailData = emailTemplates.productExpired(req.user.name, product.name, farmer.name);
      await sendEmail({
        email: farmer.email,
        subject: `Product Removed: ${product.name}`,
        html: `<p>Dear ${farmer.name},</p><p>Your product "${product.name}" has been removed by FPO ${req.user.name}.</p><p>If you have any questions, please contact the FPO.</p>`,
      });
    }

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

// @route   PUT /api/fpo/farmers/:userId/remove
// @desc    Remove a farmer from FPO
// @access  Private (FPO)
router.put('/farmers/:userId/remove', protect, authorize('fpo'), async (req, res) => {
  try {
    console.log('FPO attempting to remove farmer:', req.params.userId);
    console.log('FPO userId:', req.user.userId);
    
    const farmer = await User.findOne({ userId: req.params.userId });
    console.log('Found farmer:', farmer ? { userId: farmer.userId, name: farmer.name, role: farmer.role, fpoId: farmer.fpoId } : 'Not found');

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

    if (farmer.fpoId !== req.user.userId) {
      console.log('Authorization failed: farmer.fpoId =', farmer.fpoId, 'FPO userId =', req.user.userId);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this farmer',
      });
    }

    // Remove farmer from FPO
    farmer.fpoId = '';
    farmer.farmerApplication.status = 'removed';
    await farmer.save();

    res.json({
      success: true,
      message: 'Farmer removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;

