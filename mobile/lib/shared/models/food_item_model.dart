import 'package:equatable/equatable.dart';

class FoodItemModel extends Equatable {
  final int id;
  final int restaurantId;
  final String? restaurantName;
  final int? categoryId;
  final String? categoryName;
  final String name;
  final String? description;
  final double price;
  final String? imageUrl;
  final bool available;
  final double rating;
  final int prepTimeMinutes;

  const FoodItemModel({
    required this.id,
    required this.restaurantId,
    this.restaurantName,
    this.categoryId,
    this.categoryName,
    required this.name,
    this.description,
    required this.price,
    this.imageUrl,
    this.available = true,
    this.rating = 0.0,
    this.prepTimeMinutes = 15,
  });

  factory FoodItemModel.fromJson(Map<String, dynamic> json) {
    return FoodItemModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      restaurantId: (json['restaurantId'] as num?)?.toInt() ?? 0,
      restaurantName: json['restaurantName'] as String?,
      categoryId: ((json['categoryId'] ?? json['menuCategoryId']) as num?)?.toInt(),
      categoryName: (json['categoryName'] ?? json['menuCategoryName']) as String?,
      name: json['name'] as String? ?? '',
      description: json['description'] as String?,
      price: ((json['price'] ?? json['unitPrice']) as num?)?.toDouble() ?? 0.0,
      imageUrl: json['imageUrl'] as String?,
      available: (json['available'] ?? json['isAvailable']) as bool? ?? true,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      prepTimeMinutes: ((json['prepTimeMinutes'] ?? json['preparationTime']) as num?)?.toInt() ?? 15,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'restaurantId': restaurantId,
    'restaurantName': restaurantName,
    'categoryId': categoryId,
    'categoryName': categoryName,
    'name': name,
    'description': description,
    'price': price,
    'imageUrl': imageUrl,
    'available': available,
    'rating': rating,
    'prepTimeMinutes': prepTimeMinutes,
  };

  @override
  List<Object?> get props => [
        id,
        restaurantId,
        name,
        description,
        price,
        imageUrl,
        available,
        rating,
      ];
}
