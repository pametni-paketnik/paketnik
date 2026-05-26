from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import io
from PIL import Image
import logging

from model_loader import load_model, predict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Flower Locker — Face 2FA API",
    description="API za prepoznavo obrazov (ResNet18, prenosno učenje)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None

@app.on_event("startup")
async def startup():
    global model
    logger.info("Nalagam model...")
    model = load_model()
    logger.info("Model naložen.")


@app.get("/")
def root():
    return {"status": "ok", "message": "Face 2FA API deluje"}


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}


@app.post("/verify")
async def verify(file: UploadFile = File(...)):
    """
    Prejme sliko obraza, vrne rezultat avtentikacije.

    Vrne:
    - verified    : ali je oseba prepoznana z zadostnim zaupanjem
    - confidence  : verjetnost (0.0 – 1.0)
    - label       : ime prepoznane osebe
    - all_scores  : verjetnosti za vse razrede
    - message     : berljivo sporočilo
    """
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(400, "Dovoljeni formati: JPG, PNG.")

    try:
        data  = await file.read()
        image = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception:
        raise HTTPException(400, "Napaka pri branju slike.")

    if model is None:
        raise HTTPException(503, "Model ni naložen.")

    result = predict(model, image)
    result["message"] = (
        f"Oseba '{result['label']}' prepoznana."
        if result["verified"]
        else "Avtentikacija zavrnjena — oseba ni prepoznana."
    )
    return result


@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    """Vrne verjetnosti za vse razrede (za testiranje)."""
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(400, "Dovoljeni formati: JPG, PNG.")

    try:
        data  = await file.read()
        image = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception:
        raise HTTPException(400, "Napaka pri branju slike.")

    if model is None:
        raise HTTPException(503, "Model ni naložen.")

<<<<<<< Updated upstream
    return predict(model, image)
=======
    result = predict(model, image)

    return {
        "label": result["label"],
        "confidence": round(result["confidence"], 4),
        "all_scores": result.get("all_scores", {})
    }

class OpenBoxRequest(BaseModel): 
    box_id: str
    user_id: str

@app.post("/open-box")
def open_box(request: OpenBoxRequest):
    """
    Endpoint, ki prejme uporabnika in številko paketnika ter vrne true/false.
    Uporablja se po uspešni FaceID prepoznavi.
    """
    logger.info(f"Prejet zahtevek za odpiranje: Paketnik {request.box_id} s strani uporabnika {request.user_id}")
    
    if request.user_id and request.user_id.lower() != "unknown":
        return {
            "success": True,
            "message": f"Paketnik {request.box_id} uspešno odprt za uporabnika {request.user_id}!"
        }
    else:
        return {
            "success": False,
            "message": "Dostop zavrnjen. Uporabnik ni prepoznan."
        }
>>>>>>> Stashed changes
