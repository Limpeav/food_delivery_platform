import 'package:equatable/equatable.dart';
import '../../../../shared/models/category_model.dart';
import '../../../../shared/models/food_item_model.dart';
import '../../../../shared/models/restaurant_model.dart';
import '../../../../shared/models/review_model.dart';

export 'restaurant_event.dart';

abstract class RestaurantState extends Equatable {
  const RestaurantState();

  @override
  List<Object?> get props => [];
}

class RestaurantInitial extends RestaurantState {}

class RestaurantLoading extends RestaurantState {}

class RestaurantLoaded extends RestaurantState {
  final RestaurantModel restaurant;
  final List<CategoryModel> menuCategories;
  final List<FoodItemModel> allFoods;
  final List<FoodItemModel> filteredFoods;
  final List<ReviewModel> reviews;
  final int? selectedCategoryId;

  const RestaurantLoaded({
    required this.restaurant,
    required this.menuCategories,
    required this.allFoods,
    required this.filteredFoods,
    required this.reviews,
    this.selectedCategoryId,
  });

  RestaurantLoaded copyWith({
    int? selectedCategoryId,
    List<FoodItemModel>? filteredFoods,
  }) {
    return RestaurantLoaded(
      restaurant: restaurant,
      menuCategories: menuCategories,
      allFoods: allFoods,
      filteredFoods: filteredFoods ?? this.filteredFoods,
      reviews: reviews,
      selectedCategoryId: selectedCategoryId,
    );
  }

  @override
  List<Object?> get props => [
        restaurant,
        menuCategories,
        allFoods,
        filteredFoods,
        reviews,
        selectedCategoryId,
      ];
}

class RestaurantError extends RestaurantState {
  final String message;

  const RestaurantError(this.message);

  @override
  List<Object?> get props => [message];
}
