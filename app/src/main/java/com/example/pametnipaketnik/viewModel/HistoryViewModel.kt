package com.example.pametnipaketnik.viewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pametnipaketnik.data.local.OpenHistory
import com.example.pametnipaketnik.data.local.OpenHistoryDAO
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class HistoryViewModel(private val dao: OpenHistoryDAO) : ViewModel() {
    private val _selectedFilter = MutableStateFlow("VSE")
    val selectedFilter: StateFlow<String> = _selectedFilter

    private val allHistory = dao.getAllHistory()

    val historyEntries: StateFlow<List<OpenHistory>> =
        combine(allHistory, _selectedFilter) { list, filter ->
            when (filter) {
                "USPEŠNO" -> list.filter { it.status == "Success" }
                "NAPAKE" -> list.filter { it.status != "Success" }
                "DANES" -> {
                    val oneDayAgo = System.currentTimeMillis() - 86400000
                    list.filter { it.timestamp >= oneDayAgo }
                }
                else -> list
            }
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    fun setFilter(filter: String) {
        _selectedFilter.value = filter
    }

    fun insert(boxId: Int, status: String) {
        viewModelScope.launch {
            dao.insert(
                OpenHistory(
                    boxId = boxId,
                    timestamp = System.currentTimeMillis(),
                    status = status
                )
            )
        }
    }
}