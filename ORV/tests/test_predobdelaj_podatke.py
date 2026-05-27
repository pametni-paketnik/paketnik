import os
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import predobdelava


class TestPredobdelajPodatke(unittest.TestCase):
    def test_vrni_none_ce_mape_ni(self):
        # Če ni mape dataset/surovi_podatki funkcija naj vrne None
        with tempfile.TemporaryDirectory() as td:
            cwd = os.getcwd()
            try:
                os.chdir(td)
                result = predobdelava.predobdelaj_podatke()
            finally:
                os.chdir(cwd)

        self.assertIsNone(result)

    def test_vrni_none_ce_premalo_oseb(self):
        # Če je manj kot 3 oseb v dataset/surovi_podatki funkcija naj vrne None
        with tempfile.TemporaryDirectory() as td:
            cwd = os.getcwd()
            try:
                os.chdir(td)
                os.makedirs(os.path.join('dataset', 'surovi_podatki', 'iris'))
                os.makedirs(os.path.join('dataset', 'surovi_podatki', 'manja'))

                result = predobdelava.predobdelaj_podatke()
            finally:
                os.chdir(cwd)

        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()