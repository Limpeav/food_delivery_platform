import 'package:flutter/material.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_dimensions.dart';

class CraveryRatingBadge extends StatelessWidget {
  final double rating;
  final int? reviewCount;
  final bool isSmall;

  const CraveryRatingBadge({
    super.key,
    required this.rating,
    this.reviewCount,
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? AppDimensions.xs + 2 : AppDimensions.sm,
        vertical: isSmall ? 2 : AppDimensions.xs,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB), // Amber-50
        borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
        border: Border.all(color: const Color(0xFFFDE68A)), // Amber-200
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.star_rounded,
            size: isSmall ? 13 : 15,
            color: const Color(0xFFD97706), // Amber-600
          ),
          const SizedBox(width: 3),
          Text(
            rating > 0 ? rating.toStringAsFixed(1) : 'New',
            style: TextStyle(
              fontSize: isSmall ? 11 : 12,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF92400E), // Amber-800
            ),
          ),
          if (reviewCount != null && reviewCount! > 0) ...[
            const SizedBox(width: 3),
            Text(
              '($reviewCount)',
              style: TextStyle(
                fontSize: isSmall ? 10 : 11,
                fontWeight: FontWeight.w500,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
