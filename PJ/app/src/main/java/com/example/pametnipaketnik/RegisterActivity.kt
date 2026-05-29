package com.example.pametnipaketnik

import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.text.Editable
import android.text.Spannable
import android.text.SpannableString
import android.text.TextWatcher
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.pametnipaketnik.databinding.ActivityRegisterBinding
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {
    private lateinit var binding: ActivityRegisterBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val textWatcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                checkInputForButton()
            }

            override fun afterTextChanged(s: Editable?) {}
        }

        binding.inputName.addTextChangedListener(textWatcher)
        binding.inputSurname.addTextChangedListener(textWatcher)
        binding.inputEmail.addTextChangedListener(textWatcher)
        binding.inputPassword.addTextChangedListener(textWatcher)

        setUpGoToLoginText()

        binding.btnRegister.setOnClickListener {
            performRegister()
        }

        binding.btnFaceIdSetup.setOnClickListener {
            val name = binding.inputName.text.toString().trim()
            val surname = binding.inputSurname.text.toString().trim()
            val email = binding.inputEmail.text.toString().trim()
            val password = binding.inputPassword.text.toString().trim()

            if(name.isEmpty() || surname.isEmpty() || email.isEmpty() || password.isEmpty()){
                Toast.makeText(this, "Prosim vnesite podatke, preden nastavite Face ID", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                binding.inputEmail.error = "Neveljaven e-poštni naslov"
                return@setOnClickListener
            }

            val intent = Intent(this, FaceIdActivity::class.java)
            intent.putExtra("MODE", "REGISTER")
            intent.putExtra("NAME", name)
            intent.putExtra("SURNAME", surname)
            intent.putExtra("EMAIL", email)
            intent.putExtra("PASSWORD", password)
            startActivity(intent)
        }
        binding.goToLogin.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
            finish()
        }
        checkInputForButton()
    }

    private fun checkInputForButton() {
        val name = binding.inputName.text.toString().trim()
        val surname = binding.inputSurname.text.toString().trim()
        val email = binding.inputEmail.text.toString().trim()
        val password = binding.inputPassword.text.toString().trim()

        binding.btnRegister.isEnabled = name.isNotEmpty() && surname.isNotEmpty() && email.isNotEmpty() && password.isNotEmpty()
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

        lifecycleScope.launch {
            try {
                val req = RegisterRequest(name, surname, email, password)
                val res = ApiClient.apiService.registerUser(req)

                if(res.isSuccessful && res.body() != null){
                    val registerRes = res.body()

                    if(registerRes?.success == true){
                        Toast.makeText(this@RegisterActivity, "Registracija uspešna!", Toast.LENGTH_SHORT).show()

                        val intent = Intent(this@RegisterActivity, LoginActivity::class.java)
                        startActivity(intent)
                        finish()
                    } else{
                        Toast.makeText(this@RegisterActivity, registerRes?.message, Toast.LENGTH_SHORT).show()
                    }
                } else{
                    Toast.makeText(this@RegisterActivity, "Napak na strežniku", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception){
                Toast.makeText(this@RegisterActivity, "Povezava ni uspela: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

