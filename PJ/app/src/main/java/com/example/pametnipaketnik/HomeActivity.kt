package com.example.pametnipaketnik

import android.Manifest
import android.content.Intent
import android.graphics.Typeface
import android.os.Build
import android.os.Bundle
import android.text.Spannable
import android.text.SpannableString
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.example.pametnipaketnik.databinding.ActivityHomeBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class HomeActivity : AppCompatActivity() {
    private lateinit var binding: ActivityHomeBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val secureApiUrl = getString(R.string.api_base_url)
        ApiClient.initializer(secureApiUrl)
        checkBackendHealth()

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        checkPermissions()
        setUpGoToRegisterText()

        binding.btnLogin.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
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

    private fun checkBackendHealth() {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val res = ApiClient.apiService.health()
                withContext(Dispatchers.Main) {
                    if (res.isSuccessful && res.body() != null) {
                        val health = res.body()!!
                        val message = if (health.db_connected) {
                            "Povezava z API in bazo deluje"
                        } else {
                            "API deluje, baza ni dosegljiva"
                        }
                        Toast.makeText(this@HomeActivity, message, Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@HomeActivity, "API ni dosegljiv", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}