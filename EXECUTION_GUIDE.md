# QRGanic - Execution Guide

This guide will walk you through the complete setup and execution process for the QRGanic MERN application.

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- ✅ Node.js (v16 or higher) installed
- ✅ MongoDB installed and running
- ✅ A Gmail account (for email notifications)
- ✅ Code editor (VS Code recommended)

## 🚀 Step-by-Step Execution Process

### Step 1: Verify MongoDB Installation

**Windows:**
```bash
# Check if MongoDB is installed
mongod --version

# Start MongoDB service (if not running)
net start MongoDB
```

**macOS:**
```bash
# Check if MongoDB is installed
mongod --version

# Start MongoDB
brew services start mongodb-community
# or
mongod --config /usr/local/etc/mongod.conf
```

**Linux:**
```bash
# Check if MongoDB is installed
mongod --version

# Start MongoDB
sudo systemctl start mongod
# or
sudo service mongod start
```

### Step 2: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Copy the example file
   # On Windows (PowerShell):
   Copy-Item .env.example .env
   
   # On macOS/Linux:
   cp .env.example .env
   ```

4. **Configure `.env` file:**
   Open `backend/.env` and update the following:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/qrganic
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   EMAIL_FROM=noreply@qrganic.com
   
   FRONTEND_URL=http://localhost:5173
   ```

   **Important:** To get Gmail App Password:
   1. Go to https://myaccount.google.com/
   2. Enable 2-Step Verification
   3. Go to App Passwords: https://myaccount.google.com/apppasswords
   4. Generate a new app password for "Mail"
   5. Use that 16-character password in `EMAIL_PASS`

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   ✅ MongoDB Connected
   🚀 Server running on port 5000
   ```

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

### Step 4: Access the Application

1. **Open your browser and navigate to:**
   ```
   http://localhost:5173
   ```

2. **You should see the login page**

### Step 5: Create Initial Users

#### Option A: Using the Registration Page

1. Go to `http://localhost:5173/register`
2. Register users with different roles:
   - **Admin User:**
     - Name: Admin
     - Email: admin@qrganic.com
     - Password: admin123
     - Role: Admin
   
   - **FPO User:**
     - Name: FPO Manager
     - Email: fpo@qrganic.com
     - Password: fpo123
     - Role: FPO
     - Address: Your location
   
   - **Regular User:**
     - Name: John Doe
     - Email: user@qrganic.com
     - Password: user123
     - Role: User

#### Option B: Using MongoDB Directly (Alternative)

You can also create users directly in MongoDB:

```javascript
// Connect to MongoDB
use qrganic

// Create an admin user (password will be hashed automatically)
db.users.insertOne({
  name: "Admin",
  email: "admin@qrganic.com",
  password: "$2a$10$...", // Use bcrypt to hash "admin123"
  role: "admin",
  userId: "admin-xxxxx"
})
```

### Step 6: Testing the Application

#### Test Admin Portal:
1. Login as admin
2. Navigate to Admin dashboard
3. Try adding a new FPO
4. Try adding a new Farmer
5. View all users and products

#### Test User Portal:
1. Login as a regular user
2. Browse products (if any exist)
3. Apply to become a farmer
4. Fill out the farmer application form

#### Test FPO Portal:
1. Login as FPO
2. View pending farmer applications
3. Approve/reject applications
4. Monitor products from farmers
5. Check expired products

#### Test Farmer Portal:
1. Login as a farmer (or get approved as one)
2. Add new products
3. View your products
4. Remove products if needed

#### Test Purchase Flow:
1. As a user, browse products
2. Click "Purchase" on a product
3. Check your email for QR code
4. Use QR Lookup page to verify QR code data

## 🔧 Troubleshooting

### Issue: MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
1. Ensure MongoDB is running:
   ```bash
   # Check MongoDB status
   # Windows:
   sc query MongoDB
   
   # macOS/Linux:
   sudo systemctl status mongod
   ```

2. Verify MongoDB URI in `.env` file
3. Check if MongoDB is listening on port 27017:
   ```bash
   # Windows:
   netstat -an | findstr 27017
   
   # macOS/Linux:
   netstat -an | grep 27017
   ```

### Issue: Email Not Sending

**Error:** `Invalid login` or `Authentication failed`

**Solution:**
1. Verify Gmail App Password is correct
2. Ensure 2-Step Verification is enabled
3. Check email credentials in `.env`
4. Try using a different email service (SendGrid, Mailgun, etc.)

### Issue: CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Verify `FRONTEND_URL` in backend `.env`
2. Check `vite.config.js` proxy configuration
3. Ensure backend CORS middleware is configured correctly

### Issue: Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
1. Change PORT in `.env` to a different port (e.g., 5001)
2. Or kill the process using the port:
   ```bash
   # Windows:
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux:
   lsof -ti:5000 | xargs kill -9
   ```

### Issue: Module Not Found

**Error:** `Cannot find module 'xxx'`

**Solution:**
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again

## 📊 Database Structure

After running the application, your MongoDB database will have these collections:

- **users**: All user accounts (users, farmers, FPOs, admins)
- **products**: All product listings
- **logs**: Transaction logs (purchases/sales)
- **visuals**: Product images and documents

## 🎯 Quick Start Commands

### Start Everything (Two Terminals Required)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🔐 Default Test Credentials

After registration, you can use these test accounts:

```
Admin:
Email: admin@qrganic.com
Password: admin123

FPO:
Email: fpo@qrganic.com
Password: fpo123

User:
Email: user@qrganic.com
Password: user123
```

## 📝 Next Steps

1. **Customize the theme** - Modify colors in `frontend/src/App.css`
2. **Add more features** - Extend the functionality as needed
3. **Set up production** - Configure for production deployment
4. **Add testing** - Write unit and integration tests
5. **Deploy** - Deploy to cloud platforms (Heroku, Vercel, AWS, etc.)

## 🆘 Getting Help

If you encounter any issues:
1. Check the console logs (both backend and frontend)
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Check network connectivity
5. Review the README.md for additional information

## ✅ Verification Checklist

Before considering setup complete, verify:

- [ ] MongoDB is running and connected
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Can access login page at http://localhost:5173
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Email notifications are working (test with a purchase)
- [ ] QR code generation works
- [ ] All portals are accessible based on user role

---

**Happy Coding! 🚀**

