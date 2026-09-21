import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/order_model.dart';

class OrderRepository {
  final DioClient _dioClient;

  OrderRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<List<OrderModel>> getMyOrders({int page = 0, int size = 15}) async {
    final response = await _dioClient.get(
      ApiEndpoints.orders,
      queryParameters: {
        'page': page,
        'size': size,
        'sort': 'createdAt,desc',
      },
    );

    final data = response.data['data'] as Map<String, dynamic>? ?? {};
    final content = data['content'] as List<dynamic>? ?? [];
    return content.map((item) => OrderModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<OrderModel> getOrderDetails(int id) async {
    final response = await _dioClient.get(ApiEndpoints.orderById(id));
    final json = response.data['data'] as Map<String, dynamic>;
    return OrderModel.fromJson(json);
  }

  Future<OrderModel> cancelOrder(int id) async {
    final response = await _dioClient.patch(ApiEndpoints.cancelOrder(id));
    final json = response.data['data'] as Map<String, dynamic>;
    return OrderModel.fromJson(json);
  }
}
