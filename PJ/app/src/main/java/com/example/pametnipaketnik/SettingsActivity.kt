package com.example.pametnipaketnik

import android.content.Intent
import android.content.Context
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Filter
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.pametnipaketnik.databinding.ActivitySettingsBinding
import android.content.res.Configuration

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

            // Izračuna 24dp v piksle, da bo odmik enak na vseh telefonih
            val dp24 = (24 * resources.displayMetrics.density).toInt()

            // Nastavimo padding: sistemski rob + 24dp
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
        val adapter = object : ArrayAdapter<String>(
            this,
            android.R.layout.simple_list_item_1,
            languages.toMutableList()
        ) {
            override fun getFilter(): Filter {
                return object : Filter() {
                    override fun performFiltering(constraint: CharSequence?): FilterResults {
                        return FilterResults().apply {
                            values = languages.toList()
                            count = languages.size
                        }
                    }

                    override fun publishResults(constraint: CharSequence?, results: FilterResults?) {
                        clear()
                        addAll(languages.toList())
                        notifyDataSetChanged()
                    }
                }
            }
        }
        binding.autoCompleteLanguage.setAdapter(adapter)

        loadProfileInfo()

        // 3. Poslušalec za klik na izbiro v meniju
        binding.autoCompleteLanguage.setOnItemClickListener { _, _, position, _ ->
            val selectedLangCode = langCodes[position]
            changeLanguage(selectedLangCode)
        }

        // Nastavi trenutni jezik v dropdown ob odprtju
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

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)

        refreshTexts()

        val languages = arrayOf("Slovenščina", "English")
        val currentLang = AppCompatDelegate.getApplicationLocales().toLanguageTags()

        if (currentLang.contains("en")) {
            binding.autoCompleteLanguage.setText(languages[1], false)
        } else {
            binding.autoCompleteLanguage.setText(languages[0], false)
        }
    }

    private fun changeLanguage(langCode: String) {
        val currentLang = AppCompatDelegate
            .getApplicationLocales()
            .toLanguageTags()
            .substringBefore("-")

        if (currentLang == langCode) {
            return
        }

        binding.autoCompleteLanguage.clearFocus()
        binding.autoCompleteLanguage.dismissDropDown()

        val appLocale = LocaleListCompat.forLanguageTags(langCode)
        AppCompatDelegate.setApplicationLocales(appLocale)

        refreshTexts()
    }

    private fun refreshTexts() {
        binding.languageLabel.text = getString(R.string.select_language_text)
        binding.settingsTitle.text = getString(R.string.settings_title)

        val currentLang = AppCompatDelegate.getApplicationLocales().toLanguageTags()

        if (currentLang.contains("en")) {
            binding.autoCompleteLanguage.setText("English", false)
        } else {
            binding.autoCompleteLanguage.setText("Slovenščina", false)
        }

        loadProfileInfo()
    }

    private fun loadProfileInfo() {
        val sharedPreferences = getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
        val username = sharedPreferences.getString("USERNAME", null)
            ?.takeIf { it.isNotBlank() }
            ?: getString(R.string.profile_unknown_value)
        val userRole = sharedPreferences.getString("USER_ROLE", null)
            ?.takeIf { it.isNotBlank() }
            ?: getString(R.string.profile_unknown_value)
        val userSurname = sharedPreferences.getString("USER_SURNAME", null)
            ?.takeIf { it.isNotBlank() }
            ?: getString(R.string.profile_unknown_value)
        val userEmail = sharedPreferences.getString("USER_EMAIL", null)
            ?.takeIf { it.isNotBlank() }
            ?: getString(R.string.profile_unknown_value)
    }
}