import 'package:equatable/equatable.dart';

class ReviewModel extends Equatable {
  final int id;
  final int orderId;
  final int customerId;
  final String customerName;
  final int restaurantId;
  final String? restaurantName;
  final int? foodItemId;
  final String? foodName;
  final int rating;
  final String? comment;
  final String? createdAt;

  const ReviewModel({
    required this.id,
    required this.orderId,
    required this.customerId,
    required this.customerName,
    required this.restaurantId,
    this.restaurantName,
    this.foodItemId,
    this.foodName,
    required this.rating,
    this.comment,
    this.createdAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      orderId: (json['orderId'] as num?)?.toInt() ?? 0,
      customerId: (json['customerId'] as num?)?.toInt() ?? 0,
      customerName: json['customerName'] as String? ?? 'Customer',
      restaurantId: (json['restaurantId'] as num?)?.toInt() ?? 0,
      restaurantName: json['restaurantName'] as String?,
      foodItemId: (json['foodItemId'] as num?)?.toInt(),
      foodName: json['foodName'] as String?,
      rating: (json['rating'] as num?)?.toInt() ?? 5,
      comment: json['comment'] as String?,
      createdAt: json['createdAt']?.toString(),
    );
  }

  @override
  List<Object?> get props => [id, orderId, customerId, rating, comment, createdAt];
}
