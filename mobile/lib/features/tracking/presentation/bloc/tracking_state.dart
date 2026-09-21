import 'package:equatable/equatable.dart';
import '../../../../shared/models/order_model.dart';

abstract class TrackingState extends Equatable {
  const TrackingState();

  @override
  List<Object?> get props => [];
}

class TrackingInitial extends TrackingState {}

class TrackingLoading extends TrackingState {}

class TrackingLoaded extends TrackingState {
  final OrderModel order;
  final double? currentDriverLat;
  final double? currentDriverLng;
  final bool isWsConnected;

  const TrackingLoaded({
    required this.order,
    this.currentDriverLat,
    this.currentDriverLng,
    this.isWsConnected = false,
  });

  TrackingLoaded copyWith({
    OrderModel? order,
    double? currentDriverLat,
    double? currentDriverLng,
    bool? isWsConnected,
  }) {
    return TrackingLoaded(
      order: order ?? this.order,
      currentDriverLat: currentDriverLat ?? this.currentDriverLat,
      currentDriverLng: currentDriverLng ?? this.currentDriverLng,
      isWsConnected: isWsConnected ?? this.isWsConnected,
    );
  }

  @override
  List<Object?> get props => [
        order,
        currentDriverLat,
        currentDriverLng,
        isWsConnected,
      ];
}

class TrackingError extends TrackingState {
  final String message;

  const TrackingError(this.message);

  @override
  List<Object?> get props => [message];
}
