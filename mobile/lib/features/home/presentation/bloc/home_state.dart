import 'package:equatable/equatable.dart';
import '../../../../shared/models/category_model.dart';
import '../../../../shared/models/food_item_model.dart';
import '../../../../shared/models/promotion_model.dart';
import '../../../../shared/models/restaurant_model.dart';

export 'home_event.dart';

abstract class HomeState extends Equatable {
  const HomeState();

  @override
  List<Object?> get props => [];
}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {}

class HomeLoaded extends HomeState {
  final List<CategoryModel> categories;
  final List<PromotionModel> promotions;
  final List<RestaurantModel> popularRestaurants;
  final List<FoodItemModel> popularFoods;

  const HomeLoaded({
    required this.categories,
    required this.promotions,
    required this.popularRestaurants,
    required this.popularFoods,
  });

  @override
  List<Object?> get props => [categories, promotions, popularRestaurants, popularFoods];
}

class HomeError extends HomeState {
  final String message;

  const HomeError(this.message);

  @override
  List<Object?> get props => [message];
}
