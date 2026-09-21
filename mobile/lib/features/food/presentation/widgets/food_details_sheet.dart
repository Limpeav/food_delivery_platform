import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/widgets/cravery_button.dart';
import '../../../../shared/models/food_item_model.dart';
import '../../../cart/presentation/bloc/cart_bloc.dart';
import '../../../cart/presentation/bloc/cart_event.dart';

class FoodDetailsSheet extends StatefulWidget {
  final FoodItemModel food;
  final String restaurantName;

  const FoodDetailsSheet({
    super.key,
    required this.food,
    required this.restaurantName,
  });

  @override
  State<FoodDetailsSheet> createState() => _FoodDetailsSheetState();
}

class _FoodDetailsSheetState extends State<FoodDetailsSheet> {
  int _quantity = 1;
  final TextEditingController _notesController = TextEditingController();

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  void _increment() {
    setState(() {
      _quantity++;
    });
  }

  void _decrement() {
    if (_quantity > 1) {
      setState(() {
        _quantity--;
      });
    }
  }

  void _addToCart() {
    context.read<CartBloc>().add(
          CartItemAddRequested(
            foodItemId: widget.food.id,
            restaurantId: widget.food.restaurantId,
            restaurantName: widget.restaurantName,
            quantity: _quantity,
          ),
        );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final totalPrice = widget.food.price * _quantity;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Food Image
          if (widget.food.imageUrl != null && widget.food.imageUrl!.isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
              child: CachedNetworkImage(
                imageUrl: widget.food.imageUrl!,
                height: 180,
                width: double.infinity,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => _buildFallbackImage(),
              ),
            )
          else
            _buildFallbackImage(),

          const SizedBox(height: AppDimensions.md),

          // Title & Price
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.food.name,
                      style: AppTextStyles.h2,
                    ),
                    if (widget.food.restaurantName != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        'by ${widget.food.restaurantName}',
                        style: AppTextStyles.bodySmall,
                      ),
                    ],
                  ],
                ),
              ),
              Text(
                CurrencyFormatter.format(widget.food.price),
                style: AppTextStyles.h2.copyWith(color: AppColors.primary),
              ),
            ],
          ),

          if (widget.food.description != null && widget.food.description!.isNotEmpty) ...[
            const SizedBox(height: AppDimensions.sm),
            Text(
              widget.food.description!,
              style: AppTextStyles.bodyMedium,
            ),
          ],

          const SizedBox(height: AppDimensions.lg),
          const Divider(),
          const SizedBox(height: AppDimensions.md),

          // Quantity Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Quantity',
                style: AppTextStyles.h4,
              ),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove_rounded, size: 20),
                      color: _quantity > 1 ? AppColors.textPrimary : AppColors.textMuted,
                      onPressed: _decrement,
                    ),
                    Container(
                      constraints: const BoxConstraints(minWidth: 32),
                      alignment: Alignment.center,
                      child: Text(
                        '$_quantity',
                        style: AppTextStyles.h4.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.add_rounded, size: 20),
                      color: AppColors.primary,
                      onPressed: _increment,
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: AppDimensions.xl),

          // Add to Cart Button
          CraveryButton(
            text: 'Add to Cart • ${CurrencyFormatter.format(totalPrice)}',
            onPressed: widget.food.available ? _addToCart : null,
          ),
          const SizedBox(height: AppDimensions.xl),
        ],
      ),
    );
  }

  Widget _buildFallbackImage() {
    return Container(
      height: 140,
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
      ),
      child: const Center(
        child: Icon(
          Icons.fastfood_rounded,
          color: AppColors.primary,
          size: 48,
        ),
      ),
    );
  }
}
