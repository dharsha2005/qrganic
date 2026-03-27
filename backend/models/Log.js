import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
      default: () => `log-${Math.random().toString(36).substring(2, 10)}`
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    productId: {
      type: String,
      required: true,
      ref: 'Product',
    },
    productName: {
      type: String,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['bought', 'sold'],
      required: true,
    },
    initialPrice: {
      type: Number,
      required: true,
    },
    variablePrice: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    defectsRegistered: {
      type: String,
      default: '',
    },
    reviews: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'completed',
    },
    qrCode: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model('Log', logSchema);

export default Log;

