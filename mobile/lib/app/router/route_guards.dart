import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../router/route_names.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';

class RouteGuards {
  RouteGuards._();

  static String? guardAuth(BuildContext context, GoRouterState state) {
    final authState = context.read<AuthBloc>().state;
    final location = state.matchedLocation;

    final isSplashOrOnboarding =
        location == RouteNames.splash || location == RouteNames.onboarding;
    if (isSplashOrOnboarding) {
      return null;
    }

    final isAuthEntry = location == RouteNames.login ||
        location == RouteNames.register ||
        location == RouteNames.forgotPassword;

    if (authState is AuthPhoneRequired) {
      if (location != RouteNames.completeProfile) {
        return RouteNames.completeProfile;
      }
      return null;
    }

    if (authState is AuthAuthenticated) {
      final hasPhone = authState.user.phoneNumber != null &&
          authState.user.phoneNumber!.trim().isNotEmpty;

      if (!hasPhone) {
        if (location != RouteNames.completeProfile) {
          return RouteNames.completeProfile;
        }
        return null;
      }

      if (isAuthEntry || location == RouteNames.completeProfile) {
        return RouteNames.home;
      }
      return null;
    }

    if (authState is AuthUnauthenticated) {
      if (!isAuthEntry) {
        return RouteNames.login;
      }
      return null;
    }

    return null;
  }
}
