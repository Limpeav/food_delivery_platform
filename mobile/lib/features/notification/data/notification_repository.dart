import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/notification_model.dart';

class NotificationRepository {
  final DioClient _dioClient;

  NotificationRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<List<NotificationModel>> getNotifications() async {
    final response = await _dioClient.get(ApiEndpoints.notifications);
    final list = response.data['data'] as List<dynamic>? ?? [];
    return list.map((item) => NotificationModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<int> getUnreadCount() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.unreadNotificationsCount);
      final data = response.data['data'] as Map<String, dynamic>? ?? {};
      return (data['unreadCount'] as num?)?.toInt() ?? 0;
    } catch (_) {
      return 0;
    }
  }

  Future<void> markAsRead(int id) async {
    await _dioClient.patch(ApiEndpoints.markNotificationAsRead(id));
  }

  Future<void> markAllAsRead() async {
    await _dioClient.patch(ApiEndpoints.markAllNotificationsAsRead);
  }
}
