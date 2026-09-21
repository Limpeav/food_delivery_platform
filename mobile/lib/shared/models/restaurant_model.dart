import 'package:equatable/equatable.dart';

class RestaurantModel extends Equatable {
  final int id;
  final String name;
  final String? description;
  final String? logoUrl;
  final String? coverImageUrl;
  final String? phone;
  final String? address;
  final double? latitude;
  final double? longitude;
  final String? openingTime;
  final String? closingTime;
  final double deliveryFee;
  final double minimumOrder;
  final double rating;
  final int reviewCount;
  final String status;
  final int? categoryId;
  final String? categoryName;

  const RestaurantModel({
    required this.id,
    required this.name,
    this.description,
    this.logoUrl,
    this.coverImageUrl,
    this.phone,
    this.address,
    this.latitude,
    this.longitude,
    this.openingTime,
    this.closingTime,
    this.deliveryFee = 0.0,
    this.minimumOrder = 0.0,
    this.rating = 0.0,
    this.reviewCount = 0,
    this.status = 'APPROVED',
    this.categoryId,
    this.categoryName,
  });

  factory RestaurantModel.fromJson(Map<String, dynamic> json) {
    return RestaurantModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name'] as String? ?? '',
      description: json['description'] as String?,
      logoUrl: json['logoUrl'] as String?,
      coverImageUrl: json['coverImageUrl'] as String?,
      phone: json['phone'] as String?,
      address: json['address'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      openingTime: json['openingTime'] as String?,
      closingTime: json['closingTime'] as String?,
      deliveryFee: (json['deliveryFee'] as num?)?.toDouble() ?? 0.0,
      minimumOrder: (json['minimumOrder'] as num?)?.toDouble() ?? 0.0,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      status: json['status'] as String? ?? 'APPROVED',
      categoryId: (json['categoryId'] as num?)?.toInt(),
      categoryName: json['categoryName'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'description': description,
    'logoUrl': logoUrl,
    'coverImageUrl': coverImageUrl,
    'phone': phone,
    'address': address,
    'latitude': latitude,
    'longitude': longitude,
    'openingTime': openingTime,
    'closingTime': closingTime,
    'deliveryFee': deliveryFee,
    'minimumOrder': minimumOrder,
    'rating': rating,
    'reviewCount': reviewCount,
    'status': status,
    'categoryId': categoryId,
    'categoryName': categoryName,
  };

  bool get isOpen => status == 'APPROVED';

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        logoUrl,
        coverImageUrl,
        rating,
        reviewCount,
        status,
        deliveryFee,
        minimumOrder,
      ];
}
