import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/address_model.dart';

class AddressRepository {
  final DioClient _dioClient;

  AddressRepository({required DioClient dioClient}) : _dioClient = dioClient;

  Future<List<AddressModel>> getAddresses() async {
    final response = await _dioClient.get(ApiEndpoints.addresses);
    final list = response.data['data'] as List<dynamic>? ?? [];
    return list.map((item) => AddressModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<AddressModel> createAddress(AddressModel address) async {
    final response = await _dioClient.post(
      ApiEndpoints.addresses,
      data: address.toJson(),
    );
    final json = response.data['data'] as Map<String, dynamic>;
    return AddressModel.fromJson(json);
  }

  Future<AddressModel> updateAddress(int id, AddressModel address) async {
    final response = await _dioClient.put(
      ApiEndpoints.addressById(id),
      data: address.toJson(),
    );
    final json = response.data['data'] as Map<String, dynamic>;
    return AddressModel.fromJson(json);
  }

  Future<void> deleteAddress(int id) async {
    await _dioClient.delete(ApiEndpoints.addressById(id));
  }

  Future<AddressModel> setDefaultAddress(int id) async {
    final response = await _dioClient.patch(ApiEndpoints.setDefaultAddress(id));
    final json = response.data['data'] as Map<String, dynamic>;
    return AddressModel.fromJson(json);
  }
}
