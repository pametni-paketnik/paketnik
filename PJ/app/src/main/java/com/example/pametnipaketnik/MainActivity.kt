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
import android.util.Log
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private var currentUser: String = "Gost"

    val openCameraLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if(result.resultCode == RESULT_OK) {
                val boxId = result.data?.getStringExtra("boxId") ?: ""

                if(boxId.trim().isNotEmpty()){
                    openBoxThroughApi(boxId, currentUser)
                }else{
                    Toast.makeText(this, "Številka paketnika ni bila najdena", Toast.LENGTH_SHORT).show()
                }
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        currentUser = intent.getStringExtra("prijavljen_uporabnik") ?: "Gost"
        Toast.makeText(this, "Hello $currentUser!", Toast.LENGTH_SHORT).show()

        ViewCompat.setOnApplyWindowInsetsListener(binding.main) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        binding.buttonSettings.setOnClickListener {
            val intent = Intent(this, SettingsActivity::class.java)
            startActivity(intent)
        }
        binding.buttonOpenBox.setOnClickListener {
            val intent = Intent(this, OpenCameraActivity::class.java)
            openCameraLauncher.launch(intent)
        }
        binding.buttonHistory.setOnClickListener {
            val intent = Intent(this, HistoryActivity::class.java)
            startActivity(intent)
        }
        binding.btnBack.setOnClickListener {
            finish()
        }
        binding.btnHome.setOnClickListener {
            Toast.makeText(this, "Ste že na domači strani :)", Toast.LENGTH_SHORT).show()
        }
    }
    private fun openBoxThroughApi(boxId: String, userId: String){
        Toast.makeText(this, "Preverjanje pravic za paketnik...", Toast.LENGTH_SHORT).show()

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val reqData = OpenBoxRequest(boxId = boxId, userId = userId)
                val res = ApiClient.apiService.openBox(reqData)

                withContext(Dispatchers.Main) {
                    if (res.isSuccessful && res.body() != null) {
                        val openBoxResponse = res.body()!!

                        if (openBoxResponse.success) {
                            Toast.makeText(this@MainActivity, "Uspeh: ${openBoxResponse.message}", Toast.LENGTH_SHORT).show()
                            showOpenedDialog(boxId)
                        } else {
                            Toast.makeText(this@MainActivity, "Dostop zavrnjen: ${openBoxResponse.message}", Toast.LENGTH_LONG).show()
                        }
                    } else {
                        Toast.makeText(this@MainActivity, "Napaka API-ja: ${res.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@MainActivity, "Komunikacija z API-jem ni uspela", Toast.LENGTH_SHORT).show()
                }
            }
        }
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