package com.example.pametnipaketnik

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.pametnipaketnik.data.local.AppDatabase
import com.example.pametnipaketnik.ui.HistoryScreen
import com.example.pametnipaketnik.ui.screen.MainScreen
import com.example.pametnipaketnik.viewModel.HistoryViewModel
import com.example.pametnipaketnik.viewModel.PlantViewModel

class MainActivity : ComponentActivity() {
    private val historyViewModel: HistoryViewModel by lazy {
        val database = AppDatabase.getDatabase(this)
        val dao = database.openHistoryDao()

        val factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return HistoryViewModel(dao) as T
            }
        }
        ViewModelProvider(this, factory)[HistoryViewModel::class.java]
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MainScreen()
        }
    }
}