package com.example.pametnipaketnik

import com.google.gson.annotations.SerializedName
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path

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

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)
data class LoginResponse(
    val success: Boolean,
    val message: String?,
    val userId: String?,
    val name: String?,
    val role: String?
)
data class OpenBoxRequest(
    @SerializedName("boxId") val boxId: String,
    @SerializedName("userId") val userId: String
)
data class OpenBoxResponse(
    val success: Boolean,
    val message: String
)

interface TimelineItem
data class Order(
    @SerializedName("id") val id: String,
    @SerializedName("boxId") val boxId: String,
    @SerializedName("status") val status: String,
    @SerializedName("date") val date: String,
    @SerializedName("description") val description: String
): TimelineItem

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

    @POST("login")
    suspend fun loginUser(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @POST("open-box")
    suspend fun openBox(
        @Body request: OpenBoxRequest
    ): Response<OpenBoxResponse>

    @GET("orders/{userId}")
    suspend fun getOrders(
        @Path("userId") userId: String
    ): Response<List<Order>>
}