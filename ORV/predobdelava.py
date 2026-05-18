import cv2
import os
import numpy as np
import random
import shutil

def odstrani_sum(img):
    """Odstranjevanje šuma (Denoising)."""
    return cv2.GaussianBlur(img, (3, 3), 0)


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
    split_path = "dataset/final_split" # Za pripravo učne, validacijske in testne množice

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
    vse_ok = True 


    # Čiščenje prejšnjih obdelav
    if os.path.exists(proc_path): shutil.rmtree(proc_path)
    if os.path.exists(split_path): shutil.rmtree(split_path)
    os.makedirs(proc_path)

    vse_generirane_slike = [] # Seznam za poznejšo razdelitev v množice

    for oseba in osebe:
        pot = os.path.join(raw_path, oseba)
        st_slik = len([f for f in os.listdir(pot) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        if st_slik < 30:
            print(f"[!] STOP: Mapa '{oseba}' ima premalo slik ({st_slik}/30). Dopolnite nabor.")
            vse_ok = False
    
    if not vse_ok:
        return

    print(f"--- Vsi pogoji izpolnjeni. Začenjam generiranje dataseta za {len(osebe)} osebe. ---")

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
             # --- ODSTRANJEVANJE ŠUMA ---
            img = odstrani_sum(img) 

            ime_osnova = os.path.splitext(img_name)[0]
            
            # --- NORMALIZACIJA na [0,1] ---
            img_norm_test = img.astype('float32') / 255.0

             # Pomožna funkcija za shranjevanje in sledenje za končni split
            def shrani_in_zabelezi(image, koncnica):
                ime_datoteke = f"{ime_osnova}_{koncnica}.jpg"
                pot_shranjevanja = os.path.join(oseba_proc_dir, ime_datoteke)
                cv2.imwrite(pot_shranjevanja, image)
                vse_generirane_slike.append((pot_shranjevanja, oseba))


            # --- GENERIRANJE VARIACIJ (Augmentacija) --------------------------------------------------------

            # 2.  Original in Grayscale (Sivinska) (če rabi Član 2)
            shrani_in_zabelezi(img, "orig")
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            shrani_in_zabelezi(gray, "gray")

            # 3. Zrcaljenje (Flip)
            flipped = cv2.flip(img, 1)
            shrani_in_zabelezi(flipped, "flip")

            # 3. Rotacije (Malo levo, malo desno)
            for kot in [-15, -8, 8, 15]:
                rot = rotiraj_sliko(img, kot)
                shrani_in_zabelezi(rot, f"rot{kot}")

            # 4. Svetlost (Exposure up/down)
            shrani_in_zabelezi(spremeni_svetlost(img, 1.4), "bright")
            shrani_in_zabelezi(spremeni_svetlost(img, 0.6), "dark")

            # 5. Blur (Zameglitev) in Grainy (Šum)
            blur = cv2.GaussianBlur(img, (7, 7), 0)
            shrani_in_zabelezi(blur, "blur")
            grainy = dodaj_sum(img)
            shrani_in_zabelezi(grainy, "grainy")

            # 6. KOMBINACIJE (Zmeša filtre)
            # Ustvari še 5 unikatnih kombinacij
            for i in range(5):
                # Naključna rotacija + naključna svetlost
                c_img = rotiraj_sliko(img, random.randint(-20, 20))
                c_img = spremeni_svetlost(c_img, random.uniform(0.5, 1.5))
                # 50% možnosti, da dodamo še zrnatost
                if random.random() > 0.5:
                    c_img = dodaj_sum(c_img)
                
                shrani_in_zabelezi(c_img, f"comb_{i}")

        print(f"  [OK] Iz 30 slik za '{oseba}' je nastalo cca. 450+ različic.")

     # --- TOČKA 6: PRIPRAVA UČNE, VALIDACIJSKE IN TESTNE MNOŽICE ---
    print("\nRazvrščam slike v Train (70%), Val (15%) in Test (15%) množice...")
    random.shuffle(vse_generirane_slike)
    
    skupaj = len(vse_generirane_slike)
    meja_train = int(skupaj * 0.7)
    meja_val = int(skupaj * 0.85)

    razdelitev = {
        'train': vse_generirane_slike[:meja_train],
        'val': vse_generirane_slike[meja_train:meja_val],
        'test': vse_generirane_slike[meja_val:]
    }

    for ime_mnozice, slike in razdelitev.items():
        for pot_vira, oseba in slike:
            pot_cilja = os.path.join(split_path, ime_mnozice, oseba)
            if not os.path.exists(pot_cilja):
                os.makedirs(pot_cilja)
            shutil.copy(pot_vira, os.path.join(pot_cilja, os.path.basename(pot_vira)))

    print(f"\nUspeh! Predobdelava končana.")
    print(f"Dataset je razdeljen v: {split_path}")
    print("Mapi 'obdelani_podatki' in 'final_split' sta ignorirani v Git-u, surove slike pa so pripravljene za Push.")



if __name__ == "__main__":
    predobdelaj_podatke()
