package com.example.pametnipaketnik

import com.google.gson.annotations.SerializedName
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

data class RegisterRequest(
    @SerializedName("name") val name: String,
    @SerializedName("surname") val surname: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)
data class RegisterResponse(
    val success: Boolean,
    val message: String
)
data class OpenBoxRequest(
    @SerializedName("boxId") val boxId: String,
    @SerializedName("userId") val userId: String
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

    @POST("register")
    suspend fun registerUser(
        @Body request: RegisterRequest
    ): Response<RegisterResponse>

    @Multipart
    @POST("register-face")
    suspend fun registerFaceWithData(
        @Part file: MultipartBody.Part,
        @Part("name") name: RequestBody,
        @Part("surname") surname: RequestBody,
        @Part("email") email: RequestBody,
        @Part("password") password: RequestBody
    ): Response<RegisterResponse>

    @POST("open-box")
    suspend fun openBox(
        @Body request: OpenBoxRequest
    ): Response<OpenBoxResponse>
}