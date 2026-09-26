import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../core/network/dio_client.dart';
import '../core/storage/secure_storage_service.dart';
import '../core/websocket/websocket_service.dart';
import '../features/address/data/address_repository.dart';
import '../features/address/presentation/bloc/address_bloc.dart';
import '../features/address/presentation/bloc/address_event.dart';
import '../features/auth/data/auth_repository.dart';
import '../features/auth/presentation/bloc/auth_bloc.dart';
import '../features/auth/presentation/bloc/auth_event.dart';
import '../features/cart/data/cart_repository.dart';
import '../features/cart/presentation/bloc/cart_bloc.dart';
import '../features/cart/presentation/bloc/cart_event.dart';
import '../features/checkout/data/checkout_repository.dart';
import '../features/checkout/presentation/bloc/checkout_bloc.dart';
import '../features/favorite/data/favorite_repository.dart';
import '../features/favorite/presentation/bloc/favorite_bloc.dart';
import '../features/favorite/presentation/bloc/favorite_event.dart';
import '../features/home/data/home_repository.dart';
import '../features/home/presentation/bloc/home_bloc.dart';
import '../features/home/presentation/bloc/home_state.dart';
import '../features/notification/data/notification_repository.dart';
import '../features/notification/presentation/bloc/notification_bloc.dart';
import '../features/notification/presentation/bloc/notification_state.dart';
import '../features/order/data/order_repository.dart';
import '../features/order/presentation/bloc/order_bloc.dart';
import '../features/order/presentation/bloc/order_event.dart';
import '../features/payment/data/payment_repository.dart';
import '../features/tracking/presentation/bloc/tracking_bloc.dart';
import '../features/profile/data/profile_repository.dart';
import '../features/profile/presentation/bloc/profile_bloc.dart';
import '../features/profile/presentation/bloc/profile_event.dart';
import '../features/restaurant/data/restaurant_repository.dart';
import '../features/restaurant/presentation/bloc/restaurant_bloc.dart';
import '../features/review/data/review_repository.dart';
import '../features/search/data/search_repository.dart';
import '../features/search/presentation/bloc/search_bloc.dart';
import '../features/search/presentation/bloc/search_state.dart';
import 'config/app_config.dart';
import 'router/app_router.dart';
import 'theme/app_theme.dart';

class CraveryApp extends StatefulWidget {
  final DioClient dioClient;
  final WebSocketService webSocketService;
  final SecureStorageService secureStorageService;

  const CraveryApp({
    super.key,
    required this.dioClient,
    required this.webSocketService,
    required this.secureStorageService,
  });

  @override
  State<CraveryApp> createState() => _CraveryAppState();
}

class _CraveryAppState extends State<CraveryApp> {
  late final AuthRepository _authRepository;
  late final HomeRepository _homeRepository;
  late final RestaurantRepository _restaurantRepository;
  late final SearchRepository _searchRepository;
  late final CartRepository _cartRepository;
  late final CheckoutRepository _checkoutRepository;
  late final OrderRepository _orderRepository;
  late final AddressRepository _addressRepository;
  late final FavoriteRepository _favoriteRepository;
  late final NotificationRepository _notificationRepository;
  late final ReviewRepository _reviewRepository;
  late final ProfileRepository _profileRepository;
  late final PaymentRepository _paymentRepository;

  late final AuthBloc _authBloc;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    // Initialize Repositories
    _authRepository = AuthRepository(
      dioClient: widget.dioClient,
      storageService: widget.secureStorageService,
    );
    _homeRepository = HomeRepository(dioClient: widget.dioClient);
    _restaurantRepository = RestaurantRepository(dioClient: widget.dioClient);
    _searchRepository = SearchRepository(dioClient: widget.dioClient);
    _cartRepository = CartRepository(dioClient: widget.dioClient);
    _checkoutRepository = CheckoutRepository(dioClient: widget.dioClient);
    _orderRepository = OrderRepository(dioClient: widget.dioClient);
    _paymentRepository = PaymentRepository(dioClient: widget.dioClient);
    _addressRepository = AddressRepository(dioClient: widget.dioClient);
    _favoriteRepository = FavoriteRepository(dioClient: widget.dioClient);
    _notificationRepository = NotificationRepository(dioClient: widget.dioClient);
    _reviewRepository = ReviewRepository(dioClient: widget.dioClient);
    _profileRepository = ProfileRepository(dioClient: widget.dioClient);

    // Initialize AuthBloc & Router
    _authBloc = AuthBloc(
      authRepository: _authRepository,
    )..add(AuthCheckRequested());

    _router = createAppRouter(_authBloc);
  }

  @override
  void dispose() {
    _authBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: widget.dioClient),
        RepositoryProvider.value(value: widget.webSocketService),
        RepositoryProvider.value(value: widget.secureStorageService),
        RepositoryProvider.value(value: _authRepository),
        RepositoryProvider.value(value: _homeRepository),
        RepositoryProvider.value(value: _restaurantRepository),
        RepositoryProvider.value(value: _searchRepository),
        RepositoryProvider.value(value: _cartRepository),
        RepositoryProvider.value(value: _checkoutRepository),
        RepositoryProvider.value(value: _orderRepository),
        RepositoryProvider.value(value: _paymentRepository),
        RepositoryProvider.value(value: _addressRepository),
        RepositoryProvider.value(value: _favoriteRepository),
        RepositoryProvider.value(value: _notificationRepository),
        RepositoryProvider.value(value: _reviewRepository),
        RepositoryProvider.value(value: _profileRepository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider.value(value: _authBloc),
          BlocProvider(
            create: (ctx) => CartBloc(cartRepository: _cartRepository)..add(CartFetchRequested()),
          ),
          BlocProvider(
            create: (ctx) => HomeBloc(homeRepository: _homeRepository)..add(HomeFetchRequested()),
          ),
          BlocProvider(
            create: (ctx) => SearchBloc(searchRepository: _searchRepository)..add(SearchInitRequested()),
          ),
          BlocProvider(
            create: (ctx) => FavoriteBloc(favoriteRepository: _favoriteRepository)..add(FavoritesFetchRequested()),
          ),
          BlocProvider(
            create: (ctx) => NotificationBloc(notificationRepository: _notificationRepository)..add(NotificationsFetchRequested()),
          ),
          BlocProvider(
            create: (ctx) => AddressBloc(addressRepository: _addressRepository)..add(AddressFetchRequested()),
          ),
          BlocProvider(
            create: (ctx) => OrderBloc(orderRepository: _orderRepository)..add(OrdersFetchRequested()),
          ),
          BlocProvider(
            create: (ctx) => ProfileBloc(profileRepository: _profileRepository)..add(ProfileFetchRequested()),
          ),
          BlocProvider(
            create: (ctx) => RestaurantBloc(restaurantRepository: _restaurantRepository),
          ),
          BlocProvider(
            create: (ctx) => CheckoutBloc(checkoutRepository: _checkoutRepository),
          ),
          BlocProvider(
            create: (ctx) => TrackingBloc(
              orderRepository: _orderRepository,
              webSocketService: widget.webSocketService,
            ),
          ),
        ],
        child: MaterialApp.router(
          title: AppConfig.appName,
          theme: AppTheme.lightTheme,
          debugShowCheckedModeBanner: false,
          routerConfig: _router,
        ),
      ),
    );
  }
}
