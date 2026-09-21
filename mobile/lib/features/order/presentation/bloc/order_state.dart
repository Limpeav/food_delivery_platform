import 'package:equatable/equatable.dart';
import '../../../../shared/models/order_model.dart';

abstract class OrderState extends Equatable {
  const OrderState();

  @override
  List<Object?> get props => [];
}

class OrderInitial extends OrderState {}

class OrderLoading extends OrderState {}

class OrderLoaded extends OrderState {
  final List<OrderModel> allOrders;
  final List<OrderModel> filteredOrders;
  final String activeFilter; // 'ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'

  const OrderLoaded({
    required this.allOrders,
    required this.filteredOrders,
    this.activeFilter = 'ALL',
  });

  OrderLoaded copyWith({
    List<OrderModel>? allOrders,
    List<OrderModel>? filteredOrders,
    String? activeFilter,
  }) {
    return OrderLoaded(
      allOrders: allOrders ?? this.allOrders,
      filteredOrders: filteredOrders ?? this.filteredOrders,
      activeFilter: activeFilter ?? this.activeFilter,
    );
  }

  @override
  List<Object?> get props => [allOrders, filteredOrders, activeFilter];
}

class OrderError extends OrderState {
  final String message;

  const OrderError(this.message);

  @override
  List<Object?> get props => [message];
}
