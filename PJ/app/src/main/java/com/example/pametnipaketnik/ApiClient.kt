package com.example.pametnipaketnik

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    private var backendRetrofit: Retrofit? = null
    private var faceRetrofit: Retrofit? = null

    fun initBackend(baseUrl: String) {
        backendRetrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    fun initFace(baseUrl: String) {
        faceRetrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val backendApiService: ApiService by lazy {
        backendRetrofit?.create(ApiService::class.java)
            ?: throw IllegalArgumentException("Backend ApiClient ni inicializiran! Pokliči initBackend().")
    }

    val faceApiService: ApiService by lazy {
        faceRetrofit?.create(ApiService::class.java)
            ?: throw IllegalArgumentException("Face ApiClient ni inicializiran! Pokliči initFace().")
    }
}