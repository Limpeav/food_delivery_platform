import 'package:equatable/equatable.dart';
import '../../../../shared/models/address_model.dart';
import '../../../../shared/models/order_model.dart';

abstract class CheckoutState extends Equatable {
  const CheckoutState();

  @override
  List<Object?> get props => [];
}

class CheckoutInitial extends CheckoutState {}

class CheckoutLoading extends CheckoutState {}

class CheckoutReady extends CheckoutState {
  final List<AddressModel> addresses;
  final AddressModel? selectedAddress;
  final double subtotal;
  final double deliveryFee;
  final double discount;
  final String? appliedCouponCode;
  final String paymentMethod; // CASH_ON_DELIVERY or ONLINE_PAYMENT
  final String notes;
  final bool isSubmitting;
  final bool isSavingAddress;
  final String? couponError;

  const CheckoutReady({
    required this.addresses,
    this.selectedAddress,
    required this.subtotal,
    required this.deliveryFee,
    this.discount = 0.0,
    this.appliedCouponCode,
    this.paymentMethod = 'CASH_ON_DELIVERY',
    this.notes = '',
    this.isSubmitting = false,
    this.isSavingAddress = false,
    this.couponError,
  });

  double get totalAmount {
    final total = subtotal + deliveryFee - discount;
    return total > 0 ? total : 0.0;
  }

  CheckoutReady copyWith({
    List<AddressModel>? addresses,
    AddressModel? selectedAddress,
    double? subtotal,
    double? deliveryFee,
    double? discount,
    String? appliedCouponCode,
    bool clearCoupon = false,
    String? paymentMethod,
    String? notes,
    bool? isSubmitting,
    bool? isSavingAddress,
    String? couponError,
    bool clearCouponError = false,
  }) {
    return CheckoutReady(
      addresses: addresses ?? this.addresses,
      selectedAddress: selectedAddress ?? this.selectedAddress,
      subtotal: subtotal ?? this.subtotal,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      discount: clearCoupon ? 0.0 : (discount ?? this.discount),
      appliedCouponCode: clearCoupon ? null : (appliedCouponCode ?? this.appliedCouponCode),
      paymentMethod: paymentMethod ?? this.paymentMethod,
      notes: notes ?? this.notes,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isSavingAddress: isSavingAddress ?? this.isSavingAddress,
      couponError: clearCouponError ? null : (couponError ?? this.couponError),
    );
  }

  @override
  List<Object?> get props => [
        addresses,
        selectedAddress,
        subtotal,
        deliveryFee,
        discount,
        appliedCouponCode,
        paymentMethod,
        notes,
        isSubmitting,
        isSavingAddress,
        couponError,
      ];
}

class CheckoutOrderSuccess extends CheckoutState {
  final OrderModel order;

  const CheckoutOrderSuccess(this.order);

  @override
  List<Object?> get props => [order];
}

class CheckoutError extends CheckoutState {
  final String message;

  const CheckoutError(this.message);

  @override
  List<Object?> get props => [message];
}
