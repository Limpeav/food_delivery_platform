import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/notification_repository.dart';
import 'notification_state.dart';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final NotificationRepository _notificationRepository;

  NotificationBloc({required NotificationRepository notificationRepository})
      : _notificationRepository = notificationRepository,
        super(NotificationInitial()) {
    on<NotificationsFetchRequested>(_onNotificationsFetchRequested);
    on<NotificationMarkReadRequested>(_onNotificationMarkReadRequested);
    on<NotificationMarkAllReadRequested>(_onNotificationMarkAllReadRequested);
    on<NotificationReceivedViaWs>(_onNotificationReceivedViaWs);
  }

  Future<void> _onNotificationsFetchRequested(
    NotificationsFetchRequested event,
    Emitter<NotificationState> emit,
  ) async {
    emit(NotificationLoading());
    try {
      final results = await Future.wait([
        _notificationRepository.getNotifications(),
        _notificationRepository.getUnreadCount(),
      ]);

      final notifications = results[0] as dynamic;
      final count = results[1] as int;

      emit(
        NotificationLoaded(
          notifications: notifications,
          unreadCount: count,
        ),
      );
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onNotificationMarkReadRequested(
    NotificationMarkReadRequested event,
    Emitter<NotificationState> emit,
  ) async {
    if (state is NotificationLoaded) {
      final current = state as NotificationLoaded;
      final updatedList = current.notifications.map((n) {
        return n.id == event.id ? n.copyWith(isRead: true) : n;
      }).toList();

      final newCount = (current.unreadCount - 1).clamp(0, 999);
      emit(NotificationLoaded(notifications: updatedList, unreadCount: newCount));

      try {
        await _notificationRepository.markAsRead(event.id);
      } catch (_) {}
    }
  }

  Future<void> _onNotificationMarkAllReadRequested(
    NotificationMarkAllReadRequested event,
    Emitter<NotificationState> emit,
  ) async {
    if (state is NotificationLoaded) {
      final current = state as NotificationLoaded;
      final updatedList = current.notifications.map((n) => n.copyWith(isRead: true)).toList();
      emit(NotificationLoaded(notifications: updatedList, unreadCount: 0));

      try {
        await _notificationRepository.markAllAsRead();
      } catch (_) {}
    }
  }

  void _onNotificationReceivedViaWs(
    NotificationReceivedViaWs event,
    Emitter<NotificationState> emit,
  ) {
    if (state is NotificationLoaded) {
      final current = state as NotificationLoaded;
      emit(
        NotificationLoaded(
          notifications: [event.notification, ...current.notifications],
          unreadCount: current.unreadCount + 1,
        ),
      );
    }
  }
}
