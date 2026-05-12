package com.example.pametnipaketnik

import android.content.Intent
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.pametnipaketnik.databinding.ActivityMainBinding
import android.Manifest
import android.os.Build
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        ViewCompat.setOnApplyWindowInsetsListener(binding.main) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        checkPermissions()


        binding.buttonLogin.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
        }

        val openCameraLauncher =
            registerForActivityResult(androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult()) { result ->
                if(result.resultCode == RESULT_OK) {
                    val boxId = result.data?.getStringExtra("boxId") ?: "352"
                    showOpenedDialog(boxId)
                }
            }

        binding.buttonOpenBox.setOnClickListener {
            val intent = Intent(this, OpenCameraActivity::class.java)
            openCameraLauncher.launch(intent)
        }
        binding.buttonHistory.setOnClickListener {
            val intent = Intent(this, HistoryActivity::class.java)
            startActivity(intent)
        }

    }
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val cameraGranted = permissions[Manifest.permission.CAMERA] ?: false
        val notifyGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions[Manifest.permission.POST_NOTIFICATIONS] ?: false
        } else {
            true // Na starejših verzijah je obvestilo privzeto dovoljeno
        }

        if (cameraGranted && notifyGranted) {
            // Vse je super
        } else {
            Toast.makeText(this, "Aplikacija potrebuje dovoljenja za polno delovanje!", Toast.LENGTH_LONG).show()
        }
    }
    private fun checkPermissions() {
        val permissionsToRequest = mutableListOf(Manifest.permission.CAMERA)

        // Obvestila zahtevajo dovoljenje samo od Androida 13 naprej
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        requestPermissionLauncher.launch(permissionsToRequest.toTypedArray())
    }
    private fun showOpenedDialog(boxId: String) {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Paketnik")
            .setMessage("Ali se je paketnik odprl?")
            .setPositiveButton("Da") {_, _ ->
                saveHistory(boxId, true)
            }
            .setNegativeButton("Ne") {_, _ ->
                saveHistory(boxId, false)
            }
            .show()
    }
    private fun saveHistory(boxId: String, opened: Boolean) {
        val prefs = getSharedPreferences("history", MODE_PRIVATE)
        val oldHistory = prefs.getString("items", "[]") ?: "[]"

        val jsonArray = org.json.JSONArray(oldHistory)

        val status = if (opened) "Odprto" else "Ni bilo odprto"
        val date = java.text.SimpleDateFormat("dd.MM.yyyy HH:mm", java.util.Locale.getDefault()).format(java.util.Date())

        val item = org.json.JSONObject()
        item.put("date", date)
        item.put("boxId", boxId)
        item.put("status", status)

        jsonArray.put(item)
        prefs.edit()
            .putString("items", jsonArray.toString())
            .apply()
    }
}