from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import io
import os
from pydantic import BaseModel
from PIL import Image
import logging
from pymongo import MongoClient
import bcrypt
from bson import ObjectId
from pathlib import Path

from model_loader import load_model, predict
from dotenv import load_dotenv
load_dotenv()

FINAL_SPLIT_BASE_PATH = str(Path(__file__).resolve().parent.parent / "dataset" / "final_split")

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

@app.post("/api/face/save-fail")
async def save_fail_image(file: UploadFile = File(...), label: str = Form(...)):    
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(400, "Dovoljeni formati: JPG, PNG.")
    
    clean_label = label.strip().lower()

    veljavne_osebe = ["iris", "manja", "nika"]
    if clean_label not in veljavne_osebe: 
        raise HTTPException(400, f"Neznana oseba. Veljavne možnosti so: {veljavne_osebe}")
    
    try: 
        data = await file.read()
        image = Image.open(io.BytesIO(data)).convert("RGB")

        image = image.resize((224, 224))
    except Exception: 
        raise HTTPException(400, "Napaka pri obdelavi slike.")
    
    target_dir = os.path.join(FINAL_SPLIT_BASE_PATH, "train", clean_label)

    if not os.path.exists(target_dir):
        raise HTTPException(
            404, 
            f"Mapa ne obstaja na disku strežnika! Preverite pot: {target_dir}"
        )

    import time
    timestamp = int(time.time())
    filename = f"fail_{timestamp}.jpg" 
    final_file_path = os.path.join(target_dir, filename)

    try:
        image.save(final_file_path, "JPEG")
        return {"success": True, "message": f"Slika uspešno shranjena v {clean_label}/train/"}
    except Exception as e:
        raise HTTPException(500, f"Slike ni bilo mogoče shraniti: {str(e)}")

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