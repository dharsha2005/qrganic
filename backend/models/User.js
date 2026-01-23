import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'farmer', 'fpo', 'admin'],
      default: 'user',
    },
    address: {
      type: String,
      default: '',
    },
    farmAddress: {
      type: String,
      default: '',
    },
    contact: {
      type: String,
      default: '',
    },
    fpoId: {
      type: String,
      default: '',
    },
    farmerApplication: {
      status: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none',
      },
      farmingType: String,
      location: String,
      cultivatedProducts: [String],
      proofDocuments: [String],
      appliedAt: Date,
      reviewedAt: Date,
      reviewedBy: String,
    },
    productsSold: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    productsBought: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate userId based on role
userSchema.pre('save', function (next) {
  if (!this.userId) {
    const prefix = {
      user: 'customer',
      farmer: 'farmer',
      fpo: 'fpo',
      admin: 'admin',
    }[this.role] || 'user';
    const random = Math.random().toString(36).substring(2, 8);
    this.userId = `${prefix}-${random}`;
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;

