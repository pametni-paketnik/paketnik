package com.example.pametnipaketnik

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import android.content.Context
import android.content.Intent
import android.media.MediaPlayer
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import com.example.pametnipaketnik.databinding.ActivityOpenCameraBinding
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import okhttp3.Call
import okhttp3.Callback
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import android.util.Base64
import android.util.Log
import android.util.Size
import androidx.camera.view.PreviewView
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody
import androidx.camera.core.ExperimentalGetImage
import java.io.FileInputStream
import java.util.zip.ZipInputStream

class OpenCameraActivity : AppCompatActivity() {
    private lateinit var binding: ActivityOpenCameraBinding
    private var lastBoxId: String = ""
    private var isScanned = false
    @OptIn(ExperimentalGetImage::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityOpenCameraBinding.inflate(layoutInflater)
        ViewCompat.setOnApplyWindowInsetsListener(binding.main) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        val previewView = PreviewView(this)
        setContentView(previewView)
        startCamera(previewView)
    }

    @OptIn(ExperimentalGetImage::class)
    private fun startCamera(previewView: PreviewView) {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            val preview = Preview.Builder().build()
            preview.setSurfaceProvider(
                previewView.surfaceProvider
            )

            val options = BarcodeScannerOptions.Builder()
                .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                .build()

            val scanner = BarcodeScanning.getClient(options)

            val imageAnalysis =
                ImageAnalysis.Builder()
                    .setTargetResolution(Size(1280,720))
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()

            imageAnalysis.setAnalyzer(ContextCompat.getMainExecutor(this)) { imageProxy ->
                val mediaImage = imageProxy.image

                if(mediaImage != null && !isScanned) {
                    val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
                    scanner.process(image)
                        .addOnSuccessListener { barcodes ->
                            for(barcode in barcodes) {
                                barcode.rawValue?.let { value ->
                                    isScanned = true
                                    Log.d("QR", "QR CODE: $value")
                                    openBox(this, value)
                                }
                            }
                        }
                        .addOnFailureListener {
                            Log.e("QR", "Napaka pri skeniranju")
                        }
                        .addOnCompleteListener {
                            imageProxy.close()
                        }
                } else {
                    imageProxy.close()
                }
            }
            cameraProvider.unbindAll()
            cameraProvider.bindToLifecycle(this, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageAnalysis)
        }, ContextCompat.getMainExecutor(this))
    }

    private fun openBox(context: Context, boxId: String) {
        lastBoxId = boxId
        val client = OkHttpClient()
        val json = JSONObject()
        json.put("boxId", boxId.toInt())
        json.put("tokenFormat", 6)
        val body = RequestBody.create("application/json".toMediaTypeOrNull(), json.toString())
        val request = Request.Builder()
            .url("https://api-d4me-stage.direct4.me/sandbox/v1/Access/openbox")
            .addHeader("Authorization", "Bearer 9ea96945-3a37-4638-a5d4-22e89fbc998f")
            .addHeader("Content-Type", "application/json")
            .addHeader("Accept", "application/json")
            .post(body)
            .build()
        client.newCall(request)
            .enqueue(object: Callback {
                override fun onFailure(call: Call, e: java.io.IOException) {
                    Log.e("API", e.toString())
                }

                override fun onResponse(call: Call, response: Response) {
                    val jsonResponse = response.body?.string()
                    Log.d("API_STATUS", "Code: ${response.code}")
                    Log.d("API_BODY", jsonResponse ?: "PRAZEN ODGOVOR")
                    if(!response.isSuccessful) {
                        Log.e("API", "API napaka: ${response.code}")
                        return
                    }
                    if(jsonResponse.isNullOrBlank()) {
                        Log.e("API", "Prazen odgovor iz API-ja")
                        return
                    }
                    val obj = JSONObject(jsonResponse)
                    val base64Data = obj.optString("data", "")
                    if(base64Data.isBlank()) {
                        Log.e("API", "V odgovoru ni data tokena")
                        return
                    }
                    playToken(this@OpenCameraActivity, base64Data)
                }
            })
    }
    private fun playToken(context: Context, base64Data: String) {
        try {
            val decodedBytes = Base64.decode(base64Data, Base64.DEFAULT)

            val file = File(context.cacheDir, "token.wav")
            FileOutputStream(file).use { fos ->
                fos.write(decodedBytes)
            }

            val mediaPlayer = MediaPlayer()
            mediaPlayer.setDataSource(file.absolutePath)
            mediaPlayer.prepare()
            mediaPlayer.start()

            Log.d("TOKEN", "Zvok se predvaja: ${file.absolutePath}")

            mediaPlayer.setOnCompletionListener {
                Log.d("TOKEN", "Zvok se je koncal")
                it.release()

                val resultIntent = Intent()
                resultIntent.putExtra("boxId", lastBoxId)

                setResult(RESULT_OK, resultIntent)
                finish()
            }

        } catch (e: Exception) {
            Log.e("TOKEN", "Napaka pri predvajanju tokena", e)
        }
    }
}