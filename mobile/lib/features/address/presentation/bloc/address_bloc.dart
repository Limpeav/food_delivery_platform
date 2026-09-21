import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/address_repository.dart';
import 'address_event.dart';
import 'address_state.dart';

class AddressBloc extends Bloc<AddressEvent, AddressState> {
  final AddressRepository _addressRepository;

  AddressBloc({required AddressRepository addressRepository})
      : _addressRepository = addressRepository,
        super(AddressInitial()) {
    on<AddressFetchRequested>(_onAddressFetchRequested);
    on<AddressCreateRequested>(_onAddressCreateRequested);
    on<AddressUpdateRequested>(_onAddressUpdateRequested);
    on<AddressDeleteRequested>(_onAddressDeleteRequested);
    on<AddressSetDefaultRequested>(_onAddressSetDefaultRequested);
  }

  Future<void> _onAddressFetchRequested(
    AddressFetchRequested event,
    Emitter<AddressState> emit,
  ) async {
    emit(AddressLoading());
    try {
      final addresses = await _addressRepository.getAddresses();
      emit(AddressLoaded(addresses));
    } catch (e) {
      emit(AddressError(e.toString()));
    }
  }

  Future<void> _onAddressCreateRequested(
    AddressCreateRequested event,
    Emitter<AddressState> emit,
  ) async {
    emit(AddressLoading());
    try {
      await _addressRepository.createAddress(event.address);
      final addresses = await _addressRepository.getAddresses();
      emit(const AddressActionSuccess('Address created successfully'));
      emit(AddressLoaded(addresses));
    } catch (e) {
      emit(AddressError(e.toString()));
    }
  }

  Future<void> _onAddressUpdateRequested(
    AddressUpdateRequested event,
    Emitter<AddressState> emit,
  ) async {
    emit(AddressLoading());
    try {
      await _addressRepository.updateAddress(event.id, event.address);
      final addresses = await _addressRepository.getAddresses();
      emit(const AddressActionSuccess('Address updated successfully'));
      emit(AddressLoaded(addresses));
    } catch (e) {
      emit(AddressError(e.toString()));
    }
  }

  Future<void> _onAddressDeleteRequested(
    AddressDeleteRequested event,
    Emitter<AddressState> emit,
  ) async {
    try {
      await _addressRepository.deleteAddress(event.id);
      final addresses = await _addressRepository.getAddresses();
      emit(AddressLoaded(addresses));
    } catch (e) {
      emit(AddressError(e.toString()));
    }
  }

  Future<void> _onAddressSetDefaultRequested(
    AddressSetDefaultRequested event,
    Emitter<AddressState> emit,
  ) async {
    try {
      await _addressRepository.setDefaultAddress(event.id);
      final addresses = await _addressRepository.getAddresses();
      emit(AddressLoaded(addresses));
    } catch (e) {
      emit(AddressError(e.toString()));
    }
  }
}
