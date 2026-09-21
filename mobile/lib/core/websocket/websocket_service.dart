import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../../app/config/api_config.dart';

typedef WebSocketMessageCallback = void Function(Map<String, dynamic> data);

class WebSocketService {
  StompClient? _stompClient;
  bool _isConnected = false;
  final Map<String, List<WebSocketMessageCallback>> _subscribers = {};
  final Map<String, StompUnsubscribe> _activeSubscriptions = {};

  bool get isConnected => _isConnected;

  void connect({VoidCallback? onConnected, ValueChanged<String>? onError}) {
    if (_stompClient != null && _isConnected) {
      onConnected?.call();
      return;
    }

    final wsUrl = ApiConfig.wsUrl;
    debugPrint('[WebSocket] Connecting to $wsUrl');

    _stompClient = StompClient(
      config: StompConfig(
        url: wsUrl,
        onConnect: (StompFrame frame) {
          debugPrint('[WebSocket] STOMP connected');
          _isConnected = true;
          _resubscribeAll();
          onConnected?.call();
        },
        onWebSocketError: (dynamic error) {
          debugPrint('[WebSocket] Error: $error');
          _isConnected = false;
          onError?.call(error.toString());
        },
        onStompError: (StompFrame frame) {
          debugPrint('[WebSocket] STOMP Error: ${frame.body}');
          _isConnected = false;
          onError?.call(frame.body ?? 'STOMP error');
        },
        onDisconnect: (StompFrame frame) {
          debugPrint('[WebSocket] STOMP Disconnected');
          _isConnected = false;
        },
        reconnectDelay: const Duration(seconds: 5),
        heartbeatIncoming: const Duration(seconds: 4),
        heartbeatOutgoing: const Duration(seconds: 4),
      ),
    );

    _stompClient?.activate();
  }

  void _resubscribeAll() {
    for (final destination in _subscribers.keys) {
      if (_subscribers[destination]?.isNotEmpty ?? false) {
        _subscribeToTopic(destination);
      }
    }
  }

  void _subscribeToTopic(String destination) {
    if (_stompClient == null || !_isConnected) return;

    // Avoid duplicate STOMP broker subscriptions for same topic
    if (_activeSubscriptions.containsKey(destination)) return;

    final unsubscribe = _stompClient!.subscribe(
      destination: destination,
      callback: (StompFrame frame) {
        if (frame.body != null) {
          try {
            final decoded = jsonDecode(frame.body!) as Map<String, dynamic>;
            final callbacks = _subscribers[destination] ?? [];
            for (final cb in callbacks) {
              cb(decoded);
            }
          } catch (e) {
            debugPrint('[WebSocket] Failed to parse message body: $e');
          }
        }
      },
    );

    _activeSubscriptions[destination] = unsubscribe;
  }

  /// Subscribe to an order topic: /topic/orders/{orderId}
  VoidCallback subscribeToOrder(int orderId, WebSocketMessageCallback callback) {
    final destination = '/topic/orders/$orderId';
    return _registerListener(destination, callback);
  }

  /// Subscribe to live driver GPS topic: /topic/drivers/{driverId}/location
  VoidCallback subscribeToDriverLocation(int driverId, WebSocketMessageCallback callback) {
    final destination = '/topic/drivers/$driverId/location';
    return _registerListener(destination, callback);
  }

  /// Subscribe to user notification topic: /topic/notifications/{userId}
  VoidCallback subscribeToNotifications(int userId, WebSocketMessageCallback callback) {
    final destination = '/topic/notifications/$userId';
    return _registerListener(destination, callback);
  }

  VoidCallback _registerListener(String destination, WebSocketMessageCallback callback) {
    _subscribers.putIfAbsent(destination, () => []).add(callback);

    if (_isConnected) {
      _subscribeToTopic(destination);
    } else {
      connect();
    }

    return () {
      _subscribers[destination]?.remove(callback);
      if (_subscribers[destination]?.isEmpty ?? true) {
        _activeSubscriptions[destination]?.call();
        _activeSubscriptions.remove(destination);
      }
    };
  }

  void disconnect() {
    _activeSubscriptions.clear();
    _subscribers.clear();
    _stompClient?.deactivate();
    _stompClient = null;
    _isConnected = false;
  }
}
