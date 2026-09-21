import 'package:equatable/equatable.dart';

abstract class CartEvent extends Equatable {
  const CartEvent();

  @override
  List<Object?> get props => [];
}

class CartFetchRequested extends CartEvent {}

class CartItemAddRequested extends CartEvent {
  final int foodItemId;
  final int restaurantId;
  final String restaurantName;
  final int quantity;

  const CartItemAddRequested({
    required this.foodItemId,
    required this.restaurantId,
    required this.restaurantName,
    this.quantity = 1,
  });

  @override
  List<Object?> get props => [foodItemId, restaurantId, restaurantName, quantity];
}

class CartItemQuantityChanged extends CartEvent {
  final int itemId;
  final int quantity;

  const CartItemQuantityChanged({
    required this.itemId,
    required this.quantity,
  });

  @override
  List<Object?> get props => [itemId, quantity];
}

class CartItemRemoveRequested extends CartEvent {
  final int itemId;

  const CartItemRemoveRequested(this.itemId);

  @override
  List<Object?> get props => [itemId];
}

class CartClearRequested extends CartEvent {}

class CartClearAndAddRequested extends CartEvent {
  final int foodItemId;
  final int quantity;

  const CartClearAndAddRequested({
    required this.foodItemId,
    this.quantity = 1,
  });

  @override
  List<Object?> get props => [foodItemId, quantity];
}

class CartResetRequested extends CartEvent {}
