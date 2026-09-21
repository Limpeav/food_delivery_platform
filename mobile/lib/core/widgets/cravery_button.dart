import 'package:flutter/material.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_dimensions.dart';
import '../../app/theme/app_text_styles.dart';

enum CraveryButtonType { primary, secondary, outlined, text, danger }

class CraveryButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isFullWidth;
  final CraveryButtonType type;
  final dynamic icon;
  final double height;
  final double? width;

  const CraveryButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.isFullWidth = true,
    this.type = CraveryButtonType.primary,
    this.icon,
    this.height = AppDimensions.buttonHeightLg,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDisabled = onPressed == null || isLoading;

    Color backgroundColor;
    Color foregroundColor;
    BorderSide borderSide = BorderSide.none;

    switch (type) {
      case CraveryButtonType.primary:
        backgroundColor = isDisabled ? AppColors.textMuted : AppColors.primary;
        foregroundColor = Colors.white;
        break;
      case CraveryButtonType.secondary:
        backgroundColor = AppColors.primaryLight;
        foregroundColor = AppColors.primary;
        break;
      case CraveryButtonType.outlined:
        backgroundColor = Colors.transparent;
        foregroundColor = isDisabled ? AppColors.textMuted : AppColors.textPrimary;
        borderSide = BorderSide(
          color: isDisabled ? AppColors.border : AppColors.border,
          width: 1.5,
        );
        break;
      case CraveryButtonType.text:
        backgroundColor = Colors.transparent;
        foregroundColor = isDisabled ? AppColors.textMuted : AppColors.primary;
        break;
      case CraveryButtonType.danger:
        backgroundColor = isDisabled ? AppColors.textMuted : AppColors.error;
        foregroundColor = Colors.white;
        break;
    }

    Widget? iconWidget;
    if (icon != null) {
      if (icon is IconData) {
        iconWidget = Icon(icon as IconData, size: 18, color: foregroundColor);
      } else if (icon is Widget) {
        iconWidget = icon as Widget;
      }
    }

    final content = isLoading
        ? SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2.2,
              valueColor: AlwaysStoppedAnimation<Color>(foregroundColor),
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (iconWidget != null) ...[
                iconWidget,
                const SizedBox(width: AppDimensions.sm),
              ],
              Text(
                text,
                style: AppTextStyles.buttonMedium.copyWith(
                  color: foregroundColor,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          );

    return SizedBox(
      height: height,
      width: isFullWidth ? double.infinity : width,
      child: Material(
        color: backgroundColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
          side: borderSide,
        ),
        child: InkWell(
          onTap: isDisabled ? null : onPressed,
          borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
          child: Center(child: content),
        ),
      ),
    );
  }
}
