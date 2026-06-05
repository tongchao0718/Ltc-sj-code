# Android Mobile Design — Core Concepts

## Dependencies and API Levels

Examples assume these libraries (use Compose BOM to align versions):

| Library | Purpose |
|---------|---------|
| `androidx.compose.material3:material3` | Material 3 components and theming |
| `androidx.navigation:navigation-compose` 2.8+ | Typed routes (`composable<Route>`) |
| `org.jetbrains.kotlinx:kotlinx-serialization-json` + Kotlin Serialization plugin | `@Serializable` route types |
| `androidx.compose.material3:material3-adaptive` | `currentWindowAdaptiveInfo()`, adaptive navigation |
| `androidx.lifecycle:lifecycle-runtime-compose` | `collectAsStateWithLifecycle()` |
| `com.google.dagger:hilt-android` + `hilt-navigation-compose` | `hiltViewModel()` |
| `androidx.compose.ui:ui-test-junit4` | `createComposeRule()`, `onNodeWithText()` |

## 1. Material Design 3 Principles

**Personal:** Dynamic color and theming adapt to user wallpaper and preferences  
**Adaptive:** Layouts respond to screen size, orientation, and fold state  
**Expressive:** Typography, shape, and motion reinforce hierarchy and brand

**Platform Considerations:**

- Phone: Single-pane layouts, bottom navigation, compact touch targets
- Tablet: Two-pane master-detail, navigation rail, expanded content width
- Foldable: Continuity across hinge; avoid placing critical UI on the fold

## 2. Compose Layout System

**Stack-Based Layouts:**

```kotlin
// Vertical column with alignment
Column(
    modifier = Modifier.padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(12.dp)
) {
    Text(
        text = "Title",
        style = MaterialTheme.typography.titleMedium
    )
    Text(
        text = "Subtitle",
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
}

// Horizontal row with flexible spacing
Row(
    modifier = Modifier.fillMaxWidth(),
    verticalAlignment = Alignment.CenterVertically
) {
    Icon(Icons.Default.Star, contentDescription = null)
    Text("Featured", modifier = Modifier.padding(start = 8.dp))
    Spacer(modifier = Modifier.weight(1f))
    Text(
        text = "View All",
        color = MaterialTheme.colorScheme.primary
    )
}
```

**Lazy Lists and Grids:**

```kotlin
// Virtualized list for long content
LazyColumn(
    contentPadding = PaddingValues(16.dp),
    verticalArrangement = Arrangement.spacedBy(8.dp)
) {
    items(items, key = { it.id }) { item ->
        ItemListCard(item = item, onItemClick = { onItemClick(item) })
    }
}

// Adaptive grid for tablets
LazyVerticalGrid(
    columns = GridCells.Adaptive(minSize = 160.dp),
    contentPadding = PaddingValues(16.dp),
    horizontalArrangement = Arrangement.spacedBy(12.dp),
    verticalArrangement = Arrangement.spacedBy(12.dp)
) {
    items(items, key = { it.id }) { item ->
        ItemThumbnail(item = item)
    }
}
```

**Modifier-First Layout:**

```kotlin
// Prefer Modifier over wrapper composables
Text(
    text = "Hello",
    modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 8.dp)
        .clip(RoundedCornerShape(8.dp))
        .background(MaterialTheme.colorScheme.surfaceVariant)
        .padding(12.dp)
)
```

## 3. Navigation Patterns

**Navigation Compose with typed routes:**

```kotlin
@Serializable
object HomeRoute

@Serializable
data class DetailRoute(val itemId: String)

@Composable
fun AppNavHost(navController: NavHostController) {
    NavHost(navController = navController, startDestination = HomeRoute) {
        composable<HomeRoute> {
            HomeScreen(
                onItemClick = { id ->
                    navController.navigate(DetailRoute(id))
                }
            )
        }
        composable<DetailRoute> { backStackEntry ->
            val route = backStackEntry.toRoute<DetailRoute>()
            DetailScreen(itemId = route.itemId)
        }
    }
}
```

**Bottom navigation with top-level destinations:**

