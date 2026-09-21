import 'package:flutter/material.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/cravery_button.dart';
import '../../data/review_repository.dart';

class ReviewModal extends StatefulWidget {
  final int orderId;
  final String restaurantName;
  final ReviewRepository reviewRepository;
  final VoidCallback onReviewSubmitted;

  const ReviewModal({
    super.key,
    required this.orderId,
    required this.restaurantName,
    required this.reviewRepository,
    required this.onReviewSubmitted,
  });

  @override
  State<ReviewModal> createState() => _ReviewModalState();
}

class _ReviewModalState extends State<ReviewModal> {
  int _rating = 5;
  final TextEditingController _commentController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _onSubmit() async {
    setState(() {
      _isSubmitting = true;
    });

    try {
      await widget.reviewRepository.submitReview(
        orderId: widget.orderId,
        rating: _rating,
        comment: _commentController.text,
      );

      if (mounted) {
        Navigator.of(context).pop();
        widget.onReviewSubmitted();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Thank you for your review!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: AppDimensions.lg,
        right: AppDimensions.lg,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppDimensions.lg,
        top: AppDimensions.md,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Rate your experience',
            style: AppTextStyles.h2,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppDimensions.xs),
          Text(
            widget.restaurantName,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppDimensions.xl),

          // Star Selector
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (index) {
              final star = index + 1;
              return IconButton(
                iconSize: 40,
                icon: Icon(
                  star <= _rating ? Icons.star_rounded : Icons.star_border_rounded,
                  color: const Color(0xFFF59E0B),
                ),
                onPressed: () {
                  setState(() {
                    _rating = star;
                  });
                },
              );
            }),
          ),
          const SizedBox(height: AppDimensions.lg),

          // Feedback Comment Box
          TextField(
            controller: _commentController,
            maxLines: 3,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
            decoration: const InputDecoration(
              hintText: 'Share details of your food and delivery experience...',
            ),
          ),
          const SizedBox(height: AppDimensions.xl),

          CraveryButton(
            text: 'Submit Review',
            isLoading: _isSubmitting,
            onPressed: _onSubmit,
          ),
        ],
      ),
    );
  }
}
