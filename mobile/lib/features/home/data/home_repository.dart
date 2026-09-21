import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/category_model.dart';
import '../../../shared/models/food_item_model.dart';
import '../../../shared/models/promotion_model.dart';
import '../../../shared/models/restaurant_model.dart';

class HomeRepository {
  final DioClient _dioClient;

  HomeRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<List<CategoryModel>> getCategories() async {
    final response = await _dioClient.get(ApiEndpoints.restaurantCategories);
    final list = response.data['data'] as List<dynamic>? ?? [];
    return list.map((item) => CategoryModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<PromotionModel>> getPromotions() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.promotions);
      final list = response.data['data'] as List<dynamic>? ?? [];
      return list.map((item) => PromotionModel.fromJson(item as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<List<RestaurantModel>> getPopularRestaurants() async {
    final response = await _dioClient.get(
      ApiEndpoints.restaurants,
      queryParameters: {
        'page': 0,
        'size': 10,
        'sort': 'rating,desc',
      },
    );

    final data = response.data['data'] as Map<String, dynamic>? ?? {};
    final content = data['content'] as List<dynamic>? ?? [];
    return content.map((item) => RestaurantModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<FoodItemModel>> getPopularFoods() async {
    final response = await _dioClient.get(ApiEndpoints.popularFoods);
    final list = response.data['data'] as List<dynamic>? ?? [];
    return list.map((item) => FoodItemModel.fromJson(item as Map<String, dynamic>)).toList();
  }
}
