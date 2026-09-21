import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_dimensions.dart';
import '../../app/theme/app_text_styles.dart';
import '../../core/utils/currency_formatter.dart';
import '../../core/widgets/cravery_rating_badge.dart';
import '../models/restaurant_model.dart';

class RestaurantCard extends StatelessWidget {
  final RestaurantModel restaurant;
  final VoidCallback onTap;
  final VoidCallback? onFavoriteTap;
  final bool isFavorite;

  const RestaurantCard({
    super.key,
    required this.restaurant,
    required this.onTap,
    this.onFavoriteTap,
    this.isFavorite = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
        boxShadow: [AppColors.softShadow],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cover Image + Badges
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(AppDimensions.radiusLg),
                    ),
                    child: restaurant.coverImageUrl != null && restaurant.coverImageUrl!.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: restaurant.coverImageUrl!,
                            height: 140,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            placeholder: (_, __) => Container(
                              height: 140,
                              color: AppColors.divider,
                              child: const Center(
                                child: Icon(Icons.restaurant_rounded, color: AppColors.textMuted, size: 36),
                              ),
                            ),
                            errorWidget: (_, __, ___) => _buildFallbackCover(),
                          )
                        : _buildFallbackCover(),
                  ),

                  // Favorite Button
                  if (onFavoriteTap != null)
                    Positioned(
                      top: 10,
                      right: 10,
                      child: Container(
                        height: 36,
                        width: 36,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.9),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.1),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                        child: IconButton(
                          padding: EdgeInsets.zero,
                          icon: Icon(
                            isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                            size: 20,
                            color: isFavorite ? AppColors.error : AppColors.textPrimary,
                          ),
                          onPressed: onFavoriteTap,
                        ),
                      ),
                    ),

                  // Closed Status Overlay
                  if (!restaurant.isOpen)
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.45),
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(AppDimensions.radiusLg),
                          ),
                        ),
                        child: Center(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.75),
                              borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                            ),
                            child: const Text(
                              'Closed',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),

              // Restaurant Info
              Padding(
                padding: const EdgeInsets.all(AppDimensions.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Small Logo
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight,
                            borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                            child: restaurant.logoUrl != null && restaurant.logoUrl!.isNotEmpty
                                ? CachedNetworkImage(
                                    imageUrl: restaurant.logoUrl!,
                                    fit: BoxFit.cover,
                                    errorWidget: (_, __, ___) => const Icon(
                                      Icons.storefront_rounded,
                                      color: AppColors.primary,
                                      size: 20,
                                    ),
                                  )
                                : const Icon(
                                    Icons.storefront_rounded,
                                    color: AppColors.primary,
                                    size: 20,
                                  ),
                          ),
                        ),
                        const SizedBox(width: AppDimensions.sm),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                restaurant.name,
                                style: AppTextStyles.h4,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (restaurant.categoryName != null) ...[
                                const SizedBox(height: 2),
                                Text(
                                  restaurant.categoryName!,
                                  style: AppTextStyles.bodySmall,
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
                    const SizedBox(height: AppDimensions.sm),
                    const Divider(height: 12),
                    // Metadata row: Delivery fee, time, min order
                    Row(
                      children: [
                        const Icon(
                          Icons.delivery_dining_rounded,
                          size: 16,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          restaurant.deliveryFee == 0
                              ? 'Free delivery'
                              : '${CurrencyFormatter.format(restaurant.deliveryFee)} delivery',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: AppDimensions.md),
                        const Icon(
                          Icons.access_time_rounded,
                          size: 14,
                          color: AppColors.textMuted,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '25-35 min',
                          style: AppTextStyles.bodySmall,
                        ),
                        if (restaurant.minimumOrder > 0) ...[
                          const SizedBox(width: AppDimensions.md),
                          Text(
                            'Min: ${CurrencyFormatter.format(restaurant.minimumOrder)}',
                            style: AppTextStyles.bodySmall,
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFallbackCover() {
    return Container(
      height: 140,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primaryLight,
            AppColors.border,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: const Center(
        child: Icon(
          Icons.restaurant_rounded,
          color: AppColors.primary,
          size: 44,
        ),
      ),
    );
  }
}
