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

    # Prešteje obstoječe slike v mapi
    obstojece_slike = [f for f in os.listdir(path) if f.endswith('.jpg')]
    st_obstojecih = len(obstojece_slike)

    if st_obstojecih >= 30:
        print(f"\n[!] Napaka: Za osebo '{ime_osebe}' je že zajetih {st_obstojecih} slik.")
        print(f"Če želite zamenjati slike, jih ročno izbrišite iz mape: {path}")
        return

    print(f"\nTrenutno v mapi: {st_obstojecih} slik. Cilj: 30 slik.")

    # 2. Inicializacija kamere in detektorja
    # Uporabi vgrajen Haar Cascade za detekcijo obraza (standard)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    cap = cv2.VideoCapture(0) # 0 je privzeta kamera
    st_zajetih_v_tej_seji = 0

    print(f"\nTrenutno v mapi: {st_obstojecih}. Potrebujemo še {30 - st_obstojecih}.")

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
            # Doda 20% zamika (padding)
            offset_w = int(w * 0.2)
            offset_h = int(h * 0.2)
            # Izračuna nove koordinate
            y1 = max(0, y - offset_h)
            y2 = min(frame.shape[0], y + h + offset_h)
            x1 = max(0, x - offset_w)
            x2 = min(frame.shape[1], x + w + offset_w)

            # Narise moder kvadrat okoli obraza (guideline)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            
            # Napis za uporabnika
            cv2.putText(frame, "Zaznan obraz", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

        # Prikaz okna
        skupno_slik = st_obstojecih + st_zajetih_v_tej_seji
        cv2.imshow(f'Zajem podatkov za Smart Flower Locker ({skupno_slik}/30) - S za slikaj, Q za izhod', frame)

        tipka = cv2.waitKey(1) & 0xFF

        if tipka == ord('s'):
            if skupno_slik < 30:
            # Če je zaznan vsaj en obraz shrani izrezek
                if len(faces) > 0:
                    for (x, y, w, h) in faces:
                        # Shrani z unikatnim imenom (uporabi indeks, ki še ne obstaja)
                        indeks = skupno_slik
                        # Izreže samo obraz
                        # širši izrezek (x1, y1, x2, y2 izračunan zgoraj)
                        face_roi = frame[y1:y2, x1:x2]
                        img_name = f"{ime_osebe}_{st_zajetih_v_tej_seji }.jpg"
                        cv2.imwrite(os.path.join(path, f"{ime_osebe}_{indeks}.jpg"), face_roi)
                        st_zajetih_v_tej_seji  += 1
                        print(f"Shranjena slika {skupno_slik + 1}/30 : {img_name}")
                else:
                    print("Napaka: Obraz ni zaznan, slika ni shranjena!")

            else:
                print("\n[!] Dosegli ste limit 30 slik. Pritisnite 'q' za izhod.")

        elif tipka == ord('q'):
            break

    # Čiščenje
    cap.release()
    cv2.destroyAllWindows()
    print(f"\nZajem končan. Skupaj zajetih slik za {ime_osebe}: {st_zajetih_v_tej_seji }")

if __name__ == "__main__":
    zajemi_obraz()
