import io
import os
import logging
import time
import re
import json
from pathlib import Path
from PIL import Image, ImageOps
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler

import cv2
import numpy as np
import bcrypt
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin  
from firebase_admin import credentials, messaging
from pydantic import BaseModel
from PIL import Image
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

from predobdelava import pripravi_sliko_za_api
from model_loader import load_model, predict

load_dotenv()

firebase_raw_env = os.getenv("FIREBASE_CREDENTIALS")
if firebase_raw_env:
    try:
        cred_dict = json.loads(firebase_raw_env)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        logging.info("[Firebase] Uspešno inicializiran preko okoljskih spremenljivk!")
    except Exception as e:
        logging.error(f"[Firebase] Napaka pri parsiranju ključa: {e}")
else:
    logging.warning("[Firebase] Opozorilo: FIREBASE_CREDENTIALS ni nastavljen v .env!")

def poslji_push_notification(fcm_token: str, naslov: str, vsebina: str): 
    """Pomožna funkcija za pošiljanje push obvestila na specifično napravo."""
    if not firebase_raw_env: 
        logger.info("Push obvestilo ni bilo poslano, ker Firebase ni inicializiran.")
        return False
    try: 
        message = messaging.Message(
            notification=messaging.Notification(
                title=str(naslov),
                body=str(vsebina),
            ),
            data={
                "title": str(naslov),
                "body": str(vsebina)
            },
            android=messaging.AndroidConfig(
                priority="high",
                notification=messaging.AndroidNotification(
                    sound="default",
                    channel_id="paketnik_notification_channel" # Mora se ujemati z Android kodo!
                )
            ),
            token=str(fcm_token), 
        )
        response = messaging.send(message)
        logging.info(f"[Firebase] Obvestilo uspešno poslano! ID: {response}")
        return True
    except Exception as e:
        logging.error(f"[Firebase] Napaka pri pošiljanju obvestila: {e}")
        return False


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

scheduler = BackgroundScheduler()

def pretvori_v_datetime(datum_iz_baze): 
    if isinstance(datum_iz_baze, datetime): 
        return datum_iz_baze
    
    try: 
        datum_str = str(datum_iz_baze).strip()

        le_datum = datum_str.split("T")[0].split(" ")[0]
        try: 
            return datetime.strptime(le_datum, "%Y-%m-%d")
        except ValueError: 
            pass
        
        if " " in datum_str: 
            return datetime.strptime(str(datum_iz_baze).strip(), "%Y-%m-%d %H:%M:%S")
        raise ValueError("Noben znan format datuma ne ustreza.")
    
    except Exception as e: 
        logging.error(f"[Scheduler] Napaka pri pretvorbi datuma '{datum_iz_baze}': {e}")
        return None
    

