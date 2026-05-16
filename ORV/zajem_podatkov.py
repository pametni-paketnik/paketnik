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

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Zrcaljenje slike (za lažje pozicioniranje)
        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Iskanje obrazov
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            # Narise moder kvadrat okoli obraza (guideline)
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            
            # Napis za uporabnika
            cv2.putText(frame, "Zaznan obraz", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

        # Prikaz okna
        cv2.imshow('Zajem podatkov za Smart Flower Locker', frame)

        tipka = cv2.waitKey(1) & 0xFF

        if tipka == ord('s'):
            # Če je zaznan vsaj en obraz shrani izrezek
            if len(faces) > 0:
                for (x, y, w, h) in faces:
                    # Izreže samo obraz
                    face_roi = frame[y:y+h, x:x+w]
                    img_name = f"{ime_osebe}_{st_slik}.jpg"
                    cv2.imwrite(os.path.join(path, img_name), face_roi)
                    print(f"Shranjena slika {st_slik}: {img_name}")
                    st_slik += 1
            else:
                print("Napaka: Obraz ni zaznan, slika ni shranjena!")

        elif tipka == ord('q'):
            break

    # Čiščenje
    cap.release()
    cv2.destroyAllWindows()
    print(f"\nZajem končan. Skupaj zajetih slik za {ime_osebe}: {st_slik}")

if __name__ == "__main__":
    zajemi_obraz()
