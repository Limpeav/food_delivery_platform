import 'package:equatable/equatable.dart';
import '../../../../shared/models/user_model.dart';

abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final UserModel user;

  const AuthAuthenticated(this.user);

  @override
  List<Object?> get props => [user];
}

class AuthPhoneRequired extends AuthState {
  final UserModel user;

  const AuthPhoneRequired(this.user);

  @override
  List<Object?> get props => [user];
}

typedef PhoneRequired = AuthPhoneRequired;
typedef Authenticated = AuthAuthenticated;
typedef Unauthenticated = AuthUnauthenticated;

class AuthUnauthenticated extends AuthState {}

class AuthError extends AuthState {
  final String message;

  const AuthError(this.message);

  @override
  List<Object?> get props => [message];
}

class AuthPasswordResetSent extends AuthState {
  final String message;

  const AuthPasswordResetSent(this.message);

  @override
  List<Object?> get props => [message];
}
