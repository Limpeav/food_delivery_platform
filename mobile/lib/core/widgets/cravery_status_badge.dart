import 'package:flutter/material.dart';
import '../../app/theme/app_dimensions.dart';

class CraveryStatusBadge extends StatelessWidget {
  final String status;
  final bool isSmall;

  const CraveryStatusBadge({
    super.key,
    required this.status,
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    Color border;
    String label;

    final s = status.toUpperCase().replaceAll('-', '_');

    switch (s) {
      case 'PENDING':
        bg = const Color(0xFFFFFBEB);
        fg = const Color(0xFFB45309);
        border = const Color(0xFFFDE68A);
        label = 'Pending';
        break;
      case 'CONFIRMED':
        bg = const Color(0xFFEFF6FF);
        fg = const Color(0xFF1D4ED8);
        border = const Color(0xFFBFDBFE);
        label = 'Confirmed';
        break;
      case 'PREPARING':
        bg = const Color(0xFFFFF1EB);
        fg = const Color(0xFFFF5A1F);
        border = const Color(0xFFFFD8C7);
        label = 'Preparing';
        break;
      case 'READY_FOR_PICKUP':
        bg = const Color(0xFFEEF2FF);
        fg = const Color(0xFF4338CA);
        border = const Color(0xFFC7D2FE);
        label = 'Ready for Pickup';
        break;
      case 'DRIVER_ASSIGNED':
        bg = const Color(0xFFECFEFF);
        fg = const Color(0xFF0E7490);
        border = const Color(0xFFA5F3FC);
        label = 'Driver Assigned';
        break;
      case 'PICKED_UP':
        bg = const Color(0xFFFAF5FF);
        fg = const Color(0xFF7E22CE);
        border = const Color(0xFFE9D5FF);
        label = 'Picked Up';
        break;
      case 'OUT_FOR_DELIVERY':
        bg = const Color(0xFFF0FDFA);
        fg = const Color(0xFF0F766E);
        border = const Color(0xFF99F6E4);
        label = 'Out for Delivery';
        break;
      case 'DELIVERED':
        bg = const Color(0xFFECFDF5);
        fg = const Color(0xFF047857);
        border = const Color(0xFFA7F3D0);
        label = 'Delivered';
        break;
      case 'CANCELLED':
        bg = const Color(0xFFFEF2F2);
        fg = const Color(0xFFB91C1C);
        border = const Color(0xFFFECACA);
        label = 'Cancelled';
        break;
      case 'REJECTED':
        bg = const Color(0xFFFEF2F2);
        fg = const Color(0xFFB91C1C);
        border = const Color(0xFFFECACA);
        label = 'Rejected';
        break;
      default:
        bg = const Color(0xFFF1F5F9);
        fg = const Color(0xFF475569);
        border = const Color(0xFFCBD5E1);
        label = status.replaceAll('_', ' ');
        break;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? AppDimensions.xs + 2 : AppDimensions.sm + 2,
        vertical: isSmall ? 2 : 4,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
        border: Border.all(color: border),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: isSmall ? 10 : 12,
          fontWeight: FontWeight.w700,
          color: fg,
        ),
      ),
    );
  }
}
