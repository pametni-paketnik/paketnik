from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import io
from PIL import Image
import logging

from model_loader import load_model, predict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Face 2FA API",
    description="API za prepoznavo obrazov in dvofaktorsko avtentikacijo",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # V produkciji zamenjaj z dejanskimi domenami
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Naloži model ob zagonu
model = None

@app.on_event("startup")
async def startup_event():
    global model
    logger.info("Nalagam model...")
    model = load_model()
    logger.info("Model uspešno naložen.")


@app.get("/")
def root():
    return {"status": "ok", "message": "Face 2FA API deluje"}


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}


@app.post("/verify")
async def verify_face(file: UploadFile = File(...)):
    """
    Sprejme sliko obraza in vrne rezultat avtentikacije.
    
    - **file**: Slika v formatu JPG, PNG ali JPEG
    
    Vrne:
    - **verified**: Ali je uporabnik potrjen (True/False)
    - **confidence**: Verjetnost zaupanja (0.0 - 1.0)
    - **label**: Prepoznan razred/oznaka
    - **message**: Človeško berljivo sporočilo
    """
    # Preveri tip datoteke
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(
            status_code=400,
            detail="Neveljavna vrsta datoteke. Dovoljeni formati: JPG, PNG."
        )

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Napaka pri branju slike.")

    if model is None:
        raise HTTPException(status_code=503, detail="Model ni naložen.")

    # Klic modela
    result = predict(model, image)

    return {
        "verified": result["verified"],
        "confidence": round(result["confidence"], 4),
        "label": result["label"],
        "message": "Avtentikacija uspešna." if result["verified"] else "Avtentikacija zavrnjena."
    }


@app.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    """
    Klasificira sliko in vrne vse razrede z verjetnostmi.
    Uporabno za testiranje in razhroščevanje.
    """
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Neveljaven format slike.")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Napaka pri branju slike.")

    if model is None:
        raise HTTPException(status_code=503, detail="Model ni naložen.")

    result = predict(model, image)

    return {
        "label": result["label"],
        "confidence": round(result["confidence"], 4),
        "all_scores": result.get("all_scores", {})
    }