```kotlin
@Composable
fun MainScreen() {
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination

                topLevelDestinations.forEach { destination ->
                    NavigationBarItem(
                        selected = currentDestination?.hasRoute(destination.route::class) == true,
                        onClick = {
                            navController.navigate(destination.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(destination.icon, contentDescription = destination.label) },
                        label = { Text(destination.label) }
                    )
                }
            }
        }
    ) { innerPadding ->
        AppNavHost(
            navController = navController,
            modifier = Modifier.padding(innerPadding)
        )
    }
}
```

**Back handling:**

```kotlin
// Predictive back (Android 13+) integrates with NavController automatically
// For custom back behavior:
BackHandler(enabled = showSheet) {
    showSheet = false
}
```

## 4. Theming and System Integration

**Material 3 theme setup:**

```kotlin
@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> darkColorScheme()
        else -> lightColorScheme()
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
```

**Semantic color usage:**

```kotlin
// Always use theme tokens — never hardcode colors
Surface(color = MaterialTheme.colorScheme.surface) {
    Text(
        text = "Primary content",
        color = MaterialTheme.colorScheme.onSurface
    )
    Text(
        text = "Secondary content",
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
}
```

**Typography scale:**

```kotlin
Text("Display", style = MaterialTheme.typography.displayLarge)
Text("Headline", style = MaterialTheme.typography.headlineMedium)
Text("Title", style = MaterialTheme.typography.titleMedium)
Text("Body", style = MaterialTheme.typography.bodyLarge)
Text("Label", style = MaterialTheme.typography.labelMedium)
```

## 5. Adaptive Layouts

**Window size classes:**

```kotlin
@Composable
fun AdaptiveHomeScreen(viewModel: HomeViewModel) {
    val windowSizeClass = currentWindowAdaptiveInfo().windowSizeClass

    when {
        windowSizeClass.isWidthAtLeastBreakpoint(WindowWidthSizeClass.EXPANDED) -> {
            TwoPaneLayout(viewModel = viewModel)
        }
        else -> {
            SinglePaneLayout(viewModel = viewModel)
        }
    }
}

@Composable
fun TwoPaneLayout(viewModel: HomeViewModel) {
    val selectedItem by viewModel.selectedItem.collectAsStateWithLifecycle()

    Row(modifier = Modifier.fillMaxSize()) {
        ItemList(
            modifier = Modifier.weight(0.4f),
            onItemClick = viewModel::selectItem
        )
        DetailPane(
            item = selectedItem,
            modifier = Modifier.weight(0.6f)
        )
    }
}
```

**Navigation rail for medium/expanded width:**

```kotlin
@Composable
fun AdaptiveScaffold(content: @Composable () -> Unit) {
    val windowSizeClass = currentWindowAdaptiveInfo().windowSizeClass

    if (windowSizeClass.isWidthAtLeastBreakpoint(WindowWidthSizeClass.MEDIUM)) {
        Row {
            NavigationRail { /* destinations */ }
            content()
        }
    } else {
        Scaffold(bottomBar = { NavigationBar { /* destinations */ } }) { padding ->
            Box(Modifier.padding(padding)) { content() }
        }
    }
}
```

## 6. State Management

**State hoisting pattern:**

```kotlin
@Composable
fun SearchScreen(viewModel: SearchViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    SearchContent(
        query = uiState.query,
        results = uiState.results,
        isLoading = uiState.isLoading,
        onQueryChange = viewModel::onQueryChange,
        onItemClick = viewModel::onItemClick
    )
}

@Composable
fun SearchContent(
    query: String,
    results: List<Item>,
    isLoading: Boolean,
    onQueryChange: (String) -> Unit,
    onItemClick: (Item) -> Unit
) {
    Column(modifier = Modifier.fillMaxSize()) {
        OutlinedTextField(
            value = query,
            onValueChange = onQueryChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Search") }
        )
        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(modifier = Modifier.weight(1f)) {
                items(results, key = { it.id }) { item ->
                    ItemListCard(item = item, onItemClick = { onItemClick(item) })
                }
            }
        }
    }
}
```

**remember vs rememberSaveable vs rememberUpdatedState:**

```kotlin
// UI-only ephemeral state
var expanded by remember { mutableStateOf(false) }

// State that survives configuration changes
var selectedTab by rememberSaveable { mutableIntStateOf(0) }

// Stable callback reference inside LaunchedEffect
@Composable
fun TimerEffect(onTimeout: () -> Unit) {
    val currentOnTimeout by rememberUpdatedState(onTimeout)
    LaunchedEffect(Unit) {
        delay(3000)
        currentOnTimeout()
    }
}
```

