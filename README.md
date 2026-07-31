# Dashboard – Retail Decision Intelligence Platform

Dashboard is a full-stack, enterprise-grade Business Intelligence platform that helps businesses analyze sales performance, forecast revenue, and understand customer behavior through interactive visual analytics and natural language AI queries.

## 🚀 Key Features

- **Sharp Minimalist Design**: A premium, visually cohesive interface utilizing strict design tokens, micro-animations, and fluid optical adjustments.
- **Natural Language AI (Ask AI)**: Integrated Retrieval-Augmented Generation (RAG) using **ChromaDB** and the **Groq API**. Query your datasets, forecasts, and segments using natural language.
- **Automated ML Pipeline (Data Center)**: A seamless drag-and-drop file upload interface. Upload new transaction data (`.xlsx` or `.csv`) to automatically trigger a background orchestration pipeline that:
  - Preprocesses data and engineers customer features
  - Retrains ML revenue forecasting models
  - Recalculates Customer Lifetime Value (CLV)
  - Re-clusters user segments and basket recommendations
  - Rebuilds the ChromaDB AI Vector Index from scratch
- **Advanced Analytics**:
  - Customer Segmentation & CLV Analysis
  - Revenue Outlook & Volatility Metrics
  - Basket Analysis

## 🛠 Tech Stack

**Frontend**
- React + Vite
- Recharts (for monochrome data visualization)
- Vanilla CSS (Strict Token-based Design System)
- Lucide React Icons

**Backend & ML Pipeline**
- FastAPI + Python
- ChromaDB + Groq API (RAG architecture)
- Pandas, NumPy, Scikit-Learn
- Background Threading for Pipeline Orchestration

## 💻 Run Locally

### 1. Clone Repository

```bash
git clone https://github.com/ashishorbital/retail-business-intelligence.git
cd retail-business-intelligence
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env  # Or copy to backend/.env
```
*Note: You must add your `GROQ_API_KEY` to the `.env` file for the Ask AI feature to work.*

Run the server:
```bash
uvicorn main:app --reload
```
Backend runs on: `http://localhost:8000`

### 3. Frontend Setup

Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 4. Seed the Data (Optional)
If you want to manually seed the AI and ML models without using the UI, you can run the pipeline locally from the project root:
```bash
python -m backend.pipeline
# Or specifically to just rebuild the AI index:
python -m modules.rag.embed --rebuild
```
*Note: Using the "Data Center" tab in the web interface is the recommended way to upload new data and retrain models.*

## 👨‍💻 Author

**Ashish PS**

GitHub: https://github.com/ashishorbital
