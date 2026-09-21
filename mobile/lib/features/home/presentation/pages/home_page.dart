import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/cravery_error_state.dart';
import '../../../../core/widgets/cravery_search_bar.dart';
import '../../../../core/widgets/skeleton_loader.dart';
import '../../../../shared/widgets/cravery_app_bar.dart';
import '../../../../shared/widgets/food_card.dart';
import '../../../../shared/widgets/restaurant_card.dart';
import '../../../address/presentation/bloc/address_bloc.dart';
import '../../../address/presentation/bloc/address_state.dart';
import '../../../cart/presentation/bloc/cart_bloc.dart';
import '../../../cart/presentation/bloc/cart_event.dart';
import '../../../cart/presentation/bloc/cart_state.dart';
import '../../../favorite/presentation/bloc/favorite_bloc.dart';
import '../../../favorite/presentation/bloc/favorite_state.dart';
import '../../../food/presentation/widgets/food_details_sheet.dart';
import '../../../notification/presentation/bloc/notification_bloc.dart';
import '../../../notification/presentation/bloc/notification_state.dart';
import '../bloc/home_bloc.dart';
import '../bloc/home_state.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    context.read<HomeBloc>().add(HomeFetchRequested());
  }

  void _showConflictDialog(CartRestaurantConflict state) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        ),
        title: const Text('Create new order?'),
        content: Text(
          'Your cart contains items from "${state.cart.restaurantName ?? 'another restaurant'}". Would you like to clear your cart and add items from "${state.pendingRestaurantName}" instead?',
          style: AppTextStyles.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              context.read<CartBloc>().add(
                    CartClearAndAddRequested(
                      foodItemId: state.pendingFoodItemId,
                      quantity: state.pendingQuantity,
                    ),
                  );
            },
            child: const Text('Clear & Add'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<CartBloc, CartState>(
      listener: (context, state) {
        if (state is CartRestaurantConflict) {
          _showConflictDialog(state);
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: BlocBuilder<AddressBloc, AddressState>(
            builder: (context, addressState) {
              final defaultAddr = addressState is AddressLoaded
                  ? addressState.defaultAddress
                  : null;
              final addrLabel = defaultAddr != null
                  ? '${defaultAddr.label} • ${defaultAddr.addressLine}'
                  : 'Select Delivery Address';

              return BlocBuilder<NotificationBloc, NotificationState>(
                builder: (context, notifState) {
                  final unread = notifState is NotificationLoaded ? notifState.unreadCount : 0;
                  return BlocBuilder<CartBloc, CartState>(
                    builder: (context, cartState) {
                      return CraveryAppBar(
                        deliveryAddress: addrLabel,
                        onAddressTap: () => context.push(RouteNames.addresses),
                        onNotificationTap: () => context.push(RouteNames.notifications),
                        onCartTap: () => context.push(RouteNames.cart),
                        unreadNotifications: unread,
                        cartItemCount: cartState.cart.totalItems,
                      );
                    },
                  );
                },
              );
            },
          ),
        ),
        body: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            context.read<HomeBloc>().add(HomeRefreshRequested());
          },
          child: BlocBuilder<HomeBloc, HomeState>(
            builder: (context, state) {
              if (state is HomeLoading) {
                return _buildLoadingSkeleton();
              } else if (state is HomeError) {
                return CraveryErrorState(
                  message: state.message,
                  onRetry: () => context.read<HomeBloc>().add(HomeFetchRequested()),
                );
              } else if (state is HomeLoaded) {
                return SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.only(bottom: AppDimensions.xxxl),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Search Bar Trigger
                      Padding(
                        padding: const EdgeInsets.all(AppDimensions.lg),
                        child: CraverySearchBar(
                          readOnly: true,
                          onTap: () => context.push(RouteNames.search),
                        ),
                      ),

                      // Promotions Carousel (if any)
                      if (state.promotions.isNotEmpty) ...[
                        _buildPromotionsCarousel(state.promotions),
                        const SizedBox(height: AppDimensions.lg),
                      ],

                      // Categories Section
                      if (state.categories.isNotEmpty) ...[
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
                          child: Text('Categories', style: AppTextStyles.h3),
                        ),
                        const SizedBox(height: AppDimensions.md),
                        _buildCategoriesList(state.categories),
                        const SizedBox(height: AppDimensions.xl),
                      ],

                      // Popular Restaurants
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Popular Restaurants', style: AppTextStyles.h3),
                            TextButton(
                              onPressed: () => context.push(RouteNames.search),
                              child: const Text('See All'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppDimensions.sm),
                      _buildRestaurantList(state.popularRestaurants),
                      const SizedBox(height: AppDimensions.xl),

                      // Trending Foods
                      if (state.popularFoods.isNotEmpty) ...[
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
                          child: Text('Trending Dishes', style: AppTextStyles.h3),
                        ),
                        const SizedBox(height: AppDimensions.md),
                        _buildPopularFoodsList(state.popularFoods),
                      ],
                    ],
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ),
      ),
    );
  }

  Widget _buildPromotionsCarousel(List<dynamic> promotions) {
    return SizedBox(
      height: 140,
      child: PageView.builder(
        itemCount: promotions.length,
        controller: PageController(viewportFraction: 0.9),
        itemBuilder: (context, index) {
          final promo = promotions[index];
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 6),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primaryGradientStart, AppColors.primaryGradientEnd],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
              boxShadow: [AppColors.primaryGlow],
            ),
            child: Stack(
              children: [
                if (promo.bannerUrl != null && promo.bannerUrl!.isNotEmpty)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                    child: CachedNetworkImage(
                      imageUrl: promo.bannerUrl!,
                      width: double.infinity,
                      height: double.infinity,
                      fit: BoxFit.cover,
                      color: Colors.black.withValues(alpha: 0.3),
                      colorBlendMode: BlendMode.darken,
                      errorWidget: (_, __, ___) => const SizedBox.shrink(),
                    ),
                  ),
                Padding(
                  padding: const EdgeInsets.all(AppDimensions.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.25),
                          borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                        ),
                        child: Text(
                          '${promo.discountPercentage.toInt()}% OFF',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        promo.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 18,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (promo.description != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          promo.description!,
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.9),
                            fontSize: 12,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildCategoriesList(List<dynamic> categories) {
    return SizedBox(
      height: 94,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final cat = categories[index];
          return Container(
            margin: const EdgeInsets.only(right: AppDimensions.md),
            child: InkWell(
              borderRadius: BorderRadius.circular(AppDimensions.radiusXl),
              onTap: () {
                context.push(RouteNames.search, extra: cat.id);
              },
              child: Column(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.border),
                      boxShadow: [AppColors.softShadow],
                    ),
                    child: ClipOval(
                      child: cat.imageUrl != null && cat.imageUrl!.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: cat.imageUrl!,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) => const Icon(
                                Icons.fastfood_rounded,
                                color: AppColors.primary,
                                size: 28,
                              ),
                            )
                          : const Icon(
                              Icons.fastfood_rounded,
                              color: AppColors.primary,
                              size: 28,
                            ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  SizedBox(
                    width: 68,
                    child: Text(
                      cat.name,
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildRestaurantList(List<dynamic> restaurants) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
      child: BlocBuilder<FavoriteBloc, FavoriteState>(
        builder: (context, favState) {
          return Column(
            children: restaurants.map((restaurant) {
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
                  context.push(RouteNames.restaurantDetailsPath(restaurant.id));
                },
              );
            }).toList(),
          );
        },
      ),
    );
  }

  Widget _buildPopularFoodsList(List<dynamic> foods) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
      child: BlocBuilder<CartBloc, CartState>(
        builder: (context, cartState) {
          return Column(
            children: foods.map((food) {
              final inCartItem = cartState.cart.items
                  .where((item) => item.foodItemId == food.id)
                  .firstOrNull;

              return FoodCard(
                food: food,
                inCartQuantity: inCartItem?.quantity,
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
            }).toList(),
          );
        },
      ),
    );
  }

  Widget _buildLoadingSkeleton() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppDimensions.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SkeletonLoader(width: double.infinity, height: 48, borderRadius: AppDimensions.radiusMd),
          const SizedBox(height: AppDimensions.lg),
          const SkeletonLoader(width: double.infinity, height: 130, borderRadius: AppDimensions.radiusLg),
          const SizedBox(height: AppDimensions.xl),
          Row(
            children: List.generate(4, (_) => SkeletonLoader.categoryChip()),
          ),
          const SizedBox(height: AppDimensions.xl),
          SkeletonLoader.restaurantCard(),
          SkeletonLoader.restaurantCard(),
        ],
      ),
    );
  }
}
