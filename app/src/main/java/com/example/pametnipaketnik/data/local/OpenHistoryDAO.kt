package com.example.pametnipaketnik.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface OpenHistoryDAO{
    @Query("SELECT * FROM open_history ORDER BY timestamp DESC")
    fun getAllHistory(): Flow<List<OpenHistory>>

    @Insert
    suspend fun insert(entity: OpenHistory)
}