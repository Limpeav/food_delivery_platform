import 'package:equatable/equatable.dart';
import '../../../../shared/models/cart_model.dart';

abstract class CartState extends Equatable {
  final CartModel cart;

  const CartState({this.cart = const CartModel()});

  @override
  List<Object?> get props => [cart];
}

class CartInitial extends CartState {}

class CartLoading extends CartState {
  const CartLoading({super.cart});
}

class CartLoaded extends CartState {
  const CartLoaded(CartModel cart) : super(cart: cart);
}

class CartUpdating extends CartState {
  const CartUpdating(CartModel cart) : super(cart: cart);
}

class CartRestaurantConflict extends CartState {
  final int pendingFoodItemId;
  final int pendingRestaurantId;
  final String pendingRestaurantName;
  final int pendingQuantity;

  const CartRestaurantConflict({
    required CartModel currentCart,
    required this.pendingFoodItemId,
    required this.pendingRestaurantId,
    required this.pendingRestaurantName,
    required this.pendingQuantity,
  }) : super(cart: currentCart);

  @override
  List<Object?> get props => [
        cart,
        pendingFoodItemId,
        pendingRestaurantId,
        pendingRestaurantName,
        pendingQuantity,
      ];
}

class CartError extends CartState {
  final String message;

  const CartError(this.message, {super.cart});

  @override
  List<Object?> get props => [cart, message];
}
