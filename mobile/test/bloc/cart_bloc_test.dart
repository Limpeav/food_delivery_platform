import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:cravery_customer/features/cart/data/cart_repository.dart';
import 'package:cravery_customer/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:cravery_customer/features/cart/presentation/bloc/cart_event.dart';
import 'package:cravery_customer/features/cart/presentation/bloc/cart_state.dart';
import 'package:cravery_customer/shared/models/cart_model.dart';

class MockCartRepository extends Mock implements CartRepository {}

void main() {
  late MockCartRepository mockCartRepository;

  const testCart = CartModel(
    id: 1,
    restaurantId: 3,
    restaurantName: 'Romdeng Traditional Bistro',
    items: [
      CartItemModel(
        id: 1,
        foodItemId: 10,
        foodName: 'Fish Amok',
        price: 8.50,
        quantity: 2,
        subtotal: 17.00,
      ),
    ],
    subtotal: 17.00,
    deliveryFee: 1.50,
    totalAmount: 18.50,
    totalItems: 2,
  );

  setUp(() {
    mockCartRepository = MockCartRepository();
  });

  group('CartBloc Tests', () {
    test('initial state is CartInitial', () {
      final bloc = CartBloc(cartRepository: mockCartRepository);
      expect(bloc.state, isA<CartInitial>());
      bloc.close();
    });

    blocTest<CartBloc, CartState>(
      'emits [CartLoading, CartLoaded] when CartFetchRequested succeeds',
      build: () {
        when(() => mockCartRepository.getCart()).thenAnswer((_) async => testCart);
        return CartBloc(cartRepository: mockCartRepository);
      },
      act: (bloc) => bloc.add(CartFetchRequested()),
      expect: () => [
        isA<CartLoading>(),
        const CartLoaded(testCart),
      ],
    );

    blocTest<CartBloc, CartState>(
      'emits [CartLoading, CartLoaded] with empty cart when CartClearRequested is triggered',
      build: () {
        when(() => mockCartRepository.clearCart()).thenAnswer(
          (_) async => const CartModel(items: [], subtotal: 0, totalAmount: 0),
        );
        return CartBloc(cartRepository: mockCartRepository);
      },
      act: (bloc) => bloc.add(CartClearRequested()),
      expect: () => [
        isA<CartUpdating>(),
        const CartLoaded(CartModel(items: [], subtotal: 0, totalAmount: 0)),
      ],
    );
  });
}