def preveri_in_poslji_casovni_opomnik():
    """Funkcija ki teče v ozadju ijn preverja pogoje za 2 in 3 dni - časovna omejitev naročila v paketniku"""
    logging.info("[Scheduler] Preverjam časovna obvestila za naročila...")
    trenutni_cas = datetime.now()

    try:
        aktivna_narocila = list(narocila_collection.find({"status": "za prevzem"}))
    except Exception as e:
        logger.error(f"[Scheduler] Napaka pri branju iz MongoDB: {e}")
        return

    if not aktivna_narocila: 
        logger.info("[Scheduler] Ni aktivnih naročil za prehod.")
        return

    for doc in aktivna_narocila: 
        datum_dostave_raw = doc.get("datum_dostave")
        if not datum_dostave_raw: 
            continue

        datum_dostave = pretvori_v_datetime(datum_dostave_raw)
        if not datum_dostave: 
            continue

        razlika = trenutni_cas - datum_dostave
        preteklo_dni = razlika.days

        raw_user_id = doc.get("uporabnik_id")
        if not raw_user_id:
            continue

        try: 
            final_user_id = raw_user_id if isinstance(raw_user_id, ObjectId) else ObjectId(str(raw_user_id).strip())
            user = uporabniki_collection.find_one({"_id": final_user_id})
        except Exception as e: 
            logger.error(f"[Scheduler] Napaka pri iskanju uporabnika {raw_user_id}: {e}")
            continue

        if not user or "fcm_token" not in user: 
            continue

        fcm_token = user["fcm_token"]
        box_id = doc.get("Koda_za_odpiranje", doc.get("koda_za_odpiranje", "Neznan"))

        # po 2 dneh brez prevzema naročila 
        if preteklo_dni == 2 and not doc.get("opomnik_2_dan_poslan", False):
            uspeh = poslji_push_notification(
                fcm_token=fcm_token,
                naslov=f"Opomnik za prevzem! #{box_id} 📦",
                vsebina=f"Vaše naročilo v paketniku #{box_id} vas čaka že 2 dni."
            )
            if uspeh: 
                narocila_collection.update_one(
                    {"_id": doc["_id"]}, 
                    {"$set": {"opomnik_2_dan_poslan": True}}
                )
                time.sleep(1.5)

        if not doc.get("opomnik_3_dan_poslan", False): 
            logger.info(f"[Scheduler] TESTNO pošiljam opomnik za naročilo {doc['_id']}")
            uspeh = poslji_push_notification(
                fcm_token=fcm_token,
                naslov=f"TEST: Potekel rok! #{box_id} 📦",
                vsebina=f"Uporabnik ima aktivno naročilo v paketniku #{box_id}."
            )
            if uspeh: 
                narocila_collection.update_one(
                    {"_id": doc["_id"]}, 
                    {"$set": {"opomnik_3_dan_poslan": True, "status": "poteklo"}} 
                )
                time.sleep(1.5)
        
        
scheduler.add_job(preveri_in_poslji_casovni_opomnik, 'interval', seconds=30)

@app.on_event("startup")
async def startup():
    global model
    logger.info("Nalagam model...")
    model = load_model()
    logger.info("Model naložen.")

    scheduler.start()
    logging.info("[Scheduler] Avtomatsko preverjanje opomnikov je zagnano v ozadju.")


@app.get("/")
def root():
    return {"status": "ok", "message": "Face 2FA API deluje"}


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}


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
        surova_slika = Image.open(io.BytesIO(data)).convert("RGB")
        
        image = ImageOps.exif_transpose(surova_slika)
    except Exception:
        raise HTTPException(400, "Napaka pri branju slike.")

    if model is None:
        raise HTTPException(503, "Model ni naložen.")
    
    cv_image = pil_to_cv2(image)
    cv_obdelana, obraz_najden = pripravi_sliko_za_api(cv_image)
    koncna_slika_za_model = cv2_to_pil(cv_obdelana)

    result = predict(model, koncna_slika_za_model)
    CONFIDENCE_THRESHOLD = 0.50

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


    if result["verified"] and obraz_najden and surova_oznaka != "Neznan obraz":
        result["message"] = f"Oseba '{result['label']}' uspešno prepoznana."
        
        iskano_ime = surova_oznaka.strip()
        regex_ime = re.compile(f"^{iskano_ime}$", re.IGNORECASE)

        user = uporabniki_collection.find_one({
            "$or": [
                {"ime": regex_ime},
                {"ime ": regex_ime}
            ]
        })

        if user: 
            result["userId"] = str(user["_id"])
            vloga = user.get("vloga") if "vloga" in user else user.get("vloga", "user")
            result["role"] = str(vloga).strip()
            logger.info(f"Face ID Povezava uspešna! Najden: {iskano_ime}, ID: {result['userId']}, Vloga: {result['role']}")
        else:
            logger.warning(f"Model je prepoznal '{iskano_ime}', vendar ta oseba ne obstaja v MongoDB!")
            result["message"] = f"Prepoznan obraz '{iskano_ime}', ampak uporabnik ni nastavljen v bazi."
    else:
        result["message"] = "Avtentikacija zavrnjena — stopnja zaupanja je prenizka ali oseba ni prepoznana."

    return result

