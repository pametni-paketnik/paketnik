package com.example.pametnipaketnik.ui.screen

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.staggeredgrid.LazyVerticalStaggeredGrid
import androidx.compose.foundation.lazy.staggeredgrid.StaggeredGridCells
import androidx.compose.foundation.lazy.staggeredgrid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.pametnipaketnik.ui.theme.*
import com.example.pametnipaketnik.viewModel.PlantViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.pametnipaketnik.viewModel.PlantCategory
import com.example.pametnipaketnik.viewModel.Plants
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Person
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ModifierLocalBeyondBoundsLayout
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.interaction.MutableInteractionSource
import android.R.attr.onClick
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically

sealed class BottomNavBar(val name: String, val icon: ImageVector, val label: String){
    object Home: BottomNavBar("Home", Icons.Default.Home, "Home".uppercase())
    object History: BottomNavBar("History", Icons.Default.Info, "History".uppercase())
    object Profile: BottomNavBar("Profile", Icons.Default.Person, "Profile".uppercase())
}

@Composable
fun PlantCard(plant: Plants) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .shadow(elevation = 5.dp, shape = RoundedCornerShape(24.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(
            modifier = Modifier.fillMaxWidth()
                .height(if(plant.isTall) 280.dp else 180.dp)
        ){
            Image(
                painter = painterResource(id = plant.imageRes),
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.5f)),
                            startY = 300f
                        )
                    )
            )
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(12.dp)
            ) {
                Text(
                    text = plant.name.uppercase(),
                    style = TextStyle(
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Color.White
                    )
                )
                Text(
                    text = plant.description.uppercase(),
                    style = TextStyle(
                        fontSize = 11.sp,
                        color = Color.White.copy(alpha = 0.8f)
                    ),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
fun MainScreen(viewModel: PlantViewModel = viewModel()){
    val navController = rememberNavController()
    val items = listOf(
        BottomNavBar.Home,
        BottomNavBar.History,
        BottomNavBar.Profile
    )
    Scaffold(
        containerColor = ColorBackground,
        bottomBar = {
            Box(
                modifier = Modifier.fillMaxWidth()
                    .padding(bottom = 24.dp),
                contentAlignment = Alignment.Center
            ){
                Surface (
                    color = ColorCard,
                    shape = RoundedCornerShape(20.dp),
                    shadowElevation = 8.dp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp)
                        .height(60.dp)
                        .clip(RoundedCornerShape(20.dp))

                ) {
                    Row(
                        modifier = Modifier.fillMaxSize(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val navBackStackEntry by navController.currentBackStackEntryAsState()
                        val currentRoute = navBackStackEntry?.destination?.route

                        items.forEach { item ->
                            val isSelected = currentRoute == item.name

                            val iconSize by animateDpAsState(targetValue = if(isSelected) 28.dp else 26.dp)
                            val interactionSource = remember { MutableInteractionSource() }

                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center,
                                modifier = Modifier
                                    .clickable(
                                        interactionSource = interactionSource,
                                        indication = null,
                                        onClick = {
                                            if (currentRoute != item.name) {
                                                navController.navigate(item.name) {
                                                    popUpTo(navController.graph.startDestinationId) {
                                                        saveState = true
                                                    }
                                                    launchSingleTop = true
                                                    restoreState = true
                                                }
                                            }
                                        }
                                    )
                                ) {
                                    Icon(
                                        imageVector = item.icon,
                                        contentDescription = item.label,
                                        modifier = Modifier.size(iconSize),
                                        tint = if (isSelected) ColorTextPrimary else ColorTextSecondary
                                    )
                                AnimatedVisibility(
                                    visible = isSelected,
                                    enter = fadeIn() + expandVertically(),
                                    exit = fadeOut() + shrinkVertically()
                                ) {
                                    Text(
                                        text = item.label.uppercase(),
                                        style = TextStyle(
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            letterSpacing = 0.5.sp,
                                            color = ColorTextPrimary
                                        ),
                                        modifier = Modifier.padding(top = 2.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    ) {  innerPadding ->
        NavHost(
            navController = navController,
            startDestination = BottomNavBar.Home.name,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(BottomNavBar.Home.name) {
                PlantContent(viewModel)
            }
            composable (BottomNavBar.History.name) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Zgodovina paketov")
                }
            }
            composable(BottomNavBar.Profile.name) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Profil uporabnika")
                }
            }
        }
    }
}

@Composable
fun PlantContent(viewModel: PlantViewModel = viewModel()){
    val searchQuery = viewModel.searchQuery
    val plants = viewModel.filteredPlants
    val categories = PlantCategory.values()

    Column(modifier = Modifier
        .fillMaxSize()
        .background(ColorBackground)
    ){
        Row(modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = "Search".uppercase(),
                style = TextStyle(fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    letterSpacing = 2.sp),
                color = ColorTextPrimary,
                modifier = Modifier.padding(start = 20.dp)
            )
        }
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { viewModel.onSearchQueryChange(it) },
            placeholder = { Text("Search plants...", color = ColorTextSecondary) },
            leadingIcon = {
                Icon(imageVector = Icons.Default.Search, contentDescription = null, tint = ColorTextPrimary)
            },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .height(55.dp)
                .shadow(elevation = 4.dp, shape = RoundedCornerShape(16.dp))
                .clip(RoundedCornerShape(16.dp)),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = ColorCard,
                unfocusedContainerColor = ColorCard,
                disabledContainerColor = ColorCard,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                cursorColor = ColorTextPrimary
            ),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(24.dp))

        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            items(categories) { category ->
                val isSelected = viewModel.selectedCategory == category
                val interactionSource = remember { MutableInteractionSource() }

                Column (
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .padding(horizontal = 4.dp)
                        .clickable(
                            interactionSource = interactionSource,
                            indication = null,
                            onClick = { viewModel.selectCategory(category) }
                        )
                    ){
                    Text(
                        text = category.name.uppercase(),
                        fontSize = if(isSelected) 14.sp else 12.sp,
                        fontWeight = if(isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) ColorTextPrimary else ColorTextSecondary,
                        letterSpacing = 1.sp
                    )
                    if(isSelected){
                        Box(
                            modifier = Modifier
                                .padding(top = 4.dp)
                                .size(4.dp)
                                .background(ColorTextPrimary, CircleShape)
                        )
                    }
                }

            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Staggered Grid
        LazyVerticalStaggeredGrid(
            columns = StaggeredGridCells.Fixed(2),
            contentPadding = PaddingValues(8.dp),
            modifier = Modifier.fillMaxSize(),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalItemSpacing = 4.dp
        ) {
            items(plants) { plant ->
                PlantCard(plant = plant)
            }
        }
    }
}