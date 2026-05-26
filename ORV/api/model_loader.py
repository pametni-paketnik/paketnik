"""
model_loader.py — Nalaganje ResNet18 modela (state_dict format)
===============================================================
Model: resnet18_prepoznava_obrazov.pth
Razredi (po abecedi, kot jih naredi predobdelava.py): iris, manja, nika
"""

import os
import torch
import torchvision.models as models
import torchvision.transforms as T
import numpy as np
from PIL import Image

# ── Konfiguracija ─────────────────────────────────────────────────────────────
MODEL_PATH     = os.getenv("MODEL_PATH", "../model/resnet18_prepoznava_obrazov.pth")
AUTH_THRESHOLD = float(os.getenv("AUTH_THRESHOLD", "0.80"))
CLASS_NAMES    = ["iris", "manja", "nika"]   # abecedni vrstni red map!
DEVICE         = torch.device("cuda" if torch.cuda.is_available() else "cpu")

TRANSFORM = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]),
])
# ─────────────────────────────────────────────────────────────────────────────


def load_model() -> dict:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model ni najden: {MODEL_PATH}")

    # Zgradi ResNet18 z 3 izhodi (iris, manja, nika)
    net = models.resnet18(weights=None)
    net.fc = torch.nn.Linear(net.fc.in_features, len(CLASS_NAMES))

    # Naloži uteži
    state_dict = torch.load(MODEL_PATH, map_location=DEVICE)

    # Podpri oba formata: čist state_dict ali wrapped {model_state_dict: ...}
    if isinstance(state_dict, dict) and "model_state_dict" in state_dict:
        state_dict = state_dict["model_state_dict"]

    net.load_state_dict(state_dict)
    net.to(DEVICE)
    net.eval()

    print(f"✓ Model naložen | Razredi: {CLASS_NAMES} | Naprava: {DEVICE}")
    return {"net": net, "class_names": CLASS_NAMES}


def predict(model_dict: dict, image: Image.Image) -> dict:
    net         = model_dict["net"]
    class_names = model_dict["class_names"]

    tensor = TRANSFORM(image.convert("RGB")).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = net(tensor)
        probs   = torch.softmax(outputs, dim=1).cpu().numpy()[0]

    idx        = int(np.argmax(probs))
    label      = class_names[idx]
    confidence = float(probs[idx])
    verified   = confidence >= AUTH_THRESHOLD

    all_scores = {class_names[i]: round(float(p), 4) for i, p in enumerate(probs)}

    return {
        "verified":   verified,
        "confidence": round(confidence, 4),
        "label":      label,
        "all_scores": all_scores,
    }
