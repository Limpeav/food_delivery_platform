import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/food_item_model.dart';
import '../../../shared/models/restaurant_model.dart';

class FavoriteRepository {
  final DioClient _dioClient;

  FavoriteRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<List<RestaurantModel>> getFavoriteRestaurants() async {
    final response = await _dioClient.get(ApiEndpoints.favoriteRestaurants);
    final list = response.data['data'] as List<dynamic>? ?? [];
    return list.map((item) => RestaurantModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<void> addFavoriteRestaurant(int id) async {
    await _dioClient.post(ApiEndpoints.favoriteRestaurantById(id));
  }

  Future<void> removeFavoriteRestaurant(int id) async {
    await _dioClient.delete(ApiEndpoints.favoriteRestaurantById(id));
  }

  Future<List<FoodItemModel>> getFavoriteFoods() async {
    final response = await _dioClient.get(ApiEndpoints.favoriteFoods);
    final list = response.data['data'] as List<dynamic>? ?? [];
    return list.map((item) => FoodItemModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<void> addFavoriteFood(int id) async {
    await _dioClient.post(ApiEndpoints.favoriteFoodById(id));
  }

  Future<void> removeFavoriteFood(int id) async {
    await _dioClient.delete(ApiEndpoints.favoriteFoodById(id));
  }
}
