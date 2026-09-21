import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/debouncer.dart';
import '../../../../core/widgets/cravery_empty_state.dart';
import '../../../../core/widgets/cravery_error_state.dart';
import '../../../../core/widgets/cravery_search_bar.dart';
import '../../../../core/widgets/skeleton_loader.dart';
import '../../../../shared/widgets/food_card.dart';
import '../../../../shared/widgets/restaurant_card.dart';
import '../../../cart/presentation/bloc/cart_bloc.dart';
import '../../../cart/presentation/bloc/cart_event.dart';
import '../../../cart/presentation/bloc/cart_state.dart';
import '../../../favorite/presentation/bloc/favorite_bloc.dart';
import '../../../favorite/presentation/bloc/favorite_state.dart';
import '../../../food/presentation/widgets/food_details_sheet.dart';
import '../bloc/search_bloc.dart';
import '../bloc/search_state.dart';

class SearchPage extends StatefulWidget {
  final int? initialCategoryId;

  const SearchPage({super.key, this.initialCategoryId});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final TextEditingController _searchController = TextEditingController();
  final Debouncer _debouncer = Debouncer(delay: const Duration(milliseconds: 350));

  @override
  void initState() {
    super.initState();
    context.read<SearchBloc>().add(SearchInitRequested());
    if (widget.initialCategoryId != null) {
      context.read<SearchBloc>().add(SearchCategorySelected(widget.initialCategoryId));
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debouncer.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debouncer.run(() {
      context.read<SearchBloc>().add(SearchQueryChanged(query));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: CraverySearchBar(
          controller: _searchController,
          hintText: 'Search restaurants or dishes...',
          autofocus: false,
          onChanged: _onSearchChanged,
        ),
      ),
      body: Column(
        children: [
          // Category Filter Chips
          BlocBuilder<SearchBloc, SearchState>(
            builder: (context, state) {
              List<dynamic> categories = [];
              int? selectedId;

              if (state is SearchLoading) {
                categories = state.categories;
                selectedId = state.selectedCategoryId;
              } else if (state is SearchLoaded) {
                categories = state.categories;
                selectedId = state.selectedCategoryId;
              }

              if (categories.isEmpty) return const SizedBox.shrink();

              return Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: SizedBox(
                  height: 38,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
                    itemCount: categories.length + 1,
                    itemBuilder: (context, index) {
                      final isAll = index == 0;
                      final catId = isAll ? null : categories[index - 1].id as int;
                      final isSelected = selectedId == catId;
                      final name = isAll ? 'All' : categories[index - 1].name as String;

                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          selected: isSelected,
                          label: Text(name),
                          labelStyle: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? Colors.white : AppColors.textPrimary,
                          ),
                          backgroundColor: AppColors.background,
                          selectedColor: AppColors.primary,
                          checkmarkColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.radiusPill),
                            side: BorderSide(
                              color: isSelected ? AppColors.primary : AppColors.border,
                            ),
                          ),
                          onSelected: (_) {
                            context.read<SearchBloc>().add(SearchCategorySelected(catId));
                          },
                        ),
                      );
                    },
                  ),
                ),
              );
            },
          ),

          // Search Results
          Expanded(
            child: BlocBuilder<SearchBloc, SearchState>(
              builder: (context, state) {
                if (state is SearchLoading) {
                  return ListView(
                    padding: const EdgeInsets.all(AppDimensions.lg),
                    children: [
                      SkeletonLoader.restaurantCard(),
                      SkeletonLoader.foodCard(),
                      SkeletonLoader.foodCard(),
                    ],
                  );
                } else if (state is SearchError) {
                  return CraveryErrorState(
                    message: state.message,
                    onRetry: () => context.read<SearchBloc>().add(SearchInitRequested()),
                  );
                } else if (state is SearchLoaded) {
                  if (state.isEmpty) {
                    return CraveryEmptyState(
                      icon: Icons.search_off_rounded,
                      title: 'No results found',
                      message: state.query.isNotEmpty
                          ? 'We couldn\'t find any restaurants or dishes matching "${state.query}".'
                          : 'No items available in this category.',
                    );
                  }

                  return DefaultTabController(
                    length: 2,
                    child: Column(
                      children: [
                        Container(
                          color: Colors.white,
                          child: TabBar(
                            labelColor: AppColors.primary,
                            unselectedLabelColor: AppColors.textSecondary,
                            indicatorColor: AppColors.primary,
                            labelStyle: AppTextStyles.h4.copyWith(fontSize: 14),
                            tabs: [
                              Tab(text: 'Restaurants (${state.restaurants.length})'),
                              Tab(text: 'Dishes (${state.foods.length})'),
                            ],
                          ),
                        ),
                        Expanded(
                          child: TabBarView(
                            children: [
                              // Restaurants Tab
                              state.restaurants.isEmpty
                                  ? const CraveryEmptyState(
                                      icon: Icons.storefront_rounded,
                                      title: 'No restaurants',
                                      message: 'No restaurants match your search criteria.',
                                    )
                                  : BlocBuilder<FavoriteBloc, FavoriteState>(
                                      builder: (context, favState) {
                                        return ListView.builder(
                                          padding: const EdgeInsets.all(AppDimensions.lg),
                                          itemCount: state.restaurants.length,
                                          itemBuilder: (context, index) {
                                            final restaurant = state.restaurants[index];
                                            final isFav = favState is FavoriteLoaded &&
                                                favState.isRestaurantFavorite(restaurant.id);

                                            return RestaurantCard(
                                              restaurant: restaurant,
                                              isFavorite: isFav,
                                              onFavoriteTap: () {
                                                context.read<FavoriteBloc>().add(
                                                      FavoriteRestaurantToggleRequested(restaurant),
                                                    );
                                              },
                                              onTap: () {
                                                context.push(
                                                  RouteNames.restaurantDetailsPath(restaurant.id),
                                                );
                                              },
                                            );
                                          },
                                        );
                                      },
                                    ),

                              // Dishes Tab
                              state.foods.isEmpty
                                  ? const CraveryEmptyState(
                                      icon: Icons.fastfood_rounded,
                                      title: 'No dishes',
                                      message: 'No dishes match your search criteria.',
                                    )
                                  : BlocBuilder<CartBloc, CartState>(
                                      builder: (context, cartState) {
                                        return ListView.builder(
                                          padding: const EdgeInsets.all(AppDimensions.lg),
                                          itemCount: state.foods.length,
                                          itemBuilder: (context, index) {
                                            final food = state.foods[index];
                                            final inCart = cartState.cart.items
                                                .where((i) => i.foodItemId == food.id)
                                                .firstOrNull;

                                            return FoodCard(
                                              food: food,
                                              inCartQuantity: inCart?.quantity,
                                              onTap: () {
                                                showModalBottomSheet(
                                                  context: context,
                                                  isScrollControlled: true,
                                                  backgroundColor: Colors.white,
                                                  shape: const RoundedRectangleBorder(
                                                    borderRadius: BorderRadius.vertical(
                                                      top: Radius.circular(AppDimensions.radiusXl),
                                                    ),
                                                  ),
                                                  builder: (_) => FoodDetailsSheet(
                                                    food: food,
                                                    restaurantName: food.restaurantName ?? 'Restaurant',
                                                  ),
                                                );
                                              },
                                              onAddToCart: () {
                                                context.read<CartBloc>().add(
                                                      CartItemAddRequested(
                                                        foodItemId: food.id,
                                                        restaurantId: food.restaurantId,
                                                        restaurantName: food.restaurantName ?? 'Restaurant',
                                                        quantity: 1,
                                                      ),
                                                    );
                                              },
                                            );
                                          },
                                        );
                                      },
                                    ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
          ),
        ],
      ),
    );
  }
}
