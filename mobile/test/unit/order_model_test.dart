import 'package:flutter_test/flutter_test.dart';
import 'package:cravery_customer/shared/models/order_model.dart';

void main() {
  group('OrderModel', () {
    test('parses json correctly and computes flags', () {
      final json = {
        'id': 101,
        'customerId': 1,
        'restaurantId': 5,
        'restaurantName': 'Num Banh Chok Palace',
        'deliveryAddress': 'Street 240, Daun Penh, Phnom Penh',
        'subtotal': 18.50,
        'deliveryFee': 1.50,
        'discount': 2.00,
        'totalAmount': 18.00,
        'status': 'PENDING',
        'items': [
          {
            'id': 1,
            'foodItemId': 12,
            'foodName': 'Traditional Khmer Curry',
            'price': 6.00,
            'quantity': 2,
            'subtotal': 12.00,
          },
          {
            'id': 2,
            'foodItemId': 15,
            'foodName': 'Iced Milk Coffee',
            'price': 3.25,
            'quantity': 2,
            'subtotal': 6.50,
          },
        ],
        'paymentMethod': 'ONLINE_PAYMENT',
        'paymentStatus': 'PAID',
      };

      final order = OrderModel.fromJson(json);

      expect(order.id, 101);
      expect(order.restaurantName, 'Num Banh Chok Palace');
      expect(order.items.length, 2);
      expect(order.items.first.foodName, 'Traditional Khmer Curry');
      expect(order.totalAmount, 18.00);
      expect(order.isCancellable, isTrue);
      expect(order.isActive, isTrue);
    });

    test('isCancellable is false when status is PREPARING or DELIVERED', () {
      const orderPreparing = OrderModel(
        id: 1,
        customerId: 1,
        restaurantId: 2,
        restaurantName: 'Burger Corner',
        deliveryAddress: 'Main St',
        subtotal: 10,
        deliveryFee: 1,
        totalAmount: 11,
        status: 'PREPARING',
      );

      expect(orderPreparing.isCancellable, isFalse);
      expect(orderPreparing.isActive, isTrue);

      const orderDelivered = OrderModel(
        id: 2,
        customerId: 1,
        restaurantId: 2,
        restaurantName: 'Burger Corner',
        deliveryAddress: 'Main St',
        subtotal: 10,
        deliveryFee: 1,
        totalAmount: 11,
        status: 'DELIVERED',
      );

      expect(orderDelivered.isCancellable, isFalse);
      expect(orderDelivered.isActive, isFalse);
    });
  });
}
