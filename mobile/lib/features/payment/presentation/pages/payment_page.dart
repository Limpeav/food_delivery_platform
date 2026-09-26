import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
import '../../data/models/khqr_model.dart';
import '../../data/payment_repository.dart';

class PaymentPage extends StatefulWidget {
  final int orderId;

  const PaymentPage({super.key, required this.orderId});

  @override
  State<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  OrderModel? _order;
  KhqrModel? _khqr;
  bool _isLoading = true;
  bool _isVerifying = false;
  String _paymentStatus = 'PENDING';
  Timer? _statusTimer;

  @override
  void initState() {
    super.initState();
    _loadData();
    _startPolling();
  }

  @override
  void dispose() {
    _statusTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final orderRepo = context.read<OrderRepository>();
      final paymentRepo = context.read<PaymentRepository>();

      final order = await orderRepo.getOrderDetails(widget.orderId);
      KhqrModel? khqr;

      try {
        khqr = await paymentRepo.getBakongKhqr(widget.orderId);
      } catch (e) {
        debugPrint('Could not fetch KHQR: $e');
      }

      if (mounted) {
        setState(() {
          _order = order;
          _khqr = khqr;
          _paymentStatus = order.paymentStatus ?? 'PENDING';
          _isLoading = false;
        });

        if (_paymentStatus == 'PAID' || _paymentStatus == 'COMPLETED') {
          _statusTimer?.cancel();
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _startPolling() {
    _statusTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (_paymentStatus != 'PAID' && _paymentStatus != 'COMPLETED') {
        _verifyStatus(silent: true);
      }
    });
  }

  Future<void> _verifyStatus({bool silent = false}) async {
    if (_isVerifying) return;

    if (!silent && mounted) {
      setState(() => _isVerifying = true);
    }

    try {
      final paymentRepo = context.read<PaymentRepository>();
      final result = await paymentRepo.verifyBakongKhqr(widget.orderId);

      if (mounted) {
        if (result.verified) {
          setState(() {
            _paymentStatus = 'PAID';
            _isVerifying = false;
          });
          _statusTimer?.cancel();

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Payment verified successfully! 🎉'),
              backgroundColor: AppColors.success,
              behavior: SnackBarBehavior.floating,
            ),
          );
        } else {
          // Also refresh order state in case status updated via webhook
          final orderRepo = context.read<OrderRepository>();
          final order = await orderRepo.getOrderDetails(widget.orderId);

          if (mounted) {
            setState(() {
              _order = order;
              _paymentStatus = order.paymentStatus ?? 'PENDING';
              _isVerifying = false;
            });

            if (_paymentStatus == 'PAID' || _paymentStatus == 'COMPLETED') {
              _statusTimer?.cancel();
            } else if (!silent) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(result.message.isNotEmpty
                      ? result.message
                      : 'Payment not yet detected. Please scan and pay first.'),
                  backgroundColor: AppColors.warning,
                  behavior: SnackBarBehavior.floating,
                ),
              );
            }
          }
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isVerifying = false);
        if (!silent) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Could not check payment status. Please try again.'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    }
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
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {
              context.go(RouteNames.orderConfirmationPath(widget.orderId));
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.xl, vertical: AppDimensions.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // KHQR Branded Container
            Container(
              padding: const EdgeInsets.all(AppDimensions.xl),
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
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDC2626), // NBC Bakong Red
                      borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFDC2626).withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 16),
                        SizedBox(width: 6),
                        Text(
                          'BAKONG KHQR',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 13,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppDimensions.md),

                  Text(
                    'Scan to Pay',
                    style: AppTextStyles.h2,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _khqr?.merchantName ?? 'Cravery Store',
                    style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                  ),
                  Text(
                    'Order #${_order?.id ?? widget.orderId}',
                    style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: AppDimensions.lg),

                  // Real Bakong KHQR Graphic Box or Fallback
                  Container(
                    width: 220,
                    height: 220,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                      border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        if (_khqr != null && _khqr!.qrImageBase64.isNotEmpty)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.memory(
                              base64Decode(_khqr!.qrImageBase64),
                              width: 200,
                              height: 200,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) => CustomPaint(
                                size: const Size(190, 190),
                                painter: _QrPatternPainter(),
                              ),
                            ),
                          )
                        else
                          CustomPaint(
                            size: const Size(190, 190),
                            painter: _QrPatternPainter(),
                          ),

                        // Center KHQR Badge Overlay if rendering pattern
                        if (_khqr == null || _khqr!.qrImageBase64.isEmpty)
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

                        // Success Overlay
                        if (isPaid)
                          Container(
                            width: 220,
                            height: 220,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.95),
                              borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(Icons.check_circle_rounded, color: AppColors.success, size: 60),
                                SizedBox(height: 10),
                                Text(
                                  'Payment Received!',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.success,
                                    fontSize: 16,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'Thank you for your order',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppDimensions.lg),

                  // Amount
                  Text(
                    CurrencyFormatter.format(_khqr?.amount ?? _order?.totalAmount ?? 0.0),
                    style: AppTextStyles.h1.copyWith(
                      color: const Color(0xFFDC2626),
                      fontWeight: FontWeight.w900,
                      fontSize: 28,
                    ),
                  ),
                  const SizedBox(height: AppDimensions.sm),

                  // Payment Status Chip
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: isPaid ? AppColors.successLight : const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(AppDimensions.radiusPill),
                      border: Border.all(
                        color: isPaid ? AppColors.success : const Color(0xFFF59E0B),
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
                              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFD97706)),
                            ),
                          )
                        else
                          const Icon(Icons.check_rounded, color: AppColors.success, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          isPaid ? 'Payment Confirmed' : 'Waiting for payment...',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: isPaid ? AppColors.success : const Color(0xFF92400E),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // MD5 Reference info
                  if (_khqr?.md5.isNotEmpty == true) ...[
                    const SizedBox(height: AppDimensions.md),
                    GestureDetector(
                      onTap: () {
                        Clipboard.setData(ClipboardData(text: _khqr!.md5));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Transaction MD5 reference copied!'),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Ref: ${_khqr!.md5.substring(0, 10)}... (Tap to copy)',
                              style: const TextStyle(
                                fontSize: 11,
                                fontFamily: 'monospace',
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: AppDimensions.lg),

                  // Supported Banks Note
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.account_balance_rounded, size: 14, color: AppColors.textSecondary),
                        SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            'Scan with Bakong, ABA, ACLEDA, Wing, or any bank app',
                            style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppDimensions.xl),

            // Action Buttons
            if (isPaid)
              CraveryButton(
                text: 'View Order Details',
                onPressed: () {
                  context.go(RouteNames.orderConfirmationPath(widget.orderId));
                },
              )
            else ...[
              CraveryButton(
                text: _isVerifying ? 'Checking...' : 'Check Payment Status',
                isLoading: _isVerifying,
                type: CraveryButtonType.primary,
                onPressed: () => _verifyStatus(silent: false),
              ),
              const SizedBox(height: AppDimensions.sm),
              CraveryButton(
                text: 'View Order Without Paying',
                type: CraveryButtonType.outlined,
                onPressed: () {
                  context.go(RouteNames.orderConfirmationPath(widget.orderId));
                },
              ),
            ],
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
