class ServerException implements Exception {
  final String message;
  final int? statusCode;

  const ServerException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

class NetworkException implements Exception {
  final String message;

  const NetworkException([this.message = 'No internet connection. Please check your network.']);

  @override
  String toString() => message;
}

class UnauthorizedException implements Exception {
  final String message;

  const UnauthorizedException([this.message = 'Session expired. Please log in again.']);

  @override
  String toString() => message;
}

class BadRequestException implements Exception {
  final String message;

  const BadRequestException(this.message);

  @override
  String toString() => message;
}

class NotFoundException implements Exception {
  final String message;

  const NotFoundException([this.message = 'Requested item not found.']);

  @override
  String toString() => message;
}

class ConflictException implements Exception {
  final String message;

  const ConflictException([this.message = 'This phone number is already linked to another account.']);

  @override
  String toString() => message;
}

class CacheException implements Exception {
  final String message;

  const CacheException([this.message = 'Failed to access local storage.']);

  @override
  String toString() => message;
}
