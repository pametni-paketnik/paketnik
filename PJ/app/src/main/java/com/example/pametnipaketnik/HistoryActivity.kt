package com.example.pametnipaketnik

import android.content.Intent
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.pametnipaketnik.databinding.ActivityHistoryBinding
import org.json.JSONArray
import android.graphics.Typeface
import android.util.Log
import android.util.TypedValue

class HistoryActivity : AppCompatActivity() {
    private lateinit var binding: ActivityHistoryBinding
    private lateinit var adapter: HistoryAdapter
    private var allItems = listOf<HistoryItem>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityHistoryBinding.inflate(layoutInflater)
        setContentView(binding.root)
        ViewCompat.setOnApplyWindowInsetsListener(binding.main) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        allItems = loadHistory()
        adapter = HistoryAdapter(allItems)
        binding.recyclerViewHistory.layoutManager = LinearLayoutManager(this)
        binding.recyclerViewHistory.adapter = adapter

        binding.tabVse.setOnClickListener {
            updateTabs(binding.tabVse)
            adapter.updateItems(allItems)
        }
        binding.tabUspesno.setOnClickListener {
            updateTabs(binding.tabUspesno)
            val filtred = allItems.filter { it.status == "Odprto" }
            adapter.updateItems(filtred)
        }
        binding.tabNeuspesno.setOnClickListener {
            updateTabs(binding.tabNeuspesno)
            val filtred = allItems.filter { it.status == "Ni bilo odprto"}
            adapter.updateItems(filtred)
        }
        binding.tabDanes.setOnClickListener {
            updateTabs(binding.tabDanes)
            val today = java.text.SimpleDateFormat("dd.MM.yyyy", java.util.Locale.getDefault()).format(java.util.Date())
            val filtred = allItems.filter { it.date.startsWith(today)}
            adapter.updateItems(filtred)
        }
        updateTabs(binding.tabVse)

        binding.btnBack.setOnClickListener {
            finish()
        }
    }
    private fun loadHistory(): List<HistoryItem> {
        var currentUserId = intent.getStringExtra("USER_ID") ?: ""

        if (currentUserId.isEmpty()) {
            val userPrefs = getSharedPreferences("UserPrefs", MODE_PRIVATE)
            currentUserId = userPrefs.getString("LOGGED_IN_USER_ID", "") ?: ""
        }

        if (currentUserId.isEmpty()) {
            Log.e("HistoryActivity", "NAPAKA: ID uporabnika je prazen v zgodovini!")
            return emptyList()
        }

        val historyKey = "items_$currentUserId"
        val prefs = getSharedPreferences("history", MODE_PRIVATE)

        val oldGeneralHistory = prefs.getString("items", null)
        if (oldGeneralHistory != null && oldGeneralHistory != "[]") {
            prefs.edit()
                .putString(historyKey, oldGeneralHistory)
                .remove("items")
                .apply()
        }

        val historyString = prefs.getString(historyKey, "[]") ?: "[]"
        Log.d("HistoryActivity", "Nalagam zgodovino za ključ: $historyKey | Vsebina: $historyString")

        val list = mutableListOf<HistoryItem>()

        try {
            val jsonArray = JSONArray(historyString)

            for(i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                list.add(
                    HistoryItem(
                        date = obj.getString("date"),
                        boxId = obj.getString("boxId"),
                        status = obj.getString("status")
                    )
                )
            }
        } catch (e: Exception) {
            prefs.edit()
                .putString("items", "[]")
                .apply()
        }

        return list.reversed()
    }

    private fun updateTabs(selected: android.widget.TextView) {
        val primary = getColor(R.color.history_text_primary)
        val secondary = getColor(R.color.history_text_secondary)

        val tabs = listOf(binding.tabVse, binding.tabUspesno, binding.tabNeuspesno, binding.tabDanes)
        tabs.forEach { tab ->
            tab.isAllCaps = true

            if(tab == selected){
                tab.setTextColor(primary)
                tab.setTypeface(null, Typeface.BOLD)
                tab.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            } else{
                tab.setTextColor(secondary)
                tab.setTypeface(null, Typeface.NORMAL)
                tab.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            }
        }
    }
}