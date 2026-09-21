import 'package:equatable/equatable.dart';
import '../../../../shared/models/food_item_model.dart';
import '../../../../shared/models/restaurant_model.dart';

abstract class FavoriteEvent extends Equatable {
  const FavoriteEvent();

  @override
  List<Object?> get props => [];
}

class FavoritesFetchRequested extends FavoriteEvent {}

class FavoriteRestaurantToggleRequested extends FavoriteEvent {
  final RestaurantModel restaurant;

  const FavoriteRestaurantToggleRequested(this.restaurant);

  @override
  List<Object?> get props => [restaurant];
}

class FavoriteFoodToggleRequested extends FavoriteEvent {
  final FoodItemModel food;

  const FavoriteFoodToggleRequested(this.food);

  @override
  List<Object?> get props => [food];
}
