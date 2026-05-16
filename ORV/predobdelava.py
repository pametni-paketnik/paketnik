import os
import cv2
import numpy as np
import matplotlib.pyplot as plt

def zajemi_obraz():
    # 1. Nastavitve map
    base_path = "dataset/surovi_podatki"
    ime_osebe = input("Vnesite ime osebe, ki jo slikate: ").strip().lower()
    path = os.path.join(base_path, ime_osebe)
    # Ustvari mapo, če ne obstaja
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Ustvarjena mapa za: {ime_osebe}")

    # 2. Inicializacija kamere in detektorja
    # Uporabi vgrajen Haar Cascade za detekcijo obraza (standard)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    cap = cv2.VideoCapture(0) # 0 je privzeta kamera
    st_slik = 0

    print("\n--- NAVODILA ---")
    print("Pritisnite 's' za shranjevanje slike.")
    print("Pritisnite 'q' za izhod.")
    print("----------------\n")

    

if __name__ == "__main__":
    zajemi_obraz()
