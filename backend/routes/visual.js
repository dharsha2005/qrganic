import express from 'express';
import Visual from '../models/Visual.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/visuals
// @desc    Get all visuals
// @access  Public
router.get('/', async (req, res) => {
  try {
    const visuals = await Visual.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: visuals.length,
      visuals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/visuals/product/:productId
// @desc    Get all visuals for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const visuals = await Visual.find({ productId: req.params.productId });

    res.json({
      success: true,
      count: visuals.length,
      visuals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;

