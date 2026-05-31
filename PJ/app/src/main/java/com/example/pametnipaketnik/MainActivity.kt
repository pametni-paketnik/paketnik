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
import com.google.firebase.messaging.FirebaseMessaging
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.sql.Date
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.concurrent.TimeUnit
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private var currentUserName: String = "Gost"
    private var currentUserId: String = ""

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

        currentUserName = intent.getStringExtra("prijavljen_uporabnik") ?: "Gost"
        Toast.makeText(this, "Hello $currentUserName!", Toast.LENGTH_SHORT).show()

        ViewCompat.setOnApplyWindowInsetsListener(binding.main) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val requestPermissionLauncher = registerForActivityResult(
                ActivityResultContracts.RequestPermission()
            ) { isGranted: Boolean ->
                if (isGranted) {
                    Log.d("MainActivity_Debug", "Uporabnik je odobril obvestila!")
                } else {
                    Toast.makeText(this, "Brez dovoljenja ne boste prejemali obvestil o paketih!", Toast.LENGTH_LONG).show()
                }
            }

            if (androidx.core.content.ContextCompat.checkSelfPermission(
                    this, Manifest.permission.POST_NOTIFICATIONS
                ) != android.content.pm.PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        currentUserId = intent.getStringExtra("USER_ID") ?: ""
        if (currentUserId.isEmpty()) {
            val sharedPreferences = getSharedPreferences("UserPrefs", MODE_PRIVATE)
            currentUserId = sharedPreferences.getString("LOGGED_IN_USER_ID", "") ?: ""
        }
        Log.d("MainActivity_Debug", "Naložen uporabnik: $currentUserName z ID: $currentUserId")

        binding.recyclerViewOrders.layoutManager = LinearLayoutManager(this)

        if (currentUserId.isNotEmpty()) {
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (!task.isSuccessful) {
                    Log.w("MainActivity_Debug", "Pridobivanje FCM žetona ni uspelo", task.exception)
                    loadOrders()
                    return@addOnCompleteListener
                }

                val token = task.result
                Log.d("FCM_Token", "TRENUTNI ZETON NAPRAVE: $token")

                if (token != null) {
                    lifecycleScope.launch(Dispatchers.IO) {
                        try {
                            val requestModel = FCMTokenRequest(userId = currentUserId, fcmToken = token)
                            val response = ApiClient.apiService.updateFcmToken(requestModel)

                            withContext(Dispatchers.Main) {
                                if (response.isSuccessful) {
                                    Log.d("MainActivity_Debug", "FCM Žeton uspešno posodobljen na strežniku.")
                                } else {
                                    Log.e("MainActivity_Debug", "API javlja napako pri shranjevanju žetona: ${response.code()}")
                                }
                                loadOrders()
                            }
                        } catch (e: Exception) {
                            Log.e("MainActivity_Debug", "Komunikacija s strežnikom za FCM žeton ni uspela", e)
                            withContext(Dispatchers.Main) { loadOrders() }
                        }
                    }
                } else {
                    loadOrders()
                }
            }
        } else {
            Toast.makeText(this, "Napaka: ID uporabnika ni zaznan!", Toast.LENGTH_LONG).show()
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
            intent.putExtra("USER_ID", currentUserId)
            startActivity(intent)
        }
        /*binding.btnBack.setOnClickListener {
            finish()
        }*/
    }

    private fun loadOrders(){
        if(currentUserId.isEmpty()) {
            Toast.makeText(this, "Napaka: ID uporabnika ni najden", Toast.LENGTH_SHORT).show()
            return
        }
        lifecycleScope.launch(Dispatchers.Main) {
            try {
                val res = withContext(Dispatchers.IO){
                    ApiClient.apiService.getOrders(currentUserId)
                }
                if(res.isSuccessful && res.body() != null){
                    val rawOrderList = res.body()!!

                    if(rawOrderList.isEmpty()){
                        Toast.makeText(this@MainActivity, "Nimate aktivnih naročil", Toast.LENGTH_SHORT).show()
                    }
                    val format = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

                    val sortedOrders = rawOrderList.sortedByDescending { order ->
                        try {
                            format.parse(order.date) ?: Date(0)
                        } catch (e: Exception) {
                            Date(0)
                        }
                    }

                    val groupToday = mutableListOf<Order>()
                    val groupYesterday = mutableListOf<Order>()
                    val groupOlder = mutableListOf<Order>()

                    val todayCal = Calendar.getInstance().apply {
                        set(Calendar.HOUR_OF_DAY, 0)
                        set(Calendar.MINUTE, 0)
                        set(Calendar.SECOND, 0)
                        set(Calendar.MILLISECOND, 0)
                    }


                    for (order in sortedOrders) {
                        Log.d("MainActivity_Debug", "Naročilo ID: ${order.id} | Naslov s strežnika: '${order.address}'")
                        try {
                            val orderDate = format.parse(order.date) ?: java.util.Date()
                            val dbCal = Calendar.getInstance().apply {
                                time = orderDate
                                set(Calendar.HOUR_OF_DAY, 0)
                                set(Calendar.MINUTE, 0)
                                set(Calendar.SECOND, 0)
                                set(Calendar.MILLISECOND, 0)
                            }

                            val diffInMillies = todayCal.timeInMillis - dbCal.timeInMillis
                            val diffInDays = TimeUnit.MILLISECONDS.toDays(diffInMillies)

                            when (diffInDays) {
                                0L -> groupToday.add(order)
                                1L -> groupYesterday.add(order)
                                else -> groupOlder.add(order)
                            }
                        } catch (e: Exception) {
                            groupOlder.add(order)
                        }
                    }
                    val timelineItems = mutableListOf<TimelineItem>()

                    if (groupToday.isNotEmpty()) {
                        timelineItems.add(HeaderItem(getString(R.string.today)))
                        timelineItems.addAll(groupToday)
                    }
                    if (groupYesterday.isNotEmpty()) {
                        timelineItems.add(HeaderItem(getString(R.string.yesterday)))
                        timelineItems.addAll(groupYesterday)
                    }
                    if (groupOlder.isNotEmpty()) {
                        timelineItems.add(HeaderItem(getString(R.string.older_orders)))
                        timelineItems.addAll(groupOlder)
                    }
                    val serverBaseUrl = getString(R.string.api_base_url)

                    val adapter = OrderAdapter(timelineItems, serverBaseUrl)
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
        val userIdKey = if (currentUserId.isNotEmpty()) currentUserId else "Unknown"
        val historyKey = "items_$userIdKey"

        val prefs = getSharedPreferences("history", MODE_PRIVATE)
        val currentHistoryString = prefs.getString(historyKey, "[]") ?: "[]"

        val jsonArray = org.json.JSONArray(currentHistoryString)

        val status = if (opened) "Odprto" else "Ni bilo odprto"
        val date = java.text.SimpleDateFormat("dd.MM.yyyy HH:mm", java.util.Locale.getDefault()).format(java.util.Date())

        val item = org.json.JSONObject()
        item.put("date", date)
        item.put("boxId", boxId)
        item.put("status", status)

        jsonArray.put(item)
        prefs.edit()
            .putString(historyKey, jsonArray.toString())
            .apply()
    }
}