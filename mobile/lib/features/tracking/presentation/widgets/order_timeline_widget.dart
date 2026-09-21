import 'package:flutter/material.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';

class OrderTimelineWidget extends StatelessWidget {
  final String currentStatus;

  const OrderTimelineWidget({super.key, required this.currentStatus});

  static const List<Map<String, String>> _steps = [
    {'status': 'PENDING', 'label': 'Order Placed'},
    {'status': 'CONFIRMED', 'label': 'Confirmed'},
    {'status': 'PREPARING', 'label': 'Preparing Food'},
    {'status': 'READY_FOR_PICKUP', 'label': 'Ready for Pickup'},
    {'status': 'DRIVER_ASSIGNED', 'label': 'Driver Assigned'},
    {'status': 'PICKED_UP', 'label': 'Order Picked Up'},
    {'status': 'OUT_FOR_DELIVERY', 'label': 'Out for Delivery'},
    {'status': 'DELIVERED', 'label': 'Delivered'},
  ];

  int _getStatusIndex(String status) {
    final s = status.toUpperCase();
    for (int i = 0; i < _steps.length; i++) {
      if (_steps[i]['status'] == s) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = _getStatusIndex(currentStatus);

    return Container(
      padding: const EdgeInsets.all(AppDimensions.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Delivery Progress',
            style: AppTextStyles.h4,
          ),
          const SizedBox(height: AppDimensions.lg),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _steps.length,
            itemBuilder: (context, index) {
              final step = _steps[index];
              final isCompleted = index < currentIndex;
              final isCurrent = index == currentIndex;
              final isLast = index == _steps.length - 1;

              return IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Dot & Line
                    Column(
                      children: [
                        Container(
                          width: 22,
                          height: 22,
                          decoration: BoxDecoration(
                            color: isCompleted
                                ? AppColors.success
                                : isCurrent
                                    ? AppColors.primary
                                    : AppColors.divider,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isCurrent ? AppColors.primaryLight : Colors.transparent,
                              width: 3,
                            ),
                          ),
                          child: Center(
                            child: isCompleted
                                ? const Icon(Icons.check_rounded, size: 13, color: Colors.white)
                                : isCurrent
                                    ? Container(
                                        width: 6,
                                        height: 6,
                                        decoration: const BoxDecoration(
                                          color: Colors.white,
                                          shape: BoxShape.circle,
                                        ),
                                      )
                                    : null,
                          ),
                        ),
                        if (!isLast)
                          Expanded(
                            child: Container(
                              width: 2,
                              color: isCompleted ? AppColors.success : AppColors.divider,
                              margin: const EdgeInsets.symmetric(vertical: 2),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: AppDimensions.md),

                    // Label
                    Padding(
                      padding: const EdgeInsets.only(bottom: 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            step['label']!,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: isCurrent ? FontWeight.w700 : (isCompleted ? FontWeight.w600 : FontWeight.w400),
                              color: isCurrent
                                  ? AppColors.primary
                                  : (isCompleted ? AppColors.textPrimary : AppColors.textMuted),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
