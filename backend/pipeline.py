import subprocess
import threading
import sys
from pathlib import Path
import time

# Store pipeline state in memory
PIPELINE_STATUS = {
    "is_running": False,
    "status": "idle",
    "progress": 0,
    "error": None
}

def run_ml_pipeline():
    """Runs the entire ML and RAG pipeline sequentially in a background thread."""
    global PIPELINE_STATUS
    PIPELINE_STATUS["is_running"] = True
    PIPELINE_STATUS["error"] = None
    PIPELINE_STATUS["progress"] = 0
    PIPELINE_STATUS["status"] = "Starting ML Pipeline..."
    
    base_dir = Path(__file__).resolve().parent.parent

    scripts = [
        {"name": "Preprocessing Data", "cmd": ["python", str(base_dir / "data" / "preprocessor.py")]},
        {"name": "Training Forecasting Model", "cmd": ["python", str(base_dir / "modules" / "forecasting.py")]},
        {"name": "Calculating Customer Value", "cmd": ["python", str(base_dir / "modules" / "clv.py")]},
        {"name": "Running Segmentation Model", "cmd": ["python", str(base_dir / "modules" / "segmentation.py")]},
        {"name": "Building Recommendations", "cmd": ["python", str(base_dir / "modules" / "recommendation.py")]},
        {"name": "Rebuilding AI Vector Index", "cmd": ["python", "-m", "modules.rag.embed", "--rebuild"]}
    ]
    
    try:
        total_scripts = len(scripts)
        for idx, script in enumerate(scripts):
            PIPELINE_STATUS["status"] = script["name"]
            PIPELINE_STATUS["progress"] = int((idx / total_scripts) * 100)
            print(f"[{idx+1}/{total_scripts}] {script['name']}...")
            
            # Using cwd as base_dir is important for modules.rag.embed
            result = subprocess.run(script["cmd"], cwd=str(base_dir), capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"Error in {script['name']}: {result.stderr}")
                raise Exception(f"{script['name']} failed: {result.stderr}")
            
            time.sleep(1) # Slight pause for stability
            
        PIPELINE_STATUS["progress"] = 100
        PIPELINE_STATUS["status"] = "Completed"
        
    except Exception as e:
        PIPELINE_STATUS["error"] = str(e)
        PIPELINE_STATUS["status"] = "Error"
    finally:
        PIPELINE_STATUS["is_running"] = False

def trigger_pipeline():
    if PIPELINE_STATUS["is_running"]:
        return False, "Pipeline is already running."
    
    thread = threading.Thread(target=run_ml_pipeline)
    thread.daemon = True
    thread.start()
    return True, "Pipeline started successfully."

def get_status():
    return PIPELINE_STATUS
