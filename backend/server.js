import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import farmerRoutes from './routes/farmer.js';
import fpoRoutes from './routes/fpo.js';
import adminRoutes from './routes/admin.js';
import productRoutes from './routes/product.js';
import logRoutes from './routes/log.js';
import visualRoutes from './routes/visual.js';
import cartRoutes from './routes/cart.js';
import { scheduleExpirationCheck } from './utils/productExpiration.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: ['https://qrganic.onrender.com', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    // Start product expiration checker
    scheduleExpirationCheck();
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/fpo', fpoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/visuals', visualRoutes);
app.use('/api/cart', cartRoutes); // Use cart routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'QRGanic API is running' });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Server URL: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}`);
});

