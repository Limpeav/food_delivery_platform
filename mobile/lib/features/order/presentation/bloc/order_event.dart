import 'package:equatable/equatable.dart';

abstract class OrderEvent extends Equatable {
  const OrderEvent();

  @override
  List<Object?> get props => [];
}

class OrdersFetchRequested extends OrderEvent {}

class OrdersRefreshRequested extends OrderEvent {}

class OrderFilterChanged extends OrderEvent {
  final String filter; // 'ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'

  const OrderFilterChanged(this.filter);

  @override
  List<Object?> get props => [filter];
}

class OrderCancelRequested extends OrderEvent {
  final int orderId;

  const OrderCancelRequested(this.orderId);

  @override
  List<Object?> get props => [orderId];
}
