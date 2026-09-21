import 'package:equatable/equatable.dart';

class PromotionModel extends Equatable {
  final int id;
  final int? restaurantId;
  final String? restaurantName;
  final String title;
  final String? description;
  final String? bannerUrl;
  final double discountPercentage;
  final String? startDate;
  final String? endDate;
  final bool active;

  const PromotionModel({
    required this.id,
    this.restaurantId,
    this.restaurantName,
    required this.title,
    this.description,
    this.bannerUrl,
    this.discountPercentage = 0.0,
    this.startDate,
    this.endDate,
    this.active = true,
  });

  factory PromotionModel.fromJson(Map<String, dynamic> json) {
    return PromotionModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      restaurantId: (json['restaurantId'] as num?)?.toInt(),
      restaurantName: json['restaurantName'] as String?,
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      bannerUrl: json['bannerUrl'] as String?,
      discountPercentage: (json['discountPercentage'] as num?)?.toDouble() ?? 0.0,
      startDate: json['startDate']?.toString(),
      endDate: json['endDate']?.toString(),
      active: json['active'] as bool? ?? true,
    );
  }

  @override
  List<Object?> get props => [id, title, discountPercentage, bannerUrl, active];
}
