import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_dimensions.dart';

class SkeletonLoader extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const SkeletonLoader({
    super.key,
    this.width = double.infinity,
    required this.height,
    this.borderRadius = AppDimensions.radiusSm,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.shimmerBase,
      highlightColor: AppColors.shimmerHighlight,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }

  static Widget restaurantCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: AppDimensions.md),
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SkeletonLoader(
            width: double.infinity,
            height: 140,
            borderRadius: AppDimensions.radiusMd,
          ),
          const SizedBox(height: AppDimensions.md),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              SkeletonLoader(width: 180, height: 20),
              SkeletonLoader(width: 50, height: 20),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          const SkeletonLoader(width: 120, height: 14),
          const SizedBox(height: AppDimensions.sm),
          Row(
            children: const [
              SkeletonLoader(width: 70, height: 14),
              SizedBox(width: AppDimensions.md),
              SkeletonLoader(width: 90, height: 14),
            ],
          ),
        ],
      ),
    );
  }

  static Widget foodCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: AppDimensions.md),
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          const SkeletonLoader(
            width: 80,
            height: 80,
            borderRadius: AppDimensions.radiusMd,
          ),
          const SizedBox(width: AppDimensions.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                SkeletonLoader(width: 140, height: 18),
                SizedBox(height: AppDimensions.xs),
                SkeletonLoader(width: double.infinity, height: 14),
                SizedBox(height: AppDimensions.sm),
                SkeletonLoader(width: 60, height: 16),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static Widget categoryChip() {
    return Container(
      margin: const EdgeInsets.only(right: AppDimensions.sm),
      child: Column(
        children: const [
          SkeletonLoader(width: 64, height: 64, borderRadius: AppDimensions.radiusXl),
          SizedBox(height: 6),
          SkeletonLoader(width: 50, height: 12),
        ],
      ),
    );
  }
}
