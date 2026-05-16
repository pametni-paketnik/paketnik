import os
import cv2
import numpy as np
import matplotlib.pyplot as plt

def zajemi_obraz():
    # 1. Nastavitve map
    base_path = "dataset/surovi_podatki"
    ime_osebe = input("Vnesite ime osebe, ki jo slikate: ").strip().lower()
    path = os.path.join(base_path, ime_osebe)


if __name__ == "__main__":
    zajemi_obraz()
