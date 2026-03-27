import mongoose from 'mongoose';
import Product from './models/Product.js';
import Cart from './models/Cart.js';
import dotenv from 'dotenv';
dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const productCount = await Product.countDocuments();
    const activeCertifiedCount = await Product.countDocuments({ status: 'active', certificationStatus: 'certified' });
    console.log('Total Products:', productCount);
    console.log('Active & Certified Products:', activeCertifiedCount);

    if (activeCertifiedCount === 0) {
      console.log('⚠️ No active/certified products found. This is why the user sees nothing.');
      const sample = await Product.findOne();
      if (sample) {
        console.log('Sample Product:', {
          name: sample.name,
          status: sample.status,
          certificationStatus: sample.certificationStatus
        });
      }
    }

    const carts = await Cart.find().limit(5);
    console.log('Cart count:', await Cart.countDocuments());
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDB();
