import io
import os
import logging
import time
from pathlib import Path

import cv2
import numpy as np
import bcrypt
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

from predobdelava import pripravi_sliko_za_api
from model_loader import load_model, predict

load_dotenv()

mongo_uri = os.getenv("MONGO_URI", "PORT")
client = MongoClient(mongo_uri)
db = client["pametni_paketnik"]

uporabniki_collection = db["uporabniki"]
narocila_collection = db["narocila"]

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
    db_connected = False
    try:
        client.admin.command("ping")
        db_connected = True
    except Exception:
        db_connected = False

    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "db_connected": db_connected,
        "database": "pametni_paketnik",
    }


def pil_to_cv2(pil_image): 
    """Pretvori PIL sliko v OpenCV format (RGB -> BGR)."""
    return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

def cv2_to_pil(cv2_image): 
    """Pretvori OpenCV sliko nazaj v PIL format (BGR -> RGB)."""
    return Image.fromarray(cv2.cvtColor(cv2_image, cv2.COLOR_BGR2RGB))


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
    
    cv_image = pil_to_cv2(image)
    cv_obdelana, obraz_najden = pripravi_sliko_za_api(cv_image)
    koncna_slika_za_model = cv2_to_pil(cv_obdelana)

    result = predict(model, koncna_slika_za_model)
    CONFIDENCE_THRESHOLD = 0.40

    surovo_zaupanje = result.get("confidence", 0.0)
    surovo_verified = result.get("verified", False)
    surova_oznaka = result.get("label", "Neznan obraz")

    if surovo_zaupanje < CONFIDENCE_THRESHOLD:
        logger.warning(f"Prijava zavrnjena: Zaupanje ({surovo_zaupanje:.4f}) je pod pragom ({CONFIDENCE_THRESHOLD})")
        result["verified"] = False
        result["label"] = "Neznan obraz"
    else:
        result["verified"] = surovo_verified

    result["face_detected"] = obraz_najden
    result["message"] = (
        f"Oseba '{result['label']}' uspešno prepoznana."
        if result["verified"] and obraz_najden
        else "Avtentikacija zavrnjena — stopnja zaupanja je prenizka ali oseba ni prepoznana."
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
    
    cv_img = pil_to_cv2(image)
    cv_obdelana, _ = pripravi_sliko_za_api(cv_img)
    koncna_slika = cv2_to_pil(cv_obdelana)

    return predict(model, koncna_slika)


@app.post("/register-face")
async def register_face(
    file: UploadFile = File(...),
    name: str = Form(...),
    surname: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
):
    """Registracija novega uporabnika skupaj z obrazno sliko (multipart/form).
    Shrani surovo sliko v dataset/surovi_podatki/<safe_email>/, obdelano kopijo pa v
    dataset/obdelani_podatki/<safe_email>/ + ustvari uporabnika v MongoDB.
    """
    # preveri format
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(400, "Dovoljeni formati slike: JPG, PNG.")

    # preveri ali uporabnik že obstaja
    existing_user = uporabniki_collection.find_one({"email": email})
    if not existing_user:
        existing_user = uporabniki_collection.find_one({"email ": email})
    if existing_user:
        return {"success": False, "message": "Uporabnik s tem e-naslovom že obstaja."}

    # shrink/clean email za mapo
    safe_email = email.replace("@", "_at_").replace(".", "_")
    raw_dir = os.path.join("dataset", "surovi_podatki", safe_email)
    proc_dir = os.path.join("dataset", "obdelani_podatki", safe_email)
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(proc_dir, exist_ok=True)

    try:
        data = await file.read()
        filename = f"{int(time.time())}_{file.filename}"
        path = os.path.join(raw_dir, filename)
        with open(path, "wb") as f:
            f.write(data)

        raw_image = cv2.imread(path)
        if raw_image is None:
            raise HTTPException(400, "Napaka pri branju shranjene slike.")

        processed_image = pripravi_sliko_za_api(raw_image)
        processed_filename = f"{Path(filename).stem}_processed.jpg"
        processed_path = os.path.join(proc_dir, processed_filename)
        cv2.imwrite(processed_path, processed_image)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Napaka pri shranjevanju slike med registracijo")
        raise HTTPException(500, "Napaka pri shranjevanju slike.")

    # bcrypt hash gesla
    sol = bcrypt.gensalt()
    sifrirano_geslo = bcrypt.hashpw(password.strip().encode('utf-8'), sol).decode('utf-8')

    new_user_doc = {
        "ime": name.strip(),
        "priimek": surname.strip(),
        "email": email.strip(),
        "geslo": sifrirano_geslo,
        "vloga": "user",
        "face_image_path": path,
        "face_processed_path": processed_path,
    }

    uporabniki_collection.insert_one(new_user_doc)

    return {"success": True, "message": "Registracija uspešna (slika shranjena)."}


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
        
    ime = user.get("ime") if "ime" in user else user.get("ime ", "uporabnik")
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

class OrderResponseModel(BaseModel):
    id: str
    boxId: str
    status: str
    date: str
    description: str

@app.get("/orders/{userId}")
def get__user_orders(userId: str): 
    query_conditions = [{"uporabnik_id": userId}]
    try:
        query_conditions.append({"uporabnik_id": ObjectId(userId)})
    except Exception:
        pass

    orders_cursor = narocila_collection.find({"$or": query_conditions})

    order_list = []
    for doc in orders_cursor: 
        box_id = doc.get("koda_za_odpiranje") if "koda_za_odpiranje" in doc else doc.get("koda_za_odpiranje ", "Neznan Paketnik")
        status = doc.get("status") if "status" in doc else doc.get("status ", "neznano")
        date = doc.get("datum_dostave") if "datum_dostave" in doc else doc.get("datum_dostave ", "")
        
        order_list.append({
            "id": str(doc["_id"]),
            "boxId": str(box_id).strip(),
            "status": str(status).strip(),
            "date": str(date).strip(),
            "description": "Naročilo cvetja"  
        })

    return order_list