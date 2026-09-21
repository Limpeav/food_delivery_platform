import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/favorite_repository.dart';
import 'favorite_state.dart';

class FavoriteBloc extends Bloc<FavoriteEvent, FavoriteState> {
  final FavoriteRepository _favoriteRepository;

  FavoriteBloc({required FavoriteRepository favoriteRepository})
      : _favoriteRepository = favoriteRepository,
        super(FavoriteInitial()) {
    on<FavoritesFetchRequested>(_onFavoritesFetchRequested);
    on<FavoriteRestaurantToggleRequested>(_onFavoriteRestaurantToggleRequested);
    on<FavoriteFoodToggleRequested>(_onFavoriteFoodToggleRequested);
  }

  Future<void> _onFavoritesFetchRequested(
    FavoritesFetchRequested event,
    Emitter<FavoriteState> emit,
  ) async {
    emit(FavoriteLoading());
    try {
      final results = await Future.wait([
        _favoriteRepository.getFavoriteRestaurants(),
        _favoriteRepository.getFavoriteFoods(),
      ]);

      emit(
        FavoriteLoaded(
          restaurants: results[0] as dynamic,
          foods: results[1] as dynamic,
        ),
      );
    } catch (e) {
      emit(FavoriteError(e.toString()));
    }
  }

  Future<void> _onFavoriteRestaurantToggleRequested(
    FavoriteRestaurantToggleRequested event,
    Emitter<FavoriteState> emit,
  ) async {
    if (state is FavoriteLoaded) {
      final current = state as FavoriteLoaded;
      final isFav = current.isRestaurantFavorite(event.restaurant.id);

      // Optimistic update
      final updatedList = isFav
          ? current.restaurants.where((r) => r.id != event.restaurant.id).toList()
          : [...current.restaurants, event.restaurant];

      emit(FavoriteLoaded(restaurants: updatedList, foods: current.foods));

      try {
        if (isFav) {
          await _favoriteRepository.removeFavoriteRestaurant(event.restaurant.id);
        } else {
          await _favoriteRepository.addFavoriteRestaurant(event.restaurant.id);
        }
      } catch (e) {
        // Revert on error
        emit(current);
        emit(FavoriteError(e.toString()));
      }
    }
  }

  Future<void> _onFavoriteFoodToggleRequested(
    FavoriteFoodToggleRequested event,
    Emitter<FavoriteState> emit,
  ) async {
    if (state is FavoriteLoaded) {
      final current = state as FavoriteLoaded;
      final isFav = current.isFoodFavorite(event.food.id);

      // Optimistic update
      final updatedList = isFav
          ? current.foods.where((f) => f.id != event.food.id).toList()
          : [...current.foods, event.food];

      emit(FavoriteLoaded(restaurants: current.restaurants, foods: updatedList));

      try {
        if (isFav) {
          await _favoriteRepository.removeFavoriteFood(event.food.id);
        } else {
          await _favoriteRepository.addFavoriteFood(event.food.id);
        }
      } catch (e) {
        // Revert on error
        emit(current);
        emit(FavoriteError(e.toString()));
      }
    }
  }
}
