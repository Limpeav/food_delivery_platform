import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../shared/models/order_model.dart';
import '../../data/order_repository.dart';
import 'order_event.dart';
import 'order_state.dart';

class OrderBloc extends Bloc<OrderEvent, OrderState> {
  final OrderRepository _orderRepository;

  OrderBloc({required OrderRepository orderRepository})
      : _orderRepository = orderRepository,
        super(OrderInitial()) {
    on<OrdersFetchRequested>(_onOrdersFetchRequested);
    on<OrdersRefreshRequested>(_onOrdersRefreshRequested);
    on<OrderFilterChanged>(_onOrderFilterChanged);
    on<OrderCancelRequested>(_onOrderCancelRequested);
  }

  Future<void> _onOrdersFetchRequested(
    OrdersFetchRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(OrderLoading());
    await _loadOrders(emit, 'ALL');
  }

  Future<void> _onOrdersRefreshRequested(
    OrdersRefreshRequested event,
    Emitter<OrderState> emit,
  ) async {
    final currentFilter = state is OrderLoaded ? (state as OrderLoaded).activeFilter : 'ALL';
    await _loadOrders(emit, currentFilter);
  }

  Future<void> _loadOrders(Emitter<OrderState> emit, String filter) async {
    try {
      final orders = await _orderRepository.getMyOrders();
      final filtered = _applyFilter(orders, filter);
      emit(
        OrderLoaded(
          allOrders: orders,
          filteredOrders: filtered,
          activeFilter: filter,
        ),
      );
    } catch (e) {
      emit(OrderError(e.toString()));
    }
  }

  void _onOrderFilterChanged(
    OrderFilterChanged event,
    Emitter<OrderState> emit,
  ) {
    if (state is OrderLoaded) {
      final current = state as OrderLoaded;
      final filtered = _applyFilter(current.allOrders, event.filter);
      emit(
        current.copyWith(
          filteredOrders: filtered,
          activeFilter: event.filter,
        ),
      );
    }
  }

  Future<void> _onOrderCancelRequested(
    OrderCancelRequested event,
    Emitter<OrderState> emit,
  ) async {
    try {
      final updatedOrder = await _orderRepository.cancelOrder(event.orderId);
      if (state is OrderLoaded) {
        final current = state as OrderLoaded;
        final updatedList = current.allOrders.map((o) {
          return o.id == updatedOrder.id ? updatedOrder : o;
        }).toList();
        final filtered = _applyFilter(updatedList, current.activeFilter);
        emit(
          current.copyWith(
            allOrders: updatedList,
            filteredOrders: filtered,
          ),
        );
      }
    } catch (e) {
      emit(OrderError(e.toString()));
    }
  }

  List<OrderModel> _applyFilter(List<OrderModel> orders, String filter) {
    switch (filter) {
      case 'ACTIVE':
        return orders.where((o) => o.isActive).toList();
      case 'COMPLETED':
        return orders.where((o) => o.status == 'DELIVERED').toList();
      case 'CANCELLED':
        return orders.where((o) => o.status == 'CANCELLED' || o.status == 'REJECTED').toList();
      case 'ALL':
      default:
        return orders;
    }
  }
}
