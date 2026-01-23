import express from 'express';
import Log from '../models/Log.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/logs
// @desc    Get all logs for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Remove .populate('productId') since productId is a string, not ObjectId
    const logs = await Log.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/logs/:logId
// @desc    Get single log
// @access  Private
router.get('/:logId', protect, async (req, res) => {
  try {
    const log = await Log.findOne({ logId: req.params.logId });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log not found',
      });
    }

    if (log.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.json({
      success: true,
      log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;

