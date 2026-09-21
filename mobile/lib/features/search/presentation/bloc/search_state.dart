import 'package:equatable/equatable.dart';
import '../../../../shared/models/category_model.dart';
import '../../../../shared/models/food_item_model.dart';
import '../../../../shared/models/restaurant_model.dart';

export 'search_event.dart';

abstract class SearchState extends Equatable {
  const SearchState();

  @override
  List<Object?> get props => [];
}

class SearchInitial extends SearchState {}

class SearchLoading extends SearchState {
  final List<CategoryModel> categories;
  final int? selectedCategoryId;
  final String query;

  const SearchLoading({
    this.categories = const [],
    this.selectedCategoryId,
    this.query = '',
  });

  @override
  List<Object?> get props => [categories, selectedCategoryId, query];
}

class SearchLoaded extends SearchState {
  final List<CategoryModel> categories;
  final List<RestaurantModel> restaurants;
  final List<FoodItemModel> foods;
  final int? selectedCategoryId;
  final String query;

  const SearchLoaded({
    required this.categories,
    required this.restaurants,
    required this.foods,
    this.selectedCategoryId,
    this.query = '',
  });

  bool get isEmpty => restaurants.isEmpty && foods.isEmpty;

  @override
  List<Object?> get props => [categories, restaurants, foods, selectedCategoryId, query];
}

class SearchError extends SearchState {
  final String message;

  const SearchError(this.message);

  @override
  List<Object?> get props => [message];
}
