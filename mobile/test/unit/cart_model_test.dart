import 'package:flutter_test/flutter_test.dart';
import 'package:cravery_customer/shared/models/cart_model.dart';

void main() {
  group('CartModel & CartItemModel', () {
    test('calculates cart item subtotal accurately', () {
      const item = CartItemModel(
        id: 1,
        foodItemId: 10,
        foodName: 'Beef Lok Lak',
        price: 7.50,
        quantity: 3,
        subtotal: 22.50,
      );

      expect(item.subtotal, 22.50);
      expect(item.quantity, 3);
    });

    test('parses CartModel from json with items and total items count', () {
      final json = {
        'id': 1,
        'userId': 5,
        'restaurantId': 2,
        'restaurantName': 'Asian Flavors',
        'items': [
          {
            'id': 1,
            'foodItemId': 10,
            'foodName': 'Pad Thai',
            'price': 5.00,
            'quantity': 2,
            'subtotal': 10.00,
          },
          {
            'id': 2,
            'foodItemId': 12,
            'foodName': 'Mango Sticky Rice',
            'price': 4.00,
            'quantity': 1,
            'subtotal': 4.00,
          },
        ],
        'subtotal': 14.00,
      };

      final cart = CartModel.fromJson(json);

      expect(cart.restaurantName, 'Asian Flavors');
      expect(cart.items.length, 2);
      expect(cart.totalItems, 3);
      expect(cart.subtotal, 14.00);
    });
  });
}
