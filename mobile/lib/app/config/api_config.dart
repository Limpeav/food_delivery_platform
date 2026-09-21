import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

class ApiConfig {
  ApiConfig._();

  /// Allow overriding base URL dynamically (e.g. for testing on physical phone)
  static String? _customBaseUrl;
  static String? _customWsUrl;

  static void setCustomBaseUrl(String url) {
    _customBaseUrl = url;
  }

  static void setCustomWsUrl(String url) {
    _customWsUrl = url;
  }

  static String get defaultHost {
    if (kIsWeb) {
      return 'localhost';
    }
    if (Platform.isAndroid) {
      return '10.0.2.2';
    }
    return 'localhost';
  }

  static String get baseUrl {
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!;
    }
    const envUrl = String.fromEnvironment('API_BASE_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }
    return 'http://$defaultHost:8080/api';
  }

  static String get wsUrl {
    if (_customWsUrl != null && _customWsUrl!.isNotEmpty) {
      return _customWsUrl!;
    }
    const envWs = String.fromEnvironment('WS_URL');
    if (envWs.isNotEmpty) {
      return envWs;
    }
    // STOMP over raw WebSocket handshake endpoint exposed by Spring Boot
    return 'ws://$defaultHost:8080/ws/websocket';
  }

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
  static const Duration sendTimeout = Duration(seconds: 15);
}
