import 'package:flutter/material.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_dimensions.dart';
import '../../app/theme/app_text_styles.dart';

class CraveryTextField extends StatefulWidget {
  final TextEditingController controller;
  final String? label;
  final String hintText;
  final bool isPassword;
  final TextInputType keyboardType;
  final dynamic prefixIcon;
  final dynamic suffixIcon;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final void Function(String)? onSubmitted;
  final int maxLines;
  final bool readOnly;
  final VoidCallback? onTap;
  final TextInputAction? textInputAction;
  final bool autofocus;

  const CraveryTextField({
    super.key,
    required this.controller,
    this.label,
    String? hintText,
    String? hint,
    this.isPassword = false,
    this.keyboardType = TextInputType.text,
    this.prefixIcon,
    this.suffixIcon,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.maxLines = 1,
    this.readOnly = false,
    this.onTap,
    this.textInputAction,
    this.autofocus = false,
  }) : hintText = hintText ?? hint ?? '';

  @override
  State<CraveryTextField> createState() => _CraveryTextFieldState();
}

class _CraveryTextFieldState extends State<CraveryTextField> {
  late bool _obscureText;

  @override
  void initState() {
    super.initState();
    _obscureText = widget.isPassword;
  }

  @override
  Widget build(BuildContext context) {
    Widget? resolvedPrefix;
    if (widget.prefixIcon != null) {
      if (widget.prefixIcon is IconData) {
        resolvedPrefix = Icon(widget.prefixIcon as IconData, color: AppColors.textMuted, size: AppDimensions.iconSm + 2);
      } else if (widget.prefixIcon is Widget) {
        resolvedPrefix = widget.prefixIcon as Widget;
      }
    }

    Widget? resolvedSuffix;
    if (widget.isPassword) {
      resolvedSuffix = IconButton(
        icon: Icon(
          _obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
          color: AppColors.textMuted,
          size: AppDimensions.iconSm + 2,
        ),
        onPressed: () {
          setState(() {
            _obscureText = !_obscureText;
          });
        },
      );
    } else if (widget.suffixIcon != null) {
      if (widget.suffixIcon is IconData) {
        resolvedSuffix = Icon(widget.suffixIcon as IconData, color: AppColors.textMuted, size: AppDimensions.iconSm + 2);
      } else if (widget.suffixIcon is Widget) {
        resolvedSuffix = widget.suffixIcon as Widget;
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: AppTextStyles.h4.copyWith(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: AppDimensions.xs + 2),
        ],
        TextFormField(
          controller: widget.controller,
          obscureText: _obscureText,
          keyboardType: widget.keyboardType,
          validator: widget.validator,
          onChanged: widget.onChanged,
          onFieldSubmitted: widget.onSubmitted,
          maxLines: widget.isPassword ? 1 : widget.maxLines,
          readOnly: widget.readOnly,
          onTap: widget.onTap,
          autofocus: widget.autofocus,
          textInputAction: widget.textInputAction ?? TextInputAction.next,
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
          decoration: InputDecoration(
            hintText: widget.hintText,
            prefixIcon: resolvedPrefix,
            suffixIcon: resolvedSuffix,
          ),
        ),
      ],
    );
  }
}
