import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/websocket/websocket_service.dart';
import '../../../order/data/order_repository.dart';
import 'tracking_event.dart';
import 'tracking_state.dart';

class TrackingBloc extends Bloc<TrackingEvent, TrackingState> {
  final OrderRepository _orderRepository;
  final WebSocketService _webSocketService;

  VoidCallback? _orderUnsubscribe;
  VoidCallback? _driverUnsubscribe;
  Timer? _pollingTimer;

  TrackingBloc({
    required OrderRepository orderRepository,
    required WebSocketService webSocketService,
  })  : _orderRepository = orderRepository,
        _webSocketService = webSocketService,
        super(TrackingInitial()) {
    on<TrackingStartRequested>(_onTrackingStartRequested);
    on<TrackingOrderUpdated>(_onTrackingOrderUpdated);
    on<TrackingStatusUpdatedViaWs>(_onTrackingStatusUpdatedViaWs);
    on<TrackingDriverLocationUpdatedViaWs>(_onTrackingDriverLocationUpdatedViaWs);
    on<TrackingStopRequested>(_onTrackingStopRequested);
  }

  Future<void> _onTrackingStartRequested(
    TrackingStartRequested event,
    Emitter<TrackingState> emit,
  ) async {
    emit(TrackingLoading());
    try {
      final order = await _orderRepository.getOrderDetails(event.orderId);

      emit(
        TrackingLoaded(
          order: order,
          currentDriverLat: order.driverLatitude,
          currentDriverLng: order.driverLongitude,
          isWsConnected: _webSocketService.isConnected,
        ),
      );

      // Subscribe to real-time WebSocket order events
      _orderUnsubscribe?.call();
      _orderUnsubscribe = _webSocketService.subscribeToOrder(event.orderId, (data) {
        final newStatus = data['status'] as String?;
        if (newStatus != null) {
          add(TrackingStatusUpdatedViaWs(newStatus));
        }
      });

      // If driver is assigned, subscribe to driver location topic
      if (order.driverId != null) {
        _subscribeToDriverLocation(order.driverId!);
      }

      // Fallback polling every 12 seconds in case WebSocket drops
      _startPolling(event.orderId);
    } catch (e) {
      emit(TrackingError(e.toString()));
    }
  }

  void _subscribeToDriverLocation(int driverId) {
    _driverUnsubscribe?.call();
    _driverUnsubscribe = _webSocketService.subscribeToDriverLocation(driverId, (data) {
      final lat = (data['latitude'] as num?)?.toDouble();
      final lng = (data['longitude'] as num?)?.toDouble();
      if (lat != null && lng != null) {
        add(TrackingDriverLocationUpdatedViaWs(latitude: lat, longitude: lng));
      }
    });
  }

  void _onTrackingOrderUpdated(
    TrackingOrderUpdated event,
    Emitter<TrackingState> emit,
  ) {
    if (state is TrackingLoaded) {
      final current = state as TrackingLoaded;
      emit(
        current.copyWith(
          order: event.order,
          currentDriverLat: event.order.driverLatitude ?? current.currentDriverLat,
          currentDriverLng: event.order.driverLongitude ?? current.currentDriverLng,
        ),
      );

      // If driver was newly assigned, subscribe
      if (event.order.driverId != null && _driverUnsubscribe == null) {
        _subscribeToDriverLocation(event.order.driverId!);
      }
    }
  }

  void _onTrackingStatusUpdatedViaWs(
    TrackingStatusUpdatedViaWs event,
    Emitter<TrackingState> emit,
  ) {
    if (state is TrackingLoaded) {
      final current = state as TrackingLoaded;
      final updatedOrder = current.order.copyWith(status: event.status);
      emit(current.copyWith(order: updatedOrder));

      // Refresh order details from backend to get complete driver/delivery model
      _refreshOrderDetails(current.order.id);
    }
  }

  void _onTrackingDriverLocationUpdatedViaWs(
    TrackingDriverLocationUpdatedViaWs event,
    Emitter<TrackingState> emit,
  ) {
    if (state is TrackingLoaded) {
      final current = state as TrackingLoaded;
      emit(
        current.copyWith(
          currentDriverLat: event.latitude,
          currentDriverLng: event.longitude,
        ),
      );
    }
  }

  void _startPolling(int orderId) {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 12), (_) {
      _refreshOrderDetails(orderId);
    });
  }

  Future<void> _refreshOrderDetails(int orderId) async {
    try {
      final updated = await _orderRepository.getOrderDetails(orderId);
      add(TrackingOrderUpdated(updated));
    } catch (_) {
      // Quiet fallback
    }
  }

  void _onTrackingStopRequested(
    TrackingStopRequested event,
    Emitter<TrackingState> emit,
  ) {
    _cleanup();
  }

  void _cleanup() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    _orderUnsubscribe?.call();
    _orderUnsubscribe = null;
    _driverUnsubscribe?.call();
    _driverUnsubscribe = null;
  }

  @override
  Future<void> close() {
    _cleanup();
    return super.close();
  }
}
