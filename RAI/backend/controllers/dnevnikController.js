const DnevnikOdklepov = require('../models/DnevnikOdklepov');

exports.dodajZapis = async (req, res) => {
  try {
    const zapis = new DnevnikOdklepov(req.body);
    const shranjen = await zapis.save();

    res.status(201).json(shranjen);
  } catch (napaka) {
    res.status(400).json({
      sporocilo: 'Napaka pri dodajanju zapisa v dnevnik',
      napaka: napaka.message
    });
  }
};

exports.pridobiVseZapise = async (req, res) => {
  try {
    const zapisi = await DnevnikOdklepov.find()
      .populate('narocilo_id')
      .populate('paketnik_id')
      .populate('uporabnik_id', 'ime priimek email')
      .sort({ createdAt: -1 });

    res.status(200).json(zapisi);
  } catch (napaka) {
    res.status(500).json({
      sporocilo: 'Napaka pri pridobivanju dnevnika',
      napaka: napaka.message
    });
  }
};

exports.pridobiZapiseZaPaketnik = async (req, res) => {
  try {
    const zapisi = await DnevnikOdklepov.find({
      paketnik_id: req.params.paketnikId
    })
      .populate('narocilo_id')
      .populate('uporabnik_id', 'ime priimek email')
      .sort({ createdAt: -1 });

    res.status(200).json(zapisi);
  } catch (napaka) {
    res.status(500).json({
      sporocilo: 'Napaka pri pridobivanju zapisov paketnika',
      napaka: napaka.message
    });
  }
};

exports.pridobiZapiseZaUporabnika = async (req, res) => {
  try {
    const zapisi = await DnevnikOdklepov.find({
      uporabnik_id: req.params.uporabnikId
    })
      .populate('narocilo_id')
      .populate('paketnik_id')
      .sort({ createdAt: -1 });

    res.status(200).json(zapisi);
  } catch (napaka) {
    res.status(500).json({
      sporocilo: 'Napaka pri pridobivanju zapisov uporabnika',
      napaka: napaka.message
    });
  }
};