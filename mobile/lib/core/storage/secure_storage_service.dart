import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

class SecureStorageService {
  final FlutterSecureStorage _secureStorage;
  SharedPreferences? _prefs;

  SecureStorageService({FlutterSecureStorage? secureStorage})
      : _secureStorage = secureStorage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(),
              iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
            );

  Future<void> initPrefs() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  // --- Auth Tokens ---
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _secureStorage.write(key: AppConstants.keyAccessToken, value: accessToken);
    await _secureStorage.write(key: AppConstants.keyRefreshToken, value: refreshToken);
  }

  Future<String?> getAccessToken() async {
    return await _secureStorage.read(key: AppConstants.keyAccessToken);
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: AppConstants.keyRefreshToken);
  }

  Future<void> updateAccessToken(String newAccessToken) async {
    await _secureStorage.write(key: AppConstants.keyAccessToken, value: newAccessToken);
  }

  // --- User Session Metadata ---
  Future<void> saveUserData({
    required int id,
    required String name,
    required String email,
    required String role,
  }) async {
    await _secureStorage.write(key: AppConstants.keyUserId, value: id.toString());
    await _secureStorage.write(key: AppConstants.keyUserName, value: name);
    await _secureStorage.write(key: AppConstants.keyUserEmail, value: email);
    await _secureStorage.write(key: AppConstants.keyUserRole, value: role);
  }

  Future<Map<String, String?>> getUserData() async {
    final id = await _secureStorage.read(key: AppConstants.keyUserId);
    final name = await _secureStorage.read(key: AppConstants.keyUserName);
    final email = await _secureStorage.read(key: AppConstants.keyUserEmail);
    final role = await _secureStorage.read(key: AppConstants.keyUserRole);
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
    };
  }

  // --- Clear Auth Data ---
  Future<void> clearAuthData() async {
    await _secureStorage.delete(key: AppConstants.keyAccessToken);
    await _secureStorage.delete(key: AppConstants.keyRefreshToken);
    await _secureStorage.delete(key: AppConstants.keyUserId);
    await _secureStorage.delete(key: AppConstants.keyUserName);
    await _secureStorage.delete(key: AppConstants.keyUserEmail);
    await _secureStorage.delete(key: AppConstants.keyUserRole);
  }

  // --- Non-sensitive Local Preferences (SharedPreferences) ---
  Future<bool> isOnboardingCompleted() async {
    await initPrefs();
    return _prefs?.getBool(AppConstants.keyOnboardingCompleted) ?? false;
  }

  Future<void> setOnboardingCompleted(bool completed) async {
    await initPrefs();
    await _prefs?.setBool(AppConstants.keyOnboardingCompleted, completed);
  }

  Future<String?> getLastSelectedAddress() async {
    await initPrefs();
    return _prefs?.getString(AppConstants.keyLastSelectedAddress);
  }

  Future<void> setLastSelectedAddress(String addressLabel) async {
    await initPrefs();
    await _prefs?.setString(AppConstants.keyLastSelectedAddress, addressLabel);
  }
}
