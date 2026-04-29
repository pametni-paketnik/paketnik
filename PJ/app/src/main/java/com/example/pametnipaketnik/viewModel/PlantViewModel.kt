package com.example.pametnipaketnik.viewModel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.example.pametnipaketnik.R
enum class PlantCategory{OUTDOORS, SUCCULENT, INDOORS}
data class Plants(
    val name: String,
    val description: String,
    val price: String,
    val imageRes: Int,
    val category: PlantCategory,
    val isTall: Boolean = false
)

class PlantViewModel: ViewModel() {
    var searchQuery by mutableStateOf("")
        private set
    var selectedCategory by mutableStateOf(PlantCategory.SUCCULENT)
        private set

    fun selectCategory(category: PlantCategory) {
        selectedCategory = category
    }

    fun onSearchQueryChange(newQuery: String){
        searchQuery = newQuery
    }

    val plants = listOf(
        Plants("Aloe Vera", "Used widely for medicine...", "$18", R.drawable.monstera, PlantCategory.OUTDOORS, isTall = false),
        Plants("Syngonium", "Popular houseplant...", "$25", R.drawable.monstera, PlantCategory.SUCCULENT, isTall = true),
        Plants("Cactus", "Desert survivor...", "$12", R.drawable.monstera, PlantCategory.OUTDOORS, isTall = false),
        Plants("Jade Plant", "Luck and prosperity...", "$15", R.drawable.monstera, PlantCategory.OUTDOORS, isTall = true),
        Plants("Snake Plant", "Air purifier...", "$20", R.drawable.monstera, PlantCategory.INDOORS, isTall = false),
        Plants("Snake Plant", "Air purifier...", "$20", R.drawable.monstera, PlantCategory.INDOORS, isTall = false),
        Plants("Snake Plant", "Air purifier...", "$20", R.drawable.monstera, PlantCategory.SUCCULENT, isTall = false),
        Plants("Snake Plant", "Air purifier...", "$20", R.drawable.monstera, PlantCategory.INDOORS, isTall = false),
        Plants("Snake Plant", "Air purifier...", "$20", R.drawable.monstera, PlantCategory.OUTDOORS, isTall = true),
        Plants("Snake Plant", "Air purifier...", "$20", R.drawable.monstera, PlantCategory.INDOORS, isTall = true),
        Plants("Snake Plant", "Air purifier...", "$20", R.drawable.monstera, PlantCategory.SUCCULENT, isTall = true)
    )
    val filteredPlants: List<Plants>
        get() = plants.filter { plant ->
            val matchesCategory = plant.category == selectedCategory
            val matchesSearch = plant.name.contains(searchQuery, ignoreCase = true)

            matchesCategory && matchesSearch
        }
}