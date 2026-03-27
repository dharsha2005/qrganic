import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    productType: {
      type: String,
      enum: ['Food', 'Animal Feed', 'Others'],
      required: true,
    },
    harvestTime: {
      type: Date,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: false,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    manuresUsed: {
      type: String,
      default: '',
    },
    fertilizersUsed: {
      type: String,
      default: '',
    },
    testsDone: {
      type: String,
      default: '',
    },
    initialPrice: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    priceChanges: [
      {
        oldPrice: Number,
        newPrice: Number,
        changedAt: Date,
        changedBy: String,
      },
    ],
    quantity: {
      type: String,
      required: true,
    },
    quality: {
      type: String,
      default: 'Grade A',
    },
    location: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    fpoId: {
      type: String,
      required: true,
      ref: 'User',
    },
    certificationStatus: {
      type: String,
      enum: ['pending', 'certified', 'expired', 'removed'],
      default: 'certified',
    },
    blockchainKey: {
      type: String,
      default: '',
    },
    qrRecords: [
      {
        qrCode: String,
        generatedAt: Date,
        purchasedBy: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'sold', 'expired', 'removed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual population for seller (User)
productSchema.virtual('seller', {
  ref: 'User',
  localField: 'userId',
  foreignField: 'userId',
  justOne: true
});

// Virtual population for FPO (User)
productSchema.virtual('fpo', {
  ref: 'User',
  localField: 'fpoId',
  foreignField: 'userId',
  justOne: true
});

// Generate productId before saving
productSchema.pre('save', function (next) {
  if (!this.productId) {
    const random = Math.random().toString(36).substring(2, 10);
    this.productId = `prod-${random}`;
  }
  
  // Automatically set expiration date if not provided
  if (!this.expirationDate && this.harvestTime) {
    this.expirationDate = new Date(new Date(this.harvestTime).getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;

