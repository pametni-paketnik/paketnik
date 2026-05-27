from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import io
import os
from pydantic import BaseModel
from PIL import Image
import logging
from pymongo import MongoClient
import bcrypt

from model_loader import load_model, predict
from dotenv import load_dotenv
load_dotenv()

mongo_uri = os.getenv("MONGO_URI", "PORT")
client = MongoClient(mongo_uri)
db = client["pametni_paketnik"]

uporabniki_collection = db["uporabniki"]

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

    return predict(model, image)


class LoginRequest(BaseModel): 
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    surname: str
    email: str
    password: str

@app.post("/login")
def login(request: LoginRequest):
    vnesen_email = request.email.strip()
    vneseno_geslo = request.password.strip()
    
    user = uporabniki_collection.find_one({"email": vnesen_email})
    if not user:
        user = uporabniki_collection.find_one({"email ": vnesen_email})

    if not user:
        return {
            "success": False,
            "message": "Napačen e-naslov ali geslo",
            "userId": "", "name": "", "role": ""
        }
        
    baza_geslo_surovo = user.get("geslo") if "geslo" in user else user.get("geslo ")
    if not baza_geslo_surovo:
        return {
            "success": False,
            "message": "Napačen e-naslov ali geslo",
            "userId": "", "name": "", "role": ""
        }

    baza_hash_str = str(baza_geslo_surovo).strip()

    try:
        if baza_hash_str.startswith("$2b$") or baza_hash_str.startswith("$2a$"):
            if not bcrypt.checkpw(vneseno_geslo.encode('utf-8'), baza_hash_str.encode('utf-8')):
                return {
                    "success": False,
                    "message": "Napačen e-naslov ali geslo",
                    "userId": "", "name": "", "role": ""
                }
        else:
            if baza_hash_str != vneseno_geslo:
                return {
                    "success": False,
                    "message": "Napačen e-naslov ali geslo",
                    "userId": "", "name": "", "role": ""
                }
    except Exception:
        return {
            "success": False,
            "message": "Napaka pri preverjanju gesla",
            "userId": "", "name": "", "role": ""
        }
        
    ime = user.get("ime") if "ime" in user else user.get("ime ", "Uporabnik")
    vloga = user.get("vloga") if "vloga" in user else user.get("vloga ", "user")
    
    return {
        "success": True,
        "message": "Prijava uspešna",
        "userId": str(user["_id"]), 
        "name": str(ime).strip(),
        "role": str(vloga).strip()  
    }


@app.post("/register")
def register(request: RegisterRequest):
    vnesen_email = request.email.strip()
    
    existing_user = uporabniki_collection.find_one({"email": vnesen_email})
    if not existing_user:
        existing_user = uporabniki_collection.find_one({"email ": vnesen_email})
        
    if existing_user:
        return {
            "success": False,
            "message": "Uporabnik s tem e-naslovom je že registriran!"
        }

    # Ustvarjanje Bcrypt hleša za novo geslo pred shranjevanjem
    sol = bcrypt.gensalt()
    sifrirano_geslo = bcrypt.hashpw(request.password.strip().encode('utf-8'), sol).decode('utf-8')

    new_user_doc = {
        "ime": request.name.strip(),
        "priimek": request.surname.strip(),
        "email": vnesen_email,
        "geslo": sifrirano_geslo,  
        "vloga": "user"          
    }
    
    uporabniki_collection.insert_one(new_user_doc)
    
    return {
        "success": True,
        "message": "Registracija uspešna! Sedaj se lahko prijavite."
    }