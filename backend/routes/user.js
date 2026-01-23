import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Log from '../models/Log.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../utils/emailService.js';
import { generateQRCode } from '../utils/qrGenerator.js';

const router = express.Router();

// @route   POST /api/user/apply-farmer
// @desc    Apply to become a farmer
// @access  Private (User)
router.post('/apply-farmer', protect, async (req, res) => {
  try {
    const { farmingType, location, cultivatedProducts, proofDocuments } = req.body;

    if (req.user.role !== 'user') {
      return res.status(400).json({
        success: false,
        message: 'Only users can apply to become farmers',
      });
    }

    // Find FPO based on location (simplified mapping)
    // 1) Try to match FPO address with the provided location (case-insensitive substring)
    // 2) If no direct match, fall back to the first available FPO so the flow can continue
    let fpo = null;

    if (location && location.trim().length > 0) {
      fpo = await User.findOne({
        role: 'fpo',
        address: { $regex: location.trim(), $options: 'i' },
      });
    }

    // Fallback: pick any FPO if no address match is found
    if (!fpo) {
      fpo = await User.findOne({ role: 'fpo' });
    }

    if (!fpo) {
      return res.status(404).json({
        success: false,
        message:
          'No FPO accounts are configured in the system yet. Please contact an admin to create an FPO.',
      });
    }

    // Update user application
    req.user.farmerApplication = {
      status: 'pending',
      farmingType,
      location,
      cultivatedProducts,
      proofDocuments,
      appliedAt: new Date(),
    };
    req.user.fpoId = fpo.userId;

    await req.user.save();

    // Send email to FPO
    const emailData = emailTemplates.farmerApplicationSubmitted(req.user.name, fpo.name);
    await sendEmail({
      email: fpo.email,
      subject: `New Farmer Application from ${req.user.name}`,
      html: emailData.html,
    });

    res.json({
      success: true,
      message: 'Application submitted successfully',
      application: req.user.farmerApplication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/user/products
// @desc    Get all available products with filtering
// @access  Private (User, Farmer)
router.get('/products', protect, async (req, res) => {
  try {
    // Allow both users and farmers to see products
    if (req.user.role !== 'user' && req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only users and farmers can view products',
      });
    }

    const { category, minPrice, maxPrice, location, certificationStatus, search } = req.query;

    let query = { status: 'active' };

    // Apply filters
    if (category) {
      query.productType = category;
    }

    if (certificationStatus) {
      query.certificationStatus = certificationStatus;
    } else {
      query.certificationStatus = 'certified'; // Default to certified
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.finalPrice = {};
      if (minPrice) query.finalPrice.$gte = Number(minPrice);
      if (maxPrice) query.finalPrice.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

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

// @route   POST /api/user/purchase
// @desc    Purchase a product
// @access  Private (User, Farmer)
router.post('/purchase', protect, async (req, res) => {
  try {
    const { productId } = req.body;

    if (req.user.role !== 'user' && req.user.role !== 'farmer') {
      return res.status(400).json({
        success: false,
        message: 'Only users and farmers can purchase products',
      });
    }

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available',
      });
    }

    // Prevent farmers from purchasing their own products
    if (req.user.role === 'farmer' && product.userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot purchase your own products',
      });
    }

    const farmer = await User.findOne({ userId: product.userId });
    const fpo = await User.findOne({ userId: product.fpoId });

    // Generate QR Code
    const qrCode = await generateQRCode({
      productId: product.productId,
      productName: product.name,
      farmerName: farmer.name,
      farmerLocation: product.location,
      fpoName: fpo.name,
      purchaseDate: new Date().toISOString(),
      price: product.finalPrice,
    });

    // Create log entry after purchase
    const log = new Log({
      userId: req.user.userId,
      productId: product.productId,
      transactionType: 'bought',
      initialPrice: product.initialPrice,
      finalPrice: product.finalPrice,
      status: 'completed',
      qrCode,
      logId: undefined // Ensure pre-save hook runs
    });
    await log.save();

    // Update product
    product.status = 'sold';
    product.qrRecords.push({
      qrCode,
      generatedAt: new Date(),
      purchasedBy: req.user.userId,
    });
    await product.save();

    // Update user
    req.user.productsBought.push(product._id);
    await req.user.save();

    // Update farmer
    farmer.productsSold.push(product._id);
    await farmer.save();

    // Send email with QR code
    const emailData = emailTemplates.purchaseComplete(
      req.user.name,
      product.name,
      qrCode,
      farmer.name,
      product.location,
      fpo.name
    );
    await sendEmail({
      email: req.user.email,
      subject: emailData.subject,
      html: emailData.html,
    });

    res.json({
      success: true,
      message: 'Purchase completed successfully',
      log,
      qrCode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/user/purchases
// @desc    Get user purchase history
// @access  Private (User)
router.get('/purchases', protect, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user.userId, transactionType: 'bought' })
      .sort({ createdAt: -1 }); // Get all bought logs

    // We might want to populate product details if possible, but Log stores snapshots.
    // If we want current product details, we can try to fetch, 
    // but Log has the relevant snapshot like finalPrice.

    // Let's try to map with current product info if needed, but Log is safer.

    res.json({
      success: true,
      count: logs.length,
      purchases: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

