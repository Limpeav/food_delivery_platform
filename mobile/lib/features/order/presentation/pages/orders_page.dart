import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../core/widgets/cravery_empty_state.dart';
import '../../../../core/widgets/cravery_error_state.dart';
import '../../../../core/widgets/cravery_status_badge.dart';
import '../../../../core/widgets/skeleton_loader.dart';
import '../../../../shared/models/order_model.dart';
import '../../../review/data/review_repository.dart';
import '../../../review/presentation/widgets/review_modal.dart';
import '../bloc/order_bloc.dart';
import '../bloc/order_event.dart';
import '../bloc/order_state.dart';

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  final List<String> _filters = const ['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

  @override
  void initState() {
    super.initState();
    context.read<OrderBloc>().add(OrdersFetchRequested());
  }

  void _showCancelDialog(BuildContext context, int orderId) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDimensions.radiusLg)),
        title: Text('Cancel Order?', style: AppTextStyles.h3),
        content: Text(
          'Are you sure you want to cancel this order? This action cannot be undone.',
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
            onPressed: () {
              Navigator.of(dialogCtx).pop();
              context.read<OrderBloc>().add(OrderCancelRequested(orderId));
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
        title: const Text('My Orders'),
        centerTitle: false,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Filter Tabs
          _buildFilterTabs(),

          // Orders List
          Expanded(
            child: BlocBuilder<OrderBloc, OrderState>(
              builder: (context, state) {
                if (state is OrderLoading) {
                  return _buildLoadingSkeleton();
                }

                if (state is OrderError) {
                  return CraveryErrorState(
                    message: state.message,
                    onRetry: () => context.read<OrderBloc>().add(OrdersFetchRequested()),
                  );
                }

                if (state is OrderLoaded) {
                  if (state.filteredOrders.isEmpty) {
                    return RefreshIndicator(
                      color: AppColors.primary,
                      onRefresh: () async {
                        context.read<OrderBloc>().add(OrdersRefreshRequested());
                      },
                      child: ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: [
                          SizedBox(height: MediaQuery.of(context).size.height * 0.15),
                          CraveryEmptyState(
                            title: 'No Orders Found',
                            description: state.activeFilter == 'ALL'
                                ? 'You haven\'t placed any orders yet. Discover delicious dishes and order now!'
                                : 'No ${state.activeFilter.toLowerCase()} orders at this moment.',
                            buttonText: state.activeFilter == 'ALL' ? 'Explore Restaurants' : null,
                            onButtonPressed: state.activeFilter == 'ALL'
                                ? () => context.go(RouteNames.home)
                                : null,
                            icon: Icons.receipt_long_outlined,
                          ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    color: AppColors.primary,
                    onRefresh: () async {
                      context.read<OrderBloc>().add(OrdersRefreshRequested());
                    },
                    child: ListView.separated(
                      padding: const EdgeInsets.all(AppDimensions.md),
                      itemCount: state.filteredOrders.length,
                      separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.md),
                      itemBuilder: (context, index) {
                        final order = state.filteredOrders[index];
                        return _buildOrderCard(order);
                      },
                    ),
                  );
                }

                return const SizedBox.shrink();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTabs() {
    return BlocBuilder<OrderBloc, OrderState>(
      buildWhen: (prev, curr) => curr is OrderLoaded,
      builder: (context, state) {
        final activeFilter = state is OrderLoaded ? state.activeFilter : 'ALL';

        return Container(
          width: double.infinity,
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md, vertical: AppDimensions.sm),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _filters.map((filter) {
                final isSelected = activeFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: AppDimensions.sm),
                  child: FilterChip(
                    label: Text(
                      _formatFilterLabel(filter),
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                      ),
                    ),
                    selected: isSelected,
                    showCheckmark: false,
                    selectedColor: AppColors.primary,
                    backgroundColor: AppColors.surface,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppDimensions.radiusFull),
                      side: BorderSide(
                        color: isSelected ? AppColors.primary : AppColors.border,
                        width: 1,
                      ),
                    ),
                    onSelected: (_) {
                      context.read<OrderBloc>().add(OrderFilterChanged(filter));
                    },
                  ),
                );
              }).toList(),
            ),
          ),
        );
      },
    );
  }

  String _formatFilterLabel(String filter) {
    switch (filter) {
      case 'ACTIVE':
        return 'Active';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'ALL':
      default:
        return 'All Orders';
    }
  }

  Widget _buildOrderCard(OrderModel order) {
    final itemsSummary = order.items.map((i) => '${i.quantity}x ${i.foodName}').join(', ');

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
          onTap: () {
            context.push(RouteNames.orderDetailsPath(order.id));
          },
          child: Padding(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top row: Restaurant Name + Status Badge
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            order.restaurantName,
                            style: AppTextStyles.h3.copyWith(fontSize: 16),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Order #${order.id} • ${DateFormatter.formatDateTime(order.createdAt)}',
                            style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    CraveryStatusBadge(status: order.status),
                  ],
                ),
                const SizedBox(height: AppDimensions.sm),
                const Divider(height: 1, color: AppColors.border),
                const SizedBox(height: AppDimensions.sm),

                // Items list snippet
                if (itemsSummary.isNotEmpty)
                  Text(
                    itemsSummary,
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                const SizedBox(height: AppDimensions.sm),

                // Price & Action Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Total Amount',
                          style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
                        ),
                        Text(
                          CurrencyFormatter.format(order.totalAmount),
                          style: AppTextStyles.labelLarge.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (order.isCancellable)
                          Padding(
                            padding: const EdgeInsets.only(right: AppDimensions.xs),
                            child: OutlinedButton(
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.error,
                                side: const BorderSide(color: AppColors.error),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                                ),
                              ),
                              onPressed: () => _showCancelDialog(context, order.id),
                              child: const Text('Cancel', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                            ),
                          ),
                        if (order.isActive)
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                              ),
                            ),
                            icon: const Icon(Icons.delivery_dining_rounded, size: 16),
                            label: const Text('Track', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                            onPressed: () {
                              context.push(RouteNames.orderTrackingPath(order.id));
                            },
                          )
                        else if (order.status == 'DELIVERED')
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.primary,
                              side: const BorderSide(color: AppColors.primary),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                              ),
                            ),
                            icon: const Icon(Icons.star_outline_rounded, size: 16),
                            label: const Text('Rate', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                            onPressed: () => _openReviewModal(context, order),
                          )
                        else
                          TextButton(
                            onPressed: () {
                              context.push(RouteNames.orderDetailsPath(order.id));
                            },
                            child: Row(
                              children: [
                                Text('Details', style: AppTextStyles.labelSmall.copyWith(color: AppColors.primary)),
                                const SizedBox(width: 4),
                                const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppColors.primary),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingSkeleton() {
    return ListView.separated(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: 4,
      separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.md),
      itemBuilder: (_, __) => const SkeletonLoader(
        height: 140,
        borderRadius: AppDimensions.radiusLg,
      ),
    );
  }
}
