# DBLearn - SQL Practice Platform

A modern web-based SQL tutoring system built with **React**, **Tailwind CSS**, and **Vite**, featuring an interactive SQL editor with DuckDB-Wasm backend.

## 🚀 Tech Stack

- **Frontend**: React 18 + Tailwind CSS
- **Build Tool**: Vite 5
- **Database**: DuckDB-Wasm (in-browser SQL execution)
- **Editor**: Monaco Editor (VS Code editor)
- **Package Manager**: pnpm

## 📁 Project Structure

```
ITS-SQL/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx
│   │   ├── StepIndicator.jsx
│   │   ├── Tabs.jsx
│   │   ├── LeftPanel.jsx
│   │   └── RightPanel.jsx
│   ├── lib/                # Backend utilities
│   │   ├── db-manager.js   # DuckDB initialization
│   │   ├── problems.js     # SQL problem definitions
│   │   ├── hint-engine.js  # Hint generation
│   │   └── verifier.js     # Query verification
│   ├── styles/
│   │   └── globals.css     # Global Tailwind styles
│   ├── App.jsx             # Main app component
│   └── index.jsx           # React entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 16+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

The app will open at `http://localhost:8080`

## 📚 Features

- ✅ 5+ interactive SQL problems
- ✅ Real-time query execution with DuckDB
- ✅ Step-by-step problem indicators
- ✅ Code editor with syntax highlighting
- ✅ Sample test cases
- ✅ Responsive design with Tailwind CSS
- ✅ Tab-based navigation (Description/Submissions)

## 🎯 Usage

1. **Select a problem** using the step indicator (1-5)
2. **Read the description** in the left panel
3. **Write your SQL query** in the code editor
4. **Click Submit** to execute and verify
5. **Move to the next problem** when correct

## 📝 Notes

- Database files are in-memory using DuckDB-Wasm
- No backend server required - everything runs in the browser
- All state is managed with React hooks
- Styling is done with Tailwind CSS utility classes

## 📄 License

MIT
