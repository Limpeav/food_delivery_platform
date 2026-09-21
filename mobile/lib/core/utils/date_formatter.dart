import 'package:intl/intl.dart';

class DateFormatter {
  DateFormatter._();

  static final DateFormat _dateTimeFormat = DateFormat('MMM d, yyyy • h:mm a');
  static final DateFormat _dateFormat = DateFormat('MMM d, yyyy');
  static final DateFormat _timeFormat = DateFormat('h:mm a');

  static String formatDateTime(dynamic dateTime) {
    if (dateTime == null) return '';
    if (dateTime is DateTime) {
      return _dateTimeFormat.format(dateTime.toLocal());
    }
    final parsed = DateTime.tryParse(dateTime.toString());
    if (parsed != null) {
      return _dateTimeFormat.format(parsed.toLocal());
    }
    return dateTime.toString();
  }

  static String formatDate(dynamic dateTime) {
    if (dateTime == null) return '';
    if (dateTime is DateTime) {
      return _dateFormat.format(dateTime.toLocal());
    }
    final parsed = DateTime.tryParse(dateTime.toString());
    if (parsed != null) {
      return _dateFormat.format(parsed.toLocal());
    }
    return dateTime.toString();
  }

  static String formatTime(dynamic dateTime) {
    if (dateTime == null) return '';
    if (dateTime is DateTime) {
      return _timeFormat.format(dateTime.toLocal());
    }
    final parsed = DateTime.tryParse(dateTime.toString());
    if (parsed != null) {
      return _timeFormat.format(parsed.toLocal());
    }
    return dateTime.toString();
  }
}
