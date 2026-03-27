const mongoose = require('mongoose');

// Test MongoDB connection
const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connected successfully!');
    
    // Test a simple query
    const result = await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful:', result);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
