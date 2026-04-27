package com.example.pametnipaketnik.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "open_history")
data class OpenHistory(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val boxId: Int,
    val timestamp: Long,
    val status: String
)