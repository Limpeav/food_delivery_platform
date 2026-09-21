import 'package:equatable/equatable.dart';

class CouponModel extends Equatable {
  final int id;
  final String code;
  final String discountType; // PERCENTAGE or FIXED_AMOUNT
  final double discountValue;
  final double? maxDiscountAmount;
  final double? minOrderAmount;
  final String? startDate;
  final String? endDate;
  final bool active;

  const CouponModel({
    required this.id,
    required this.code,
    required this.discountType,
    required this.discountValue,
    this.maxDiscountAmount,
    this.minOrderAmount,
    this.startDate,
    this.endDate,
    this.active = true,
  });

  factory CouponModel.fromJson(Map<String, dynamic> json) {
    return CouponModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      code: json['code'] as String? ?? '',
      discountType: json['discountType'] as String? ?? 'PERCENTAGE',
      discountValue: (json['discountValue'] as num?)?.toDouble() ?? 0.0,
      maxDiscountAmount: ((json['maxDiscountAmount'] ?? json['maximumDiscount']) as num?)?.toDouble(),
      minOrderAmount: ((json['minOrderAmount'] ?? json['minimumOrderAmount']) as num?)?.toDouble(),
      startDate: json['startDate']?.toString(),
      endDate: (json['endDate'] ?? json['expirationDate'])?.toString(),
      active: json['active'] as bool? ?? true,
    );
  }

  String get formattedDiscount {
    if (discountType == 'PERCENTAGE') {
      return '${discountValue.toInt()}% OFF';
    }
    return '\$${discountValue.toStringAsFixed(2)} OFF';
  }

  @override
  List<Object?> get props => [id, code, discountType, discountValue, minOrderAmount];
}
