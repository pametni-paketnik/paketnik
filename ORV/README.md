# ORV - Računalniški vid (Zajem in obdelava)

Ta mapa vsebuje Python orodja za vzpostavitev nabora učnih podatkov (dataset) za model razpoznave obrazov.

## ⚙️ 1. Priprava okolja

V terminalu se postavite v mapo `ORV` in izvedite naslednje korake:

1. **Ustvari virtualno okolje:**
   `python -m venv venv`

2. **Aktiviraj okolje glede na tvoj sistem:**

| Sistem / Terminal | Ukaz |
| :--- | :--- |
| **Windows PowerShell** | `.\venv\Scripts\Activate.ps1` |
| **Windows CMD** | `venv\Scripts\activate` |
| **macOS / Linux** | `source venv/bin/activate` |

*Ko je okolje aktivirano, boste v terminalu videli oznako `(venv)`.*

3. **Namesti knjižnice:**
   `pip install -r requirements.txt`

---

## 📸 2. Postopek zajema podatkov (Vsaka članica)

Vsaka članica ekipe mora v bazo prispevati **točno 30 slik** svojega obraza.

1. Zaženi: `python zajem_podatkov.py`
2. Vpiši svoje ime (npr. `manja` ali `nika`).
3. Postavi se pred kamero (zelen okvir mora zaznati obraz).
4. Pritisni **'s'** za zajem posamezne slike (ponavljaj do 30).
5. Pritisni **'q'** za izhod.

**Pomembno:** Surove slike iz mape `dataset/surovi_podatki/` commitajte in pushajte na GitHub, da jih dobijo ostale članice.

---

## 🛠️ 3. Predobdelava in generiranje učnih podatkov (Član 2)

Ko so v mapi `surovi_podatki` zbrani zajemi vseh treh članic (vsaj 3 mape, vsaka s 30 slikami), Član 2 zažene postopek augmentacije:

1. Zaženi: `python predobdelava.py`
2. Skripta bo samodejno preverila pogoje in iz 90 surovih slik generirala **~1300+ različic** (rotacije, svetlost, šum, zameglitev).
3. Obdelani podatki se shranijo v `dataset/obdelani_podatki/` in so pripravljeni za učenje modela.

*Opomba: Mapa `obdelani_podatki` je v `.gitignore` in se ne pošilja na GitHub zaradi velikosti.*

---

## 📋 Zahteve za delovanje skript
- **Število oseb:** Vsaj 3 (iris, manja, nika).
- **Število slik:** Vsaka oseba mora imeti točno 30 surovih slik.
- **Validacija:** Skripta `predobdelava.py` bo prekinila postopek, če pogoji niso izpolnjeni.