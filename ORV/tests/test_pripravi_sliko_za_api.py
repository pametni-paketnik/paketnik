import os
import sys
import unittest
import types
from unittest.mock import MagicMock, patch

import numpy as np
import cv2

ROOT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'api')
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import predobdelava


class TestPripraviSlikoZaApi(unittest.TestCase):
    def test_crop_then_resize_then_denoise_with_real_numpy_cv2(self):
        # Ustvari sintetično RGB sliko (enakomerna vrednost)
        image = np.full((200, 150, 3), 128, dtype=np.uint8)

        # mock detektor obraza, da vrne fiksni bbox (x, y, w, h)
        fake_cascade = MagicMock()
        fake_cascade.detectMultiScale.return_value = [(50, 60, 40, 40)]

        with patch.object(predobdelava.cv2, "data", types.SimpleNamespace(haarcascades=""), create=True), \
             patch.object(predobdelava.cv2, "CascadeClassifier", return_value=fake_cascade):
            result, obraz_najden = predobdelava.pripravi_sliko_za_api(image)

        # rezultat bi moral biti resize-iran na ciljno velikost (224,224,3)
        self.assertEqual(result.shape, (224, 224, 3))
        self.assertEqual(result.dtype, np.uint8)
        # vrednosti pikslov naj ostanejo v veljavnem uint8 intervalu
        self.assertTrue(result.min() >= 0 and result.max() <= 255)
        self.assertTrue(obraz_najden)


if __name__ == "__main__":
    unittest.main()