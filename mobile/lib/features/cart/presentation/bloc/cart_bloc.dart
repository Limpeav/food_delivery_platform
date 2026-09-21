import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../shared/models/cart_model.dart';
import '../../data/cart_repository.dart';
import 'cart_event.dart';
import 'cart_state.dart';

class CartBloc extends Bloc<CartEvent, CartState> {
  final CartRepository _cartRepository;

  CartBloc({required CartRepository cartRepository})
      : _cartRepository = cartRepository,
        super(CartInitial()) {
    on<CartFetchRequested>(_onCartFetchRequested);
    on<CartItemAddRequested>(_onCartItemAddRequested);
    on<CartItemQuantityChanged>(_onCartItemQuantityChanged);
    on<CartItemRemoveRequested>(_onCartItemRemoveRequested);
    on<CartClearRequested>(_onCartClearRequested);
    on<CartClearAndAddRequested>(_onCartClearAndAddRequested);
    on<CartResetRequested>(_onCartResetRequested);
  }

  Future<void> _onCartFetchRequested(
    CartFetchRequested event,
    Emitter<CartState> emit,
  ) async {
    emit(CartLoading(cart: state.cart));
    try {
      final cart = await _cartRepository.getCart();
      emit(CartLoaded(cart));
    } catch (e) {
      emit(CartError(e.toString(), cart: state.cart));
    }
  }

  Future<void> _onCartItemAddRequested(
    CartItemAddRequested event,
    Emitter<CartState> emit,
  ) async {
    final currentCart = state.cart;

    // Single-restaurant check
    if (currentCart.isNotEmpty &&
        currentCart.restaurantId != null &&
        currentCart.restaurantId != event.restaurantId) {
      emit(
        CartRestaurantConflict(
          currentCart: currentCart,
          pendingFoodItemId: event.foodItemId,
          pendingRestaurantId: event.restaurantId,
          pendingRestaurantName: event.restaurantName,
          pendingQuantity: event.quantity,
        ),
      );
      return;
    }

    emit(CartUpdating(currentCart));
    try {
      final updatedCart = await _cartRepository.addToCart(
        foodItemId: event.foodItemId,
        quantity: event.quantity,
      );
      emit(CartLoaded(updatedCart));
    } catch (e) {
      emit(CartError(e.toString(), cart: currentCart));
    }
  }

  Future<void> _onCartItemQuantityChanged(
    CartItemQuantityChanged event,
    Emitter<CartState> emit,
  ) async {
    final currentCart = state.cart;
    emit(CartUpdating(currentCart));

    try {
      if (event.quantity <= 0) {
        final updatedCart = await _cartRepository.removeItem(event.itemId);
        emit(CartLoaded(updatedCart));
      } else {
        final updatedCart = await _cartRepository.updateQuantity(
          itemId: event.itemId,
          quantity: event.quantity,
        );
        emit(CartLoaded(updatedCart));
      }
    } catch (e) {
      emit(CartError(e.toString(), cart: currentCart));
    }
  }

  Future<void> _onCartItemRemoveRequested(
    CartItemRemoveRequested event,
    Emitter<CartState> emit,
  ) async {
    final currentCart = state.cart;
    emit(CartUpdating(currentCart));
    try {
      final updatedCart = await _cartRepository.removeItem(event.itemId);
      emit(CartLoaded(updatedCart));
    } catch (e) {
      emit(CartError(e.toString(), cart: currentCart));
    }
  }

  Future<void> _onCartClearRequested(
    CartClearRequested event,
    Emitter<CartState> emit,
  ) async {
    emit(CartUpdating(state.cart));
    try {
      final clearedCart = await _cartRepository.clearCart();
      emit(CartLoaded(clearedCart));
    } catch (e) {
      emit(CartError(e.toString(), cart: state.cart));
    }
  }

  Future<void> _onCartClearAndAddRequested(
    CartClearAndAddRequested event,
    Emitter<CartState> emit,
  ) async {
    emit(const CartLoading());
    try {
      await _cartRepository.clearCart();
      final updatedCart = await _cartRepository.addToCart(
        foodItemId: event.foodItemId,
        quantity: event.quantity,
      );
      emit(CartLoaded(updatedCart));
    } catch (e) {
      emit(CartError(e.toString(), cart: state.cart));
    }
  }

  void _onCartResetRequested(
    CartResetRequested event,
    Emitter<CartState> emit,
  ) {
    emit(const CartLoaded(CartModel()));
  }
}
