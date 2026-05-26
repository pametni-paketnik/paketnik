package com.example.pametnipaketnik

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.example.pametnipaketnik.databinding.ActivityFaceIdBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class FaceIdActivity : AppCompatActivity() {

    private lateinit var binding: ActivityFaceIdBinding
    private lateinit var cameraExecutor: ExecutorService
    private var imageCapture: ImageCapture ?= null
    private var mode: String = "LOGIN"
    private var boxId: String = ""
    private var name: String = ""
    private var surname: String = ""
    private var email: String = ""
    private var password: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityFaceIdBinding.inflate(layoutInflater)
        enableEdgeToEdge()
        setContentView(binding.root)

        cameraExecutor = Executors.newSingleThreadExecutor()

        mode = intent.getStringExtra("MODE") ?: "LOGIN"
        boxId = intent.getStringExtra("boxId") ?: ""

        if (mode == "REGISTER") {
            name = intent.getStringExtra("NAME") ?: ""
            surname = intent.getStringExtra("SURNAME") ?: ""
            email = intent.getStringExtra("EMAIL") ?: ""
            password = intent.getStringExtra("PASSWORD") ?: ""
            binding.btnCapture.setImageResource(R.drawable.ic_camera_black)
        }

        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        startCamera()

        binding.btnBack.setOnClickListener {
            finish()
        }
        binding.btnHome.setOnClickListener {
            val intent = Intent(this, HomeActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            startActivity(intent)
            finish()
        }
        // Povezava gumb capture
        binding.btnCapture.setOnClickListener {
            takePhotoAndVerify()
        }
    }
    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

        cameraProviderFuture.addListener({
            val cameraProvider: ProcessCameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder()
                .build()
                .also {
                    it.setSurfaceProvider(binding.viewFinder.surfaceProvider)
                }

            // inicializaija ImageCapture objekta
            imageCapture = ImageCapture.Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                .setTargetRotation(binding.viewFinder.display.rotation)
                .build()
            //spredna kamera
            val cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageCapture)

            } catch (exc: Exception) {
                Log.e("FaceID", "Zagon kamere ni uspel", exc)
            }

        }, ContextCompat.getMainExecutor(this))
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor.shutdown()
    }
    private fun takePhotoAndVerify() {
        val imageCapture = imageCapture ?: return

        // zacasna datoteka kamor se bo shranila slika iz kamere
        val photoFile = File(cacheDir, "face_auth_capture.jpg")
        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

        Toast.makeText(this, "Procesiram obraz...", Toast.LENGTH_SHORT).show()

        imageCapture.takePicture(
            outputOptions,
            ContextCompat.getMainExecutor(this),
            object: ImageCapture.OnImageSavedCallback{
                override fun onError(exception: ImageCaptureException) {
                    Log.e("FaceID", "Zajem slike spodletel: ${exception.message}", exception)
                    Toast.makeText(this@FaceIdActivity, "Napaka pri slikanju", Toast.LENGTH_SHORT).show()
                }

                override fun onImageSaved(outputFileResults: ImageCapture.OutputFileResults) {
                    if(mode == "REGISTRE"){
                        sendRegisterFaceOnServer(photoFile)
                    }else{
                        sendImageOnServer(photoFile)
                    }
                }
            }
        )
    }
    private fun sendImageOnServer(fileImage: File){
        val requiresFile = fileImage.asRequestBody("image/jpeg".toMediaTypeOrNull())
        val body = MultipartBody.Part.createFormData("file", fileImage.name, requiresFile)

        lifecycleScope.launch(Dispatchers.IO) {
            try{
                val res = ApiClient.apiService.verifyFace(body)

                withContext(Dispatchers.Main) {
                    if (res.isSuccessful && res.body() != null) {
                        val result = res.body()!!

                        if (result.verified) {
                            Toast.makeText(this@FaceIdActivity, "Prijava uspešna! Živijo ${result.label}", Toast.LENGTH_SHORT).show()

                            val intent = Intent(this@FaceIdActivity, MainActivity::class.java)
                            intent.putExtra("prijavljeni_uporabnik", result.label) // Shranimo ime za kasnejše odpiranje
                            startActivity(intent)
                            finish()

                        } else {
                            Toast.makeText(this@FaceIdActivity, "Obraz ni prepoznan: ${result.message}", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        Toast.makeText(this@FaceIdActivity, "Napaka na strežniku: ${res.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
            }catch (e: Exception){
                Log.e("FaceID", "Napaka pri povezavi: ${e.message}", e)
                withContext(Dispatchers.Main){
                    Toast.makeText(this@FaceIdActivity, "Povezava s strežnikom ni uspela", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
    private fun sendRegisterFaceOnServer(fileImage: File){
        val requiresFile = fileImage.asRequestBody("image/jpeg".toMediaTypeOrNull())
        val filePart = MultipartBody.Part.createFormData("file", fileImage.name, requiresFile)

        val nameBody = name.toRequestBody("text/plain".toMediaTypeOrNull())
        val surnameBody = surname.toRequestBody("text/plain".toMediaTypeOrNull())
        val emailBody = email.toRequestBody("text/plain".toMediaTypeOrNull())
        val passwordBody = password.toRequestBody("text/plain".toMediaTypeOrNull())

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val res = ApiClient.apiService.registerFaceWithData(filePart, nameBody, surnameBody, emailBody, passwordBody)

                withContext(Dispatchers.Main){
                    if(res.isSuccessful && res.body() != null){
                        Toast.makeText(this@FaceIdActivity, "Registracija s FaceID uspešna", Toast.LENGTH_SHORT).show()

                        val intent = Intent(this@FaceIdActivity, LoginActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    } else{
                        Toast.makeText(this@FaceIdActivity, "Registracija spodletela ${res.code()}",
                            Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception){
                Log.e("FaceID", "Napaka pri registraciji obraza: ${e.message}", e)
                withContext(Dispatchers.Main){
                    Toast.makeText(this@FaceIdActivity, "Povezava s strežnikom ni uspela", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}












