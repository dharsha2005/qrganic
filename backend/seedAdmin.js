import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@qrganic.com';
    const adminPassword = 'admin123';

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists:', adminEmail);
      process.exit(0);
    }

    // Create admin
    const admin = new User({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    await admin.save();
    console.log('🚀 Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
