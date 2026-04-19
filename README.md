# 🌸 SMART FLOWER LOCKER

## OPIS SISTEMA
Smart Flower Locker je inovativna rešitev za dostavo in prevzem cvetja preko pametnih paketnikov. Uporabnikom omogoča enostavno naročanje rož preko mobilne aplikacije in prevzem v bližnjem paketniku, brez potrebe po obisku fizične cvetličarne.

Cilj projekta je poenostaviti proces nakupa rož, povečati dostopnost ter zagotoviti optimalne pogoje za shranjevanje cvetja do trenutka prevzema.

---

## CILJNI UPORABNIKI
- posamezniki (darila)
- podjetja (poslovna darila)

---
## GLAVNE FUNKCIONALNOSTI

### 1. 📱 Mobilna aplikacija
Uporabnik lahko:
- izbira med različnimi vrstami rož in šopkov  
- odda naročilo  
- izbere lokacijo paketnika  
- prejema obvestila o dostavi in prevzemu  

---

### 2. 📦 Pametni paketnik
Posebej prilagojen za shranjevanje cvetja.

Vsebuje:
- senzor za zaznavanje odprtja/zaprtja vrat  
- notranjo LED osvetlitev (simulacija naravne svetlobe)  
- sistem za nadzor časa shranjevanja  

---

### 3. 🌼 Optimizirani pogoji za rože
- samodejni vklop svetlobe ob odprtju vrat  

Možnost nadgradnje:
- regulacija temperature  
- nadzor vlage  

---

## DELOVANJE SISTEMA
1. Uporabnik v aplikaciji izbere šopek  
2. Izbere datum dostave  
3. Izbere lokacijo paketnika  
4. Izvede naročilo in plačilo  
5. Na izbran dan cvetličarna dostavi šopek v paketnik  
6. Uporabnik prejme obvestilo  
7. Uporabnik odpre paketnik s prepoznavo obraza in prevzame šopek

Ob prevzemu:
- paketnik zazna odprtje vrat  
- vklopi se notranja svetloba  

---
## ČASOVNI ROK PREVZEMA
- maksimalni čas za prevzem: **3 dni**

Če paket ni prevzet:
- sistem samodejno označi paket za odstranitev  
- uporabnik prejme opozorilo  
- sproži se obvestilo za upravljalca sistema  

---

## 🔔 OBVESTILA
Uporabnik prejema:
- potrditev naročila  
- obvestilo o dostavi  
- opomnik za prevzem  
- opozorilo pred potekom roka  
- obvestilo o odstranitvi (če paket ni prevzet)  

---

## TEHNOLOŠKE KOMPONENTE
- IoT senzorji (zaznavanje vrat)  
- LED svetlobni sistem  
- backend sistem za upravljanje naročil  
- mobilna aplikacija (iOS / Android)  
- sistem za obveščanje (push notifikacije)  

---

## PREDNOSTI REŠITVE
- prihranek časa (brez iskanja cvetličarn)  
- dostopnost 24/7  
- boljša uporabniška izkušnja  
- optimalni pogoji za ohranjanje svežine rož  
- zmanjšanje logističnih težav  

---

## MOŽNE NADGRADNJE
- integracija z lokalnimi cvetličarnami  
- personalizirana priporočila  
- možnost darilnih sporočil  
- sledenje svežini cvetja  
- pametno hlajenje in vlaženje

---

## USER STORIES (UPORABNIŠKE ZGODBE)

### Za uporabnika
- Kot uporabnik želim pregledati ponudbo šopkov, da lahko izberem primernega.  
- Kot uporabnik želim izbrati datum dostave, da šopek pride ob pravem času.  
- Kot uporabnik želim izbrati lokacijo paketnika, da mi je prevzem priročen.  
- Kot uporabnik želim plačati naročilo preko aplikacije, da je proces enostaven.  
- Kot uporabnik želim prejeti obvestilo, ko je šopek dostavljen, da ga lahko prevzamem.  
- Kot uporabnik želim prejeti kodo za odpiranje paketnika, da lahko dostopam do šopka.  

### Za sistem
- Sistem mora shranjevati naročila.  
- Sistem mora generirati kodo za odpiranje paketnika.  
- Sistem mora poslati obvestilo uporabniku.  
- Sistem mora povezati paketnik z aplikacijo.  

---

## RAZDELITEV DELA

### Član 1 – Frontend (aplikacija)
- UI za izbiro šopkov  
- obrazec za naročilo  
- prikaz obvestil  

### Član 2 – Backend
- API za naročila  
- povezava z bazo (MongoDB)  
- logika za kode paketnika  

### Član 3 – Sistem paketnika
- simulacija odpiranja paketnika  
- generiranje/validacija kode  
- povezava z backendom  
- integracija plačil  
- testiranje sistema  
- dokumentacija


## 📎 ZAKLJUČEK
Smart Flower Locker predstavlja sodobno rešitev, ki združuje tehnologijo in praktičnost. Sistem izboljšuje uporabniško izkušnjo pri nakupu rož ter optimizira proces dostave in shranjevanja občutljivih izdelkov.
