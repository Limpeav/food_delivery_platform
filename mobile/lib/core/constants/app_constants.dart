class AppConstants {
  AppConstants._();

  // Storage Keys
  static const String keyAccessToken = 'cravery_access_token';
  static const String keyRefreshToken = 'cravery_refresh_token';
  static const String keyUserRole = 'cravery_user_role';
  static const String keyUserId = 'cravery_user_id';
  static const String keyUserName = 'cravery_user_name';
  static const String keyUserEmail = 'cravery_user_email';
  static const String keyOnboardingCompleted = 'cravery_onboarding_completed';
  static const String keyLastSelectedAddress = 'cravery_last_address';

  // Role
  static const String roleCustomer = 'CUSTOMER';

  // Pagination Defaults
  static const int defaultPageSize = 10;
  static const int defaultFoodPageSize = 12;

  // Animation Durations
  static const Duration animDurationShort = Duration(milliseconds: 200);
  static const Duration animDurationMedium = Duration(milliseconds: 350);
  static const Duration animDurationLong = Duration(milliseconds: 500);
}
