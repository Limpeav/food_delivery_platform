import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:cravery_customer/features/auth/data/auth_repository.dart';
import 'package:cravery_customer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:cravery_customer/features/auth/presentation/bloc/auth_event.dart';
import 'package:cravery_customer/features/auth/presentation/bloc/auth_state.dart';
import 'package:cravery_customer/shared/models/user_model.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late MockAuthRepository mockAuthRepository;

  const testUser = UserModel(
    id: 1,
    name: 'Customer Demo',
    email: 'customer@gmail.com',
    role: 'CUSTOMER',
  );

  setUp(() {
    mockAuthRepository = MockAuthRepository();
  });

  group('AuthBloc Tests', () {
    test('initial state is AuthInitial', () {
      final bloc = AuthBloc(authRepository: mockAuthRepository);
      expect(bloc.state, isA<AuthInitial>());
      bloc.close();
    });

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthAuthenticated] when session check succeeds with valid user',
      build: () {
        when(() => mockAuthRepository.checkCurrentUser()).thenAnswer((_) async => testUser);
        return AuthBloc(authRepository: mockAuthRepository);
      },
      act: (bloc) => bloc.add(AuthCheckRequested()),
      expect: () => [
        isA<AuthLoading>(),
        const AuthAuthenticated(testUser),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthUnauthenticated] when no active session found',
      build: () {
        when(() => mockAuthRepository.checkCurrentUser()).thenAnswer((_) async => null);
        return AuthBloc(authRepository: mockAuthRepository);
      },
      act: (bloc) => bloc.add(AuthCheckRequested()),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthUnauthenticated>(),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthAuthenticated] on successful customer login',
      build: () {
        when(() => mockAuthRepository.login(
              email: 'customer@gmail.com',
              password: 'password123',
            )).thenAnswer((_) async => testUser);
        return AuthBloc(authRepository: mockAuthRepository);
      },
      act: (bloc) => bloc.add(const AuthLoginRequested(
        email: 'customer@gmail.com',
        password: 'password123',
      )),
      expect: () => [
        isA<AuthLoading>(),
        const AuthAuthenticated(testUser),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthError, AuthUnauthenticated] on login failure',
      build: () {
        when(() => mockAuthRepository.login(
              email: 'wrong@gmail.com',
              password: 'wrongpassword',
            )).thenThrow(Exception('Invalid credentials'));
        return AuthBloc(authRepository: mockAuthRepository);
      },
      act: (bloc) => bloc.add(const AuthLoginRequested(
        email: 'wrong@gmail.com',
        password: 'wrongpassword',
      )),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthError>(),
        isA<AuthUnauthenticated>(),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthUnauthenticated] on logout',
      build: () {
        when(() => mockAuthRepository.logout()).thenAnswer((_) async {});
        return AuthBloc(authRepository: mockAuthRepository);
      },
      act: (bloc) => bloc.add(AuthLogoutRequested()),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthUnauthenticated>(),
      ],
    );
  });
}
