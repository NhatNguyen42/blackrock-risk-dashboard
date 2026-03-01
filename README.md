# Aladdin-Inspired Portfolio Risk Dashboard

> **BlackRock Aladdin-style** portfolio risk analytics with GenAI commentary, Monte Carlo simulation, and interactive visualizations.

![Dashboard](https://img.shields.io/badge/Status-Production_Ready-brightgreen) ![Python](https://img.shields.io/badge/Python-3.11+-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)

---

## Features

### Portfolio Analytics (Aladdin Core)
- **Unified Risk/Return Views** — Sharpe, Sortino, VaR (95%/99%), CVaR, Beta, Alpha, Treynor, Information Ratio, Calmar
- **Interactive Allocation Pie Chart** — Recharts-powered donut with hover tooltips
- **Cumulative Returns** — Portfolio vs Benchmark (SPY) area chart
- **Sector Exposure** — Horizontal bar chart with real-time sector data from yfinance
- **Correlation Matrix** — Color-coded asset correlation heatmap
- **VaR Heatmap** — Per-asset Value-at-Risk at 90/95/99% confidence levels

### Monte Carlo Scenario Engine
- **GBM Simulation** — 100-5,000 paths, 30-756 day horizons
- **Named Scenarios** — "AI Capex Slowdown", "Rate Hike", "Energy Crisis", "Tech Bull Run", "Recession"
- **Fan Chart** — 5th/25th/50th/75th/95th percentile confidence bands
- **Terminal Stats** — Probability of loss, median outcome, tail risks

### GenAI Auto Commentary
- **AI Co-Pilot** — Generates Aladdin-style portfolio commentary
- **Configurable Provider** — OpenAI (GPT-4o-mini), Ollama (local Llama 3.1), or Mock (demo)
- **Structured Output** — Executive summary, key strengths, risk alerts, actionable recommendations
- **Context-Aware** — Uses actual portfolio metrics for precise analysis

### Additional Polish
- **CSV Drag-and-Drop** — Upload portfolio allocations from CSV files
- **PDF Report Export** — Generate downloadable risk reports
- **Dark Mode** — Full dark/light theme with glassmorphism design
- **Responsive** — Mobile-friendly advisor view

---

## Architecture

```
┌─────────────────────────────────────┐
│         Next.js Frontend            │
│  React + TypeScript + TailwindCSS   │
│  Recharts / Tremor / TanStack       │
│  Zustand (state) │ react-dropzone   │
└──────────────┬──────────────────────┘
               │ REST API
┌──────────────▼──────────────────────┐
│         FastAPI Backend             │
│  Portfolio Routes │ Market Routes   │
│  AI Routes │ Report Routes          │
├─────────────────────────────────────┤
│  Services Layer                     │
│  ┌─────────────┐ ┌───────────────┐  │
│  │ Risk Engine │ │ Monte Carlo   │  │
│  │ Pandas/Numpy│ │ GBM + Scipy   │  │
│  └─────────────┘ └───────────────┘  │
│  ┌─────────────┐ ┌───────────────┐  │
│  │ Market Data │ │AI Commentary  │  │
│  │ yfinance    │ │LangChain/GPT  │  │
│  └─────────────┘ └───────────────┘  │
│  ┌─────────────────────────────────┐│
│  │ PDF Report Generator (fpdf2)   ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **npm** or **yarn**

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set AI_PROVIDER=mock for demo, or add your OpenAI key

# Start server
uvicorn app.main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Dashboard available at: `http://localhost:3000`

---

## Configuration

### AI Provider Options

| Provider | Config | Notes |
|----------|--------|-------|
| **Mock** (default) | `AI_PROVIDER=mock` | Rich demo commentary, no API key needed |
| **OpenAI** | `AI_PROVIDER=openai` + `OPENAI_API_KEY=sk-...` | GPT-4o-mini, best quality |
| **Ollama** | `AI_PROVIDER=ollama` + `OLLAMA_BASE_URL=...` | Local LLM, privacy-first |

### Environment Variables

**Backend** (`.env`):
```
AI_PROVIDER=mock
OPENAI_API_KEY=sk-your-key-here
OLLAMA_BASE_URL=http://localhost:11434
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```
Set `NEXT_PUBLIC_API_URL` in Vercel environment variables.

### Backend → Render
1. Connect GitHub repo
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables from `.env`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/portfolio/analyze` | Full portfolio risk analysis |
| POST | `/api/portfolio/monte-carlo` | Monte Carlo simulation |
| GET | `/api/portfolio/scenarios` | List available scenarios |
| POST | `/api/ai/commentary` | Generate AI commentary |
| GET | `/api/market/ticker/{symbol}` | Ticker lookup |
| GET | `/api/market/search/{query}` | Search tickers |
| POST | `/api/reports/pdf` | Generate PDF report |
| GET | `/api/health` | Health check |

---

## CSV Format for Portfolio Upload

```csv
ticker,weight,name
AAPL,0.20,Apple Inc.
MSFT,0.20,Microsoft Corp.
NVDA,0.15,NVIDIA Corp.
GOOGL,0.15,Alphabet Inc.
AMZN,0.10,Amazon.com Inc.
JPM,0.10,JPMorgan Chase
JNJ,0.10,Johnson & Johnson
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS, Recharts, Tremor.sh, TanStack Table, Zustand, Framer Motion |
| Backend | FastAPI, Pandas, NumPy, SciPy, yfinance |
| AI | LangChain, OpenAI GPT-4o-mini / Ollama |
| PDF | fpdf2 |
| Deploy | Vercel (frontend) + Render (backend) |

---

## License

This project is for educational / portfolio demonstration purposes. Not financial advice.
