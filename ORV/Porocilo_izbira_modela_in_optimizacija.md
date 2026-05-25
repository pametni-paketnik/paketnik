1. IZBIRA MODELOV IN ALGORITMOV

Za reševanje zastavljenega problema smo izbrali pristop prenosnega učenja (Transfer Learning) z uporabo konvolucijske nevronske mreže ResNet18, ki je bila vnaprej naučena na podatkovni zbirki ImageNet.

Zakaj ResNet18? Arhitektura ResNet (Residual Networks) z uporabo "bližnjic" (skip connections) učinkovito rešuje problem izginjajočega gradienta v globokih mrežah. Različica z 18 plastmi ponuja odličen kompromis med računsko zahtevnostjo (hitrostjo učenja) in natančnostjo modela, kar je idealno za projektne naloge z omejenimi viri.

Kaj smo prilagodili? Ker je bil originalni model naučen za klasifikacijo 1000 razredov, smo zadnjo polno povezano plast (fully connected layer) odstranili in jo nadomestili z novo linearno plastjo, ki ustreza številu razredov v našem specifičnem problemu. Zamrznili smo začetne plasti mreže (feature extractor) in preizkusili učenje celotne mreže z nizko stopnjo učenja v primerjavi z učenjem le zadnje klasifikacijske plasti.

2. OPTIMIZACIJA HIPERPARAMTEROV IN POTEK UČENJA

Ena epoha pmeni da je nevronska mreža šla točno enkrat skozi celotno učno množico (pomeni da vidi vse slike v učni množici enkrat).
Ker so nevronske mreže prevelike, da bi jih nevronska mreža obdelala naenkrat, jih razdelimo na manjše dele (Batch Size). Ko se zvrsti toliko teh manjših delov, da so obdelane vse slike, je zaključena 1 epoha. Z večanjem števila epoh se model večkrat uči iz istih podatkov in s tem izboljšuje svojo natančnost, vendar lahko preveliko število epoh privede do prevelikega prilagajanja (overfitting).

Da bi našli najbolj optimalno konfiguracijo za našo podatkovno zbirko, smo izvedli sistematsko iskanje po mreži nasljednjih parametrov: 

    1. STOPNJA UČENJA (Learning Rate [0.01, 0.001, 0.0001])
    Stopnja učenja določa, kako velike korake dela algoritem pri popravljanju uteži mreže.

    0.01: Izbrana kot višja stopnja učenja. Pomembna je za optimizator SGD, da se premakne iz lokalnih minimumov, medtem ko je za Adama pogosto previsoka in lahko povzroči divjanje (divergenco) modela.

    0.001: To je industrijski standard in privzeta vrednost za večino optimizatorjev (vključno z Adamom). Pogosto predstavlja idealno ravnovesje med hitrostjo in natančnostjo.

    0.0001: Nizka stopnja učenja. Izbrali smo jo zato, ker uporabljamo vnaprej naučen model (ResNet18). Pri prenosnem učenju ne želimo uničiti že naučenih značilnosti iz zbirke ImageNet, zato fine nastavitve (fine-tuning) pogosto zahtevajo zelo majhne korake.

    2. OPTIMIZATORJA (Adam in SGD): 
    SGD: Izbran kot osnovni (baseline) algoritem. Je matematično preprost, stabilen in ob pravilno nastavljeni stopnji učenja pogosto doseže odlično generalizacijo na testnih podatkih, čeprav se uči dlje časa.

    Adam: Izbran zaradi svoje prilagodljivosti (adaptivnosti). Ker samostojno prilagaja stopnjo učenja za vsak parameter, je izjemno robusten in hiter. Primerjava med SGD in Adamom nam daje jasen vpogled v to, ali naš problem bolje deluje s fiksnimi ali dinamičnimi koraki učenja.

    3. ŠTEVILO EPOH (5, 10, 12): 
    Ker uporabljamo prenosno učenje in že vnaprej naučen model ResNet18, mreža že "zna" prepoznavati robove, oblike in teksture.

    5 epoh: Izbrali smo kot spodnjo mejo, da preverimo, ali se model z optimizatorjem Adam uspe naučiti razlikovati nove razrede v zelo kratkem času.

    10 in 12 epoh: Ti dve vrednosti sta bili izbrani z namenom, da modelu omogočimo dovolj časa za konvergenco (stabilizacijo natančnosti), hkrati pa meja ni nastavljena previsoko, s čimer smo preprečili preveliko prilagajanje (overfitting) in pretirano porabo računalniškega časa. 

    4. VELIKOST SERIJE (Batch Size [32, 64, 128]): 
    Velikost serije določa, koliko slik si model ogleda, preden posodobi svoje uteži.

    32: Manjša serija pomeni več šuma pri posodabljanju gradientov, kar deluje kot oblika regularizacije (pomaga modelu ven iz slabih lokalnih minimumov).

    64 in 128: Večje serije ponujajo bolj stabilne in natančne ocene gradienta ter omogočajo boljšo izrabo grafične kartice (GPU) za vzporedno računanje, kar močno pospeši čas učenja.

POTEK OPTIMIZACIJE
Učeneje jje potekalo iterativno. Za vsako kombinacijo zgoraj navedenih hiperparametrov smo model naučili na učni zbirki (train set) in sproti preverjali njegovo uspešnost na validacijski zbirki (validation set).
    SGD: Predstavlja klasičen pristop s konstantno stopnjo učenja. Je stabilen, a včasih potrebuje več časa (epoh), da najde globalni minimum, sploh če se zatakne v sedlastih točkah.

    Adam: Združuje prednosti algoritmov AdaGrad in RMSProp. Izračunava prilagodljive stopnje učenja za vsak parameter posebej (preko spremljanja prvega in drugega momenta gradientov). Izbrali smo ga, ker je znan po izjemno hitri konvergenci in dobrem delovanju že pri privzetih nastavitvah.

(rezultati optimizacije se nahajajo v porocilo_optimizacije_modela.pdf)





Za končni produkcijski model (Face ID sistem) smo kljub visokim rezultatom modela pri 12 epoha izbrali konfiguracijo Adam (LR=0.01, Batch=128) pri le 5 epoha. Slednji je namreč dosegel primerljivo nizko validacijsko izgubo v bistveno krajšem času. Z uveljavitvijo koncepta zgodnjega zaustavljanja (Early Stopping) smo minimizirali tveganje za preučenost (overfitting), ki je pri varnostno kritičnih sistemih, kot je prepoznavanje obrazov, nesprejemljiva. Krajši čas učenja zagotavlja večjo robustnost modela na nepredviden šum v realnem okolju (npr. sprememba osvetlitve ali kota kamere) in boljšo sposobnost generalizacije.