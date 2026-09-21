import 'package:equatable/equatable.dart';
import '../../../../shared/models/address_model.dart';

abstract class CheckoutEvent extends Equatable {
  const CheckoutEvent();

  @override
  List<Object?> get props => [];
}

class CheckoutInitRequested extends CheckoutEvent {
  final double subtotal;
  final double deliveryFee;

  const CheckoutInitRequested({required this.subtotal, required this.deliveryFee});

  @override
  List<Object?> get props => [subtotal, deliveryFee];
}

class CheckoutAddressSelected extends CheckoutEvent {
  final AddressModel address;

  const CheckoutAddressSelected(this.address);

  @override
  List<Object?> get props => [address];
}

class CheckoutAddressPinUpdated extends CheckoutEvent {
  final double latitude;
  final double longitude;

  const CheckoutAddressPinUpdated({required this.latitude, required this.longitude});

  @override
  List<Object?> get props => [latitude, longitude];
}

class CheckoutCouponApplyRequested extends CheckoutEvent {
  final String couponCode;

  const CheckoutCouponApplyRequested(this.couponCode);

  @override
  List<Object?> get props => [couponCode];
}

class CheckoutCouponRemoveRequested extends CheckoutEvent {}

class CheckoutPaymentMethodSelected extends CheckoutEvent {
  final String paymentMethod; // CASH_ON_DELIVERY or ONLINE_PAYMENT

  const CheckoutPaymentMethodSelected(this.paymentMethod);

  @override
  List<Object?> get props => [paymentMethod];
}

class CheckoutNotesChanged extends CheckoutEvent {
  final String notes;

  const CheckoutNotesChanged(this.notes);

  @override
  List<Object?> get props => [notes];
}

class CheckoutAddressCreateRequested extends CheckoutEvent {
  final String label;
  final String recipientName;
  final String phoneNumber;
  final String addressLine;
  final String city;
  final double? latitude;
  final double? longitude;

  const CheckoutAddressCreateRequested({
    required this.label,
    required this.recipientName,
    required this.phoneNumber,
    required this.addressLine,
    required this.city,
    this.latitude,
    this.longitude,
  });

  @override
  List<Object?> get props => [label, recipientName, phoneNumber, addressLine, city, latitude, longitude];
}

class CheckoutPlaceOrderRequested extends CheckoutEvent {}