@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    """Vrne verjetnosti za vse razrede (za testiranje)."""
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(400, "Dovoljeni formati: JPG, PNG.")

    try:
        data  = await file.read()
        surova_slika = Image.open(io.BytesIO(data)).convert("RGB")

        image = ImageOps.exif_transpose(surova_slika)
    except Exception:
        raise HTTPException(400, "Napaka pri branju slike.")

    if model is None:
        raise HTTPException(503, "Model ni naložen.")
    
    cv_img = pil_to_cv2(image)
    cv_obdelana, _ = pripravi_sliko_za_api(cv_img)
    koncna_slika = cv2_to_pil(cv_obdelana)

    return predict(model, koncna_slika)


class LoginRequest(BaseModel): 
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    surname: str
    email: str
    password: str

class OpenBoxRequest(BaseModel): 
    boxId: str
    userId: str

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

    # Ustvarjanje Bcrypt heša za novo geslo pred shranjevanjem
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
    address: str

@app.get("/orders/{userId}", response_model=list[OrderResponseModel])
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
        
        ime_izdelka = "Neznan izdelek"
        naslov_paketnika = "Neznana lokacija"

        izdelki = doc.get("izdelki", [])
        if isinstance(izdelki, list) and len(izdelki) > 0: 
            prvi_izdelek = izdelki[0]

            if isinstance(prvi_izdelek, dict): 
                ime_izdelka = prvi_izdelek.get("ime_izdelka", "Neznan izdelek")
                paketnik = prvi_izdelek.get("paketnik", {})

                if isinstance(paketnik, dict): 
                    naslov_paketnika = paketnik.get("naslov", "")

        order_list.append({
            "id": str(doc["_id"]),
            "boxId": str(box_id).strip(),
            "status": str(status).strip(),
            "date": str(date).strip(),
            "description": str(ime_izdelka).strip(),  
            "address": str(naslov_paketnika).strip() 
        })

    return order_list

@app.post("/open-box")
def open_box(request: OpenBoxRequest): 
    input_box_id = request.boxId.strip()
    input_user_id = request.userId.strip()

    logger.info(f"Zahteva ta odpiranje paketnika '{input_box_id}' s strani uporabnika '{input_user_id}'")

    try:
            user = uporabniki_collection.find_one({"_id": ObjectId(input_user_id)})
            if user and "fcm_token" in user:
                poslji_push_notification(
                    fcm_token=user["fcm_token"],
                    naslov="Paketnik odprt!",
                    vsebina=f"Paketnik #{input_box_id} je bil uspešno odprt."
                )
            else:
                logger.warning(f"Uporabnik {input_user_id} nima fcm_tokena v bazi. Obvestilo preskočeno.")
    except Exception as e:
        logger.error(f"Napaka pri preverjanju fcm_tokena: {e}")
            
    return{
        "success": True, 
        "message": f"Paketnik {input_box_id} odprt"
    }

class FCMTokenRequest(BaseModel):
    userId: str
    fcmToken: str

@app.post("/update-fcm-token")
def update_fcm_token(request: FCMTokenRequest): 
    user_id_raw = request.userId.strip()
    token = request.fcmToken.strip()

    try:
        user_id = ObjectId(user_id_raw)
    except Exception:
        raise HTTPException(status_code=400, detail="Neveljaven ID uporabnika")
    

    result = uporabniki_collection.update_one(
        {"_id": user_id},
        {"$set": {"fcm_token": token}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Uporabnik ni bil najden")
        
    logging.info(f"[Firebase] Uspešno posodobljen FCM žeton za uporabnika {user_id_raw}")
    return {"success": True, "message": "FCM žeton uspešno shranjen."}
