package com.example.pametnipaketnik

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    private var retrofit: Retrofit? = null
    fun initializer(baseUrl: String){
        if(retrofit == null) {
            retrofit = Retrofit.Builder()
                .baseUrl(baseUrl)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
    }

    val apiService: ApiService by lazy {
        retrofit?.create(ApiService::class.java)
            ?: throw IllegalArgumentException("ApiClient ni inicializiran! Pokliči ApiClient.initialize v tvoji MainActivity.")
    }
}