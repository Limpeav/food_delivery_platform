class KhqrModel {
  final String qrString;
  final String qrImageBase64;
  final String md5;
  final String currency;
  final double amount;
  final int orderId;
  final String merchantName;

  const KhqrModel({
    required this.qrString,
    required this.qrImageBase64,
    required this.md5,
    required this.currency,
    required this.amount,
    required this.orderId,
    required this.merchantName,
  });

  factory KhqrModel.fromJson(Map<String, dynamic> json) {
    return KhqrModel(
      qrString: json['qrString'] as String? ?? '',
      qrImageBase64: json['qrImageBase64'] as String? ?? '',
      md5: json['md5'] as String? ?? '',
      currency: json['currency'] as String? ?? 'USD',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      orderId: (json['orderId'] as num?)?.toInt() ?? 0,
      merchantName: json['merchantName'] as String? ?? 'Cravery Store',
    );
  }
}

class KhqrVerifyResult {
  final bool verified;
  final String message;
  final String? transactionId;
  final String? orderStatus;
  final String? paymentStatus;

  const KhqrVerifyResult({
    required this.verified,
    required this.message,
    this.transactionId,
    this.orderStatus,
    this.paymentStatus,
  });

  factory KhqrVerifyResult.fromJson(Map<String, dynamic> json) {
    return KhqrVerifyResult(
      verified: json['verified'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      transactionId: json['transactionId'] as String?,
      orderStatus: json['orderStatus'] as String?,
      paymentStatus: json['paymentStatus'] as String?,
    );
  }
}
