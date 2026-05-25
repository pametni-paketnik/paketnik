package com.example.pametnipaketnik

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import android.widget.Button
import android.widget.ImageButton
import android.widget.Toast
import com.example.pametnipaketnik.databinding.ActivityFaceIdBinding



class FaceIdActivity : AppCompatActivity() {

    private lateinit var binding: ActivityFaceIdBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityFaceIdBinding.inflate(layoutInflater)
        // Edge-to-Edge
        enableEdgeToEdge()
        setContentView(binding.root)

        //odmiki zaradi statusne vrstice in prekrivanja napisa
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        //Gumb za nazaj
        binding.btnBack.setOnClickListener {
            finish()
        }
        // Povezava gumb capture
        binding.btnCapture.setOnClickListener {
            // Tukaj bo kasneje logika za zajem slike za ORV
            Toast.makeText(this, "Obraz zajet!", Toast.LENGTH_SHORT).show()
        }

    }
}