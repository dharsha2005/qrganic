import mongoose from 'mongoose';

const visualSchema = new mongoose.Schema(
  {
    visualId: {
      type: String,
      required: true,
      unique: true,
    },
    productId: {
      type: String,
      required: true,
      ref: 'Product',
    },
    visualType: {
      type: String,
      enum: ['image', 'video', 'document'],
      default: 'image',
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Generate visualId before saving
visualSchema.pre('save', function (next) {
  if (!this.visualId) {
    const random = Math.random().toString(36).substring(2, 10);
    this.visualId = `vis-${random}`;
  }
  next();
});

const Visual = mongoose.model('Visual', visualSchema);

export default Visual;

