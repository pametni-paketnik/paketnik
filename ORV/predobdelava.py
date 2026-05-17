import cv2
import os
import numpy as np

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

if __name__ == "__main__":
    predobdelaj_podatke()
