class ApiEndpoints {
  ApiEndpoints._();

  // Authentication
  static const String customerLogin = '/auth/customer/login';
  static const String customerGoogleLogin = '/auth/customer/google';
  static const String customerRegister = '/auth/customer/register';
  static const String completeCustomerProfile = '/auth/customer/complete-profile';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String authMe = '/auth/me';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // User Profile
  static const String userProfile = '/users/me';
  static const String updateProfile = '/users/profile';
  static const String updatePhone = '/users/me/phone';
  static const String changePassword = '/users/change-password';

  // Addresses
  static const String addresses = '/addresses';
  static String addressById(dynamic id) => '/addresses/$id';
  static String setDefaultAddress(dynamic id) => '/addresses/$id/default';

  // Restaurants
  static const String restaurants = '/restaurants';
  static String restaurantById(dynamic id) => '/restaurants/$id';
  static const String restaurantCategories = '/restaurant-categories';
  static String restaurantMenuCategories(dynamic restaurantId) => '/restaurants/$restaurantId/menu-categories';
  static String restaurantFoods(dynamic restaurantId) => '/restaurants/$restaurantId/foods';
  static String restaurantReviews(dynamic restaurantId) => '/restaurants/$restaurantId/reviews';

  // Foods
  static const String foods = '/foods';
  static const String popularFoods = '/foods/popular';
  static String foodById(dynamic id) => '/foods/$id';
  static String foodReviews(dynamic foodId) => '/foods/$foodId/reviews';

  // Cart
  static const String cart = '/cart';
  static const String cartItems = '/cart/items';
  static String cartItemById(dynamic itemId) => '/cart/items/$itemId';

  // Orders
  static const String orders = '/orders';
  static String orderById(dynamic id) => '/orders/$id';
  static String cancelOrder(dynamic id) => '/orders/$id/cancel';

  // Coupons
  static const String coupons = '/coupons';
  static const String validateCoupon = '/coupons/validate';

  // Promotions
  static const String promotions = '/promotions';
  static String restaurantPromotions(dynamic restaurantId) => '/restaurants/$restaurantId/promotions';

  // Favorites
  static const String favoriteRestaurants = '/favorites/restaurants';
  static String favoriteRestaurantById(dynamic id) => '/favorites/restaurants/$id';
  static String checkRestaurantFavorite(dynamic id) => '/favorites/restaurants/$id/check';
  static const String favoriteFoods = '/favorites/foods';
  static String favoriteFoodById(dynamic id) => '/favorites/foods/$id';
  static String checkFoodFavorite(dynamic id) => '/favorites/foods/$id/check';

  // Notifications
  static const String notifications = '/notifications';
  static const String unreadNotificationsCount = '/notifications/unread-count';
  static String markNotificationAsRead(dynamic id) => '/notifications/$id/read';
  static const String markAllNotificationsAsRead = '/notifications/read-all';

  // Reviews
  static const String reviews = '/reviews';
}
