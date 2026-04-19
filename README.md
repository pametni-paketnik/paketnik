IDEJNI NAČRT – PAMETNI PAKETNIK ZA ROŽE
OPIS SISTEMA
Sistem omogoča uporabnikom, da preko mobilne aplikacije naročijo šopek rož, ki jih na izbran datum dostavi ponudnik v pametni paketnik. Uporabnik nato prejme obvestilo in lahko šopek prevzame v določenem času.

CILJNI UPORABNIKI
posamezniki - darila, podjetja - poslovna darila
DELOVANJE SISTEMA
	1	Uporabnik v aplikaciji izbere šopek
	2	Izbere datum dostave
	3	Izbere lokacijo paketnika
	4	Izvede naročilo in plačilo
	5	Na izbran dan cvetličarna dostavi šopek v paketnik
	6	Uporabnik prejme obvestilo
	7	Uporabnik odpre paketnik s prepoynavo obraza in prevzame šopek

USER STORIES (UPORABNIŠKE ZGODBE)
Za uporabnika
	•	Kot uporabnik želim pregledati ponudbo šopkov, da lahko izberem primernega.
	•	Kot uporabnik želim izbrati datum dostave, da šopek pride ob pravem času.
	•	Kot uporabnik želim izbrati lokacijo paketnika, da mi je prevzem priročen.
	•	Kot uporabnik želim plačati naročilo preko aplikacije, da je proces enostaven.
	•	Kot uporabnik želim prejeti obvestilo, ko je šopek dostavljen, da ga lahko prevzamem.
	•	Kot uporabnik želim prejeti kodo za odpiranje paketnika, da lahko dostopam do šopka.
Za sistem
	•	Sistem mora shranjevati naročila.
	•	Sistem mora generirati kodo za odpiranje paketnika.
	•	Sistem mora poslati obvestilo uporabniku.
	•	Sistem mora povezati paketnik z aplikacijo.

RAZDELITEV DELA
Član 1 – Frontend (aplikacija)
	•	UI za izbiro šopkov
	•	obrazec za naročilo
	•	prikaz obvestil

Član 2 – Backend
	•	API za naročila
	•	povezava z bazo (MongoDB)
	•	logika za kode paketnika

Član 3 – Sistem paketnika
	•	simulacija odpiranja paketnika
	•	generiranje/validacija kode
	•	povezava z backendom
	•	integracija plačil
	•	testiranje sistema
	•	dokumentacija


