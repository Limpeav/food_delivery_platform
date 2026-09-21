import 'package:equatable/equatable.dart';

class UserModel extends Equatable {
  final int id;
  final String name;
  final String email;
  final String? phoneNumber;
  final bool phoneVerified;
  final String? googleSubject;
  final String? profileImageUrl;
  final String role;
  final String? status;
  final String? createdAt;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phoneNumber,
    this.phoneVerified = false,
    this.googleSubject,
    this.profileImageUrl,
    required this.role,
    this.status,
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String?,
      phoneVerified: json['phoneVerified'] == true,
      googleSubject: json['googleSubject'] as String?,
      profileImageUrl: json['profileImageUrl'] as String?,
      role: json['role'] as String? ?? 'CUSTOMER',
      status: json['status'] as String?,
      createdAt: json['createdAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'phoneNumber': phoneNumber,
    'phoneVerified': phoneVerified,
    'googleSubject': googleSubject,
    'profileImageUrl': profileImageUrl,
    'role': role,
    'status': status,
    'createdAt': createdAt,
  };

  UserModel copyWith({
    String? name,
    String? phoneNumber,
    bool? phoneVerified,
    String? profileImageUrl,
  }) {
    return UserModel(
      id: id,
      name: name ?? this.name,
      email: email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      phoneVerified: phoneVerified ?? this.phoneVerified,
      googleSubject: googleSubject,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      role: role,
      status: status,
      createdAt: createdAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        email,
        phoneNumber,
        phoneVerified,
        googleSubject,
        profileImageUrl,
        role,
        status,
      ];
}
