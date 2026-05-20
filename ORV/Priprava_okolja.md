1. Kje odpremo? 
Windows: V iskanje (zraven gumba Start) vtipkaj Anaconda Prompt ali Anaconda PowerShell Prompt and ga zaženi. (Navaden CMD ali PowerShell morda ne bosta prepoznala ukaza conda, če poti niso ročno nastavljene, zato obvezno uporabi Anaconda Prompt).
macOS / Linux: Odpri navaden sistemski Terminal. Ker imaš Anacondo že nameščeno, bo ukaz conda tam že deloval (to vidiš po tem, da ti na levi strani vrstice verjetno že piše (base)).

Korak 1: Ustvari okolje. Vpiši spodnji ukaz in pritisni Enter. Ko te vpraša Proceed (y/n)?, pritisni tipko y in nato Enter.
Bash
    conda create -n racunalniski_vid python=3.10

Korak 2: Aktiviraj okolje.
Bash
    conda activate racunalniski_vid

Opazil boš, da se je napis na skrajni levi strani terminala spremenil iz (base) v (racunalniski_vid). To je znak, da si uspešno "vstopil" v svoje novo, čisto okolje.

Korak 3 (Izbira mape): Sedaj pa postane mapa pomembna! Premakni se v mapo, kjer imaš shranjen svoj projekt (kjer so slike in kjer želiš imeti svojo kodo). Za premikanje med mapami uporabi cd ukaz

Korak 4: Namesti knjižnice, ki jih potrebuješ za učenje modela:
Bash
    pip install torch torchvision torchaudio
    pip install opencv-python scikit-learn matplotlib jupyter

Korak 5: Zaženi okolje za pisanje kode (Jupyter Notebook):
Bash
    jupyter notebook

To bo v tvojem brskalniku odprlo okno, kjer boš videl datoteke v tvoji mapi projekta. Tam klikneš New -> Notebook (Python 3)

