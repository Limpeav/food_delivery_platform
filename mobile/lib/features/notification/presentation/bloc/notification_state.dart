import 'package:equatable/equatable.dart';
import '../../../../shared/models/notification_model.dart';

abstract class NotificationEvent extends Equatable {
  const NotificationEvent();

  @override
  List<Object?> get props => [];
}

class NotificationsFetchRequested extends NotificationEvent {}

class NotificationMarkReadRequested extends NotificationEvent {
  final int id;

  const NotificationMarkReadRequested(this.id);

  @override
  List<Object?> get props => [id];
}

class NotificationMarkAllReadRequested extends NotificationEvent {}

class NotificationReceivedViaWs extends NotificationEvent {
  final NotificationModel notification;

  const NotificationReceivedViaWs(this.notification);

  @override
  List<Object?> get props => [notification];
}

abstract class NotificationState extends Equatable {
  const NotificationState();

  @override
  List<Object?> get props => [];
}

class NotificationInitial extends NotificationState {}

class NotificationLoading extends NotificationState {}

class NotificationLoaded extends NotificationState {
  final List<NotificationModel> notifications;
  final int unreadCount;

  const NotificationLoaded({
    required this.notifications,
    required this.unreadCount,
  });

  @override
  List<Object?> get props => [notifications, unreadCount];
}

class NotificationError extends NotificationState {
  final String message;

  const NotificationError(this.message);

  @override
  List<Object?> get props => [message];
}
