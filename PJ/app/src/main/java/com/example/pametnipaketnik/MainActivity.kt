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
    private var currentUserName: String = "Gost"
    private var currentUserId: String = ""
    private var selectedOrder: Order? = null

    val openCameraLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if(result.resultCode == RESULT_OK) {
                val scannedBox = result.data?.getStringExtra("boxId") ?: ""

                if (scannedBox.trim().isNotEmpty()){
                    openBoxThroughApi(scannedBox, currentUserId)
                } else {
                    Toast.makeText(this, "Številka paketnika ni bila najdena", Toast.LENGTH_SHORT).show()
                }
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        ApiClient.initBackend(getString(R.string.backend_api_base_url))

        currentUserName = intent.getStringExtra("prijavljen_uporabnik") ?: "Gost"
        Toast.makeText(this, "Hello $currentUserName!", Toast.LENGTH_SHORT).show()

        ViewCompat.setOnApplyWindowInsetsListener(binding.main) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        currentUserId = intent.getStringExtra("USER_ID") ?: ""

        if (currentUserId.isEmpty()) {
            val sharedPreferences = getSharedPreferences("UserPrefs", MODE_PRIVATE)
            currentUserId = sharedPreferences.getString("LOGGED_IN_USER_ID", "") ?: ""
        }
        Log.d("MainActivity_Debug", "Naložen uporabnik: $currentUserName z ID: $currentUserId")

        if (currentUserId.isNotEmpty()) {
            loadOrders()
        } else {
            Toast.makeText(this, "Napaka: ID uporabnika ni zaznan!", Toast.LENGTH_LONG).show()
        }

        binding.buttonSettings.setOnClickListener {
            val intent = Intent(this, SettingsActivity::class.java)
            startActivity(intent)
        }
        /*binding.buttonOpenBox.setOnClickListener {
            val intent = Intent(this, OpenCameraActivity::class.java)
            openCameraLauncher.launch(intent)
        }*/
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

    private fun loadOrders(){
        if(currentUserId.isEmpty()) {
            Toast.makeText(this, "Napaka: ID uporabnika ni najden", Toast.LENGTH_SHORT).show()
            return
        }
        lifecycleScope.launch(Dispatchers.Main) {
            try {
                val res = withContext(Dispatchers.IO){
                    ApiClient.backendApiService.getOrders(currentUserId)
                }
                if(res.isSuccessful && res.body() != null){
                    val order_list = res.body()!!

                    if(order_list.isEmpty()){
                        Toast.makeText(this@MainActivity, "Nimate aktivnih naročil", Toast.LENGTH_SHORT).show()
                    }
                    val timelineItems = mutableListOf<TimelineItem>()

                    val format = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
                    val today = java.util.Date()

                    val groupToday = mutableListOf<Order>()
                    val groupYesterday = mutableListOf<Order>()
                    val groupExpired = mutableListOf<Order>()
                    val groupEarlier = mutableListOf<Order>()

                    for (order in order_list) {
                        try {
                            val orderDate = format.parse(order.date) ?: today
                            val diffInMillies = today.time - orderDate.time
                            val diffInDays = java.util.concurrent.TimeUnit.MILLISECONDS.toDays(diffInMillies)

                            if (order.status.equals("Prevzeto", ignoreCase = true)) {
                                groupEarlier.add(order)
                            } else if (diffInDays == 0L) {
                                groupToday.add(order)
                            } else if (diffInDays == 1L) {
                                groupYesterday.add(order)
                            } else if (diffInDays > 3L) {
                                groupExpired.add(order)
                            } else {
                                groupEarlier.add(order)
                            }
                        } catch (e: Exception) {
                            groupEarlier.add(order)
                        }
                    }

                    if (groupToday.isNotEmpty()) {
                        timelineItems.add(HeaderItem("Danes"))
                        timelineItems.addAll(groupToday)
                    }
                    if (groupYesterday.isNotEmpty()) {
                        timelineItems.add(HeaderItem("Včeraj"))
                        timelineItems.addAll(groupYesterday)
                    }
                    if (groupExpired.isNotEmpty()) {
                        timelineItems.add(HeaderItem("Potekel rok za prevzem"))
                        timelineItems.addAll(groupExpired)
                    }
                    if (groupEarlier.isNotEmpty()) {
                        timelineItems.add(HeaderItem("Starejša in prevzeta naročila"))
                        timelineItems.addAll(groupEarlier)
                    }

                    val adapter = OrderAdapter(timelineItems) { clickedOrder ->
                        selectedOrder = clickedOrder

                        val intent = Intent(this@MainActivity, OpenCameraActivity::class.java)
                        openCameraLauncher.launch(intent)
                    }
                    binding.recyclerViewOrders.adapter = adapter
                } else {
                    Toast.makeText(this@MainActivity, "Napaka pri prenosu naročil: ${res.code()}",
                        Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@MainActivity, "Ni povezave do strežnika za naročila", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
    private fun openBoxThroughApi(boxId: String, userId: String){
        Toast.makeText(this, "Preverjanje pravic za paketnik...", Toast.LENGTH_SHORT).show()

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val reqData = OpenBoxRequest(boxId = boxId, userId = userId)
                val res = ApiClient.backendApiService.openBox(reqData)

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