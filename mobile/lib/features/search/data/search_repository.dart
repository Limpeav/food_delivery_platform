import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/category_model.dart';
import '../../../shared/models/food_item_model.dart';
import '../../../shared/models/restaurant_model.dart';

class SearchRepository {
  final DioClient _dioClient;

  SearchRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<List<CategoryModel>> getCategories() async {
    final response = await _dioClient.get(ApiEndpoints.restaurantCategories);
    final list = response.data['data'] as List<dynamic>? ?? [];
    return list.map((item) => CategoryModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<RestaurantModel>> searchRestaurants({
    String? query,
    int? categoryId,
    int page = 0,
    int size = 10,
  }) async {
    final Map<String, dynamic> queryParams = {
      'page': page,
      'size': size,
    };
    if (query != null && query.trim().isNotEmpty) {
      queryParams['search'] = query.trim();
    }
    if (categoryId != null) {
      queryParams['categoryId'] = categoryId;
    }

    final response = await _dioClient.get(
      ApiEndpoints.restaurants,
      queryParameters: queryParams,
    );

    final data = response.data['data'] as Map<String, dynamic>? ?? {};
    final content = data['content'] as List<dynamic>? ?? [];
    return content.map((item) => RestaurantModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<FoodItemModel>> searchFoods({
    String? query,
    int? categoryId,
    int page = 0,
    int size = 10,
  }) async {
    final Map<String, dynamic> queryParams = {
      'page': page,
      'size': size,
      'availableOnly': true,
    };
    if (query != null && query.trim().isNotEmpty) {
      queryParams['search'] = query.trim();
    }
    if (categoryId != null) {
      queryParams['categoryId'] = categoryId;
    }

    final response = await _dioClient.get(
      ApiEndpoints.foods,
      queryParameters: queryParams,
    );

    final data = response.data['data'] as Map<String, dynamic>? ?? {};
    final content = data['content'] as List<dynamic>? ?? [];
    return content.map((item) => FoodItemModel.fromJson(item as Map<String, dynamic>)).toList();
  }
}
