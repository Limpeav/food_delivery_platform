import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import 'models/payment_model.dart';

class PaymentRepository {
  final DioClient _dioClient;

  PaymentRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<PaymentModel> getOrderPayment(int orderId) async {
    final response = await _dioClient.get(ApiEndpoints.orderPayment(orderId));
    final data = response.data['data'] as Map<String, dynamic>;
    return PaymentModel.fromJson(data);
  }

  Future<List<PaymentModel>> getPaymentHistory() async {
    final response = await _dioClient.get(ApiEndpoints.paymentsHistory);
    final list = response.data['data'] as List<dynamic>? ?? [];
    return list.map((item) => PaymentModel.fromJson(item as Map<String, dynamic>)).toList();
  }
}
