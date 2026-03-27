import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';
dotenv.config();

const fixData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await Product.updateMany(
      {},
      { $set: { status: 'active', certificationStatus: 'certified' } }
    );

    console.log(`🚀 Updated ${result.modifiedCount} products to active and certified!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing data:', error.message);
    process.exit(1);
  }
};

fixData();
