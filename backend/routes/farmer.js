import express from 'express';
import Product from '../models/Product.js';
import Visual from '../models/Visual.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../utils/emailService.js';

const router = express.Router();

// @route   POST /api/farmer/products
// @desc    Upload a new product
// @access  Private (Farmer)
router.post('/products', protect, authorize('farmer'), async (req, res) => {
  try {
    const {
      name,
      productType,
      harvestTime,
      dueDate,
      manuresUsed,
      fertilizersUsed,
      testsDone,
      initialPrice,
      finalPrice,
      quantity,
      quality,
      location,
    } = req.body;

    // Automatically calculate expiration date as 7 days from harvest
    const expirationDate = new Date(new Date(harvestTime).getTime() + 7 * 24 * 60 * 60 * 1000);

    const product = await Product.create({
      name,
      productType,
      harvestTime,
      expirationDate,
      dueDate,
      manuresUsed,
      fertilizersUsed,
      testsDone,
      initialPrice,
      finalPrice,
      quantity,
      quality,
      location,
      userId: req.user.userId,
      fpoId: req.user.fpoId,
      certificationStatus: 'certified',
      status: 'active',
    });

    // Update user's productsSold
    req.user.productsSold.push(product._id);
    await req.user.save();

    // Send email to FPO
    const fpo = await User.findOne({ userId: req.user.fpoId });
    if (fpo) {
      const emailData = emailTemplates.productUploaded(req.user.name, name, fpo.name);
      // Trigger email asynchronously
      sendEmail({
        email: fpo.email,
        subject: emailData.subject,
        html: emailData.html,
      }).catch(err => console.error('Product upload email error:', err));
    }

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/farmer/products
// @desc    Get all products by farmer
// @access  Private (Farmer)
router.get('/products', protect, authorize('farmer'), async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.userId }).sort({ createdAt: -1 });

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

// @route   PUT /api/farmer/products/:productId
// @desc    Update a product
// @access  Private (Farmer)
router.put('/products/:productId', protect, authorize('farmer'), async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product',
      });
    }

    // Track price changes
    if (req.body.finalPrice && req.body.finalPrice !== product.finalPrice) {
      product.priceChanges.push({
        oldPrice: product.finalPrice,
        newPrice: req.body.finalPrice,
        changedAt: new Date(),
        changedBy: req.user.userId,
      });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/farmer/products/:productId
// @desc    Remove a product
// @access  Private (Farmer)
router.delete('/products/:productId', protect, authorize('farmer'), async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product',
      });
    }

    // Delete the product completely
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

export default router;

