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


def predobdelaj_podatke():
    raw_path = "dataset/surovi_podatki"
    proc_path = "dataset/obdelani_podatki"
    target_size = (224, 224) #velikost

    if not os.path.exists(proc_path):
        os.makedirs(proc_path)

    print("Začenjam s predobdelavo...")

     # Gre čez vse mape oseb (iris, nika, itd.)
    for oseba in os.listdir(raw_path):
        oseba_raw_dir = os.path.join(raw_path, oseba)
        oseba_proc_dir = os.path.join(proc_path, oseba)

        if not os.path.isdir(oseba_raw_dir):
            continue

        if not os.path.exists(oseba_proc_dir):
            os.makedirs(oseba_proc_dir)

        print(f"\nObdelujem osebo: {oseba}")

        for img_name in os.listdir(oseba_raw_dir):
            img_path = os.path.join(oseba_raw_dir, img_name)
            img = cv2.imread(img_path)

            if img is None:
                continue

             # 1. SPREMEMBA VELIKOSTI (Resizing)
            img_resized = cv2.resize(img, target_size)

            # 2. PRETVORBA V SIVINE (če rabi Člana 2)
            img_gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
            
            # SHRANJEVANJE ORIGINALNE (pomanjšane) SLIKE
            cv2.imwrite(os.path.join(oseba_proc_dir, f"proc_{img_name}"), img_resized)

            # 3. AUGMENTACIJA (Horizontalni flip - zrcaljenje)
            # Za podvojeno št slik brez dodatnega slikanja
            img_flip = cv2.flip(img_resized, 1)
            cv2.imwrite(os.path.join(oseba_proc_dir, f"aug_flip_{img_name}"), img_flip)

            print(f"  - Obdelana slika: {img_name} (+ augmentacija)")

    print("\nPredobdelava končana! Slike so v mapi 'dataset/obdelani_podatki'.")

if __name__ == "__main__":
    predobdelaj_podatke()
