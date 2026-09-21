import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/widgets/cravery_button.dart';
import '../../../../shared/models/order_model.dart';
import '../../../order/data/order_repository.dart';

class PaymentPage extends StatefulWidget {
  final int orderId;

  const PaymentPage({super.key, required this.orderId});

  @override
  State<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  OrderModel? _order;
  bool _isLoading = true;
  String _paymentStatus = 'PENDING';
  Timer? _statusTimer;

  @override
  void initState() {
    super.initState();
    _fetchOrder();
    _startStatusPolling();
  }

  @override
  void dispose() {
    _statusTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchOrder() async {
    try {
      final repo = context.read<OrderRepository>();
      final order = await repo.getOrderDetails(widget.orderId);
      if (mounted) {
        setState(() {
          _order = order;
          _isLoading = false;
          _paymentStatus = order.paymentStatus ?? 'PENDING';
        });

        if (_paymentStatus == 'PAID' || _paymentStatus == 'COMPLETED') {
          _statusTimer?.cancel();
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _startStatusPolling() {
    _statusTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      _fetchOrder();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    final isPaid = _paymentStatus == 'PAID' || _paymentStatus == 'COMPLETED';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('KHQR Payment'),
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.xxl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // KHQR Branded Container
            Container(
              padding: const EdgeInsets.all(AppDimensions.xxl),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppDimensions.radiusXl),
                border: Border.all(color: AppColors.border),
                boxShadow: [AppColors.cardShadow],
              ),
              child: Column(
                children: [
                  // KHQR Header
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDC2626), // KHQR Red
                      borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                    ),
                    child: const Text(
                      'BAKONG KHQR',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: AppDimensions.lg),

                  Text(
                    'Scan to Pay',
                    style: AppTextStyles.h2,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Order #${_order?.id ?? widget.orderId}',
                    style: AppTextStyles.bodySmall,
                  ),
                  const SizedBox(height: AppDimensions.lg),

                  // Simulated / Real KHQR Graphic Box
                  Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                      border: Border.all(color: AppColors.border, width: 2),
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        CustomPaint(
                          size: const Size(180, 180),
                          painter: _QrPatternPainter(),
                        ),
                        // Center Bakong logo mark
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: const Color(0xFFDC2626),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Center(
                            child: Icon(Icons.qr_code_2_rounded, color: Colors.white, size: 24),
                          ),
                        ),
                        if (isPaid)
                          Container(
                            color: Colors.white.withValues(alpha: 0.9),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(Icons.check_circle_rounded, color: AppColors.success, size: 54),
                                SizedBox(height: 8),
                                Text(
                                  'Payment Received',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.success,
                                    fontSize: 15,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppDimensions.xl),

                  // Total Amount
                  Text(
                    CurrencyFormatter.format(_order?.totalAmount ?? 0.0),
                    style: AppTextStyles.h1.copyWith(color: AppColors.primary),
                  ),
                  const SizedBox(height: AppDimensions.md),

                  // Payment Status Chip
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: isPaid ? AppColors.successLight : AppColors.warningLight,
                      borderRadius: BorderRadius.circular(AppDimensions.radiusPill),
                      border: Border.all(
                        color: isPaid ? AppColors.success : AppColors.warning,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (!isPaid)
                          const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(AppColors.warning),
                            ),
                          )
                        else
                          const Icon(Icons.check_rounded, color: AppColors.success, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          isPaid ? 'Payment Confirmed by Backend' : 'Waiting for payment...',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: isPaid ? AppColors.success : AppColors.warning,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppDimensions.xxl),

            // Proceed Button
            if (isPaid)
              CraveryButton(
                text: 'View Order Confirmation',
                onPressed: () {
                  context.go(RouteNames.orderConfirmationPath(widget.orderId));
                },
              )
            else
              Row(
                children: [
                  Expanded(
                    child: CraveryButton(
                      text: 'Check Status',
                      type: CraveryButtonType.outlined,
                      onPressed: _fetchOrder,
                    ),
                  ),
                  const SizedBox(width: AppDimensions.md),
                  Expanded(
                    child: CraveryButton(
                      text: 'I Have Paid',
                      type: CraveryButtonType.primary,
                      onPressed: () {
                        _fetchOrder();
                        // Also allow customer to view order directly
                        context.go(RouteNames.orderConfirmationPath(widget.orderId));
                      },
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

class _QrPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black
      ..style = PaintingStyle.fill;

    const blockSize = 6.0;
    for (double x = 10; x < size.width - 10; x += blockSize * 2) {
      for (double y = 10; y < size.height - 10; y += blockSize * 2) {
        if ((x + y).toInt() % 3 == 0) {
          canvas.drawRect(Rect.fromLTWH(x, y, blockSize, blockSize), paint);
        }
      }
    }

    // Corner QR eye squares
    _drawEye(canvas, const Offset(16, 16), paint);
    _drawEye(canvas, Offset(size.width - 46, 16), paint);
    _drawEye(canvas, Offset(16, size.height - 46), paint);
  }

  void _drawEye(Canvas canvas, Offset offset, Paint paint) {
    canvas.drawRect(Rect.fromLTWH(offset.dx, offset.dy, 30, 30), paint);
    final whitePaint = Paint()..color = Colors.white;
    canvas.drawRect(Rect.fromLTWH(offset.dx + 5, offset.dy + 5, 20, 20), whitePaint);
    canvas.drawRect(Rect.fromLTWH(offset.dx + 10, offset.dy + 10, 10, 10), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
