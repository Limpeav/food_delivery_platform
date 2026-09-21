import 'package:equatable/equatable.dart';

class OrderItemModel extends Equatable {
  final int id;
  final int foodItemId;
  final String foodName;
  final double price;
  final int quantity;
  final double subtotal;

  const OrderItemModel({
    required this.id,
    required this.foodItemId,
    required this.foodName,
    required this.price,
    required this.quantity,
    required this.subtotal,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      foodItemId: (json['foodItemId'] as num?)?.toInt() ?? 0,
      foodName: json['foodName'] as String? ?? '',
      price: ((json['price'] ?? json['unitPrice']) as num?)?.toDouble() ?? 0.0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'foodItemId': foodItemId,
    'foodName': foodName,
    'price': price,
    'quantity': quantity,
    'subtotal': subtotal,
  };

  @override
  List<Object?> get props => [id, foodItemId, foodName, price, quantity, subtotal];
}

class OrderModel extends Equatable {
  final int id;
  final int customerId;
  final String? customerName;
  final String? customerPhone;

  final int restaurantId;
  final String restaurantName;
  final String? restaurantPhone;
  final String? restaurantAddress;
  final double? restaurantLatitude;
  final double? restaurantLongitude;

  final String deliveryAddress;
  final double? deliveryLatitude;
  final double? deliveryLongitude;

  final double subtotal;
  final double deliveryFee;
  final double discount;
  final double totalAmount;

  final String status;
  final String? couponCode;
  final String? notes;
  final List<OrderItemModel> items;

  final String? paymentMethod;
  final String? paymentStatus;
  final String? transactionReference;

  final int? deliveryId;
  final String? deliveryStatus;
  final int? driverId;
  final String? driverName;
  final String? driverPhone;
  final String? vehicleType;
  final String? vehicleNumber;
  final double? driverLatitude;
  final double? driverLongitude;

  final String? createdAt;
  final String? updatedAt;

  const OrderModel({
    required this.id,
    required this.customerId,
    this.customerName,
    this.customerPhone,
    required this.restaurantId,
    required this.restaurantName,
    this.restaurantPhone,
    this.restaurantAddress,
    this.restaurantLatitude,
    this.restaurantLongitude,
    required this.deliveryAddress,
    this.deliveryLatitude,
    this.deliveryLongitude,
    required this.subtotal,
    required this.deliveryFee,
    this.discount = 0.0,
    required this.totalAmount,
    required this.status,
    this.couponCode,
    this.notes,
    this.items = const [],
    this.paymentMethod,
    this.paymentStatus,
    this.transactionReference,
    this.deliveryId,
    this.deliveryStatus,
    this.driverId,
    this.driverName,
    this.driverPhone,
    this.vehicleType,
    this.vehicleNumber,
    this.driverLatitude,
    this.driverLongitude,
    this.createdAt,
    this.updatedAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    return OrderModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      customerId: (json['customerId'] as num?)?.toInt() ?? 0,
      customerName: json['customerName'] as String?,
      customerPhone: json['customerPhone'] as String?,
      restaurantId: (json['restaurantId'] as num?)?.toInt() ?? 0,
      restaurantName: json['restaurantName'] as String? ?? '',
      restaurantPhone: json['restaurantPhone'] as String?,
      restaurantAddress: json['restaurantAddress'] as String?,
      restaurantLatitude: (json['restaurantLatitude'] as num?)?.toDouble(),
      restaurantLongitude: (json['restaurantLongitude'] as num?)?.toDouble(),
      deliveryAddress: json['deliveryAddress'] as String? ?? '',
      deliveryLatitude: (json['deliveryLatitude'] as num?)?.toDouble(),
      deliveryLongitude: (json['deliveryLongitude'] as num?)?.toDouble(),
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      deliveryFee: (json['deliveryFee'] as num?)?.toDouble() ?? 0.0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0.0,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] as String? ?? 'PENDING',
      couponCode: json['couponCode'] as String?,
      notes: json['notes'] as String?,
      items: rawItems.map((item) => OrderItemModel.fromJson(item as Map<String, dynamic>)).toList(),
      paymentMethod: json['paymentMethod'] as String?,
      paymentStatus: json['paymentStatus'] as String?,
      transactionReference: json['transactionReference'] as String?,
      deliveryId: (json['deliveryId'] as num?)?.toInt(),
      deliveryStatus: json['deliveryStatus'] as String?,
      driverId: (json['driverId'] as num?)?.toInt(),
      driverName: json['driverName'] as String?,
      driverPhone: json['driverPhone'] as String?,
      vehicleType: json['vehicleType'] as String?,
      vehicleNumber: json['vehicleNumber'] as String?,
      driverLatitude: (json['driverLatitude'] as num?)?.toDouble(),
      driverLongitude: (json['driverLongitude'] as num?)?.toDouble(),
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
    );
  }

  bool get isCancellable => status == 'PENDING' || status == 'CONFIRMED';
  bool get isActive =>
      status != 'DELIVERED' && status != 'CANCELLED' && status != 'REJECTED';

  OrderModel copyWith({
    String? status,
    double? driverLatitude,
    double? driverLongitude,
    String? deliveryStatus,
    String? updatedAt,
  }) {
    return OrderModel(
      id: id,
      customerId: customerId,
      customerName: customerName,
      customerPhone: customerPhone,
      restaurantId: restaurantId,
      restaurantName: restaurantName,
      restaurantPhone: restaurantPhone,
      restaurantAddress: restaurantAddress,
      restaurantLatitude: restaurantLatitude,
      restaurantLongitude: restaurantLongitude,
      deliveryAddress: deliveryAddress,
      deliveryLatitude: deliveryLatitude,
      deliveryLongitude: deliveryLongitude,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      discount: discount,
      totalAmount: totalAmount,
      status: status ?? this.status,
      couponCode: couponCode,
      notes: notes,
      items: items,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      transactionReference: transactionReference,
      deliveryId: deliveryId,
      deliveryStatus: deliveryStatus ?? this.deliveryStatus,
      driverId: driverId,
      driverName: driverName,
      driverPhone: driverPhone,
      vehicleType: vehicleType,
      vehicleNumber: vehicleNumber,
      driverLatitude: driverLatitude ?? this.driverLatitude,
      driverLongitude: driverLongitude ?? this.driverLongitude,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        status,
        subtotal,
        deliveryFee,
        discount,
        totalAmount,
        driverLatitude,
        driverLongitude,
        deliveryStatus,
        updatedAt,
      ];
}
