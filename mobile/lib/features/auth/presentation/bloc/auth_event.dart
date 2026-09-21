import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthCheckRequested extends AuthEvent {}

class AuthGoogleSignInRequested extends AuthEvent {
  final String? testIdToken;

  const AuthGoogleSignInRequested({this.testIdToken});

  @override
  List<Object?> get props => [testIdToken];
}

class AuthCompletePhoneRequested extends AuthEvent {
  final String phoneNumber;

  const AuthCompletePhoneRequested({required this.phoneNumber});

  @override
  List<Object?> get props => [phoneNumber];
}

class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;

  const AuthLoginRequested({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class AuthRegisterRequested extends AuthEvent {
  final String name;
  final String email;
  final String password;
  final String confirmPassword;
  final String? phoneNumber;

  const AuthRegisterRequested({
    required this.name,
    required this.email,
    required this.password,
    required this.confirmPassword,
    this.phoneNumber,
  });

  @override
  List<Object?> get props => [name, email, password, confirmPassword, phoneNumber];
}

class AuthForgotPasswordRequested extends AuthEvent {
  final String email;

  const AuthForgotPasswordRequested({required this.email});

  @override
  List<Object?> get props => [email];
}

class AuthLogoutRequested extends AuthEvent {}
