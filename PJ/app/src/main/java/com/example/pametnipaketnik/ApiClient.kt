package com.example.pametnipaketnik

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient  {
    private var retrofit: Retrofit? = null
    fun initializer(baseUrl: String){
        if(retrofit == null) {
            // 1. Ustvari lovilec (interceptor), ki bo beležil telo (body) zahtevkov in odgovorov
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            // 2. Ustvari OkHttpClient in mu dodaj ta lovilec
            val client = OkHttpClient.Builder()
                .addInterceptor(logging)
                .build()

            // 3. Podaj ta client v Retrofit Builder
            retrofit = Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
    }
    val apiService: ApiService by lazy {
        retrofit?.create(ApiService::class.java)
            ?: throw IllegalArgumentException("ApiClient ni inicializiran! Pokliči ApiClient.initialize v tvoji MainActivity.")
    }
}