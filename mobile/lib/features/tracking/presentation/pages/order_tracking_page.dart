import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/websocket/websocket_service.dart';
import '../../../../core/widgets/cravery_button.dart';
import '../../../../core/widgets/cravery_error_state.dart';
import '../../../../core/widgets/cravery_status_badge.dart';
import '../../../../core/widgets/skeleton_loader.dart';
import '../../../order/data/order_repository.dart';
import '../bloc/tracking_bloc.dart';
import '../bloc/tracking_event.dart';
import '../bloc/tracking_state.dart';
import '../widgets/interactive_delivery_map.dart';
import '../widgets/order_timeline_widget.dart';

class OrderTrackingPage extends StatelessWidget {
  final int orderId;

  const OrderTrackingPage({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return BlocProvider<TrackingBloc>(
      create: (ctx) => TrackingBloc(
        orderRepository: ctx.read<OrderRepository>(),
        webSocketService: ctx.read<WebSocketService>(),
      )..add(TrackingStartRequested(orderId)),
      child: _OrderTrackingView(orderId: orderId),
    );
  }
}

class _OrderTrackingView extends StatelessWidget {
  final int orderId;

  const _OrderTrackingView({required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Track Order #$orderId'),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          tooltip: 'Back to Home',
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go(RouteNames.home);
            }
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.home_rounded, color: AppColors.primary),
            tooltip: 'Home',
            onPressed: () => context.go(RouteNames.home),
          ),
          BlocBuilder<TrackingBloc, TrackingState>(
            builder: (context, state) {
              final isLive = state is TrackingLoaded && state.isWsConnected;
              return Container(
                margin: const EdgeInsets.only(right: AppDimensions.md),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isLive ? AppColors.success.withValues(alpha: 0.1) : AppColors.surface,
                  borderRadius: BorderRadius.circular(AppDimensions.radiusFull),
                  border: Border.all(
                    color: isLive ? AppColors.success : AppColors.border,
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: isLive ? AppColors.success : AppColors.textMuted,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      isLive ? 'LIVE' : 'SYNCING',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: isLive ? AppColors.success : AppColors.textMuted,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<TrackingBloc, TrackingState>(
        builder: (context, state) {
          if (state is TrackingLoading) {
            return _buildSkeleton();
          }

          if (state is TrackingError) {
            return CraveryErrorState(
              message: state.message,
              onRetry: () {
                context.read<TrackingBloc>().add(TrackingStartRequested(orderId));
              },
            );
          }

          if (state is TrackingLoaded) {
            final order = state.order;

            return RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () async {
                context.read<TrackingBloc>().add(TrackingStartRequested(orderId));
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(AppDimensions.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Estimated Status Banner
                    _buildEstimatedStatusBanner(order.status),
                    const SizedBox(height: AppDimensions.md),

                    // Interactive Live Delivery Map
                    InteractiveDeliveryMap(
                      restaurantLat: order.restaurantLatitude,
                      restaurantLng: order.restaurantLongitude,
                      customerLat: order.deliveryLatitude,
                      customerLng: order.deliveryLongitude,
                      driverLat: state.currentDriverLat,
                      driverLng: state.currentDriverLng,
                      status: order.status,
                      driverName: order.driverName,
                      vehicleNumber: order.vehicleNumber,
                    ),
                    const SizedBox(height: AppDimensions.md),

                    // Driver Profile Card (when driver assigned)
                    if (order.driverName != null) ...[
                      _buildDriverContactCard(context, order),
                      const SizedBox(height: AppDimensions.md),
                    ],

                    // Restaurant & Destination Summary
                    _buildDestinationCard(order),
                    const SizedBox(height: AppDimensions.md),

                    // Order Step Timeline
                    OrderTimelineWidget(currentStatus: order.status),
                    const SizedBox(height: AppDimensions.lg),

                    // View Full Order Details button
                    CraveryButton(
                      text: 'View Full Order Details',
                      type: CraveryButtonType.outlined,
                      onPressed: () {
                        context.push(RouteNames.orderDetailsPath(order.id));
                      },
                    ),
                    const SizedBox(height: AppDimensions.sm),

                    // Back to Home button
                    CraveryButton(
                      text: 'Back to Home',
                      type: CraveryButtonType.primary,
                      icon: Icons.home_rounded,
                      onPressed: () {
                        context.go(RouteNames.home);
                      },
                    ),
                    const SizedBox(height: AppDimensions.xl),
                  ],
                ),
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildEstimatedStatusBanner(String status) {
    String headline;
    String subtext;
    IconData icon;
    Color color;

    switch (status) {
      case 'PENDING':
        headline = 'Order Sent';
        subtext = 'Waiting for restaurant confirmation...';
        icon = Icons.hourglass_top_rounded;
        color = AppColors.warning;
        break;
      case 'CONFIRMED':
        headline = 'Order Confirmed';
        subtext = 'Restaurant accepted your order and will start cooking soon.';
        icon = Icons.check_circle_outline_rounded;
        color = AppColors.info;
        break;
      case 'PREPARING':
        headline = 'Preparing Your Feast';
        subtext = 'Fresh ingredients are in the pan! Getting ready for pickup.';
        icon = Icons.restaurant_rounded;
        color = AppColors.primary;
        break;
      case 'READY_FOR_PICKUP':
        headline = 'Ready for Pickup';
        subtext = 'Your food is packaged and waiting for the delivery partner.';
        icon = Icons.inventory_2_outlined;
        color = AppColors.primary;
        break;
      case 'OUT_FOR_DELIVERY':
        headline = 'On The Way!';
        subtext = 'Driver is rushing towards your delivery address.';
        icon = Icons.delivery_dining_rounded;
        color = AppColors.success;
        break;
      case 'DELIVERED':
        headline = 'Order Delivered';
        subtext = 'Enjoy your delicious meal! Bon appétit.';
        icon = Icons.done_all_rounded;
        color = AppColors.success;
        break;
      case 'CANCELLED':
      case 'REJECTED':
        headline = 'Order Cancelled';
        subtext = 'This order has been cancelled.';
        icon = Icons.cancel_outlined;
        color = AppColors.error;
        break;
      default:
        headline = 'Order in Progress';
        subtext = 'Your order is being processed.';
        icon = Icons.info_outline_rounded;
        color = AppColors.primary;
    }

    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(width: AppDimensions.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(headline, style: AppTextStyles.h3.copyWith(fontSize: 17)),
                const SizedBox(height: 2),
                Text(
                  subtext,
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary, fontSize: 13),
                ),
              ],
            ),
          ),
          CraveryStatusBadge(status: status),
        ],
      ),
    );
  }

  Widget _buildDriverContactCard(BuildContext context, dynamic order) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: AppColors.primary.withValues(alpha: 0.1),
            child: const Icon(Icons.person_rounded, color: AppColors.primary, size: 28),
          ),
          const SizedBox(width: AppDimensions.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(order.driverName ?? 'Driver', style: AppTextStyles.labelLarge),
                if (order.vehicleNumber != null || order.vehicleType != null)
                  Text(
                    '${order.vehicleType ?? 'Vehicle'} • ${order.vehicleNumber ?? ''}',
                    style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                  ),
                const SizedBox(height: 2),
                Text(
                  'Your delivery partner',
                  style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          if (order.driverPhone != null)
            IconButton.filled(
              style: IconButton.styleFrom(
                backgroundColor: AppColors.success,
                foregroundColor: Colors.white,
              ),
              icon: const Icon(Icons.phone_rounded, size: 20),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Calling ${order.driverName}: ${order.driverPhone}'),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildDestinationCard(dynamic order) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.storefront_rounded, size: 20, color: AppColors.textSecondary),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('From', style: AppTextStyles.caption.copyWith(color: AppColors.textMuted)),
                    Text(
                      order.restaurantName,
                      style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 8),
            child: Divider(height: 1, color: AppColors.border),
          ),
          Row(
            children: [
              const Icon(Icons.location_on_rounded, size: 20, color: AppColors.primary),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Delivering to', style: AppTextStyles.caption.copyWith(color: AppColors.textMuted)),
                    Text(
                      order.deliveryAddress,
                      style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSkeleton() {
    return Padding(
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Column(
        children: const [
          SkeletonLoader(height: 80, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.md),
          SkeletonLoader(height: 240, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.md),
          SkeletonLoader(height: 100, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.md),
          SkeletonLoader(height: 200, borderRadius: AppDimensions.radiusLg),
        ],
      ),
    );
  }
}
