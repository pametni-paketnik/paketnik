package com.example.pametnipaketnik

import android.os.Bundle
import android.content.Intent
import android.graphics.Typeface
import android.text.Spannable
import android.text.SpannableString
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.pametnipaketnik.databinding.ActivityLoginBinding

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setUpGoToRegisterText()

        binding.btnLogin.setOnClickListener {
            performLogin()
        }

        binding.btnFaceIdLogin.setOnClickListener {
            val intent = Intent(this, FaceIdActivity::class.java)
            intent.putExtra("MODE", "LOGIN") // prijava
            startActivity(intent)
        }

        binding.goToRegister.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }
    }

    private fun setUpGoToRegisterText(){
        val fullText = "Nimaš računa? Registriraj se tukaj"
        val spannable = SpannableString(fullText)

        val targetText = "Registriraj se tukaj"
        val startIndex = fullText.indexOf(targetText)
        val endText = startIndex + targetText.length

        if (startIndex != -1){
            spannable.setSpan(
                StyleSpan(Typeface.BOLD),
                startIndex, endText,
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
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

        if(email == "admin@um.si" && password == "admin123"){
            Toast.makeText(this, "Prijava uspesna", Toast.LENGTH_LONG).show()

            val intent = Intent(this, HistoryActivity::class.java)
            startActivity(intent)
            finish()
        }else{
            Toast.makeText(this, "Napačen e-naslov ali geslo", Toast.LENGTH_SHORT).show()
        }
    }
}

