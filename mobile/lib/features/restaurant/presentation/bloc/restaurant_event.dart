import 'package:equatable/equatable.dart';

abstract class RestaurantEvent extends Equatable {
  const RestaurantEvent();

  @override
  List<Object?> get props => [];
}

class RestaurantDetailsRequested extends RestaurantEvent {
  final int restaurantId;

  const RestaurantDetailsRequested(this.restaurantId);

  @override
  List<Object?> get props => [restaurantId];
}

class RestaurantCategorySelected extends RestaurantEvent {
  final int? categoryId;

  const RestaurantCategorySelected(this.categoryId);

  @override
  List<Object?> get props => [categoryId];
}
