import 'package:flutter/material.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_dimensions.dart';
import '../../app/theme/app_text_styles.dart';
import 'cravery_button.dart';

class CraveryEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String? actionText;
  final VoidCallback? onAction;

  const CraveryEmptyState({
    super.key,
    required this.icon,
    required this.title,
    String? message,
    String? description,
    String? actionText,
    String? buttonText,
    VoidCallback? onAction,
    VoidCallback? onButtonPressed,
  })  : message = message ?? description ?? '',
        actionText = actionText ?? buttonText,
        onAction = onAction ?? onButtonPressed;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.xxl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 38,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: AppDimensions.lg),
            Text(
              title,
              style: AppTextStyles.h3.copyWith(fontWeight: FontWeight.w800),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppDimensions.sm),
            Text(
              message,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            if (actionText != null && onAction != null) ...[
              const SizedBox(height: AppDimensions.xl),
              SizedBox(
                width: 200,
                child: CraveryButton(
                  text: actionText!,
                  onPressed: onAction,
                  type: CraveryButtonType.primary,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
