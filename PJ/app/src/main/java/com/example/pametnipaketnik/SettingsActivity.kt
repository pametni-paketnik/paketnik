package com.example.pametnipaketnik

import android.os.Bundle
import android.widget.ArrayAdapter
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.pametnipaketnik.databinding.ActivitySettingsBinding

class SettingsActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySettingsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        // Popravljen WindowInsets del z dodatnim odmikom (paddingom)
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())

            // Izračunamo 24dp v piksle, da bo odmik enak na vseh telefonih
            val dp24 = (24 * resources.displayMetrics.density).toInt()

            // Nastavimo padding: sistemski rob + tvojih 24dp
            v.setPadding(
                systemBars.left + dp24,
                systemBars.top + dp24,
                systemBars.right + dp24,
                systemBars.bottom + dp24
            )
            insets
        }


        // 1. Definicija jezikov (prikazano ime in koda jezika)
        val languages = arrayOf("Slovenščina", "English")
        val langCodes = arrayOf("sl", "en")

        // 2. Nastavitev adapterja za dropdown
        val adapter = ArrayAdapter(this, android.R.layout.simple_list_item_1, languages)
        binding.autoCompleteLanguage.setAdapter(adapter)

        // 3. Poslušalec za klik na izbiro v meniju
        binding.autoCompleteLanguage.setOnItemClickListener { _, _, position, _ ->
            val selectedLangCode = langCodes[position]
            changeLanguage(selectedLangCode)
        }

        // Opcijsko: Nastavi trenutni jezik v dropdown ob odprtju
        val currentLang = AppCompatDelegate.getApplicationLocales().toLanguageTags()
        if (currentLang.contains("en")) {
            binding.autoCompleteLanguage.setText(languages[1], false)
        } else {
            binding.autoCompleteLanguage.setText(languages[0], false)
        }

        binding.btnBack.setOnClickListener {
            finish()
        }
    }

    private fun changeLanguage(langCode: String) {
        val appLocale: LocaleListCompat = LocaleListCompat.forLanguageTags(langCode)
        AppCompatDelegate.setApplicationLocales(appLocale)
    }
}