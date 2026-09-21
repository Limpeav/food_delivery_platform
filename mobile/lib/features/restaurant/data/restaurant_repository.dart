import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/category_model.dart';
import '../../../shared/models/food_item_model.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../../shared/models/review_model.dart';

class RestaurantRepository {
  final DioClient _dioClient;

  RestaurantRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<RestaurantModel> getRestaurantById(int id) async {
    final response = await _dioClient.get(ApiEndpoints.restaurantById(id));
    final json = response.data['data'] as Map<String, dynamic>;
    return RestaurantModel.fromJson(json);
  }

  Future<List<CategoryModel>> getMenuCategories(int restaurantId) async {
    final response = await _dioClient.get(ApiEndpoints.restaurantMenuCategories(restaurantId));
    final list = response.data['data'] as List<dynamic>? ?? [];
    return list.map((item) => CategoryModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<FoodItemModel>> getFoodsByRestaurant(int restaurantId) async {
    final response = await _dioClient.get(ApiEndpoints.restaurantFoods(restaurantId));
    final list = response.data['data'] as List<dynamic>? ?? [];
    return list.map((item) => FoodItemModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<ReviewModel>> getRestaurantReviews(int restaurantId) async {
    try {
      final response = await _dioClient.get(
        ApiEndpoints.restaurantReviews(restaurantId),
        queryParameters: {'page': 0, 'size': 10},
      );
      final data = response.data['data'] as Map<String, dynamic>? ?? {};
      final content = data['content'] as List<dynamic>? ?? [];
      return content.map((item) => ReviewModel.fromJson(item as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }
}
