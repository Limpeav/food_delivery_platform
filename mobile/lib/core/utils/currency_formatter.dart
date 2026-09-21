import 'package:intl/intl.dart';
import '../../app/config/app_config.dart';

class CurrencyFormatter {
  CurrencyFormatter._();

  static final NumberFormat _currencyFormat = NumberFormat.currency(
    symbol: AppConfig.currencySymbol,
    decimalDigits: 2,
  );

  static String format(dynamic amount) {
    if (amount == null) return '${AppConfig.currencySymbol}0.00';
    if (amount is num) {
      return _currencyFormat.format(amount);
    }
    final parsed = double.tryParse(amount.toString());
    if (parsed != null) {
      return _currencyFormat.format(parsed);
    }
    return '${AppConfig.currencySymbol}0.00';
  }
}
