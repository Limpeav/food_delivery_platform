import 'package:equatable/equatable.dart';
import '../../../../shared/models/food_item_model.dart';
import '../../../../shared/models/restaurant_model.dart';

export 'favorite_event.dart';

abstract class FavoriteState extends Equatable {
  const FavoriteState();

  @override
  List<Object?> get props => [];
}

class FavoriteInitial extends FavoriteState {}

class FavoriteLoading extends FavoriteState {}

class FavoriteLoaded extends FavoriteState {
  final List<RestaurantModel> restaurants;
  final List<FoodItemModel> foods;

  const FavoriteLoaded({
    this.restaurants = const [],
    this.foods = const [],
  });

  bool isRestaurantFavorite(int id) => restaurants.any((r) => r.id == id);
  bool isFoodFavorite(int id) => foods.any((f) => f.id == id);

  @override
  List<Object?> get props => [restaurants, foods];
}

class FavoriteError extends FavoriteState {
  final String message;

  const FavoriteError(this.message);

  @override
  List<Object?> get props => [message];
}
