import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/widgets/cravery_error_state.dart';
import '../../../../core/widgets/cravery_rating_badge.dart';
import '../../../../shared/widgets/food_card.dart';
import '../../../cart/presentation/bloc/cart_bloc.dart';
import '../../../cart/presentation/bloc/cart_event.dart';
import '../../../cart/presentation/bloc/cart_state.dart';
import '../../../favorite/presentation/bloc/favorite_bloc.dart';
import '../../../favorite/presentation/bloc/favorite_state.dart';
import '../../../food/presentation/widgets/food_details_sheet.dart';
import '../bloc/restaurant_bloc.dart';
import '../bloc/restaurant_state.dart';

class RestaurantDetailsPage extends StatefulWidget {
  final int restaurantId;

  const RestaurantDetailsPage({super.key, required this.restaurantId});

  @override
  State<RestaurantDetailsPage> createState() => _RestaurantDetailsPageState();
}

class _RestaurantDetailsPageState extends State<RestaurantDetailsPage> {
  @override
  void initState() {
    super.initState();
    context.read<RestaurantBloc>().add(RestaurantDetailsRequested(widget.restaurantId));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: BlocBuilder<RestaurantBloc, RestaurantState>(
        builder: (context, state) {
          if (state is RestaurantLoading) {
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            );
          } else if (state is RestaurantError) {
            return Scaffold(
              appBar: AppBar(),
              body: CraveryErrorState(
                message: state.message,
                onRetry: () => context.read<RestaurantBloc>().add(
                      RestaurantDetailsRequested(widget.restaurantId),
                    ),
              ),
            );
          } else if (state is RestaurantLoaded) {
            final restaurant = state.restaurant;

            return CustomScrollView(
              slivers: [
                // Collapsible Hero App Bar
                SliverAppBar(
                  expandedHeight: 200.0,
                  pinned: true,
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.textPrimary,
                  leading: CircleAvatar(
                    backgroundColor: Colors.white.withValues(alpha: 0.9),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppColors.textPrimary),
                      onPressed: () => context.pop(),
                    ),
                  ),
                  actions: [
                    BlocBuilder<FavoriteBloc, FavoriteState>(
                      builder: (context, favState) {
                        final isFav = favState is FavoriteLoaded &&
                            favState.isRestaurantFavorite(restaurant.id);

                        return CircleAvatar(
                          backgroundColor: Colors.white.withValues(alpha: 0.9),
                          child: IconButton(
                            icon: Icon(
                              isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                              size: 20,
                              color: isFav ? AppColors.error : AppColors.textPrimary,
                            ),
                            onPressed: () {
                              context.read<FavoriteBloc>().add(
                                    FavoriteRestaurantToggleRequested(restaurant),
                                  );
                            },
                          ),
                        );
                      },
                    ),
                    const SizedBox(width: AppDimensions.sm),
                  ],
                  flexibleSpace: FlexibleSpaceBar(
                    background: restaurant.coverImageUrl != null && restaurant.coverImageUrl!.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: restaurant.coverImageUrl!,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => Container(color: AppColors.primaryLight),
                          )
                        : Container(color: AppColors.primaryLight),
                  ),
                ),

                // Restaurant Details Header
                SliverToBoxAdapter(
                  child: Container(
                    color: Colors.white,
                    padding: const EdgeInsets.all(AppDimensions.lg),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    restaurant.name,
                                    style: AppTextStyles.h2,
                                  ),
                                  if (restaurant.categoryName != null) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      restaurant.categoryName!,
                                      style: AppTextStyles.bodyMedium,
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            CraveryRatingBadge(
                              rating: restaurant.rating,
                              reviewCount: restaurant.reviewCount,
                            ),
                          ],
                        ),

                        if (restaurant.description != null && restaurant.description!.isNotEmpty) ...[
                          const SizedBox(height: AppDimensions.sm),
                          Text(
                            restaurant.description!,
                            style: AppTextStyles.bodyMedium,
                          ),
                        ],

                        const SizedBox(height: AppDimensions.md),
                        const Divider(),
                        const SizedBox(height: AppDimensions.sm),

                        // Delivery & Address Info
                        Row(
                          children: [
                            const Icon(Icons.delivery_dining_rounded, color: AppColors.primary, size: 20),
                            const SizedBox(width: 6),
                            Text(
                              restaurant.deliveryFee == 0
                                  ? 'Free delivery'
                                  : '${CurrencyFormatter.format(restaurant.deliveryFee)} Delivery',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(width: AppDimensions.lg),
                            const Icon(Icons.access_time_rounded, color: AppColors.textMuted, size: 16),
                            const SizedBox(width: 4),
                            Text('25-35 min', style: AppTextStyles.bodySmall),
                          ],
                        ),
                        if (restaurant.address != null) ...[
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              const Icon(Icons.location_on_outlined, color: AppColors.textMuted, size: 16),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  restaurant.address!,
                                  style: AppTextStyles.bodySmall,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),

                // Category Filter Tabs
                if (state.menuCategories.isNotEmpty)
                  SliverPersistentHeader(
                    pinned: true,
                    delegate: _CategoryTabHeaderDelegate(
                      categories: state.menuCategories,
                      selectedId: state.selectedCategoryId,
                      onSelect: (id) {
                        context.read<RestaurantBloc>().add(RestaurantCategorySelected(id));
                      },
                    ),
                  ),

                // Menu Items List
                SliverPadding(
                  padding: const EdgeInsets.all(AppDimensions.lg),
                  sliver: state.filteredFoods.isEmpty
                      ? SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.all(AppDimensions.xxl),
                            child: Center(
                              child: Text(
                                'No dishes found in this category.',
                                style: AppTextStyles.bodyMedium,
                              ),
                            ),
                          ),
                        )
                      : BlocBuilder<CartBloc, CartState>(
                          builder: (context, cartState) {
                            return SliverList(
                              delegate: SliverChildBuilderDelegate(
                                (context, index) {
                                  final food = state.filteredFoods[index];
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
                                          restaurantName: restaurant.name,
                                        ),
                                      );
                                    },
                                    onAddToCart: () {
                                      context.read<CartBloc>().add(
                                            CartItemAddRequested(
                                              foodItemId: food.id,
                                              restaurantId: restaurant.id,
                                              restaurantName: restaurant.name,
                                              quantity: 1,
                                            ),
                                          );
                                    },
                                  );
                                },
                                childCount: state.filteredFoods.length,
                              ),
                            );
                          },
                        ),
                ),
              ],
            );
          }
          return const SizedBox.shrink();
        },
      ),

      // Persistent Floating Cart Bottom Banner if cart contains items
      bottomNavigationBar: BlocBuilder<CartBloc, CartState>(
        builder: (context, cartState) {
          if (cartState.cart.isEmpty) return const SizedBox.shrink();

          return Container(
            padding: const EdgeInsets.all(AppDimensions.md),
            decoration: BoxDecoration(
              color: Colors.white,
              border: const Border(top: BorderSide(color: AppColors.border)),
              boxShadow: [AppColors.cardShadow],
            ),
            child: SafeArea(
              top: false,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg, vertical: 14),
                ),
                onPressed: () => context.push(RouteNames.cart),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.25),
                            borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                          ),
                          child: Text(
                            '${cartState.cart.totalItems}',
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                          ),
                        ),
                        const SizedBox(width: AppDimensions.md),
                        const Text(
                          'View Cart',
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                        ),
                      ],
                    ),
                    Text(
                      CurrencyFormatter.format(cartState.cart.subtotal),
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _CategoryTabHeaderDelegate extends SliverPersistentHeaderDelegate {
  final List<dynamic> categories;
  final int? selectedId;
  final ValueChanged<int?> onSelect;

  _CategoryTabHeaderDelegate({
    required this.categories,
    required this.selectedId,
    required this.onSelect,
  });

  @override
  double get minExtent => 52.0;

  @override
  double get maxExtent => 52.0;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
        itemCount: categories.length + 1,
        itemBuilder: (context, index) {
          final isAll = index == 0;
          final catId = isAll ? null : categories[index - 1].id as int;
          final isSelected = selectedId == catId;
          final name = isAll ? 'All Dishes' : categories[index - 1].name as String;

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
              onSelected: (_) => onSelect(catId),
            ),
          );
        },
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _CategoryTabHeaderDelegate oldDelegate) {
    return oldDelegate.selectedId != selectedId || oldDelegate.categories != categories;
  }
}
