package com.example.pametnipaketnik

import android.Manifest
import android.content.Context
import android.content.Intent
import android.graphics.Typeface
import android.os.Build
import android.os.Bundle
import android.text.Spannable
import android.text.SpannableString
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.view.View
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.pametnipaketnik.databinding.ActivityHomeBinding

class HomeActivity : AppCompatActivity() {
    private lateinit var binding: ActivityHomeBinding
    private var isLoggedIn: Boolean = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val secureApiUrl = getString(R.string.api_base_url)
        ApiClient.initializer(secureApiUrl)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        checkPermissions()
        setUpGoToRegisterText()

        binding.btnLogin.setOnClickListener {
            if(isLoggedIn){
                makeLogout()
            } else{
                val intent = Intent(this, LoginActivity::class.java)
                startActivity(intent)
            }
        }
        binding.goToRegister.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }
        binding.buttonBackText.setOnClickListener {
            val sharedPreferences = getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
            val savedUserId = sharedPreferences.getString("LOGGED_IN_USER_ID", "")
            val savedName = sharedPreferences.getString("USERNAME", "Uporabnik")

            val intent = Intent(this, MainActivity::class.java).apply {
                putExtra("USER_ID", savedUserId)
                putExtra("prijavljen_uporabnik", savedName)
            }
            startActivity(intent)
        }
    }

    override fun onResume() {
        super.onResume()
        refreshSession()
    }

    private fun refreshSession(){
        val sharedPreferences = getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
        val userId = sharedPreferences.getString("LOGGED_IN_USER_ID", null)

        if(!userId.isNullOrEmpty()){
            isLoggedIn = true
            binding.btnLogin.text = getString(R.string.odjavi_se)
            binding.goToRegister.visibility = View.GONE
            binding.buttonBackText.visibility = View.VISIBLE
        } else {
            isLoggedIn = false
            binding.btnLogin.text = getString(R.string.prijavi_se_tukaj)
            binding.goToRegister.visibility = View.VISIBLE
            binding.buttonBackText.visibility = View.GONE
        }
    }

    private fun makeLogout() {
        val sharedPreferences = getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
        sharedPreferences.edit().clear().apply()

        Toast.makeText(this, "Odjava uspešna", Toast.LENGTH_SHORT).show()
        refreshSession()
    }
    private fun setUpGoToRegisterText() {
        val linkText = getString(R.string.go_to_register_link)
        val fullText = getString(R.string.go_to_register_full, linkText)

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
        binding.goToRegister.text = spannable
    }
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) {permissions ->
        val cameraGranted = permissions[Manifest.permission.CAMERA] ?: false
        val notifyGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions[Manifest.permission.POST_NOTIFICATIONS] ?: false
        } else {
            true
        }
        if(!cameraGranted || !notifyGranted) {
            Toast.makeText(this, "Aplikacija potrebuje dovoljenje za delovanje", Toast.LENGTH_SHORT).show()
        }
    }
    private fun checkPermissions() {
        val permissionsToRequest = mutableListOf(Manifest.permission.CAMERA)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        requestPermissionLauncher.launch(permissionsToRequest.toTypedArray())
    }
}