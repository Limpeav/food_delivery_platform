import 'package:flutter_test/flutter_test.dart';
import 'package:cravery_customer/core/utils/currency_formatter.dart';

void main() {
  group('CurrencyFormatter', () {
    test('formats whole numbers to 2 decimal places with currency symbol', () {
      expect(CurrencyFormatter.format(10.0), '\$10.00');
      expect(CurrencyFormatter.format(0.0), '\$0.00');
    });

    test('formats precision decimal prices', () {
      expect(CurrencyFormatter.format(12.5), '\$12.50');
      expect(CurrencyFormatter.format(3.99), '\$3.99');
    });

    test('formats thousand amounts with separator', () {
      expect(CurrencyFormatter.format(1500.0), '\$1,500.00');
    });
  });
}
