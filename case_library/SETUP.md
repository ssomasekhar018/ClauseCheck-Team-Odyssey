# 🚀 Quick Setup Instructions

## Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Indian Kanoon API Token ([Get Here](https://indiankanoon.org/account/))

## Installation Steps

### Step 1: Backend Setup (Terminal 1)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (Windows PowerShell)
Copy-Item .env.example .env

# OR use this command (Windows CMD)
copy .env.example .env

# Edit .env file and add your API token
# Open .env in your text editor and replace:
# INDIAN_KANOON_API_TOKEN=your_api_token_here

# Start the server
npm start
```

✅ Server should now be running at **http://localhost:5000**

### Step 2: Frontend Setup (Terminal 2)

Open a **NEW terminal window** and run:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend should now be running at **http://localhost:3000**

### Step 3: Test the Application

1. Open your browser and go to **http://localhost:3000**
2. You should see the India Case Search Portal
3. Try searching for "fundamental rights" or "cyber crime"
4. Click on results to view judgments or download PDFs

## Troubleshooting

### Can't start server?
- Make sure you've added your API token to the `.env` file
- Check that port 5000 isn't already in use
- Verify Node.js is installed: `node --version`

### Frontend shows errors?
- Make sure the backend server is running first
- Check that both servers are on the correct ports
- Clear your browser cache and reload

### No search results?
- Verify your API token is valid and active
- Check the server console for error messages
- Try a different search query

## File Checklist

Make sure these files exist:

- ✅ `server/.env` (created from `.env.example` with your API token)
- ✅ `server/package.json`
- ✅ `server/index.js`
- ✅ `client/package.json`
- ✅ `client/vite.config.js`
- ✅ `client/src/App.jsx`
- ✅ `client/src/components/SearchPage.jsx`
- ✅ `client/src/components/ResultsPage.jsx`

## Next Steps

- Read the full **README.md** for customization options
- Try different search queries
- Customize the theme colors and UI
- Deploy to production when ready

---

Need help? Check the main **README.md** for detailed documentation!
