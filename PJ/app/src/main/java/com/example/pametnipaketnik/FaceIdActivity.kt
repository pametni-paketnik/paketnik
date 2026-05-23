package com.example.pametnipaketnik

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import android.widget.Button
import android.widget.ImageButton
import android.widget.Toast


class FaceIdActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Edge-to-Edge
        enableEdgeToEdge()

        setContentView(R.layout.activity_face_id)

        //odmiki zaradi statusne vrstice in prekrivanja napisa
        val rootLayout = findViewById<android.view.View>(android.R.id.content)        // Če nimaš ID-ja na glavnem layoutu, lahko uporabiš: window.decorView.rootView
        ViewCompat.setOnApplyWindowInsetsListener(rootLayout) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Povezava gumb
        val captureButton = findViewById<ImageButton>(R.id.btn_capture)
        captureButton.setOnClickListener {
            // Tukaj bo kasneje logika za zajem slike za ORV
            Toast.makeText(this, "Obraz zajet!", Toast.LENGTH_SHORT).show()
        }
    }
}