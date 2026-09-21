import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/cravery_empty_state.dart';
import '../../../../core/widgets/cravery_error_state.dart';
import '../../../../core/widgets/skeleton_loader.dart';
import '../../../../shared/models/food_item_model.dart';
import '../../../../shared/models/restaurant_model.dart';
import '../../../../shared/widgets/food_card.dart';
import '../../../../shared/widgets/restaurant_card.dart';
import '../../../cart/presentation/bloc/cart_bloc.dart';
import '../../../cart/presentation/bloc/cart_state.dart';
import '../../../food/presentation/widgets/food_details_sheet.dart';
import '../bloc/favorite_bloc.dart';
import '../bloc/favorite_state.dart';

class FavoritesPage extends StatefulWidget {
  const FavoritesPage({super.key});

  @override
  State<FavoritesPage> createState() => _FavoritesPageState();
}

class _FavoritesPageState extends State<FavoritesPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<FavoriteBloc>().add(FavoritesFetchRequested());
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _openFoodSheet(BuildContext context, FoodItemModel food) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppDimensions.radiusXl)),
      ),
      builder: (_) => FoodDetailsSheet(
        food: food,
        restaurantName: 'Cravery Partner',
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Favorites'),
        centerTitle: false,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          labelStyle: AppTextStyles.labelLarge,
          tabs: const [
            Tab(text: 'Restaurants'),
            Tab(text: 'Dishes'),
          ],
        ),
      ),
      body: BlocBuilder<FavoriteBloc, FavoriteState>(
        builder: (context, state) {
          if (state is FavoriteLoading) {
            return _buildSkeleton();
          }

          if (state is FavoriteError) {
            return CraveryErrorState(
              message: state.message,
              onRetry: () => context.read<FavoriteBloc>().add(FavoritesFetchRequested()),
            );
          }

          if (state is FavoriteLoaded) {
            return TabBarView(
              controller: _tabController,
              children: [
                _buildRestaurantsTab(state.restaurants),
                _buildFoodsTab(state.foods),
              ],
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildRestaurantsTab(List<RestaurantModel> restaurants) {
    if (restaurants.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          context.read<FavoriteBloc>().add(FavoritesFetchRequested());
        },
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            SizedBox(height: MediaQuery.of(context).size.height * 0.15),
            CraveryEmptyState(
              title: 'No Favorite Restaurants',
              description: 'Save your favorite spots by tapping the heart icon on any restaurant page.',
              buttonText: 'Browse Restaurants',
              icon: Icons.storefront_outlined,
              onButtonPressed: () => context.go(RouteNames.home),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () async {
        context.read<FavoriteBloc>().add(FavoritesFetchRequested());
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(AppDimensions.md),
        itemCount: restaurants.length,
        itemBuilder: (context, index) {
          final restaurant = restaurants[index];
          return RestaurantCard(
            restaurant: restaurant,
            isFavorite: true,
            onTap: () {
              context.push(RouteNames.restaurantDetailsPath(restaurant.id));
            },
            onFavoriteTap: () {
              context.read<FavoriteBloc>().add(FavoriteRestaurantToggleRequested(restaurant));
            },
          );
        },
      ),
    );
  }

  Widget _buildFoodsTab(List<FoodItemModel> foods) {
    if (foods.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          context.read<FavoriteBloc>().add(FavoritesFetchRequested());
        },
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            SizedBox(height: MediaQuery.of(context).size.height * 0.15),
            CraveryEmptyState(
              title: 'No Saved Dishes',
              description: 'Bookmark mouth-watering dishes so you can reorder them in seconds.',
              buttonText: 'Explore Menu Items',
              icon: Icons.fastfood_outlined,
              onButtonPressed: () => context.go(RouteNames.search),
            ),
          ],
        ),
      );
    }

    return BlocBuilder<CartBloc, CartState>(
      builder: (context, cartState) {
        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            context.read<FavoriteBloc>().add(FavoritesFetchRequested());
          },
          child: ListView.separated(
            padding: const EdgeInsets.all(AppDimensions.md),
            itemCount: foods.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
            itemBuilder: (context, index) {
              final food = foods[index];
              int quantityInCart = 0;
              if (cartState is CartLoaded) {
                final match = cartState.cart.items.where((i) => i.foodItemId == food.id);
                if (match.isNotEmpty) {
                  quantityInCart = match.first.quantity;
                }
              }

              return Stack(
                children: [
                  FoodCard(
                    food: food,
                    inCartQuantity: quantityInCart > 0 ? quantityInCart : null,
                    onTap: () => _openFoodSheet(context, food),
                    onAddToCart: () => _openFoodSheet(context, food),
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: InkWell(
                      onTap: () {
                        context.read<FavoriteBloc>().add(FavoriteFoodToggleRequested(food));
                      },
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.08),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.favorite_rounded,
                          color: AppColors.error,
                          size: 20,
                        ),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildSkeleton() {
    return Padding(
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Column(
        children: const [
          SkeletonLoader(height: 180, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.md),
          SkeletonLoader(height: 180, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.md),
          SkeletonLoader(height: 180, borderRadius: AppDimensions.radiusLg),
        ],
      ),
    );
  }
}
