import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_dimensions.dart';
import '../../app/theme/app_text_styles.dart';
import '../../core/utils/currency_formatter.dart';
import '../models/food_item_model.dart';

class FoodCard extends StatelessWidget {
  final FoodItemModel food;
  final VoidCallback onTap;
  final VoidCallback? onAddToCart;
  final int? inCartQuantity;

  const FoodCard({
    super.key,
    required this.food,
    required this.onTap,
    this.onAddToCart,
    this.inCartQuantity,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppDimensions.sm),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
          child: Padding(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Food Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        food.name,
                        style: AppTextStyles.h4,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (food.description != null && food.description!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          food.description!,
                          style: AppTextStyles.bodySmall,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      const SizedBox(height: AppDimensions.sm),
                      Row(
                        children: [
                          Text(
                            CurrencyFormatter.format(food.price),
                            style: AppTextStyles.price,
                          ),
                          if (food.rating > 0) ...[
                            const SizedBox(width: AppDimensions.sm),
                            const Icon(Icons.star_rounded, size: 14, color: Color(0xFFD97706)),
                            const SizedBox(width: 2),
                            Text(
                              food.rating.toStringAsFixed(1),
                              style: AppTextStyles.caption.copyWith(color: const Color(0xFF92400E)),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppDimensions.md),

                // Dish Image + Add Button
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        color: AppColors.divider,
                        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                        child: food.imageUrl != null && food.imageUrl!.isNotEmpty
                            ? CachedNetworkImage(
                                imageUrl: food.imageUrl!,
                                fit: BoxFit.cover,
                                placeholder: (_, __) => Container(
                                  color: AppColors.divider,
                                  child: const Center(
                                    child: Icon(Icons.fastfood_rounded, color: AppColors.textMuted),
                                  ),
                                ),
                                errorWidget: (_, __, ___) => _buildFallbackFoodImage(),
                              )
                            : _buildFallbackFoodImage(),
                      ),
                    ),

                    // Add to Cart Button Badge
                    if (onAddToCart != null && food.available)
                      Positioned(
                        bottom: -6,
                        right: -6,
                        child: Material(
                          color: AppColors.primary,
                          shape: const CircleBorder(),
                          elevation: 2,
                          child: InkWell(
                            customBorder: const CircleBorder(),
                            onTap: onAddToCart,
                            child: Padding(
                              padding: const EdgeInsets.all(6.0),
                              child: inCartQuantity != null && inCartQuantity! > 0
                                  ? Text(
                                      '$inCartQuantity',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w800,
                                        fontSize: 12,
                                      ),
                                    )
                                  : const Icon(
                                      Icons.add_rounded,
                                      color: Colors.white,
                                      size: 18,
                                    ),
                            ),
                          ),
                        ),
                      ),

                    if (!food.available)
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.8),
                            borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                          ),
                          child: const Center(
                            child: Text(
                              'Sold Out',
                              style: TextStyle(
                                color: AppColors.error,
                                fontWeight: FontWeight.w700,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFallbackFoodImage() {
    return Container(
      color: AppColors.primaryLight,
      child: const Center(
        child: Icon(
          Icons.restaurant_menu_rounded,
          color: AppColors.primary,
          size: 28,
        ),
      ),
    );
  }
}
