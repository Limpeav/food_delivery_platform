import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../shared/models/user_model.dart';
import '../../data/auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;

  AuthBloc({required AuthRepository authRepository})
      : _authRepository = authRepository,
        super(AuthInitial()) {
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<AuthGoogleSignInRequested>(_onAuthGoogleSignInRequested);
    on<AuthCompletePhoneRequested>(_onAuthCompletePhoneRequested);
    on<AuthLoginRequested>(_onAuthLoginRequested);
    on<AuthRegisterRequested>(_onAuthRegisterRequested);
    on<AuthForgotPasswordRequested>(_onAuthForgotPasswordRequested);
    on<AuthLogoutRequested>(_onAuthLogoutRequested);
  }

  Future<void> _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _authRepository.checkCurrentUser();
      if (user != null) {
        if (user.phoneNumber == null || user.phoneNumber!.trim().isEmpty) {
          emit(AuthPhoneRequired(user));
        } else {
          emit(AuthAuthenticated(user));
        }
      } else {
        emit(AuthUnauthenticated());
      }
    } catch (_) {
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onAuthGoogleSignInRequested(
    AuthGoogleSignInRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final result = await _authRepository.googleSignIn(testIdToken: event.testIdToken);
      if (result == null) {
        // User cancelled Google Sign-In dialog
        emit(const AuthError('Sign-in cancelled.'));
        emit(AuthUnauthenticated());
        return;
      }

      if (result.phoneRequired || result.user.phoneNumber == null || result.user.phoneNumber!.trim().isEmpty) {
        emit(AuthPhoneRequired(result.user));
      } else {
        emit(AuthAuthenticated(result.user));
      }
    } catch (e) {
      final errorMessage = _friendlyErrorMessage(e);
      emit(AuthError(errorMessage));
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onAuthCompletePhoneRequested(
    AuthCompletePhoneRequested event,
    Emitter<AuthState> emit,
  ) async {
    final currentState = state;
    UserModel? currentUser;
    if (currentState is AuthPhoneRequired) {
      currentUser = currentState.user;
    } else if (currentState is AuthAuthenticated) {
      currentUser = currentState.user;
    }

    emit(AuthLoading());
    try {
      final updatedUser = await _authRepository.completePhoneNumber(event.phoneNumber);
      emit(AuthAuthenticated(updatedUser));
    } catch (e) {
      final errorMessage = _friendlyErrorMessage(e);
      emit(AuthError(errorMessage));
      if (currentUser != null) {
        emit(AuthPhoneRequired(currentUser));
      } else {
        emit(AuthUnauthenticated());
      }
    }
  }

  Future<void> _onAuthLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _authRepository.login(
        email: event.email,
        password: event.password,
      );
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthError(e.toString()));
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onAuthRegisterRequested(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _authRepository.register(
        name: event.name,
        email: event.email,
        password: event.password,
        confirmPassword: event.confirmPassword,
        phoneNumber: event.phoneNumber,
      );
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthError(e.toString()));
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onAuthForgotPasswordRequested(
    AuthForgotPasswordRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      await _authRepository.forgotPassword(event.email);
      emit(const AuthPasswordResetSent('Password reset instructions have been sent to your email.'));
      emit(AuthUnauthenticated());
    } catch (e) {
      emit(AuthError(e.toString()));
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onAuthLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      await _authRepository.logout();
    } finally {
      emit(AuthUnauthenticated());
    }
  }

  String _friendlyErrorMessage(dynamic error) {
    if (error is ConflictException) {
      return error.message;
    }
    if (error is BadRequestException) {
      return error.message;
    }
    if (error is NetworkException) {
      return 'Please check your internet connection and try again.';
    }
    final str = error.toString().toLowerCase();
    if (str.contains('network') || str.contains('socket') || str.contains('connection')) {
      return 'Please check your internet connection and try again.';
    }
    if (str.contains('cancel')) {
      return 'Sign-in cancelled.';
    }
    if (str.contains('already linked') || str.contains('conflict')) {
      return 'This phone number is already linked to another account.';
    }
    if (str.contains('google')) {
      return 'Unable to sign in with Google. Please try again.';
    }
    return 'Unable to complete sign-in. Please try again.';
  }
}
