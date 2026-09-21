/// Reusable Cambodian mobile phone number validator and normalizer.
/// Supports only Cambodian country code (+855) and authentic Cambodian mobile operator prefixes.
class CambodiaPhoneValidator {
  CambodiaPhoneValidator._();

  static const String countryCode = '+855';
  static const String countryCodeDigits = '855';

  /// Valid Cambodian mobile operator prefixes (without leading 0 or after +855).
  /// Corresponds to local prefixes:
  /// 010, 011, 012, 015, 016, 017,
  /// 060, 061, 067, 069, 070,
  /// 077, 078, 081, 086, 087, 089,
  /// 090, 092, 093, 095, 096, 097, 098, 099
  static const Set<String> operatorPrefixes = {
    '10', '11', '12', '15', '16', '17',
    '60', '61', '67', '69', '70',
    '77', '78', '81', '86', '87', '89',
    '90', '92', '93', '95', '96', '97', '98', '99',
  };

  /// Validates whether the given string is a valid Cambodian mobile phone number.
  static bool isValid(String? phone) {
    if (phone == null || phone.trim().isEmpty) {
      return false;
    }

    final trimmed = phone.trim();
    final digits = _cleanDigits(trimmed);
    if (digits.isEmpty) {
      return false;
    }

    // Rejection of foreign international prefixes (e.g., +1, +44, +66, +84)
    if (trimmed.startsWith('+') && !digits.startsWith(countryCodeDigits)) {
      return false;
    }

    final nationalNumber = _extractNationalNumber(digits);
    if (nationalNumber == null) {
      return false;
    }

    // National subscriber number must be 8 or 9 digits (e.g. 12345678 or 123456789)
    if (nationalNumber.length < 8 || nationalNumber.length > 9) {
      return false;
    }

    final prefix = nationalNumber.substring(0, 2);
    return operatorPrefixes.contains(prefix);
  }

  /// Normalizes a valid Cambodian phone number to E.164 standard (+855XXXXXXXX).
  ///
  /// Throws [ArgumentError] if the phone number is invalid.
  static String normalize(String phone) {
    if (!isValid(phone)) {
      throw ArgumentError('Invalid Cambodian mobile phone number: $phone');
    }

    final digits = _cleanDigits(phone.trim());
    final nationalNumber = _extractNationalNumber(digits)!;
    return '$countryCode$nationalNumber';
  }

  /// Alias for [normalize] to produce standard E.164 format.
  static String toE164(String phone) => normalize(phone);

  /// Formats the phone number for customer-friendly display, e.g. "+855 12 345 678".
  static String toDisplayFormat(String phone) {
    final e164 = normalize(phone);
    final national = e164.substring(countryCode.length);

    if (national.length >= 8) {
      return '+855 ${national.substring(0, 2)} ${national.substring(2, 5)} ${national.substring(5)}';
    }
    return e164;
  }

  /// Returns user-friendly validation error message or null if valid.
  static String? getValidationError(String? phone) {
    if (phone == null || phone.trim().isEmpty) {
      return 'Please enter your phone number.';
    }

    final trimmed = phone.trim();
    final digits = _cleanDigits(trimmed);

    if (trimmed.startsWith('+') && !digits.startsWith(countryCodeDigits)) {
      return 'Please enter a valid Cambodian mobile number.';
    }

    final nationalNumber = _extractNationalNumber(digits);
    if (nationalNumber == null || nationalNumber.length < 8 || nationalNumber.length > 9) {
      return 'Please enter a valid Cambodian phone number.';
    }

    final prefix = nationalNumber.substring(0, 2);
    if (!operatorPrefixes.contains(prefix)) {
      return 'Please enter a valid Cambodian mobile number.';
    }

    return null;
  }

  static String? _extractNationalNumber(String digits) {
    if (digits.startsWith(countryCodeDigits)) {
      return digits.substring(countryCodeDigits.length);
    } else if (digits.startsWith('0')) {
      return digits.substring(1);
    } else {
      return digits;
    }
  }

  static String _cleanDigits(String phone) {
    return phone.replaceAll(RegExp(r'[^0-9]'), '');
  }
}
