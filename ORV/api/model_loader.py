"""
model_loader.py — Nalaganje ResNet18 modela za prepoznavo obrazov
=================================================================
Pričakuje model shranjen z izvozi_model.py (torch.save slovar z
model_state_dict in class_names).
"""

import os
import torch
import torchvision.models as models
import torchvision.transforms as T
import numpy as np
from PIL import Image

# ── Konfiguracija ─────────────────────────────────────────────────────────────
MODEL_PATH     = os.getenv("MODEL_PATH", "model/face_model_export.pt")
AUTH_THRESHOLD = float(os.getenv("AUTH_THRESHOLD", "0.80"))
DEVICE         = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Predobdelava — enaka kot pri učenju
TRANSFORM = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]),
])
# ─────────────────────────────────────────────────────────────────────────────


def load_model() -> dict:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model ni najden: {MODEL_PATH}\n"
            f"Prepričaj se, da si skopiral face_model_export.pt v mapo model/"
        )

    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)

    class_names = checkpoint["class_names"]
    num_classes  = len(class_names)

    net = models.resnet18(weights=None)
    net.fc = torch.nn.Linear(net.fc.in_features, num_classes)
    net.load_state_dict(checkpoint["model_state_dict"])
    net.to(DEVICE)
    net.eval()

    print(f"✓ Model naložen. Razredi: {class_names} | Naprava: {DEVICE}")
    return {"net": net, "class_names": class_names}


def predict(model_dict: dict, image: Image.Image) -> dict:
    """
    Sprejme PIL sliko, vrne:
      verified, confidence, label, all_scores
    """
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

    all_scores = {class_names[i]: float(p) for i, p in enumerate(probs)}

    return {
        "verified":   verified,
        "confidence": confidence,
        "label":      label,
        "all_scores": all_scores,
    }