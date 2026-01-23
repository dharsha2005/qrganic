# QRGanic - Agricultural E-Commerce Platform

QRGanic is a multi-role agricultural e-commerce platform designed to connect certified farmers, local FPOs (Farmer Producer Organizations), registered users, and a central Admin authority. The platform ensures authenticity and transparency by allowing only certified farmer products that have been verified by the respective FPOs.

## 🚀 Features

### Multi-Portal System
- **User Portal**: Browse and purchase certified products, apply to become a farmer
- **Farmer Portal**: Upload and manage products, track sales
- **FPO Portal**: Approve/reject farmer applications, monitor products, handle expired items
- **Admin Portal**: Full control over users, products, FPOs, and farmers

### Key Functionalities
- ✅ Role-based authentication and authorization
- ✅ Product certification system
- ✅ QR code generation for purchases
- ✅ Email notifications for all key events
- ✅ Location-based FPO routing
- ✅ Product expiry monitoring
- ✅ Farmer application workflow
- ✅ Dark green theme matching the design

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd qrganic
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qrganic
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@qrganic.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Note**: For Gmail, you'll need to generate an App Password:
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password for "Mail"

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
qrganic/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Log.js
│   │   └── Visual.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── farmer.js
│   │   ├── fpo.js
│   │   ├── admin.js
│   │   ├── product.js
│   │   ├── log.js
│   │   └── visual.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── emailService.js
│   │   └── qrGenerator.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── QRLookup.jsx
│   │   │   ├── Admin/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── User/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── Farmer/
│   │   │   │   └── Dashboard.jsx
│   │   │   └── FPO/
│   │   │       └── Dashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 🗄️ Database Schema

The project uses MongoDB with the following main collections:

- **Users**: Stores user, farmer, FPO, and admin accounts
- **Products**: Stores product information with certification details
- **Logs**: Tracks all transactions (purchases/sales)
- **Visuals**: Stores product images and documents

## 🔐 Default Roles

After setting up, you can register users with different roles:
- `user`: Regular consumer
- `farmer`: Certified farmer (requires FPO approval)
- `fpo`: Farmer Producer Organization
- `admin`: System administrator

## 📧 Email Notifications

The system sends automated emails for:
- Farmer application submissions
- Application approvals/rejections
- Product uploads
- Product expiry alerts
- Purchase completions (with QR code)
- Admin actions (FPO/Farmer additions)

## 🎨 Theme

The application uses a dark green theme:
- Primary Green: `#2d5016`
- Dark Green: `#1e350f`
- Light Green: `#3a6a1d`
- Background: `#1a1a1a`

## 🔄 Workflow

### Farmer Registration Flow
1. User applies to become a farmer
2. Application routed to FPO based on location
3. FPO reviews and approves/rejects
4. User becomes farmer upon approval
5. Email notifications sent

### Product Listing Flow
1. Farmer uploads product with details
2. Product assigned due date
3. Product visible to users
4. FPO monitors for expiry
5. Expired products flagged and removed

### Purchase Flow
1. User selects product
2. Payment processed
3. QR code generated
4. QR code emailed to user
5. Transaction logged

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify MongoDB port (default: 27017)

### Email Not Sending
- Verify email credentials in `.env`
- Check if App Password is correct (for Gmail)
- Ensure SMTP settings are correct

### CORS Errors
- Verify frontend URL in backend CORS configuration
- Check proxy settings in `vite.config.js`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### User Routes
- `POST /api/user/apply-farmer` - Apply to become farmer
- `GET /api/user/products` - Get all products
- `POST /api/user/purchase` - Purchase product

### Farmer Routes
- `POST /api/farmer/products` - Add product
- `GET /api/farmer/products` - Get farmer's products
- `PUT /api/farmer/products/:productId` - Update product
- `DELETE /api/farmer/products/:productId` - Remove product

### FPO Routes
- `GET /api/fpo/applications` - Get pending applications
- `PUT /api/fpo/applications/:userId/approve` - Approve application
- `PUT /api/fpo/applications/:userId/reject` - Reject application
- `GET /api/fpo/farmers` - Get farmers under FPO
- `GET /api/fpo/products` - Get products from farmers
- `GET /api/fpo/products/expired` - Get expired products
- `PUT /api/fpo/products/:productId/remove` - Remove expired product

### Admin Routes
- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/users` - Get all users
- `GET /api/admin/fpos` - Get all FPOs
- `GET /api/admin/farmers` - Get all farmers
- `POST /api/admin/fpo` - Add new FPO
- `POST /api/admin/farmer` - Add new farmer

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributors

- Your Name

## 🙏 Acknowledgments

- Design inspiration from the provided admin dashboard
- Database schema based on the QRganic db schema mind map

---

**Note**: This is a development version. For production deployment, ensure to:
- Use environment variables for all sensitive data
- Implement proper error handling
- Add input validation and sanitization
- Set up proper logging
- Configure HTTPS
- Implement rate limiting
- Add comprehensive testing

