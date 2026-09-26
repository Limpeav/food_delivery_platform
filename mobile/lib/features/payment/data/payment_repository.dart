import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import 'models/khqr_model.dart';

class PaymentRepository {
  final DioClient _dioClient;

  PaymentRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<KhqrModel> getBakongKhqr(int orderId) async {
    final response = await _dioClient.get(ApiEndpoints.paymentKhqr(orderId));
    final data = response.data['data'] as Map<String, dynamic>;
    return KhqrModel.fromJson(data);
  }

  Future<KhqrVerifyResult> verifyBakongKhqr(int orderId) async {
    final response = await _dioClient.post(ApiEndpoints.verifyPaymentKhqr(orderId));
    final data = response.data['data'] as Map<String, dynamic>;
    return KhqrVerifyResult.fromJson(data);
  }
}
