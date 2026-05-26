package com.example.pametnipaketnik

import com.google.gson.annotations.SerializedName
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

data class OpenBoxRequest(
    @SerializedName("box_id") val boxId: String,
    @SerializedName("user_id") val userId: String
)
data class OpenBoxResponse(
    val success: Boolean,
    val message: String
)

interface ApiService {
    @Multipart
    @POST("verify")
    suspend fun verifyFace(
        @Part file: MultipartBody.Part
    ): Response<FaceVerifyResponse>

    @POST("open-box")
    suspend fun openBox(
        @Body request: OpenBoxRequest
    ): Response<OpenBoxResponse>
}