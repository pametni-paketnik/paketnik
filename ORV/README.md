# ORV - Računalniški vid (Zajem in obdelava)

Ta mapa vsebuje Python skripte za zajem učnih podatkov in predobdelavo slik obrazov.

## Navodila za pripravo okolja

Da bo skripta delovala, si pripravi virtualno okolje (v terminalu), Glede na vaš sistem in terminal uporabite ustrezen ukaz znotraj mape `ORV`:

1. **Ustvari virtualno okolje:**
   `python -m venv venv`

2. **Aktiviraj okolje:**

    | **Windows PowerShell** | `.\venv\Scripts\Activate.ps1` 

    | **Windows CMD** | `venv\Scripts\activate` 

    | **macOS / Linux** | `source venv/bin/activate` 

Ko je okolje aktivirano, boste v terminalu videli napis `(venv)`.

3. **Namesti potrebne knjižnice:**
   `pip install -r requirements.txt`

## Uporaba
- `zajem_podatkov.py`: Odpre kamero. Pritisni **'s'** za shranjevanje slike in **'q'** za izhod.