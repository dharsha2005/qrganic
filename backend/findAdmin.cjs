const mongoose = require('mongoose');
const User = require('./models/User.js');
require('dotenv').config();

const findAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      console.log('✅ Admin Found:');
      console.log('Email:', admin.email);
      console.log('Name:', admin.name);
      console.log('User ID:', admin.userId);
      console.log('Password: [Hidden - stored in database as hash]');
      console.log('');
      console.log('🔐 To reset password, you need to:');
      console.log('1. Delete this admin entry from database');
      console.log('2. Create new admin with known password');
      console.log('3. Or update password directly in database');
    } else {
      console.log('❌ No admin user found in database');
      console.log('');
      console.log('📝 To create admin, register via:');
      console.log('Email: admin@qrganic.com');
      console.log('Password: YourSecurePassword123');
      console.log('Role: Admin');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

findAdmin();
