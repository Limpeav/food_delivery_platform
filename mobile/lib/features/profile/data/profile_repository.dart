import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/user_model.dart';

class ProfileRepository {
  final DioClient _dioClient;

  ProfileRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<UserModel> getProfile() async {
    final response = await _dioClient.get(ApiEndpoints.userProfile);
    final json = response.data['data'] as Map<String, dynamic>;
    return UserModel.fromJson(json);
  }

  Future<UserModel> updateProfile({
    required String name,
    String? phoneNumber,
  }) async {
    final response = await _dioClient.put(
      ApiEndpoints.updateProfile,
      data: {
        'name': name.trim(),
        'phoneNumber': phoneNumber?.trim(),
      },
    );

    final json = response.data['data'] as Map<String, dynamic>;
    return UserModel.fromJson(json);
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    await _dioClient.put(
      ApiEndpoints.changePassword,
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
        'confirmPassword': confirmPassword,
      },
    );
  }
}
