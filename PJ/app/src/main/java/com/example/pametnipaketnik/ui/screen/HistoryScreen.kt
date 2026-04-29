package com.example.pametnipaketnik.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.foundation.lazy.items
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.pametnipaketnik.data.local.OpenHistory
import com.example.pametnipaketnik.ui.theme.*

@Composable
fun HistoryScreen() {
    val demoEntries = listOf(
        OpenHistory(id = 1, boxId = 352, timestamp = 1714041000000, status = "Success"),
        OpenHistory(id = 2, boxId = 358, timestamp = 1714041300000, status = "Success"),
        OpenHistory(id = 3, boxId = 540, timestamp = 1714041600000, status = "Error"),
        OpenHistory(id = 4, boxId = 120, timestamp = 1714047600000, status = "Success")
    )

    var isSelected by remember { mutableStateOf("VSE") }

    val filteredEntries by remember(isSelected) {
        derivedStateOf {
            when (isSelected) {
                "USPEŠNO" -> demoEntries.filter { it.status == "Success" }
                "NAPAKE" -> demoEntries.filter { it.status != "Success" }
                "DANES" -> {
                    val startOfDay = System.currentTimeMillis() - 86400000
                    demoEntries.filter { it.timestamp >= startOfDay }
                }
                else -> demoEntries
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ColorBackground)
            .padding(horizontal = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.padding(top = 80.dp))

        Text(
            text = "ZGODOVINA PAKETNIKOV",
            fontWeight = FontWeight.Bold,
            fontSize = 18.sp,
            letterSpacing = 2.sp,
            color = ColorTextPrimary
        )
        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier.fillMaxWidth()
                .padding(top = 20.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.Bottom
        ) {
            listOf("VSE", "USPEŠNO", "NAPAKE", "DANES").forEach { filter ->
                val isSelectedFilter = isSelected == filter

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .width(85.dp)
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { isSelected = filter }
                ) {
                    Text(
                        text = filter,
                        color = if (isSelectedFilter) Color.Black else Color.Gray.copy(alpha = 0.6f),
                        fontWeight = if (isSelectedFilter) FontWeight.Bold else FontWeight.Medium,
                        fontSize = if(isSelectedFilter) 13.sp else 12.sp,
                        letterSpacing = 1.sp
                    )

                    if (isSelectedFilter) {
                        Box(
                            modifier = Modifier
                                .size(4.dp)
                                .background(Color.Black, RoundedCornerShape(5.dp))
                        )
                    } else {
                        Box(modifier = Modifier.size(4.dp))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.padding(top = 35.dp))

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(bottom = 32.dp)
        ) {
            items(filteredEntries) { entry ->
                HistoryItem(entry)
            }
        }
    }
}

@Composable
fun HistoryItem(entry: OpenHistory) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(120.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(ColorCard),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                modifier = Modifier.size(80.dp),
                shape = RoundedCornerShape(20.dp),
                color = ColorBackground
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = "#${entry.boxId}",
                        style = TextStyle(
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Light,
                            color = ColorTextSecondary
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.padding(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Paketnik ${entry.boxId}".uppercase(),
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = ColorTextPrimary
                )

                Spacer(modifier = Modifier.padding(top = 8.dp))

                val statusString = buildAnnotatedString {
                    if (entry.status == "Success") {
                        withStyle(style = SpanStyle(color = ColorTextSecondary, fontWeight = FontWeight.Bold)) {
                            append("Poskus Uspešen".uppercase())
                        }
                    } else {
                        withStyle(style = SpanStyle(color = Color(0xFFBC4B4B), fontWeight = FontWeight.Bold)) {
                            append("Napaka pri odpiranju".uppercase())
                        }
                    }
                }

                Text(
                    text = statusString,
                    fontSize = 11.sp,
                    letterSpacing = 1.sp
                )

                Spacer(modifier = Modifier.padding(bottom = 4.dp))

                Text(
                    text = if (entry.boxId == 120) "14:20" else "12:30",
                    color = ColorTextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Box(
                modifier = Modifier
                    .size(35.dp)
                    .background(ColorTextPrimary, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowForward,
                    contentDescription = null,
                    tint = ColorCard,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}