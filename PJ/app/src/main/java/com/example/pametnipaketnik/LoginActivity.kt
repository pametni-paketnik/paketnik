package com.example.pametnipaketnik

import android.content.Context
import android.os.Bundle
import android.content.Intent
import android.graphics.Typeface
import android.text.Spannable
import android.text.SpannableString
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.pametnipaketnik.databinding.ActivityLoginBinding
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.statusBarColor = androidx.core.content.ContextCompat.getColor(this, R.color.home_page_background)
        androidx.core.view.WindowInsetsControllerCompat(window, window.decorView).isAppearanceLightStatusBars = true
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setUpGoToRegisterText()

        binding.btnLogin.setOnClickListener {
            performLogin()
        }

        binding.btnFaceIdLogin.setOnClickListener {
            val intent = Intent(this, FaceIdActivity::class.java)
            intent.putExtra("MODE", "LOGIN")
            startActivity(intent)
        }

        binding.goToRegister.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }
    }

    private fun setUpGoToRegisterText() {
        val linkText = getString(R.string.go_to_register_link)
        val fullText = getString(R.string.go_to_register_full, linkText)

        val spannable = SpannableString(fullText)

        val startIndex = fullText.indexOf(linkText)
        val endText = startIndex + linkText.length

        if (startIndex != -1) {
            //Bold
            spannable.setSpan(
                StyleSpan(Typeface.BOLD),
                startIndex, endText,
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
            //Barvno besedilo
            spannable.setSpan(
                ForegroundColorSpan(getColor(R.color.history_text_primary)),
                startIndex, endText,
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }
        binding.goToRegister.text = spannable
    }

    private fun performLogin(){
        val email = binding.inputEmail.text.toString().trim()
        val password = binding.inputPassword.text.toString().trim()

        if(email.isEmpty() || password.isEmpty()){
            Toast.makeText(this, "Prosim izpolnite vsa polja", Toast.LENGTH_SHORT).show()
            return
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.inputEmail.error = "Vnesite veljaven e-naslov"
            return
        }

        // Klic na API v ozadju
        lifecycleScope.launch {
            try {
                val req = LoginRequest(email, password)
                val res = ApiClient.apiService.loginUser(req)

                if(res.isSuccessful && res.body() != null){
                    val logingRes = res.body()

                    if (logingRes?.success == true) {
                        Toast.makeText(this@LoginActivity, "Prijava uspešna!", Toast.LENGTH_SHORT).show()

                        val prejetUserId = logingRes.userId ?: ""
                        val prejetaVloga = logingRes.role ?: ""
                        val prejetoIme = logingRes.name ?: "Uporabnik"
                        val prejetPriimek = logingRes.getSurnameValue() ?: ""
                        val prejetEmail = logingRes.getEmailValue() ?: email

                        val sharedPreferences = getSharedPreferences("UserPrefs", MODE_PRIVATE)
                        sharedPreferences.edit().apply {
                            putString("LOGGED_IN_USER_ID", prejetUserId)
                            putString("USER_ROLE", prejetaVloga)
                            putString("USERNAME", prejetoIme)
                            putString("USER_SURNAME", prejetPriimek)
                            putString("USER_EMAIL", prejetEmail)
                        }.apply()

                        val intent = Intent(this@LoginActivity, MainActivity::class.java)
                        intent.putExtra("prijavljen_uporabnik", prejetoIme)
                        intent.putExtra("USER_ID", prejetUserId)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@LoginActivity, logingRes?.message, Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this@LoginActivity, "Napaka na strežniku", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception){
                Toast.makeText(this@LoginActivity, "Povezava ni uspela: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    
}

private fun LoginResponse.getSurnameValue(): String? {
    return runCatching {
        val getter = javaClass.methods.firstOrNull { it.name == "getSurname" && it.parameterCount == 0 }
        getter?.invoke(this) as? String
    }.getOrNull()
}

private fun LoginResponse.getEmailValue(): String? {
    return runCatching {
        val getter = javaClass.methods.firstOrNull { it.name == "getEmail" && it.parameterCount == 0 }
        getter?.invoke(this) as? String
    }.getOrNull()
}

