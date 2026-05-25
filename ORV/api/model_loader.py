import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

# 1. Nastavitve - imena oseb (enako kot mape v dataset/surovi_podatki)
# Član 2 ima v zvezku razrede razvrščene po abecedi. Prilagodi ta seznam vašim imenom!
IMENA_OSEB = ['iris', 'manja', 'nika'] 

# 2. Definicija naprave (CPU ali GPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model(model_path="model.pth"):
    """
    Naloži arhitekturo ResNet in vanjo vpiše naučene uteži (od Člana 2).
    """
    # Ustvarimo enako arhitekturo mreže, kot jo je uporabil Član 2 (npr. resnet18)
    model = models.resnet18(pretrained=False)
    
    # Prilagodimo zadnjo plast številu naših članov ekipe
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(IMENA_OSEB))
    
    # Naložimo shranjene uteži, če datoteka obstaja
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
    else:
        print(f"OPOZORILO: Datoteka {model_path} ne obstaja! Model bo vrnil naključne rezultate.")
        
    model.to(device)
    model.eval()  # Nastavimo model v način za ocenjevanje
    return model

# 3. Transformacija slike (Natančne nastavitve, ki sta jih določila Član 1 in 2)
# Slika se mora zmanjšati na 224x224 in normalizirati z ImageNet vrednostmi
infer_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def predict(model, pil_image):
    """
    Sprejme naložen model in PIL sliko, izvede predobdelavo in vrne rezultat.
    """
    # Priprava slike za nevronsko mrežo
    tensor = infer_transforms(pil_image).unsqueeze(0).to(device)
    
    # Ocenjevanje brez računanja gradientov (hitreje, manj pomnilnika)
    with torch.no_grad():
        outputs = model(tensor)
        # Pretvorba izhodov v procente (verjetnosti)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        
        # Poiščemo najvišjo verjetnost in pripadajoči indeks razreda
        confidence, preds = torch.max(probabilities, 0)
    
    label_idx = preds.item()
    prepoznana_oseba = IMENA_OSEB[label_idx]
    zanesljivost = confidence.item()
    
    # Nastavimo prag varnosti: npr. če je model več kot 75% prepričan, odobrimo 2FA vstop
    PRAG_ZAUPANJA = 0.75
    verified = True if zanesljivost >= PRAG_ZAUPANJA else False
    
    # Pripravimo vse rezultate v obliki slovarja za vse_scores (za /classify endpoint)
    all_scores = {IMENA_OSEB[i]: float(probabilities[i]) for i in range(len(IMENA_OSEB))}
    
    return {
        "verified": verified,
        "confidence": zanesljivost,
        "label": prepoznana_oseba,
        "all_scores": all_scores
    }