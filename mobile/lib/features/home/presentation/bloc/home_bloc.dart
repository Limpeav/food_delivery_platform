import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/home_repository.dart';
import 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final HomeRepository _homeRepository;

  HomeBloc({required HomeRepository homeRepository})
      : _homeRepository = homeRepository,
        super(HomeInitial()) {
    on<HomeFetchRequested>(_onHomeFetchRequested);
    on<HomeRefreshRequested>(_onHomeRefreshRequested);
  }

  Future<void> _onHomeFetchRequested(
    HomeFetchRequested event,
    Emitter<HomeState> emit,
  ) async {
    emit(HomeLoading());
    await _loadHomeData(emit);
  }

  Future<void> _onHomeRefreshRequested(
    HomeRefreshRequested event,
    Emitter<HomeState> emit,
  ) async {
    await _loadHomeData(emit);
  }

  Future<void> _loadHomeData(Emitter<HomeState> emit) async {
    try {
      final results = await Future.wait([
        _homeRepository.getCategories(),
        _homeRepository.getPromotions(),
        _homeRepository.getPopularRestaurants(),
        _homeRepository.getPopularFoods(),
      ]);

      emit(
        HomeLoaded(
          categories: results[0] as dynamic,
          promotions: results[1] as dynamic,
          popularRestaurants: results[2] as dynamic,
          popularFoods: results[3] as dynamic,
        ),
      );
    } catch (e) {
      emit(HomeError(e.toString()));
    }
  }
}
