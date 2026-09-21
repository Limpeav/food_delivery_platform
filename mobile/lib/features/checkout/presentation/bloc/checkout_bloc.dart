import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../shared/models/address_model.dart';
import '../../data/checkout_repository.dart';
import 'checkout_event.dart';
import 'checkout_state.dart';


class CheckoutBloc extends Bloc<CheckoutEvent, CheckoutState> {
  final CheckoutRepository _checkoutRepository;

  CheckoutBloc({required CheckoutRepository checkoutRepository})
      : _checkoutRepository = checkoutRepository,
        super(CheckoutInitial()) {
    on<CheckoutInitRequested>(_onCheckoutInitRequested);
    on<CheckoutAddressSelected>(_onCheckoutAddressSelected);
    on<CheckoutAddressPinUpdated>(_onCheckoutAddressPinUpdated);
    on<CheckoutAddressCreateRequested>(_onCheckoutAddressCreateRequested);
    on<CheckoutCouponApplyRequested>(_onCheckoutCouponApplyRequested);
    on<CheckoutCouponRemoveRequested>(_onCheckoutCouponRemoveRequested);
    on<CheckoutPaymentMethodSelected>(_onCheckoutPaymentMethodSelected);
    on<CheckoutNotesChanged>(_onCheckoutNotesChanged);
    on<CheckoutPlaceOrderRequested>(_onCheckoutPlaceOrderRequested);
  }

  Future<void> _onCheckoutInitRequested(
    CheckoutInitRequested event,
    Emitter<CheckoutState> emit,
  ) async {
    emit(CheckoutLoading());
    try {
      final addresses = await _checkoutRepository.getAddresses();
      final defaultAddr = addresses.isNotEmpty
          ? addresses.firstWhere((a) => a.isDefault, orElse: () => addresses.first)
          : null;

      emit(
        CheckoutReady(
          addresses: addresses,
          selectedAddress: defaultAddr,
          subtotal: event.subtotal,
          deliveryFee: event.deliveryFee,
        ),
      );
    } catch (e) {
      emit(CheckoutError(e.toString()));
    }
  }

  void _onCheckoutAddressSelected(
    CheckoutAddressSelected event,
    Emitter<CheckoutState> emit,
  ) {
    if (state is CheckoutReady) {
      emit((state as CheckoutReady).copyWith(selectedAddress: event.address));
    }
  }

  void _onCheckoutAddressPinUpdated(
    CheckoutAddressPinUpdated event,
    Emitter<CheckoutState> emit,
  ) {
    if (state is CheckoutReady) {
      final current = state as CheckoutReady;
      if (current.selectedAddress != null) {
        final updated = current.selectedAddress!.copyWith(
          latitude: event.latitude,
          longitude: event.longitude,
        );
        // Also update in address list if present
        final updatedAddresses = current.addresses.map((a) {
          if (a.id == updated.id) {
            return updated;
          }
          return a;
        }).toList();
        emit(current.copyWith(
          selectedAddress: updated,
          addresses: updatedAddresses,
        ));
      }
    }
  }

  Future<void> _onCheckoutAddressCreateRequested(
    CheckoutAddressCreateRequested event,
    Emitter<CheckoutState> emit,
  ) async {
    if (state is! CheckoutReady) return;
    final current = state as CheckoutReady;
    emit(current.copyWith(isSavingAddress: true));
    try {
      final newAddress = await _checkoutRepository.createAddress(
        AddressModel(
          id: 0,
          userId: 0,
          label: event.label,
          recipientName: event.recipientName,
          phoneNumber: event.phoneNumber,
          addressLine: event.addressLine,
          city: event.city,
          latitude: event.latitude,
          longitude: event.longitude,
          isDefault: current.addresses.isEmpty,
        ),
      );
      final updatedAddresses = [...current.addresses, newAddress];
      emit(current.copyWith(
        addresses: updatedAddresses,
        selectedAddress: newAddress,
        isSavingAddress: false,
      ));
    } catch (e) {
      emit(current.copyWith(isSavingAddress: false));
      emit(CheckoutError(e.toString().replaceAll('Exception:', '').trim()));
      emit(current.copyWith(isSavingAddress: false));
    }
  }

  Future<void> _onCheckoutCouponApplyRequested(
    CheckoutCouponApplyRequested event,
    Emitter<CheckoutState> emit,
  ) async {
    if (state is CheckoutReady) {
      final current = state as CheckoutReady;
      try {
        final result = await _checkoutRepository.validateCoupon(
          code: event.couponCode,
          subtotal: current.subtotal,
        );

        final discount = (result['discount'] as num?)?.toDouble() ?? 0.0;
        final code = result['code'] as String? ?? event.couponCode;

        emit(
          current.copyWith(
            discount: discount,
            appliedCouponCode: code,
            clearCouponError: true,
          ),
        );
      } catch (e) {
        emit(
          current.copyWith(
            couponError: e.toString().replaceAll('Exception:', '').trim(),
          ),
        );
      }
    }
  }

  void _onCheckoutCouponRemoveRequested(
    CheckoutCouponRemoveRequested event,
    Emitter<CheckoutState> emit,
  ) {
    if (state is CheckoutReady) {
      emit((state as CheckoutReady).copyWith(clearCoupon: true, clearCouponError: true));
    }
  }

  void _onCheckoutPaymentMethodSelected(
    CheckoutPaymentMethodSelected event,
    Emitter<CheckoutState> emit,
  ) {
    if (state is CheckoutReady) {
      emit((state as CheckoutReady).copyWith(paymentMethod: event.paymentMethod));
    }
  }

  void _onCheckoutNotesChanged(
    CheckoutNotesChanged event,
    Emitter<CheckoutState> emit,
  ) {
    if (state is CheckoutReady) {
      emit((state as CheckoutReady).copyWith(notes: event.notes));
    }
  }

  Future<void> _onCheckoutPlaceOrderRequested(
    CheckoutPlaceOrderRequested event,
    Emitter<CheckoutState> emit,
  ) async {
    if (state is CheckoutReady) {
      final current = state as CheckoutReady;

      if (current.selectedAddress == null) {
        emit(const CheckoutError('Please select or add a delivery address'));
        emit(current);
        return;
      }

      emit(current.copyWith(isSubmitting: true));

      try {
        final order = await _checkoutRepository.createOrder(
          addressId: current.selectedAddress!.id,
          couponCode: current.appliedCouponCode,
          paymentMethod: current.paymentMethod,
          notes: current.notes,
        );

        emit(CheckoutOrderSuccess(order));
      } catch (e) {
        emit(current.copyWith(isSubmitting: false));
        emit(CheckoutError(e.toString()));
      }
    }
  }
}
