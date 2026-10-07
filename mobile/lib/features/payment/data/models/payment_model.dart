class PaymentModel {
  final int id;
  final int? orderId;
  final double amount;
  final String paymentMethod;
  final String status;
  final String? transactionReference;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const PaymentModel({
    required this.id,
    this.orderId,
    required this.amount,
    required this.paymentMethod,
    required this.status,
    this.transactionReference,
    this.createdAt,
    this.updatedAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['id'] as int? ?? 0,
      orderId: json['orderId'] as int?,
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      paymentMethod: json['paymentMethod'] as String? ?? 'CASH_ON_DELIVERY',
      status: json['status'] as String? ?? 'PENDING',
      transactionReference: json['transactionReference'] as String?,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'] as String) : null,
    );
  }
}
