import 'package:flutter/material.dart';
import 'app/app.dart';
import 'core/network/dio_client.dart';
import 'core/storage/secure_storage_service.dart';
import 'core/websocket/websocket_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize secure local storage & preferences
  final storageService = SecureStorageService();
  await storageService.initPrefs();

  // Initialize central HTTP REST client
  final dioClient = DioClient(storageService: storageService);

  // Initialize STOMP WebSocket service for live order tracking
  final webSocketService = WebSocketService();
  webSocketService.connect();

  runApp(
    CraveryApp(
      dioClient: dioClient,
      webSocketService: webSocketService,
      secureStorageService: storageService,
    ),
  );
}
