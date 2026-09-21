import 'package:google_sign_in/google_sign_in.dart';
import '../../../core/error/exceptions.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../../../core/utils/cambodia_phone_validator.dart';
import '../../../shared/models/user_model.dart';

class AuthResult {
  final UserModel user;
  final bool phoneRequired;

  const AuthResult({
    required this.user,
    required this.phoneRequired,
  });
}

class AuthRepository {
  final DioClient _dioClient;
  final SecureStorageService _storageService;
  final GoogleSignIn _googleSignIn;

  AuthRepository({
    required DioClient dioClient,
    required SecureStorageService storageService,
    GoogleSignIn? googleSignIn,
  })  : _dioClient = dioClient,
        _storageService = storageService,
        _googleSignIn = googleSignIn ??
            GoogleSignIn(
              clientId: '114319681725-s9lh8honou0fklulla6fsqe2v79ur45h.apps.googleusercontent.com',
              scopes: ['email', 'profile'],
            );

  Future<AuthResult?> googleSignIn({String? testIdToken}) async {
    String? idToken = testIdToken;
    if (idToken == null) {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        // User cancelled Google sign in
        return null;
      }
      final googleAuth = await googleUser.authentication;
      idToken = googleAuth.idToken;
    }

    if (idToken == null || idToken.isEmpty) {
      throw const ServerException('Unable to sign in with Google. Please try again.');
    }

    final response = await _dioClient.post(
      ApiEndpoints.customerGoogleLogin,
      data: {'idToken': idToken},
    );

    final data = response.data['data'] as Map<String, dynamic>;
    final accessToken = data['accessToken'] as String;
    final refreshToken = data['refreshToken'] as String;
    final phoneRequired = data['phoneRequired'] == true;

    await _storageService.saveTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );

    final userJson = data['user'] as Map<String, dynamic>;
    final user = UserModel.fromJson(userJson);

    await _storageService.saveUserData(
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    );

    return AuthResult(user: user, phoneRequired: phoneRequired);
  }

  Future<UserModel> completePhoneNumber(String phoneNumber) async {
    final normalized = CambodiaPhoneValidator.normalize(phoneNumber);
    final response = await _dioClient.patch(
      ApiEndpoints.updatePhone,
      data: {'phoneNumber': normalized},
    );

    final userJson = response.data['data'] as Map<String, dynamic>;
    final user = UserModel.fromJson(userJson);

    await _storageService.saveUserData(
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    );

    return user;
  }

  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    final response = await _dioClient.post(
      ApiEndpoints.customerLogin,
      data: {
        'email': email.trim(),
        'password': password,
      },
    );

    final data = response.data['data'] as Map<String, dynamic>;
    final accessToken = data['accessToken'] as String;
    final refreshToken = data['refreshToken'] as String;

    await _storageService.saveTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );

    final userJson = data['user'] as Map<String, dynamic>;
    final user = UserModel.fromJson(userJson);

    await _storageService.saveUserData(
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    );

    return user;
  }

  Future<UserModel> register({
    required String name,
    required String email,
    required String password,
    required String confirmPassword,
    String? phoneNumber,
  }) async {
    final response = await _dioClient.post(
      ApiEndpoints.customerRegister,
      data: {
        'name': name.trim(),
        'email': email.trim(),
        'password': password,
        'confirmPassword': confirmPassword,
        'phoneNumber': phoneNumber?.trim(),
      },
    );

    final data = response.data['data'] as Map<String, dynamic>;
    final accessToken = data['accessToken'] as String;
    final refreshToken = data['refreshToken'] as String;

    await _storageService.saveTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );

    final userJson = data['user'] as Map<String, dynamic>;
    final user = UserModel.fromJson(userJson);

    await _storageService.saveUserData(
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    );

    return user;
  }

  Future<UserModel?> checkCurrentUser() async {
    final accessToken = await _storageService.getAccessToken();
    if (accessToken == null || accessToken.isEmpty) {
      return null;
    }

    try {
      final response = await _dioClient.get(ApiEndpoints.authMe);
      if (response.statusCode == 200 && response.data['data'] != null) {
        final userJson = response.data['data'] as Map<String, dynamic>;
        final user = UserModel.fromJson(userJson);
        await _storageService.saveUserData(
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        );
        return user;
      }
    } catch (_) {
      // If token is invalid and refresh failed, storage was cleared by interceptor
    }
    return null;
  }

  Future<void> forgotPassword(String email) async {
    await _dioClient.post(
      ApiEndpoints.forgotPassword,
      data: {'email': email.trim()},
    );
  }

  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    await _dioClient.post(
      ApiEndpoints.resetPassword,
      data: {
        'token': token.trim(),
        'newPassword': newPassword,
      },
    );
  }

  Future<void> logout() async {
    try {
      final refreshToken = await _storageService.getRefreshToken();
      if (refreshToken != null) {
        await _dioClient.post(
          ApiEndpoints.logout,
          data: {'refreshToken': refreshToken},
        );
      }
    } catch (_) {
      // Best-effort backend logout
    } finally {
      try {
        await _googleSignIn.signOut();
      } catch (_) {
        // Best-effort Google sign-out
      }
      await _storageService.clearAuthData();
    }
  }
}
