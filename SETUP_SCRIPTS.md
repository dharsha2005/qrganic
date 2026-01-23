# Quick Setup Scripts

## Windows PowerShell Setup Script

Create a file `setup.ps1` in the root directory:

```powershell
# QRGanic Setup Script for Windows

Write-Host "🚀 Setting up QRGanic..." -ForegroundColor Green

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
mongod --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  MongoDB might not be installed. Please ensure MongoDB is installed and running." -ForegroundColor Yellow
}

# Backend Setup
Write-Host "`n📦 Setting up backend..." -ForegroundColor Cyan
Set-Location backend
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file. Please update it with your configuration." -ForegroundColor Green
}
npm install
Set-Location ..

# Frontend Setup
Write-Host "`n📦 Setting up frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Update backend/.env with your configuration" -ForegroundColor White
Write-Host "2. Start MongoDB" -ForegroundColor White
Write-Host "3. Run 'npm run dev' in backend directory" -ForegroundColor White
Write-Host "4. Run 'npm run dev' in frontend directory" -ForegroundColor White
```

## macOS/Linux Setup Script

Create a file `setup.sh` in the root directory:

```bash
#!/bin/bash

# QRGanic Setup Script for macOS/Linux

echo "🚀 Setting up QRGanic..."

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi
node --version

# Check MongoDB
echo "Checking MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB might not be installed. Please ensure MongoDB is installed and running."
else
    mongod --version
fi

# Backend Setup
echo ""
echo "📦 Setting up backend..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
fi
npm install
cd ..

# Frontend Setup
echo ""
echo "📦 Setting up frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your configuration"
echo "2. Start MongoDB"
echo "3. Run 'npm run dev' in backend directory"
echo "4. Run 'npm run dev' in frontend directory"
```

## Usage

**Windows:**
```powershell
.\setup.ps1
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

