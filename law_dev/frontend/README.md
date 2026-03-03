# Courtroom Simulation Frontend

This is the React/TypeScript frontend for the Courtroom Simulation module of the ClauseCheck Legal Tech Suite.

## 🏗️ Build Reproducibility Instructions (Mandatory)

Follow these steps to set up, build, and run the frontend application locally.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v16.0.0 or higher)
- **npm** (usually comes with Node.js)

### 2. Installation
Navigate to the `law-de/frontend` directory and install the dependencies:

```bash
cd law-de/frontend
npm install
```

### 3. Development Server
To run the application in development mode with hot-reloading:

```bash
npm run dev
```
The application will typically start at `http://localhost:5173` (or the next available port).

### 4. Production Build
To create a production-ready build:

```bash
npm run build
```
This command compiles TypeScript and bundles the assets into the `dist/` directory.

### 5. Preview Production Build
To preview the production build locally:

```bash
npm run preview
```

### 6. Environment Configuration
Ensure the backend server (`law-de/backend`) is running on `http://localhost:8000`. The frontend expects the backend API to be available at this address for the simulation to function correctly.
