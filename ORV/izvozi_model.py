"""
izvozi_model.py — Skripta za izvoz naučenega modela
====================================================
NAVODILO ZA ČLANA 2:
    1. Odpri ta fajl v istem okolju kjer si učil model
    2. Nastavi CLASS_NAMES na imena map iz dataset/surovi_podatki/
       (npr. ["iris", "manja", "nika"] — mora biti isto kot mape!)
    3. Nastavi MODEL_CHECKPOINT na pot do tvojega .pth / checkpoint fajla
    4. Poženi: python izvozi_model.py
    5. Nastali fajl 'model/face_model_export.pt' pošlji Članu 3
"""

import torch
import torchvision.models as models
import os

# ═══════════════════════════════════════════════════════════
#  NASTAVI TUKAJ:
CLASS_NAMES = ["iris", "manja", "nika"]   # ← zamenjaj z dejanskimi imeni map!
MODEL_CHECKPOINT = "model_best.pth"        # ← pot do tvojega checkpoint fajla
OUTPUT_PATH = "model/face_model_export.pt"
# ═══════════════════════════════════════════════════════════

def izvozi():
    os.makedirs("model", exist_ok=True)
    num_classes = len(CLASS_NAMES)

    print(f"Nalagam arhitekturo ResNet18 ({num_classes} razredov)...")
    model = models.resnet18(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)

    print(f"Nalagam uteži iz: {MODEL_CHECKPOINT}")
    checkpoint = torch.load(MODEL_CHECKPOINT, map_location="cpu")

    # Podpre različne formate checkpointa
    if isinstance(checkpoint, dict):
        if "model_state_dict" in checkpoint:
            model.load_state_dict(checkpoint["model_state_dict"])
        elif "state_dict" in checkpoint:
            model.load_state_dict(checkpoint["state_dict"])
        else:
            # Poskusi direktno
            model.load_state_dict(checkpoint)
    else:
        model.load_state_dict(checkpoint)

    model.eval()

    # Shrani model skupaj z metapodatki
    torch.save({
        "model_state_dict": model.state_dict(),
        "class_names": CLASS_NAMES,
        "num_classes": num_classes,
        "architecture": "resnet18"
    }, OUTPUT_PATH)

    print(f"\n✓ Model uspešno izvožen: {OUTPUT_PATH}")
    print(f"  Razredi: {CLASS_NAMES}")
    print(f"\nPošlji ta fajl Članu 3!")

if __name__ == "__main__":
    izvozi()