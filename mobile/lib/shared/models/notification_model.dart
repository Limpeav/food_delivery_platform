import 'package:equatable/equatable.dart';

class NotificationModel extends Equatable {
  final int id;
  final int userId;
  final String title;
  final String message;
  final String? type;
  final String? referenceId;
  final bool isRead;
  final String? createdAt;

  const NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    this.type,
    this.referenceId,
    this.isRead = false,
    this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      userId: (json['userId'] as num?)?.toInt() ?? 0,
      title: json['title'] as String? ?? '',
      message: json['message'] as String? ?? '',
      type: json['type'] as String?,
      referenceId: json['referenceId']?.toString(),
      isRead: json['isRead'] as bool? ?? (json['read'] as bool? ?? false),
      createdAt: json['createdAt']?.toString(),
    );
  }

  NotificationModel copyWith({bool? isRead}) {
    return NotificationModel(
      id: id,
      userId: userId,
      title: title,
      message: message,
      type: type,
      referenceId: referenceId,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt,
    );
  }

  @override
  List<Object?> get props => [id, userId, title, message, isRead, createdAt];
}
