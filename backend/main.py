from fastapi import FastAPI
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from services import (
    get_kpis,
    get_segments,
    get_forecast,
    get_recommendations,
    get_clv,
    get_segment_summary,
    get_segment_analytics,
    get_forecast_summary,
    get_products
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Retail BI Platform API"}

@app.get("/kpis")
def kpis():
    return get_kpis()

@app.get("/segments")
def segments():
    return get_segments()

@app.get("/forecast")
def forecast():
    return get_forecast()

@app.get("/recommendations/{product}")
def recommendations(product: str):
    return get_recommendations(product)

@app.get("/clv/{customer_id}")
def clv(customer_id: int):

    result = get_clv(customer_id)

    return result

@app.get("/segment-summary")
def segment_summary():
    return get_segment_summary()

@app.get("/segment-analytics")
def segment_analytics():
    return get_segment_analytics()

@app.get("/forecast-summary")
def forecast_summary():
    return get_forecast_summary()

@app.get("/products")
def products():
    return get_products()

from schemas import AskQuery
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))
from modules.rag.generate import answer
from fastapi import HTTPException

@app.post("/api/ask")
def ask_ai(query_obj: AskQuery):
    if not query_obj.query or len(query_obj.query) > 500:
        raise HTTPException(status_code=400, detail="Invalid query")
    try:
        res = answer(query_obj.query)
        return res
    except Exception as e:
        print("Error in /api/ask:", e)
        raise HTTPException(status_code=500, detail="An error occurred while generating the answer.")

from fastapi import UploadFile, File
import shutil
from pipeline import trigger_pipeline, get_status

@app.post("/api/upload-data")
async def upload_data(file: UploadFile = File(...)):
    # Overwrite the Online Retail.xlsx file
    base_dir = Path(__file__).resolve().parent.parent
    target_path = base_dir / "data" / "Online Retail.xlsx"
    
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Trigger the ML pipeline in the background
    success, msg = trigger_pipeline()
    if not success:
        raise HTTPException(status_code=400, detail=msg)
        
    return {"message": "File uploaded successfully, ML pipeline started."}

@app.get("/api/pipeline-status")
def pipeline_status():
    return get_status()