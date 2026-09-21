import 'package:equatable/equatable.dart';

abstract class ProfileEvent extends Equatable {
  const ProfileEvent();

  @override
  List<Object?> get props => [];
}

class ProfileFetchRequested extends ProfileEvent {}

class ProfileUpdateRequested extends ProfileEvent {
  final String name;
  final String? phoneNumber;

  const ProfileUpdateRequested({required this.name, this.phoneNumber});

  @override
  List<Object?> get props => [name, phoneNumber];
}

class ProfileChangePasswordRequested extends ProfileEvent {
  final String currentPassword;
  final String newPassword;
  final String confirmPassword;

  const ProfileChangePasswordRequested({
    required this.currentPassword,
    required this.newPassword,
    required this.confirmPassword,
  });

  @override
  List<Object?> get props => [currentPassword, newPassword, confirmPassword];
}
