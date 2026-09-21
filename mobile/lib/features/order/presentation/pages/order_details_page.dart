import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../core/widgets/cravery_button.dart';
import '../../../../core/widgets/cravery_error_state.dart';
import '../../../../core/widgets/cravery_status_badge.dart';
import '../../../../core/widgets/skeleton_loader.dart';
import '../../../../shared/models/order_model.dart';
import '../../../review/data/review_repository.dart';
import '../../../review/presentation/widgets/review_modal.dart';
import '../../data/order_repository.dart';
import '../bloc/order_bloc.dart';
import '../bloc/order_event.dart';

class OrderDetailsPage extends StatefulWidget {
  final int orderId;

  const OrderDetailsPage({super.key, required this.orderId});

  @override
  State<OrderDetailsPage> createState() => _OrderDetailsPageState();
}

class _OrderDetailsPageState extends State<OrderDetailsPage> {
  late Future<OrderModel> _orderFuture;

  @override
  void initState() {
    super.initState();
    _loadOrder();
  }

  void _loadOrder() {
    setState(() {
      _orderFuture = context.read<OrderRepository>().getOrderDetails(widget.orderId);
    });
  }

  void _showCancelDialog(BuildContext context, OrderModel order) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDimensions.radiusLg)),
        title: Text('Cancel Order?', style: AppTextStyles.h3),
        content: Text(
          'Are you sure you want to cancel order #${order.id}? This action cannot be reversed.',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: Text('Keep Order', style: AppTextStyles.labelMedium.copyWith(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDimensions.radiusMd)),
            ),
            onPressed: () async {
              Navigator.of(dialogCtx).pop();
              try {
                await context.read<OrderRepository>().cancelOrder(order.id);
                if (mounted) {
                  context.read<OrderBloc>().add(OrdersRefreshRequested());
                  _loadOrder();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Order has been cancelled successfully.'),
                      backgroundColor: AppColors.textPrimary,
                    ),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to cancel order: $e'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
            },
            child: Text('Yes, Cancel', style: AppTextStyles.labelMedium.copyWith(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _openReviewModal(BuildContext context, OrderModel order) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppDimensions.radiusXl)),
      ),
      builder: (ctx) => ReviewModal(
        orderId: order.id,
        restaurantName: order.restaurantName,
        reviewRepository: context.read<ReviewRepository>(),
        onReviewSubmitted: () {
          _loadOrder();
          context.read<OrderBloc>().add(OrdersRefreshRequested());
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Order #${widget.orderId}'),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          tooltip: 'Back',
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
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: _loadOrder,
          ),
        ],
      ),
      body: FutureBuilder<OrderModel>(
        future: _orderFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return _buildSkeleton();
          }

          if (snapshot.hasError) {
            return CraveryErrorState(
              message: snapshot.error.toString(),
              onRetry: _loadOrder,
            );
          }

          final order = snapshot.data!;
          return _buildOrderContent(order);
        },
      ),
    );
  }

  Widget _buildOrderContent(OrderModel order) {
    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Status Header Card
                _buildStatusHeader(order),
                const SizedBox(height: AppDimensions.md),

                // Driver Card if active and assigned
                if (order.driverName != null) ...[
                  _buildDriverCard(order),
                  const SizedBox(height: AppDimensions.md),
                ],

                // Restaurant Details Card
                _buildRestaurantCard(order),
                const SizedBox(height: AppDimensions.md),

                // Delivery Address Card
                _buildDeliveryAddressCard(order),
                const SizedBox(height: AppDimensions.md),

                // Items List Card
                _buildOrderItemsCard(order),
                const SizedBox(height: AppDimensions.md),

                // Payment & Pricing Breakdown Card
                _buildBillBreakdownCard(order),
                const SizedBox(height: AppDimensions.xxl),
              ],
            ),
          ),
        ),

        // Bottom Action Bar
        _buildBottomBar(order),
      ],
    );
  }

  Widget _buildStatusHeader(OrderModel order) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Status',
                  style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
                ),
                const SizedBox(height: 4),
                Text(
                  _getStatusDescription(order.status),
                  style: AppTextStyles.labelMedium.copyWith(color: AppColors.textPrimary),
                ),
                const SizedBox(height: 4),
                Text(
                  'Placed on ${DateFormatter.formatDateTime(order.createdAt)}',
                  style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          CraveryStatusBadge(status: order.status),
        ],
      ),
    );
  }

  String _getStatusDescription(String status) {
    switch (status) {
      case 'PENDING':
        return 'Waiting for restaurant confirmation';
      case 'CONFIRMED':
        return 'Restaurant confirmed your order';
      case 'PREPARING':
        return 'Chef is preparing your food';
      case 'READY_FOR_PICKUP':
        return 'Order is ready for pickup';
      case 'OUT_FOR_DELIVERY':
        return 'Driver is heading your way';
      case 'DELIVERED':
        return 'Delivered successfully';
      case 'CANCELLED':
        return 'Order was cancelled';
      case 'REJECTED':
        return 'Order was rejected';
      default:
        return status;
    }
  }

  Widget _buildDriverCard(OrderModel order) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.delivery_dining_rounded, color: AppColors.primary, size: 28),
          ),
          const SizedBox(width: AppDimensions.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order.driverName ?? 'Assigned Driver',
                  style: AppTextStyles.labelLarge,
                ),
                if (order.vehicleType != null || order.vehicleNumber != null)
                  Text(
                    '${order.vehicleType ?? 'Vehicle'} • ${order.vehicleNumber ?? ''}',
                    style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                  ),
                if (order.driverPhone != null)
                  Text(
                    order.driverPhone!,
                    style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
                  ),
              ],
            ),
          ),
          if (order.driverPhone != null)
            Container(
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.phone_rounded, color: AppColors.success, size: 20),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Calling driver: ${order.driverPhone}'),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildRestaurantCard(OrderModel order) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.storefront_rounded, size: 20, color: AppColors.primary),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Text(
                  order.restaurantName,
                  style: AppTextStyles.h3.copyWith(fontSize: 16),
                ),
              ),
            ],
          ),
          if (order.restaurantAddress != null) ...[
            const SizedBox(height: 6),
            Text(
              order.restaurantAddress!,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
            ),
          ],
          if (order.restaurantPhone != null) ...[
            const SizedBox(height: 4),
            Text(
              'Tel: ${order.restaurantPhone!}',
              style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDeliveryAddressCard(OrderModel order) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.location_on_rounded, size: 20, color: AppColors.primary),
              const SizedBox(width: AppDimensions.sm),
              Text('Delivery Address', style: AppTextStyles.labelLarge),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            order.deliveryAddress,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          if (order.notes != null && order.notes!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
              ),
              child: Row(
                children: [
                  const Icon(Icons.note_alt_outlined, size: 16, color: AppColors.textMuted),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Note: ${order.notes!}',
                      style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildOrderItemsCard(OrderModel order) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Order Items (${order.items.length})', style: AppTextStyles.labelLarge),
          const SizedBox(height: AppDimensions.sm),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: AppDimensions.sm),
          ...order.items.map((item) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '${item.quantity}x',
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppDimensions.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.foodName, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                        Text(
                          '${CurrencyFormatter.format(item.price)} each',
                          style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    CurrencyFormatter.format(item.subtotal),
                    style: AppTextStyles.labelMedium,
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildBillBreakdownCard(OrderModel order) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Payment Summary', style: AppTextStyles.labelLarge),
          const SizedBox(height: AppDimensions.sm),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: AppDimensions.sm),
          _buildBillRow('Subtotal', CurrencyFormatter.format(order.subtotal)),
          const SizedBox(height: 6),
          _buildBillRow('Delivery Fee', CurrencyFormatter.format(order.deliveryFee)),
          if (order.discount > 0) ...[
            const SizedBox(height: 6),
            _buildBillRow(
              order.couponCode != null ? 'Discount (${order.couponCode})' : 'Discount',
              '-${CurrencyFormatter.format(order.discount)}',
              valueColor: AppColors.success,
            ),
          ],
          const SizedBox(height: AppDimensions.sm),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: AppDimensions.sm),
          _buildBillRow(
            'Total Amount',
            CurrencyFormatter.format(order.totalAmount),
            isBold: true,
            valueColor: AppColors.primary,
          ),
          const SizedBox(height: AppDimensions.md),
          Container(
            padding: const EdgeInsets.all(AppDimensions.sm),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      order.paymentMethod == 'ONLINE_PAYMENT'
                          ? Icons.qr_code_rounded
                          : Icons.payments_outlined,
                      size: 20,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    Text(
                      order.paymentMethod == 'ONLINE_PAYMENT' ? 'KHQR Online Payment' : 'Cash on Delivery',
                      style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: (order.paymentStatus == 'PAID' || order.paymentStatus == 'COMPLETED')
                        ? AppColors.success.withValues(alpha: 0.1)
                        : AppColors.warning.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                  ),
                  child: Text(
                    order.paymentStatus ?? 'PENDING',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: (order.paymentStatus == 'PAID' || order.paymentStatus == 'COMPLETED')
                          ? AppColors.success
                          : AppColors.warning,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBillRow(String label, String value, {bool isBold = false, Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: isBold ? AppTextStyles.labelLarge : AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
        ),
        Text(
          value,
          style: (isBold ? AppTextStyles.h3.copyWith(fontSize: 18) : AppTextStyles.labelMedium).copyWith(
            color: valueColor ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildBottomBar(OrderModel order) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(top: BorderSide(color: AppColors.border)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (order.isCancellable)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(right: AppDimensions.sm),
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                      ),
                    ),
                    onPressed: () => _showCancelDialog(context, order),
                    child: const Text('Cancel Order', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
              ),
            if (order.isActive)
              Expanded(
                flex: 2,
                child: CraveryButton(
                  text: 'Track Delivery',
                  icon: Icons.delivery_dining_rounded,
                  onPressed: () {
                    context.push(RouteNames.orderTrackingPath(order.id));
                  },
                ),
              )
            else if (order.status == 'DELIVERED')
              Expanded(
                child: CraveryButton(
                  text: 'Leave a Review',
                  icon: Icons.star_outline_rounded,
                  onPressed: () => _openReviewModal(context, order),
                ),
              )
            else
              Expanded(
                child: CraveryButton(
                  text: 'Back to Orders',
                  type: CraveryButtonType.secondary,
                  onPressed: () => context.pop(),
                ),
              ),
          ],
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
          SizedBox(height: AppDimensions.md),
          SkeletonLoader(height: 110, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.md),
          SkeletonLoader(height: 160, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.md),
          SkeletonLoader(height: 140, borderRadius: AppDimensions.radiusLg),
        ],
      ),
    );
  }
}
