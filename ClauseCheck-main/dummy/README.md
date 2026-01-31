# 🇮🇳 India Case Search & Download Portal

A full-stack web application for searching Indian court judgments across all jurisdictions. Built with React, Vite, Material UI, Node.js, and Express, powered by the Indian Kanoon API.

![Tech Stack](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-646CFF)
![Material UI](https://img.shields.io/badge/MUI-5-007FFF)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## ✨ Features

- **Comprehensive Search**: Search for any Indian case (criminal, civil, land, cyber, etc.)
- **Clean UI**: Professional white design with blue accents, fully responsive
- **Case Details**: View case title, court, date, citation, and judge information
- **Direct Access**: Click to view full judgment on Indian Kanoon website
- **PDF Downloads**: Download judgment PDFs when court copies are available
- **Loading States**: Smooth animations and loading indicators
- **Mobile Friendly**: Fully responsive design for all devices
- **Error Handling**: Clear error messages and fallback states

## 📁 Project Structure

```
india-case-search/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchPage.jsx    # Home page with search input
│   │   │   └── ResultsPage.jsx   # Results display with cards
│   │   ├── App.jsx               # Main app component with routing
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                 # Node.js + Express backend
│   ├── index.js           # Express server with API routes
│   ├── .env.example       # Environment variables template
│   └── package.json
│
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Indian Kanoon API token ([Get one here](https://indiankanoon.org/account/))

### 1️⃣ Clone & Navigate

```bash
cd C:\Desktop\dummy
```

### 2️⃣ Setup Backend

```bash
cd server
npm install
```

Create `.env` file from template:
```bash
cp .env.example .env
```

Edit `.env` and add your API token:
```env
INDIAN_KANOON_API_TOKEN=your_actual_api_token_here
PORT=5000
```

Start the backend server:
```bash
npm start
```

The server will run at **http://localhost:5000**

### 3️⃣ Setup Frontend

Open a **new terminal** and run:

```bash
cd client
npm install
npm run dev
```

The frontend will run at **http://localhost:3000**

### 4️⃣ Open Application

Navigate to **http://localhost:3000** in your browser and start searching!

## 🔧 Configuration

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `INDIAN_KANOON_API_TOKEN` | Your API token from Indian Kanoon | ✅ Yes |
| `PORT` | Server port (default: 5000) | ❌ No |

### Frontend (vite.config.js)

The Vite proxy is already configured to forward `/api/*` requests to `http://localhost:5000`.

## 📡 API Endpoints

### Backend Routes

#### GET `/api/health`
Health check endpoint
- **Response**: `{ status: 'ok', message: 'India Case Search API is running' }`

#### GET `/api/search?query=<keyword>&pagenum=<page>`
Search for cases
- **Parameters**:
  - `query` (required): Search keywords
  - `pagenum` (optional): Page number (default: 0)
- **Response**:
```json
{
  "query": "fundamental rights",
  "pagenum": 0,
  "count": 10,
  "results": [
    {
      "id": 0,
      "docId": "123456",
      "title": "ABC vs State of Karnataka (2021)",
      "url": "https://indiankanoon.org/doc/123456/",
      "pdf": "https://api.indiankanoon.org/origdoc/123456/",
      "author": "Justice XYZ",
      "court": "Supreme Court of India",
      "date": "2021-05-15",
      "cite": "[2021] 10 SCC 234"
    }
  ]
}
```

## 🎨 UI Customization Guide

### Change Theme Colors

Edit `client/src/App.jsx` (lines 8-27):

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',     // Change main blue color
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#0288d1',     // Change accent color
    },
    background: {
      default: '#f5f7fa',  // Change background
      paper: '#ffffff',    // Change card background
    },
  },
});
```

### Modify Background Gradient

Edit `client/src/index.css` (line 14):

```css
background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
/* Change to your preferred gradient */
```

### Update Card Hover Effects

Edit `client/src/components/ResultsPage.jsx` (lines 116-118):

```javascript
'&:hover': {
  transform: 'translateY(-4px)',  // Adjust hover lift
  boxShadow: 6,                   // Adjust shadow depth
}
```

### Modify Typography

Edit `client/src/App.jsx` (lines 28-38):

```javascript
typography: {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h3: { fontWeight: 700 },  // Adjust heading weights
  h5: { fontWeight: 600 },
  h6: { fontWeight: 500 },
}
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Desktop**: 1200px+ (full width)
- **Tablet**: 600px-1200px (medium width)
- **Mobile**: <600px (compact layout)

Material UI's responsive grid system handles all layouts automatically.

## 🔍 Example Searches

Try these search queries:
- `fundamental rights`
- `cyber crime`
- `land dispute`
- `consumer protection`
- `article 21`
- `Kesavananda Bharati`
- `section 420 IPC`

## 🐛 Troubleshooting

### Backend won't start
- Check if Node.js 18+ is installed: `node --version`
- Verify API token is set in `.env`
- Check if port 5000 is available

### Frontend shows API errors
- Ensure backend is running at http://localhost:5000
- Check browser console for detailed errors
- Verify proxy configuration in `vite.config.js`

### No results found
- Check API token is valid
- Verify your Indian Kanoon API subscription is active
- Try different search keywords

### PDF downloads not working
- PDFs are only available for cases with court copies
- Some judgments don't have downloadable PDFs
- Check your API plan includes origdoc access

## 📦 Production Build

### Build Frontend
```bash
cd client
npm run build
```

The production build will be in `client/dist/`

### Deploy Backend
```bash
cd server
# Set environment variables on your hosting platform
# Deploy index.js with Node.js runtime
```

### Environment Variables for Production
- Set `INDIAN_KANOON_API_TOKEN` in your hosting environment
- Update frontend API URL if backend is on different domain
- Configure CORS settings in `server/index.js` if needed

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **Indian Kanoon** for providing the excellent legal search API
- **Material UI** for the beautiful component library
- **Vite** for blazing fast development experience

## 💡 Future Enhancements

- [ ] Pagination for search results
- [ ] Advanced filters (date range, court, judge)
- [ ] Case bookmarking and favorites
- [ ] Export results to CSV
- [ ] Search history
- [ ] Dark mode toggle
- [ ] Multi-language support

## 📞 Support

For API-related issues, visit [Indian Kanoon Documentation](https://api.indiankanoon.org/documentation/)

---

**Built with ❤️ for legal research in India**