## 7. Gestures and Interactions

**Swipe to dismiss (lists):**

```kotlin
val dismissState = rememberSwipeToDismissBoxState(
    confirmValueChange = { value ->
        if (value == SwipeToDismissBoxValue.EndToStart) {
            onDelete()
            true
        } else false
    }
)

SwipeToDismissBox(
    state = dismissState,
    backgroundContent = {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.errorContainer)
                .padding(horizontal = 20.dp),
            contentAlignment = Alignment.CenterEnd
        ) {
            Icon(Icons.Default.Delete, contentDescription = "Delete")
        }
    },
    content = { ItemListCard(item = item, onItemClick = onItemClick) }
)
```

**Pull to refresh:**

```kotlin
val pullRefreshState = rememberPullToRefreshState()

// Wire isRefreshing + endRefresh() in LaunchedEffect when refresh triggers
LaunchedEffect(pullRefreshState.isRefreshing) {
    if (pullRefreshState.isRefreshing) {
        viewModel.refresh()
        pullRefreshState.endRefresh()
    }
}

Box(
    modifier = Modifier
        .fillMaxSize()
        .nestedScroll(pullRefreshState.nestedScrollConnection)
) {
    LazyColumn { /* items */ }

    PullToRefreshContainer(
        state = pullRefreshState,
        modifier = Modifier.align(Alignment.TopCenter)
    )
}
```

**Custom pointer gestures:**

```kotlin
var offset by remember { mutableStateOf(Offset.Zero) }

Box(
    modifier = Modifier
        .pointerInput(Unit) {
            detectDragGestures { change, dragAmount ->
                change.consume()
                offset += dragAmount
            }
        }
        .offset { IntOffset(offset.x.roundToInt(), offset.y.roundToInt()) }
) {
    DraggableContent()
}
```

## 8. Accessibility

```kotlin
// Decorative icons inside a labeled parent: null contentDescription
Icon(Icons.Default.Star, contentDescription = null)

// Standalone interactive control: describe the action on the Icon
IconButton(onClick = onFavorite) {
    Icon(
        imageVector = Icons.Default.FavoriteBorder,
        contentDescription = "Add to favorites"
    )
}

// Compound clickable row: merge children and set one description
Row(
    modifier = Modifier
        .clickable(onClick = onClick)
        .semantics(mergeDescendants = true) {
            contentDescription = "Open item details for ${item.title}"
        }
) {
    // child composables
}
```

**Touch target minimum:** Use `Modifier.minimumInteractiveComponentSize()` or ensure 48dp hit areas.

## 9. Visual Design

**Elevation and surfaces:**

```kotlin
ElevatedCard(
    modifier = Modifier.fillMaxWidth(),
    elevation = CardDefaults.elevatedCardElevation(defaultElevation = 2.dp)
) {
    Text("Elevated content", modifier = Modifier.padding(16.dp))
}

Surface(
    tonalElevation = 3.dp,
    shape = RoundedCornerShape(16.dp)
) {
    Text("Tonal surface", modifier = Modifier.padding(16.dp))
}
```

**Shape system:**

```kotlin
// Use theme shapes for consistency
Card(shape = MaterialTheme.shapes.medium) { /* content */ }
Button(shape = MaterialTheme.shapes.large) { Text("Action") }
```

**Motion:**

```kotlin
val elevation by animateDpAsState(
    targetValue = if (pressed) 8.dp else 2.dp,
    label = "cardElevation"
)

AnimatedVisibility(visible = showContent) {
    ContentPanel()
}
```

## 10. Preview

```kotlin
@Preview(name = "Light", showBackground = true)
@Preview(name = "Dark", uiMode = Configuration.UI_MODE_NIGHT_YES)
@Preview(name = "Tablet", device = Devices.TABLET)
@Composable
private fun ItemListCardPreview() {
    AppTheme {
        ItemListCard(
            item = Item("Title", "Subtitle"),
            onItemClick = {}
        )
    }
}
```

**Compose UI test (minimal):**

```kotlin
@Test
fun itemListCard_displaysTitle() {
    composeTestRule.setContent {
        AppTheme {
            ItemListCard(item = Item("Title", "Subtitle"), onItemClick = {})
        }
    }
    composeTestRule.onNodeWithText("Title").assertIsDisplayed()
}
```
