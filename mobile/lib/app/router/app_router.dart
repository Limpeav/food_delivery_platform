import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/address/presentation/pages/add_edit_address_page.dart';
import '../../features/address/presentation/pages/addresses_page.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/auth/presentation/pages/complete_profile_page.dart';
import '../../features/auth/presentation/pages/forgot_password_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/cart/presentation/pages/cart_page.dart';
import '../../features/checkout/presentation/pages/checkout_page.dart';
import '../../features/favorite/presentation/pages/favorites_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/notification/presentation/pages/notifications_page.dart';
import '../../features/onboarding/onboarding_page.dart';
import '../../features/order/presentation/pages/order_confirmation_page.dart';
import '../../features/order/presentation/pages/order_details_page.dart';
import '../../features/order/presentation/pages/orders_page.dart';
import '../../features/payment/presentation/pages/payment_page.dart';
import '../../features/profile/presentation/pages/change_password_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/profile/presentation/pages/static_content_pages.dart';
import '../../features/restaurant/presentation/pages/restaurant_details_page.dart';
import '../../features/search/presentation/pages/search_page.dart';
import '../../features/splash/splash_page.dart';
import '../../features/tracking/presentation/pages/order_tracking_page.dart';
import '../../shared/models/address_model.dart';
import '../../shared/widgets/bottom_nav_scaffold.dart';
import 'route_guards.dart';
import 'route_names.dart';

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');

GoRouter createAppRouter(AuthBloc authBloc) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: RouteNames.splash,
    refreshListenable: GoRouterRefreshStream(authBloc.stream),
    redirect: (context, state) => RouteGuards.guardAuth(context, state),
    routes: [
      // Splash & Onboarding
      GoRoute(
        path: RouteNames.splash,
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: RouteNames.onboarding,
        builder: (context, state) => const OnboardingPage(),
      ),

      // Auth Routes
      GoRoute(
        path: RouteNames.login,
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: RouteNames.register,
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: RouteNames.forgotPassword,
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.completeProfile,
        builder: (context, state) => const CompleteProfilePage(),
      ),

      // Bottom Navigation Scaffold with 5 Branches
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return BottomNavScaffold(navigationShell: navigationShell);
        },
        branches: [
          // Branch 0: Home
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RouteNames.home,
                builder: (context, state) => const HomePage(),
              ),
            ],
          ),

          // Branch 1: Search
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RouteNames.search,
                builder: (context, state) => const SearchPage(),
              ),
            ],
          ),

          // Branch 2: Orders
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RouteNames.orders,
                builder: (context, state) => const OrdersPage(),
              ),
            ],
          ),

          // Branch 3: Favorites
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RouteNames.favorites,
                builder: (context, state) => const FavoritesPage(),
              ),
            ],
          ),

          // Branch 4: Profile
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RouteNames.profile,
                builder: (context, state) => const ProfilePage(),
              ),
            ],
          ),
        ],
      ),

      // Full-screen Subroutes
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.restaurantDetails,
        builder: (context, state) {
          final id = int.tryParse(state.pathParameters['id'] ?? '') ?? 0;
          return RestaurantDetailsPage(restaurantId: id);
        },
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.cart,
        builder: (context, state) => const CartPage(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.checkout,
        builder: (context, state) => const CheckoutPage(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.payment,
        builder: (context, state) {
          final orderId = int.tryParse(state.pathParameters['orderId'] ?? '') ?? 0;
          return PaymentPage(orderId: orderId);
        },
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.orderConfirmation,
        builder: (context, state) {
          final orderId = int.tryParse(state.pathParameters['orderId'] ?? '') ?? 0;
          return OrderConfirmationPage(orderId: orderId);
        },
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.orderDetails,
        builder: (context, state) {
          final id = int.tryParse(state.pathParameters['id'] ?? '') ?? 0;
          return OrderDetailsPage(orderId: id);
        },
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.orderTracking,
        builder: (context, state) {
          final id = int.tryParse(state.pathParameters['id'] ?? '') ?? 0;
          return OrderTrackingPage(orderId: id);
        },
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.addresses,
        builder: (context, state) => const AddressesPage(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.addressNew,
        builder: (context, state) => const AddEditAddressPage(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.addressEdit,
        builder: (context, state) {
          final address = state.extra as AddressModel?;
          return AddEditAddressPage(initialAddress: address);
        },
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.notifications,
        builder: (context, state) => const NotificationsPage(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.changePassword,
        builder: (context, state) => const ChangePasswordPage(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.settings,
        builder: (context, state) => const SettingsPage(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.helpCenter,
        builder: (context, state) => const HelpCenterPage(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.privacyPolicy,
        builder: (context, state) => const PrivacyPolicyPage(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: RouteNames.termsOfService,
        builder: (context, state) => const TermsOfServicePage(),
      ),
    ],
  );
}
