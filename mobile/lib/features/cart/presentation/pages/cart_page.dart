import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/widgets/cravery_button.dart';
import '../../../../core/widgets/cravery_empty_state.dart';
import '../bloc/cart_bloc.dart';
import '../bloc/cart_event.dart';
import '../bloc/cart_state.dart';

class CartPage extends StatelessWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Cart'),
        actions: [
          BlocBuilder<CartBloc, CartState>(
            builder: (context, state) {
              if (state.cart.isEmpty) return const SizedBox.shrink();
              return TextButton(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                      ),
                      title: const Text('Clear Cart?'),
                      content: const Text('Are you sure you want to remove all items from your cart?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(ctx).pop(),
                          child: const Text('Cancel'),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.of(ctx).pop();
                            context.read<CartBloc>().add(CartClearRequested());
                          },
                          child: const Text('Clear', style: TextStyle(color: AppColors.error)),
                        ),
                      ],
                    ),
                  );
                },
                child: const Text(
                  'Clear',
                  style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600),
                ),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<CartBloc, CartState>(
        builder: (context, state) {
          final cart = state.cart;

          if (cart.isEmpty) {
            return CraveryEmptyState(
              icon: Icons.shopping_basket_outlined,
              title: 'Your cart is empty',
              message: 'Add items from restaurants to start your order.',
              actionText: 'Explore Restaurants',
              onAction: () => context.go(RouteNames.home),
            );
          }

          return Column(
            children: [
              // Restaurant Banner Header
              if (cart.restaurantName != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppDimensions.lg,
                    vertical: AppDimensions.md,
                  ),
                  color: Colors.white,
                  child: Row(
                    children: [
                      const Icon(Icons.storefront_rounded, color: AppColors.primary, size: 20),
                      const SizedBox(width: AppDimensions.sm),
                      Expanded(
                        child: Text(
                          cart.restaurantName!,
                          style: AppTextStyles.h4,
                        ),
                      ),
                      Text(
                        '${cart.totalItems} items',
                        style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: AppDimensions.sm),

              // Cart Items List
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(AppDimensions.lg),
                  itemCount: cart.items.length,
                  separatorBuilder: (context, index) => const SizedBox(height: AppDimensions.sm),
                  itemBuilder: (context, index) {
                    final item = cart.items[index];

                    return Container(
                      padding: const EdgeInsets.all(AppDimensions.md),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          // Item Image
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                              child: item.foodImageUrl != null && item.foodImageUrl!.isNotEmpty
                                  ? CachedNetworkImage(
                                      imageUrl: item.foodImageUrl!,
                                      fit: BoxFit.cover,
                                      errorWidget: (context, url, error) => const Icon(
                                        Icons.fastfood_rounded,
                                        color: AppColors.primary,
                                        size: 24,
                                      ),
                                    )
                                  : const Icon(
                                      Icons.fastfood_rounded,
                                      color: AppColors.primary,
                                      size: 24,
                                    ),
                            ),
                          ),
                          const SizedBox(width: AppDimensions.md),

                          // Title & Price
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.foodName,
                                  style: AppTextStyles.h4,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (item.selectedOptions != null && item.selectedOptions!.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 2),
                                    child: Text(
                                      item.selectedOptions!,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: Color(0xFF92400E),
                                        fontWeight: FontWeight.w500,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                const SizedBox(height: 2),
                                Text(
                                  CurrencyFormatter.format(item.price),
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Quantity Controls
                          Container(
                            decoration: BoxDecoration(
                              color: AppColors.background,
                              borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              children: [
                                IconButton(
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                  icon: Icon(
                                    item.quantity == 1 ? Icons.delete_outline_rounded : Icons.remove_rounded,
                                    size: 16,
                                    color: item.quantity == 1 ? AppColors.error : AppColors.textPrimary,
                                  ),
                                  onPressed: () {
                                    context.read<CartBloc>().add(
                                          CartItemQuantityChanged(
                                            itemId: item.id,
                                            quantity: item.quantity - 1,
                                          ),
                                        );
                                  },
                                ),
                                Container(
                                  constraints: const BoxConstraints(minWidth: 24),
                                  alignment: Alignment.center,
                                  child: Text(
                                    '${item.quantity}',
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                                  ),
                                ),
                                IconButton(
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                  icon: const Icon(Icons.add_rounded, size: 16, color: AppColors.primary),
                                  onPressed: () {
                                    context.read<CartBloc>().add(
                                          CartItemQuantityChanged(
                                            itemId: item.id,
                                            quantity: item.quantity + 1,
                                          ),
                                        );
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

              // Bottom Bill Summary Card & Checkout Action
              Container(
                padding: const EdgeInsets.all(AppDimensions.lg),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: const Border(top: BorderSide(color: AppColors.border)),
                  boxShadow: [AppColors.cardShadow],
                ),
                child: SafeArea(
                  top: false,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Subtotal', style: AppTextStyles.bodyMedium),
                          Text(
                            CurrencyFormatter.format(cart.subtotal),
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Estimated Delivery', style: AppTextStyles.bodyMedium),
                          Text(
                            cart.deliveryFee == 0
                                ? 'Free'
                                : CurrencyFormatter.format(cart.deliveryFee),
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Divider(),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Total', style: AppTextStyles.h3),
                          Text(
                            CurrencyFormatter.format(cart.totalAmount),
                            style: AppTextStyles.h2.copyWith(color: AppColors.primary),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppDimensions.lg),
                      CraveryButton(
                        text: 'Proceed to Checkout',
                        onPressed: () => context.push(RouteNames.checkout),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
