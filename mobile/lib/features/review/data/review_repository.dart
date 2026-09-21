import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/review_model.dart';

class ReviewRepository {
  final DioClient _dioClient;

  ReviewRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<ReviewModel> submitReview({
    required int orderId,
    int? foodItemId,
    required int rating,
    String? comment,
  }) async {
    final response = await _dioClient.post(
      ApiEndpoints.reviews,
      data: {
        'orderId': orderId,
        'foodItemId': foodItemId,
        'rating': rating,
        'comment': comment?.trim().isEmpty ?? true ? null : comment?.trim(),
      },
    );

    final json = response.data['data'] as Map<String, dynamic>;
    return ReviewModel.fromJson(json);
  }
}
