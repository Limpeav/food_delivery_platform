import 'package:equatable/equatable.dart';
import '../../../../shared/models/address_model.dart';

abstract class AddressEvent extends Equatable {
  const AddressEvent();

  @override
  List<Object?> get props => [];
}

class AddressFetchRequested extends AddressEvent {}

class AddressCreateRequested extends AddressEvent {
  final AddressModel address;

  const AddressCreateRequested(this.address);

  @override
  List<Object?> get props => [address];
}

class AddressUpdateRequested extends AddressEvent {
  final int id;
  final AddressModel address;

  const AddressUpdateRequested({required this.id, required this.address});

  @override
  List<Object?> get props => [id, address];
}

class AddressDeleteRequested extends AddressEvent {
  final int id;

  const AddressDeleteRequested(this.id);

  @override
  List<Object?> get props => [id];
}

class AddressSetDefaultRequested extends AddressEvent {
  final int id;

  const AddressSetDefaultRequested(this.id);

  @override
  List<Object?> get props => [id];
}
