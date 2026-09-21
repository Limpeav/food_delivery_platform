import 'package:equatable/equatable.dart';
import '../../../../shared/models/order_model.dart';

abstract class TrackingEvent extends Equatable {
  const TrackingEvent();

  @override
  List<Object?> get props => [];
}

class TrackingStartRequested extends TrackingEvent {
  final int orderId;

  const TrackingStartRequested(this.orderId);

  @override
  List<Object?> get props => [orderId];
}

class TrackingOrderUpdated extends TrackingEvent {
  final OrderModel order;

  const TrackingOrderUpdated(this.order);

  @override
  List<Object?> get props => [order];
}

class TrackingStatusUpdatedViaWs extends TrackingEvent {
  final String status;

  const TrackingStatusUpdatedViaWs(this.status);

  @override
  List<Object?> get props => [status];
}

class TrackingDriverLocationUpdatedViaWs extends TrackingEvent {
  final double latitude;
  final double longitude;

  const TrackingDriverLocationUpdatedViaWs({
    required this.latitude,
    required this.longitude,
  });

  @override
  List<Object?> get props => [latitude, longitude];
}

class TrackingStopRequested extends TrackingEvent {}
