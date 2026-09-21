import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/address_model.dart';
import '../../../shared/models/order_model.dart';

class CheckoutRepository {
  final DioClient _dioClient;

  CheckoutRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<AddressModel> createAddress(AddressModel address) async {
    final response = await _dioClient.post(
      ApiEndpoints.addresses,
      data: address.toJson(),
    );
    final json = response.data['data'] as Map<String, dynamic>;
    return AddressModel.fromJson(json);
  }

  Future<List<AddressModel>> getAddresses() async {
    final response = await _dioClient.get(ApiEndpoints.addresses);
    final list = response.data['data'] as List<dynamic>? ?? [];
    return list.map((item) => AddressModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<Map<String, dynamic>> validateCoupon({
    required String code,
    required double subtotal,
  }) async {
    final response = await _dioClient.post(
      ApiEndpoints.validateCoupon,
      queryParameters: {
        'code': code.trim(),
        'subtotal': subtotal,
      },
    );

    return response.data['data'] as Map<String, dynamic>;
  }

  Future<OrderModel> createOrder({
    required int addressId,
    String? couponCode,
    required String paymentMethod,
    String? notes,
  }) async {
    final response = await _dioClient.post(
      ApiEndpoints.orders,
      data: {
        'addressId': addressId,
        'couponCode': couponCode?.trim().isEmpty ?? true ? null : couponCode?.trim(),
        'paymentMethod': paymentMethod,
        'notes': notes?.trim().isEmpty ?? true ? null : notes?.trim(),
      },
    );

    final json = response.data['data'] as Map<String, dynamic>;
    return OrderModel.fromJson(json);
  }
}
