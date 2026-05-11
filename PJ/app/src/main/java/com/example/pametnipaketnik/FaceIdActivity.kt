package com.example.pametnipaketnik

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import android.widget.Button
import android.widget.Toast


class FaceIdActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_face_id)

        val captureButton = findViewById<Button>(R.id.btn_capture)
        captureButton.setOnClickListener {
            // Tukaj bo kasneje logika za CameraX zajem
            Toast.makeText(this, "Obraz zajet!", Toast.LENGTH_SHORT).show()
        }
    }
}