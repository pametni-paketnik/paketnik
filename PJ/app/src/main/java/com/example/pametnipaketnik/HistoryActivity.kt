package com.example.pametnipaketnik

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.pametnipaketnik.databinding.ActivityHistoryBinding
import org.json.JSONArray


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
    }
    private fun loadHistory(): List<HistoryItem> {
        val prefs = getSharedPreferences("history", MODE_PRIVATE)
        val historyString = prefs.getString("items", "[]") ?: "[]"

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

        binding.tabVse.setTextColor(secondary)
        binding.tabUspesno.setTextColor(secondary)
        binding.tabNeuspesno.setTextColor(secondary)
        binding.tabDanes.setTextColor(secondary)

        selected.setTextColor(primary)
    }
}