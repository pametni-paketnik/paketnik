import cv2
import os
import numpy as np
import random


def dodaj_sum(img):
    """Simulira grainy (zrnat) efekt."""
    row, col, ch = img.shape
    gauss = np.random.normal(0, 15, (row, col, ch))
    noisy = img + gauss
    return np.clip(noisy, 0, 255).astype(np.uint8)

def spremeni_svetlost(img, faktor):
    """Simulira exposure up/down preko HSV barvnega prostora."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hsv = np.array(hsv, dtype=np.float64)
    hsv[:, :, 2] = hsv[:, :, 2] * faktor
    hsv[:, :, 2][hsv[:, :, 2] > 255] = 255
    hsv = np.array(hsv, dtype=np.uint8)
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

def rotiraj_sliko(img, kot):
    """Rotira sliko za določen kot brez rezanja robov."""
    (h, w) = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, kot, 1.0)
    return cv2.warpAffine(img, M, (w, h))

def predobdelaj_podatke():
    raw_path = "dataset/surovi_podatki"
    proc_path = "dataset/obdelani_podatki"
    target_size = (224, 224) #velikost

    # 1. PREVERJANJE POGOJEV (Data Validation)
    if not os.path.exists(raw_path):
        print("[!] Napaka: Mapa 'surovi_podatki' ne obstaja!")
        return
    osebe = [f for f in os.listdir(raw_path) if os.path.isdir(os.path.join(raw_path, f))]
  
    # Preveri če so vsaj 3 osebe (članice ekipe)
    if len(osebe) < 3:
        print(f"[!] STOP: Premalo map oseb. Potrebujemo vsaj 3 (najdeno: {len(osebe)}).")
        return

    # Preveri če ima vsaka mapa točno ali več kot 30 slik
    vse_ok = True

    for oseba in osebe:
        pot = os.path.join(raw_path, oseba)
        st_slik = len([f for f in os.listdir(pot) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        if st_slik < 30:
            print(f"[!] STOP: Mapa '{oseba}' ima premalo slik ({st_slik}/30). Dopolnite nabor.")
            vse_ok = False
    
    if not vse_ok:
        return

    print(f"--- Vsi pogoji izpolnjeni. Začenjam generiranje dataseta za {len(osebe)} osebe. ---")

    if not os.path.exists(proc_path):
        os.makedirs(proc_path)


    # Gre čez vse mape oseb (iris, nika, ipd.)
    for oseba in osebe:
        oseba_raw_dir = os.path.join(raw_path, oseba)
        oseba_proc_dir = os.path.join(proc_path, oseba)
        if not os.path.exists(oseba_proc_dir):
            os.makedirs(oseba_proc_dir)

        print(f"\nObdelujem osebo: {oseba}...")

        for img_name in os.listdir(oseba_raw_dir):
            img_path = os.path.join(oseba_raw_dir, img_name)
            img = cv2.imread(img_path)
            if img is None:
                continue

             # 1. SPREMEMBA VELIKOSTI (Resizing)
            img = cv2.resize(img, target_size)
            ime_osnova = os.path.splitext(img_name)[0]
            
            # --- NORMALIZACIJA ---
            img_norm_test = img.astype('float32') / 255.0

            # --- GENERIRANJE VARIACIJ (Augmentacija) --------------------------------------------------------

            # 2.  Original in Grayscale (Sivinska) (če rabi Član 2)
            cv2.imwrite(os.path.join(oseba_proc_dir, f"{ime_osnova}_orig.jpg"), img)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            cv2.imwrite(os.path.join(oseba_proc_dir, f"{ime_osnova}_gray.jpg"), gray)

            # 3. Zrcaljenje (Flip)
            flipped = cv2.flip(img, 1)
            cv2.imwrite(os.path.join(oseba_proc_dir, f"{ime_osnova}_flip.jpg"), flipped)

            # 3. Rotacije (Malo levo, malo desno)
            for kot in [-15, -8, 8, 15]:
                rot = rotiraj_sliko(img, kot)
                cv2.imwrite(os.path.join(oseba_proc_dir, f"{ime_osnova}_rot{kot}.jpg"), rot)

            # 4. Svetlost (Exposure up/down)
            cv2.imwrite(os.path.join(oseba_proc_dir, f"{ime_osnova}_bright.jpg"), spremeni_svetlost(img, 1.4))
            cv2.imwrite(os.path.join(oseba_proc_dir, f"{ime_osnova}_dark.jpg"), spremeni_svetlost(img, 0.6))

            # 5. Blur (Zameglitev) in Grainy (Šum)
            blur = cv2.GaussianBlur(img, (7, 7), 0)
            cv2.imwrite(os.path.join(oseba_proc_dir, f"{ime_osnova}_blur.jpg"), blur)
            grainy = dodaj_sum(img)
            cv2.imwrite(os.path.join(oseba_proc_dir, f"{ime_osnova}_grainy.jpg"), grainy)

    print("\nPredobdelava končana! Slike so v mapi 'dataset/obdelani_podatki'.")

if __name__ == "__main__":
    predobdelaj_podatke()
