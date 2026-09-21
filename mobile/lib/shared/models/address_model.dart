import 'package:equatable/equatable.dart';

class AddressModel extends Equatable {
  final int id;
  final int userId;
  final String label;
  final String recipientName;
  final String phoneNumber;
  final String addressLine;
  final String city;
  final double? latitude;
  final double? longitude;
  final bool isDefault;

  const AddressModel({
    required this.id,
    required this.userId,
    required this.label,
    required this.recipientName,
    required this.phoneNumber,
    required this.addressLine,
    required this.city,
    this.latitude,
    this.longitude,
    this.isDefault = false,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      userId: (json['userId'] as num?)?.toInt() ?? 0,
      label: json['label'] as String? ?? 'Home',
      recipientName: json['recipientName'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      addressLine: json['addressLine'] as String? ?? '',
      city: json['city'] as String? ?? '',
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'label': label,
    'recipientName': recipientName,
    'phoneNumber': phoneNumber,
    'addressLine': addressLine,
    'city': city,
    'latitude': latitude,
    'longitude': longitude,
    'isDefault': isDefault,
  };

  AddressModel copyWith({
    String? label,
    String? recipientName,
    String? phoneNumber,
    String? addressLine,
    String? city,
    double? latitude,
    double? longitude,
    bool? isDefault,
  }) {
    return AddressModel(
      id: id,
      userId: userId,
      label: label ?? this.label,
      recipientName: recipientName ?? this.recipientName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      addressLine: addressLine ?? this.addressLine,
      city: city ?? this.city,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      isDefault: isDefault ?? this.isDefault,
    );
  }

  @override
  List<Object?> get props => [id, userId, label, recipientName, phoneNumber, addressLine, city, isDefault];
}
