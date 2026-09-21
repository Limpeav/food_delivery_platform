class RouteNames {
  RouteNames._();

  // Auth & System
  static const String splash = '/splash';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String completeProfile = '/auth/complete-profile';

  // Bottom Nav Branches
  static const String home = '/home';
  static const String search = '/search';
  static const String orders = '/orders';
  static const String favorites = '/favorites';
  static const String profile = '/profile';

  // Subroutes
  static const String restaurantDetails = '/restaurants/:id';
  static String restaurantDetailsPath(dynamic id) => '/restaurants/$id';

  static const String cart = '/cart';
  static const String checkout = '/checkout';
  static const String payment = '/payment/:orderId';
  static String paymentPath(dynamic orderId) => '/payment/$orderId';

  static const String orderConfirmation = '/order-confirmation/:orderId';
  static String orderConfirmationPath(dynamic orderId) => '/order-confirmation/$orderId';

  static const String orderDetails = '/orders/:id';
  static String orderDetailsPath(dynamic id) => '/orders/$id';

  static const String orderTracking = '/orders/:id/tracking';
  static String orderTrackingPath(dynamic id) => '/orders/$id/tracking';

  static const String addresses = '/addresses';
  static const String addressNew = '/addresses/new';
  static const String addressEdit = '/addresses/:id/edit';
  static String addressEditPath(dynamic id) => '/addresses/$id/edit';

  static const String notifications = '/notifications';
  static const String changePassword = '/change-password';
  static const String settings = '/settings';
  static const String helpCenter = '/help-center';
  static const String privacyPolicy = '/privacy-policy';
  static const String termsOfService = '/terms-of-service';
}
