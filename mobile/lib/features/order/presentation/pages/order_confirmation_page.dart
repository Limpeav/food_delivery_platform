import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/cravery_button.dart';

class OrderConfirmationPage extends StatelessWidget {
  final int orderId;

  const OrderConfirmationPage({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.xxl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Success Icon Animation
              Center(
                child: Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.2),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.check_circle_rounded,
                      color: AppColors.primary,
                      size: 56,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AppDimensions.xxl),

              Text(
                'Order Placed!',
                style: AppTextStyles.h1,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppDimensions.xs),
              Text(
                'Order #CRV-$orderId',
                style: AppTextStyles.h4.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppDimensions.md),
              Text(
                'The restaurant has received your order and will start preparing your delicious food shortly.',
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppDimensions.xxxl),

              // Action Buttons
              CraveryButton(
                text: 'Track Order',
                type: CraveryButtonType.primary,
                onPressed: () {
                  context.go(RouteNames.orderTrackingPath(orderId));
                },
              ),
              const SizedBox(height: AppDimensions.md),
              CraveryButton(
                text: 'Back to Home',
                type: CraveryButtonType.outlined,
                onPressed: () {
                  context.go(RouteNames.home);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
