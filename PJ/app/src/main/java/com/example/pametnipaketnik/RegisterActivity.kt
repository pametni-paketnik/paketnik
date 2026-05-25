package com.example.pametnipaketnik

import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.text.Spannable
import android.text.SpannableString
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.pametnipaketnik.databinding.ActivityRegisterBinding

class RegisterActivity : AppCompatActivity() {
    private lateinit var binding: ActivityRegisterBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setUpGoToLoginText()

        binding.btnRegister.setOnClickListener {
            performRegister()
        }

        binding.btnFaceIdSetup.setOnClickListener {
            val intent = Intent(this, FaceIdActivity::class.java)
            intent.putExtra("MODE", "REGISTER")
            startActivity(intent)
        }

        binding.goToLogin.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
            finish()
        }

        binding.btnBack.setOnClickListener {
            finish()
        }
        binding.btnHome.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            startActivity(intent)
            finish()
        }
    }

    private fun setUpGoToLoginText() {

        val linkText = getString(R.string.go_to_login_link) //
        val fullText = getString(R.string.go_to_login_full, linkText)

        val spannable = SpannableString(fullText)

        val startIndex = fullText.indexOf(linkText)
        val endText = startIndex + linkText.length

        if (startIndex != -1) {
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
        binding.goToLogin.text = spannable
    }

    private fun performRegister(){
        val name = binding.inputName.text.toString().trim()
        val surname = binding.inputSurname.text.toString().trim()
        val email = binding.inputEmail.text.toString().trim()
        val password = binding.inputPassword.text.toString().trim()

        if (name.isEmpty() || surname.isEmpty() || email.isEmpty() || password.isEmpty()){
            Toast.makeText(this, "Prosim izpolnite vsa polja", Toast.LENGTH_SHORT).show()
            return
        }

        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.inputEmail.error = "Neveljaven e-poštni naslov"
            return
        }

        // Tukaj pride klic na API za registracijo
        Toast.makeText(this, "Registracija uspešna!", Toast.LENGTH_SHORT).show()

        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }
}

