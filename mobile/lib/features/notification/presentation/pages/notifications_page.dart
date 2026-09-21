import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../core/widgets/cravery_empty_state.dart';
import '../../../../core/widgets/cravery_error_state.dart';
import '../../../../core/widgets/skeleton_loader.dart';
import '../../../../shared/models/notification_model.dart';
import '../bloc/notification_bloc.dart';
import '../bloc/notification_state.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  @override
  void initState() {
    super.initState();
    context.read<NotificationBloc>().add(NotificationsFetchRequested());
  }

  void _handleNotificationTap(BuildContext context, NotificationModel item) {
    if (!item.isRead) {
      context.read<NotificationBloc>().add(NotificationMarkReadRequested(item.id));
    }

    if (item.referenceId != null && item.referenceId!.isNotEmpty) {
      final orderId = int.tryParse(item.referenceId!);
      if (orderId != null) {
        context.push(RouteNames.orderDetailsPath(orderId));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Notifications'),
        centerTitle: false,
        actions: [
          BlocBuilder<NotificationBloc, NotificationState>(
            builder: (context, state) {
              if (state is NotificationLoaded && state.unreadCount > 0) {
                return TextButton(
                  onPressed: () {
                    context.read<NotificationBloc>().add(NotificationMarkAllReadRequested());
                  },
                  child: Text(
                    'Mark all as read',
                    style: AppTextStyles.labelSmall.copyWith(color: AppColors.primary),
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
      body: BlocBuilder<NotificationBloc, NotificationState>(
        builder: (context, state) {
          if (state is NotificationLoading) {
            return _buildSkeleton();
          }

          if (state is NotificationError) {
            return CraveryErrorState(
              message: state.message,
              onRetry: () => context.read<NotificationBloc>().add(NotificationsFetchRequested()),
            );
          }

          if (state is NotificationLoaded) {
            if (state.notifications.isEmpty) {
              return CraveryEmptyState(
                title: 'No Notifications Yet',
                description: 'You\'ll receive updates here about order confirmations, delivery status, and exclusive discounts.',
                icon: Icons.notifications_none_rounded,
              );
            }

            return RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () async {
                context.read<NotificationBloc>().add(NotificationsFetchRequested());
              },
              child: ListView.separated(
                padding: const EdgeInsets.all(AppDimensions.md),
                itemCount: state.notifications.length,
                separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
                itemBuilder: (context, index) {
                  final item = state.notifications[index];
                  return _buildNotificationCard(context, item);
                },
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildNotificationCard(BuildContext context, NotificationModel item) {
    IconData icon;
    Color iconColor;
    Color iconBg;

    final type = (item.type ?? '').toUpperCase();
    if (type.contains('ORDER')) {
      icon = Icons.receipt_long_rounded;
      iconColor = AppColors.primary;
      iconBg = AppColors.primary.withValues(alpha: 0.1);
    } else if (type.contains('PROMO') || type.contains('DISCOUNT') || type.contains('COUPON')) {
      icon = Icons.local_offer_rounded;
      iconColor = const Color(0xFFF59E0B);
      iconBg = const Color(0xFFF59E0B).withValues(alpha: 0.1);
    } else if (type.contains('DELIVERY')) {
      icon = Icons.delivery_dining_rounded;
      iconColor = AppColors.success;
      iconBg = AppColors.success.withValues(alpha: 0.1);
    } else {
      icon = Icons.notifications_rounded;
      iconColor = AppColors.info;
      iconBg = AppColors.info.withValues(alpha: 0.1);
    }

    return Container(
      decoration: BoxDecoration(
        color: item.isRead ? Colors.white : const Color(0xFFFFF8F5),
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(
          color: item.isRead ? AppColors.border : AppColors.primary.withValues(alpha: 0.3),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
          onTap: () => _handleNotificationTap(context, item),
          child: Padding(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icon Bubble
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: iconBg,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: iconColor, size: 22),
                ),
                const SizedBox(width: AppDimensions.md),

                // Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              item.title,
                              style: AppTextStyles.labelLarge.copyWith(
                                fontWeight: item.isRead ? FontWeight.w600 : FontWeight.w800,
                              ),
                            ),
                          ),
                          if (!item.isRead) ...[
                            const SizedBox(width: 6),
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.message,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: item.isRead ? AppColors.textSecondary : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        DateFormatter.formatDateTime(item.createdAt),
                        style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSkeleton() {
    return Padding(
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Column(
        children: const [
          SkeletonLoader(height: 90, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.sm),
          SkeletonLoader(height: 90, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.sm),
          SkeletonLoader(height: 90, borderRadius: AppDimensions.radiusLg),
        ],
      ),
    );
  }
}
