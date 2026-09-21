import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/restaurant_repository.dart';
import 'restaurant_state.dart';

class RestaurantBloc extends Bloc<RestaurantEvent, RestaurantState> {
  final RestaurantRepository _restaurantRepository;

  RestaurantBloc({required RestaurantRepository restaurantRepository})
      : _restaurantRepository = restaurantRepository,
        super(RestaurantInitial()) {
    on<RestaurantDetailsRequested>(_onRestaurantDetailsRequested);
    on<RestaurantCategorySelected>(_onRestaurantCategorySelected);
  }

  Future<void> _onRestaurantDetailsRequested(
    RestaurantDetailsRequested event,
    Emitter<RestaurantState> emit,
  ) async {
    emit(RestaurantLoading());
    try {
      final results = await Future.wait([
        _restaurantRepository.getRestaurantById(event.restaurantId),
        _restaurantRepository.getMenuCategories(event.restaurantId),
        _restaurantRepository.getFoodsByRestaurant(event.restaurantId),
        _restaurantRepository.getRestaurantReviews(event.restaurantId),
      ]);

      final restaurant = results[0] as dynamic;
      final menuCategories = results[1] as dynamic;
      final allFoods = results[2] as dynamic;
      final reviews = results[3] as dynamic;

      emit(
        RestaurantLoaded(
          restaurant: restaurant,
          menuCategories: menuCategories,
          allFoods: allFoods,
          filteredFoods: allFoods,
          reviews: reviews,
        ),
      );
    } catch (e) {
      emit(RestaurantError(e.toString()));
    }
  }

  void _onRestaurantCategorySelected(
    RestaurantCategorySelected event,
    Emitter<RestaurantState> emit,
  ) {
    if (state is RestaurantLoaded) {
      final current = state as RestaurantLoaded;
      final selectedId = event.categoryId;

      final filtered = selectedId == null
          ? current.allFoods
          : current.allFoods.where((f) => f.categoryId == selectedId).toList();

      emit(
        current.copyWith(
          selectedCategoryId: selectedId,
          filteredFoods: filtered,
        ),
      );
    }
  }
}
