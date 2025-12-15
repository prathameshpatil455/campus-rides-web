# 🚗 CampusRide - Student Ride Sharing Platform

A student-exclusive ride-sharing web application built with Angular.

## 📋 Prerequisites

- **Node.js** (version 18.x or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

## 🚀 Quick Start

### Step 1: Install Angular CLI

```bash
npm install -g @angular/cli
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run the Project

```bash
npm start
```

The application will open at **http://localhost:4200**

## 📝 Available Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 📁 Project Structure

```
src/
├── app/
│   ├── landing/          # Landing page
│   ├── app.ts           # Root component
│   └── app.routes.ts    # Routes
├── styles.css           # Global styles
└── index.html          # Main HTML
```

## 🔧 Troubleshooting

**Port already in use?**

```bash
ng serve --port 4201
```

**Module not found?**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Need to restart server?**

- Only restart when installing new packages or changing config files
- Regular code changes auto-reload (no restart needed)

---

For detailed information, see [Roadmap.md](./Roadmap.md) and [FEATURES.md](./FEATURES.md)
