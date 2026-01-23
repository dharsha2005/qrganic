# 📍 .env File Location Guide

## Where to Place the .env File

The `.env` file **MUST** be placed in the **`backend`** directory.

### Correct Location:
```
qrganic/
├── backend/
│   ├── .env          ← PLACE IT HERE
│   ├── server.js
│   ├── package.json
│   └── ...
├── frontend/
└── ...
```

### Full Path Example:
```
D:\New folder (2)\backend\.env
```

## How to Create the .env File

### Option 1: Manual Creation (Recommended)

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create a new file named `.env` (note the dot at the beginning)

3. Copy and paste this content:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qrganic
JWT_SECRET=your_jwt_secret_key_here_change_in_production
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

4. **IMPORTANT:** Replace the placeholder values:
   - `your_jwt_secret_key_here_change_in_production` → A random secret string
   - `your_email@gmail.com` → Your Gmail address
   - `your_app_password` → Your Gmail App Password

### Option 2: Using Command Line

**Windows (PowerShell):**
```powershell
cd backend
Copy-Item .env.example .env
# Then edit .env with your values
```

**macOS/Linux:**
```bash
cd backend
cp .env.example .env
# Then edit .env with your values
```

**Note:** If `.env.example` doesn't exist, create `.env` manually.

## Why in the Backend Directory?

The `dotenv.config()` in `backend/server.js` looks for the `.env` file in the **current working directory** where the server runs, which is the `backend` folder.

```javascript
// backend/server.js
dotenv.config();  // Looks for .env in the backend directory
```

## File Structure Visualization

```
D:\New folder (2)\
│
├── backend\                    ← Backend folder
│   ├── .env                    ← ✅ .env file goes HERE
│   ├── .env.example            ← Example file (optional)
│   ├── server.js               ← Uses dotenv.config()
│   ├── package.json
│   ├── models\
│   ├── routes\
│   └── ...
│
├── frontend\                   ← Frontend folder
│   ├── src\
│   ├── package.json
│   └── ...                      ← ❌ .env does NOT go here
│
└── README.md
```

## Verification

To verify the `.env` file is in the correct location:

1. **Check if file exists:**
   ```bash
   cd backend
   dir .env          # Windows
   ls -la .env       # macOS/Linux
   ```

2. **Check file contents:**
   ```bash
   cd backend
   type .env         # Windows
   cat .env          # macOS/Linux
   ```

## Important Notes

⚠️ **Security:**
- Never commit `.env` to git (it's in `.gitignore`)
- Never share your `.env` file publicly
- Use different `.env` files for development and production

⚠️ **File Name:**
- Must be exactly `.env` (with the dot)
- Not `env` or `.env.txt`
- No file extension

⚠️ **Location:**
- Must be in the `backend` directory
- Same level as `server.js`
- Not in the root project folder
- Not in the frontend folder

## Troubleshooting

### Error: "Cannot find module" or environment variables not loading

**Solution:**
1. Verify `.env` is in `backend/` directory
2. Check file name is exactly `.env` (not `.env.txt`)
3. Ensure no extra spaces in variable names
4. Restart the server after creating/modifying `.env`

### Error: "MONGODB_URI is not defined"

**Solution:**
1. Check `.env` file exists in `backend/` directory
2. Verify `MONGODB_URI` is spelled correctly
3. Ensure no quotes around values (unless needed)
4. Check for typos in variable names

---

**Quick Reference:**
- **Location:** `backend/.env`
- **Full Path:** `D:\New folder (2)\backend\.env`
- **Required:** Yes, for backend to work
- **Git:** Ignored (in .gitignore)

