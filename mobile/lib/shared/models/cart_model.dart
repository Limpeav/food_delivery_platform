import 'package:equatable/equatable.dart';

class CartItemModel extends Equatable {
  final int id;
  final int foodItemId;
  final String foodName;
  final String? foodImageUrl;
  final double price;
  final int quantity;
  final double subtotal;
  final String? selectedOptions;
  final String? specialInstructions;

  const CartItemModel({
    required this.id,
    required this.foodItemId,
    required this.foodName,
    this.foodImageUrl,
    required this.price,
    required this.quantity,
    required this.subtotal,
    this.selectedOptions,
    this.specialInstructions,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      foodItemId: (json['foodItemId'] as num?)?.toInt() ?? 0,
      foodName: json['foodName'] as String? ?? '',
      foodImageUrl: (json['foodImageUrl'] ?? json['imageUrl']) as String?,
      price: ((json['price'] ?? json['unitPrice']) as num?)?.toDouble() ?? 0.0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      selectedOptions: json['selectedOptions'] as String?,
      specialInstructions: json['specialInstructions'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'foodItemId': foodItemId,
    'foodName': foodName,
    'foodImageUrl': foodImageUrl,
    'price': price,
    'quantity': quantity,
    'subtotal': subtotal,
    'selectedOptions': selectedOptions,
    'specialInstructions': specialInstructions,
  };

  @override
  List<Object?> get props => [id, foodItemId, foodName, price, quantity, subtotal, selectedOptions, specialInstructions];
}

class CartModel extends Equatable {
  final int? id;
  final int? restaurantId;
  final String? restaurantName;
  final double restaurantDeliveryFee;
  final double restaurantMinimumOrder;
  final List<CartItemModel> items;
  final double subtotal;
  final double deliveryFee;
  final double totalAmount;
  final int totalItems;

  const CartModel({
    this.id,
    this.restaurantId,
    this.restaurantName,
    this.restaurantDeliveryFee = 0.0,
    this.restaurantMinimumOrder = 0.0,
    this.items = const [],
    this.subtotal = 0.0,
    this.deliveryFee = 0.0,
    this.totalAmount = 0.0,
    this.totalItems = 0,
  });

  factory CartModel.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    return CartModel(
      id: (json['id'] as num?)?.toInt(),
      restaurantId: (json['restaurantId'] as num?)?.toInt(),
      restaurantName: json['restaurantName'] as String?,
      restaurantDeliveryFee: (json['restaurantDeliveryFee'] as num?)?.toDouble() ?? 0.0,
      restaurantMinimumOrder: (json['restaurantMinimumOrder'] as num?)?.toDouble() ?? 0.0,
      items: rawItems.map((item) => CartItemModel.fromJson(item as Map<String, dynamic>)).toList(),
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      deliveryFee: (json['deliveryFee'] as num?)?.toDouble() ?? 0.0,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      totalItems: (json['totalItems'] as num?)?.toInt() ??
          rawItems.fold<int>(0, (sum, item) => sum + (((item as Map<String, dynamic>)['quantity'] as num?)?.toInt() ?? 1)),
    );
  }

  bool get isEmpty => items.isEmpty;
  bool get isNotEmpty => items.isNotEmpty;

  @override
  List<Object?> get props => [
        id,
        restaurantId,
        restaurantName,
        items,
        subtotal,
        deliveryFee,
        totalAmount,
        totalItems,
      ];
}
