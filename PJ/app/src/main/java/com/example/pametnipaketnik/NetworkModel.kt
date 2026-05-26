package com.example.pametnipaketnik

data class FaceVerifyResponse(
    val verified: Boolean,
    val confidence: Double,
    val label: String,
    val message: String
)
