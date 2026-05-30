##1.KORAK
	* Na svoja Gmail naslova bosta prejeli vabilo od Googla/Firebasea.
	* V e-pošti morata klikniti gumb Accept invitation (Sprejmi vabilo).
	* Pojdita na Firebase Console in se prijavita s svojim osebnim Gmail računom.
	* Kliknita na projekt Pametni Paketnik.
	* Na glavni strani (zgoraj levo) kliknita na ikono zobnika (Nastavitve projekta) -> Project settings.
	* Ostanita na prvem zavihku (General) in se pomaknita čisto na dno strani do razdelka "Your apps".
	* Tam bosta videli ikono Android aplikacije in poleg nje velik moder gumb google-services.json. 	- Kliknita ga in 		prenesita datoteko na računalnik.

Kam jo vstaviti: To preneseno datoteko ročno skopirajta v svojo mapo projekta pod:
📂 PametniPaketnik / PJ / app / (Nujno mora biti v mapi app, sicer se Android projekt ne bo zagnal).

##2.KORAK
	* V Android Studiu (ali VS Code) odprita datoteko .gitignore, ki se nahaja v mapi PametniPaketnik / PJ / (glavna mapa 		Android projekta (app)).
	* Poglejta, če je v njej že zapisana spodnja vrstica. Če je ni, jo ročno dopišita na konec datoteke:
	    
        /google-services.json

    * Shranita datoteko. Zdaj bo Git to datoteko popolnoma ignoriral in je ne bo ponujal za git add.

##3.KORAK
	* Pojdita na Firebase Console in odprita projekt Pametni Paketnik.
	* Zgoraj levo (zraven Project Overview) kliknita na ikono zobnika (Nastavitve) in izberita Project 	settings.
	* Na vrhu kliknita na zavihek Service accounts.
	* Prepričajta se, da je označena izbira Python in na dnu strani kliknita velik moder gumb Generate 	new private key 		(Ustvari nov zasebni ključ).
	* Pojavilo se bo opozorilo, kjer potrdita s klikom na Generate key. Na računalnik se bo prenesla .json 	datoteka (ime 		bo nekaj v stilu pametni-paketnik-firebase-adminsdk-....json). - lahko ga pustita kar pod prenosi kamor se vama shrani 		(ne devaj v mapo projekta)
	
##4.KORAK
	* Odprita urejevalnik kode (npr. VS Code) in se postavita v mapo:
	📂 PametniPaketnik / ORV / api /
	* ko sta v mapi .env vstavita: 

    FIREBASE_CREDENTIALS='{"type": "service_account", "project_id": "pametni-paketnik", "private_key": "...", ...}' <- (ime pustita tocno tako kot je, v zavite oklepaje vstavita vsebino ki ključa ki sta ga generirale v koraku 3 pametni-paketnik-firebase-adminsdk-....json })
	
    ⚠️ Pomembno opozorilo za FIREBASE_CREDENTIALS: Celotna vsebina Firebase JSON ključa (tistega, ki se prenese iz Service Accounts - preneseno v koraku 3) mora biti zapakirana v eni sami vrstici in obdana z enojnimi narekovaji ('), sicer bo Python javljal napako pri branju.





