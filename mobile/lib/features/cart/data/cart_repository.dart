import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/cart_model.dart';

class CartRepository {
  final DioClient _dioClient;

  CartRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<CartModel> getCart() async {
    final response = await _dioClient.get(ApiEndpoints.cart);
    if (response.data['data'] != null) {
      final json = response.data['data'] as Map<String, dynamic>;
      return CartModel.fromJson(json);
    }
    return const CartModel();
  }

  Future<CartModel> addToCart({
    required int foodItemId,
    required int quantity,
  }) async {
    final response = await _dioClient.post(
      ApiEndpoints.cartItems,
      data: {
        'foodItemId': foodItemId,
        'quantity': quantity,
      },
    );

    final json = response.data['data'] as Map<String, dynamic>;
    return CartModel.fromJson(json);
  }

  Future<CartModel> updateQuantity({
    required int itemId,
    required int quantity,
  }) async {
    final response = await _dioClient.put(
      ApiEndpoints.cartItemById(itemId),
      data: {'quantity': quantity},
    );

    final json = response.data['data'] as Map<String, dynamic>;
    return CartModel.fromJson(json);
  }

  Future<CartModel> removeItem(int itemId) async {
    final response = await _dioClient.delete(ApiEndpoints.cartItemById(itemId));
    final json = response.data['data'] as Map<String, dynamic>;
    return CartModel.fromJson(json);
  }

  Future<CartModel> clearCart() async {
    final response = await _dioClient.delete(ApiEndpoints.cart);
    if (response.data['data'] != null) {
      final json = response.data['data'] as Map<String, dynamic>;
      return CartModel.fromJson(json);
    }
    return const CartModel();
  }
}
