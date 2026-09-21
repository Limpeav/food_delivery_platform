import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary Brand
  static const Color primary = Color(0xFFFF5A1F); // Cravery Orange
  static const Color primaryHover = Color(0xFFE04812);
  static const Color primaryLight = Color(0xFFFFF1EB);
  static const Color primaryGradientStart = Color(0xFFFF5A1F);
  static const Color primaryGradientEnd = Color(0xFFFF8A4C);

  // Background & Surface
  static const Color background = Color(0xFFF8FAFC); // Slate-50
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF1E293B);
  static const Color cardBackground = Color(0xFFFFFFFF);

  // Text & Typography
  static const Color textPrimary = Color(0xFF0F172A); // Slate-900
  static const Color textSecondary = Color(0xFF475569); // Slate-600
  static const Color textMuted = Color(0xFF94A3B8); // Slate-400
  static const Color textLight = Color(0xFFFFFFFF);

  // Borders & Dividers
  static const Color border = Color(0xFFE2E8F0); // Slate-200
  static const Color borderFocus = Color(0xFFFF5A1F);
  static const Color divider = Color(0xFFF1F5F9); // Slate-100

  // Status & Feedback
  static const Color success = Color(0xFF10B981); // Emerald-500
  static const Color successLight = Color(0xFFECFDF5);
  static const Color warning = Color(0xFFF59E0B); // Amber-500
  static const Color warningLight = Color(0xFFFFFBEB);
  static const Color error = Color(0xFFEF4444); // Red-500
  static const Color errorLight = Color(0xFFFEF2F2);
  static const Color info = Color(0xFF3B82F6); // Blue-500
  static const Color infoLight = Color(0xFFEFF6FF);

  // Shimmer
  static const Color shimmerBase = Color(0xFFE2E8F0);
  static const Color shimmerHighlight = Color(0xFFF8FAFC);

  // Shadows
  static BoxShadow softShadow = BoxShadow(
    color: const Color(0xFF0F172A).withValues(alpha: 0.04),
    blurRadius: 10,
    offset: const Offset(0, 4),
  );

  static BoxShadow cardShadow = BoxShadow(
    color: const Color(0xFF0F172A).withValues(alpha: 0.06),
    blurRadius: 16,
    offset: const Offset(0, 6),
  );

  static BoxShadow primaryGlow = BoxShadow(
    color: primary.withValues(alpha: 0.28),
    blurRadius: 12,
    offset: const Offset(0, 4),
  );
}
