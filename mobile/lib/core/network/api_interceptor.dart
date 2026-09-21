import 'package:dio/dio.dart';
import '../storage/secure_storage_service.dart';
import 'api_endpoints.dart';
import '../../app/config/api_config.dart';

class ApiInterceptor extends Interceptor {
  final SecureStorageService _storageService;
  final Dio _dio;
  final void Function()? onSessionExpired;
  bool _isRefreshing = false;

  ApiInterceptor({
    required SecureStorageService storageService,
    required Dio dio,
    this.onSessionExpired,
  })  : _storageService = storageService,
        _dio = dio;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Avoid attaching Bearer token to public auth endpoints
    final path = options.path;
    final isAuthEndpoint = path.contains(ApiEndpoints.customerLogin) ||
        path.contains(ApiEndpoints.customerRegister) ||
        path.contains(ApiEndpoints.refreshToken) ||
        path.contains(ApiEndpoints.forgotPassword) ||
        path.contains(ApiEndpoints.resetPassword);

    if (!isAuthEndpoint) {
      final token = await _storageService.getAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }

    options.headers['Accept'] = 'application/json';
    options.headers['Content-Type'] = 'application/json';
    return handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final response = err.response;
    final requestOptions = err.requestOptions;

    // Check if 401 Unauthorized and not already refreshing or attempting login
    final isAuthEndpoint = requestOptions.path.contains(ApiEndpoints.customerLogin) ||
        requestOptions.path.contains(ApiEndpoints.customerRegister) ||
        requestOptions.path.contains(ApiEndpoints.refreshToken);

    if (response?.statusCode == 401 && !isAuthEndpoint && !_isRefreshing) {
      _isRefreshing = true;
      try {
        final refreshToken = await _storageService.getRefreshToken();
        if (refreshToken != null && refreshToken.isNotEmpty) {
          // Attempt refresh using standalone temporary Dio
          final refreshDio = Dio(
            BaseOptions(
              baseUrl: ApiConfig.baseUrl,
              connectTimeout: ApiConfig.connectTimeout,
            ),
          );

          final refreshResponse = await refreshDio.post(
            ApiEndpoints.refreshToken,
            data: {'refreshToken': refreshToken},
          );

          if (refreshResponse.statusCode == 200 && refreshResponse.data != null) {
            final data = refreshResponse.data['data'] ?? refreshResponse.data;
            final newAccessToken = data['accessToken'] as String?;
            final newRefreshToken = data['refreshToken'] as String?;

            if (newAccessToken != null) {
              if (newRefreshToken != null) {
                await _storageService.saveTokens(
                  accessToken: newAccessToken,
                  refreshToken: newRefreshToken,
                );
              } else {
                await _storageService.updateAccessToken(newAccessToken);
              }

              // Retry original request with new token
              requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
              _isRefreshing = false;
              final retryResponse = await _dio.fetch(requestOptions);
              return handler.resolve(retryResponse);
            }
          }
        }
      } catch (_) {
        // Refresh failed, session permanently expired
      } finally {
        _isRefreshing = false;
      }

      // Clear tokens and notify app
      await _storageService.clearAuthData();
      onSessionExpired?.call();
    }

    return handler.next(err);
  }
}
