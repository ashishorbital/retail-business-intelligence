# ShelfSense – AI Business Intelligence Platform

ShelfSense is a full-stack Business Intelligence platform that helps businesses analyze sales performance,
customer behavior, and key business metrics through interactive dashboards and AI-powered insights.

## Features

- Sales Analytics Dashboard
- Customer Segmentation
- Sales Forecasting
- KPI Monitoring
- Business Insights & Visualization

## Tech Stack

**Frontend**
- React
- Vite

**Backend**
- FastAPI
- Python

**Libraries**
- Pandas
- NumPy
- Scikit-Learn
- Mlxtend
- OpenPyXL

## Run Locally

### Clone Repository

```bash
git clone https://github.com/ashishorbital/ShelfSense-business-intelligence.git
cd ShelfSense-business-intelligence
```

### Backend

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env  # Or copy to backend/.env
# Add your GROQ_API_KEY to the .env file
uvicorn main:app --reload
```

### Build RAG Index
To enable the AI "Ask" feature, you must first build the vector index.
Run this from the project root whenever data updates:
```bash
python -m modules.rag.embed --rebuild
```

Backend: `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Author

**Ashish PS**

GitHub: https://github.com/ashishorbital
