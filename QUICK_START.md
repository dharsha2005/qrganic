# QRGanic - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js installed
- MongoDB running
- Gmail account (for emails)

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment

1. Copy `backend/.env.example` to `backend/.env`
2. Update these values in `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/qrganic
   JWT_SECRET=your_secret_key_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

### Step 3: Start Servers

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

### Step 4: Access Application

Open browser: http://localhost:5173

### Step 5: Create First User

1. Click "Register"
2. Fill in details:
   - Name: Admin
   - Email: admin@qrganic.com
   - Password: admin123
   - Role: Admin
3. Click "Register"
4. You'll be redirected to Admin dashboard

## 🎯 Test the Application

### As Admin:
1. Add a new FPO
2. Add a new Farmer
3. View all users and products

### As User:
1. Register as a regular user
2. Browse products
3. Apply to become a farmer

### As FPO:
1. Login as FPO
2. Review farmer applications
3. Approve/reject applications

### As Farmer:
1. Get approved as farmer (or admin adds you)
2. Add products
3. Manage your listings

## 🔧 Common Issues

**MongoDB not connecting?**
- Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`

**Email not sending?**
- Get Gmail App Password from: https://myaccount.google.com/apppasswords
- Enable 2-Step Verification first

**Port already in use?**
- Change PORT in `.env` file
- Or kill process: `lsof -ti:5000 | xargs kill -9`

## 📚 Full Documentation

- See `EXECUTION_GUIDE.md` for detailed setup
- See `README.md` for complete documentation
- See `PROJECT_SUMMARY.md` for project overview

---

**Ready to go! 🚀**

