import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/cravery_button.dart';
import '../../../../core/widgets/cravery_text_field.dart';
import '../../../../shared/models/address_model.dart';
import '../bloc/address_bloc.dart';
import '../bloc/address_event.dart';
import '../bloc/address_state.dart';
import 'map_location_picker_page.dart';

class AddEditAddressPage extends StatefulWidget {
  final AddressModel? initialAddress;

  const AddEditAddressPage({super.key, this.initialAddress});

  @override
  State<AddEditAddressPage> createState() => _AddEditAddressPageState();
}

class _AddEditAddressPageState extends State<AddEditAddressPage> {
  final _formKey = GlobalKey<FormState>();

  late String _selectedLabel;
  late final TextEditingController _recipientNameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _addressLineController;
  late final TextEditingController _cityController;
  late bool _isDefault;

  // Map location state
  LatLng? _pickedLocation;
  GoogleMapController? _miniMapController;
  bool _isLocating = false;

  final List<String> _commonLabels = const ['Home', 'Office', 'Other'];

  bool get _isEditing => widget.initialAddress != null;

  @override
  void initState() {
    super.initState();
    final addr = widget.initialAddress;

    _selectedLabel = addr?.label ?? 'Home';
    _recipientNameController =
        TextEditingController(text: addr?.recipientName ?? '');
    _phoneController =
        TextEditingController(text: addr?.phoneNumber ?? '');
    _addressLineController =
        TextEditingController(text: addr?.addressLine ?? '');
    _cityController = TextEditingController(
        text: addr?.city.isNotEmpty == true ? addr!.city : 'Phnom Penh');
    _isDefault = addr?.isDefault ?? false;

    // Pre-fill map location from existing address
    if (addr?.latitude != null && addr?.longitude != null) {
      _pickedLocation = LatLng(addr!.latitude!, addr.longitude!);
    }
  }

  @override
  void dispose() {
    _recipientNameController.dispose();
    _phoneController.dispose();
    _addressLineController.dispose();
    _cityController.dispose();
    _miniMapController?.dispose();
    super.dispose();
  }

  // ── Open full-screen map picker ────────────────────────────────────────────
  Future<void> _openMapPicker() async {
    final LatLng? result = await Navigator.of(context).push<LatLng>(
      MaterialPageRoute(
        builder: (_) =>
            MapLocationPickerPage(initialPosition: _pickedLocation),
        fullscreenDialog: true,
      ),
    );
    if (result != null) {
      setState(() => _pickedLocation = result);
      _miniMapController?.animateCamera(
        CameraUpdate.newLatLngZoom(result, 16),
      );
    }
  }

  // ── Use current GPS location ────────────────────────────────────────────────
  Future<void> _useMyLocation() async {
    setState(() => _isLocating = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                  'Location permission denied. Enable it in device Settings.'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
        return;
      }

      final Position pos = await Geolocator.getCurrentPosition(
        locationSettings:
            const LocationSettings(accuracy: LocationAccuracy.high),
      );

      final newPos = LatLng(pos.latitude, pos.longitude);
      if (mounted) {
        setState(() => _pickedLocation = newPos);
        _miniMapController?.animateCamera(
          CameraUpdate.newLatLngZoom(newPos, 16),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not get location: $e'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  // ── Save address ───────────────────────────────────────────────────────────
  void _onSave() {
    if (!_formKey.currentState!.validate()) return;

    final address = AddressModel(
      id: widget.initialAddress?.id ?? 0,
      userId: widget.initialAddress?.userId ?? 0,
      label: _selectedLabel,
      recipientName: _recipientNameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
      addressLine: _addressLineController.text.trim(),
      city: _cityController.text.trim(),
      latitude: _pickedLocation?.latitude,
      longitude: _pickedLocation?.longitude,
      isDefault: _isDefault,
    );

    if (_isEditing) {
      context.read<AddressBloc>().add(
            AddressUpdateRequested(
                id: widget.initialAddress!.id, address: address),
          );
    } else {
      context.read<AddressBloc>().add(AddressCreateRequested(address));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Address' : 'Add New Address'),
        centerTitle: false,
      ),
      body: BlocListener<AddressBloc, AddressState>(
        listener: (context, state) {
          if (state is AddressActionSuccess) {
            context.pop();
          } else if (state is AddressError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.error,
              ),
            );
          }
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Map Location Picker Section ────────────────────────────
                Text('Delivery Location on Map', style: AppTextStyles.labelLarge),
                const SizedBox(height: AppDimensions.sm),

                // Mini map preview (or placeholder if not yet set)
                ClipRRect(
                  borderRadius:
                      BorderRadius.circular(AppDimensions.radiusLg),
                  child: SizedBox(
                    height: 180,
                    child: _pickedLocation != null
                        ? Stack(
                            children: [
                              GoogleMap(
                                initialCameraPosition: CameraPosition(
                                  target: _pickedLocation!,
                                  zoom: 16,
                                ),
                                onMapCreated: (c) => _miniMapController = c,
                                markers: {
                                  Marker(
                                    markerId: const MarkerId('picked'),
                                    position: _pickedLocation!,
                                    icon: BitmapDescriptor.defaultMarkerWithHue(
                                        BitmapDescriptor.hueRed),
                                  ),
                                },
                                scrollGesturesEnabled: false,
                                zoomGesturesEnabled: false,
                                rotateGesturesEnabled: false,
                                tiltGesturesEnabled: false,
                                myLocationButtonEnabled: false,
                                zoomControlsEnabled: false,
                                mapToolbarEnabled: false,
                              ),
                              // Tap overlay to open full picker
                              Positioned.fill(
                                child: Material(
                                  color: Colors.transparent,
                                  child: InkWell(
                                    onTap: _openMapPicker,
                                    child: Align(
                                      alignment: Alignment.bottomRight,
                                      child: Padding(
                                        padding: const EdgeInsets.all(8),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10, vertical: 6),
                                          decoration: BoxDecoration(
                                            color: Colors.white
                                                .withValues(alpha: 0.92),
                                            borderRadius:
                                                BorderRadius.circular(20),
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.black
                                                    .withValues(alpha: 0.12),
                                                blurRadius: 6,
                                              )
                                            ],
                                          ),
                                          child: const Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Icon(
                                                Icons.edit_location_alt_rounded,
                                                size: 14,
                                                color: AppColors.primary,
                                              ),
                                              SizedBox(width: 4),
                                              Text(
                                                'Change',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w700,
                                                  color: AppColors.primary,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          )
                        : GestureDetector(
                            onTap: _openMapPicker,
                            child: Container(
                              height: 180,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                border: Border.all(
                                    color: AppColors.border,
                                    style: BorderStyle.solid),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    width: 56,
                                    height: 56,
                                    decoration: BoxDecoration(
                                      color: AppColors.primaryLight,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.add_location_alt_rounded,
                                      color: AppColors.primary,
                                      size: 28,
                                    ),
                                  ),
                                  const SizedBox(height: AppDimensions.sm),
                                  Text(
                                    'Tap to pin your location on the map',
                                    style: AppTextStyles.bodySmall.copyWith(
                                        color: AppColors.textSecondary),
                                  ),
                                ],
                              ),
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: AppDimensions.sm),

                // Action buttons: My Location + Pick on Map
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: const BorderSide(color: AppColors.primary),
                          shape: RoundedRectangleBorder(
                            borderRadius:
                                BorderRadius.circular(AppDimensions.radiusMd),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 11),
                        ),
                        icon: _isLocating
                            ? const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: AppColors.primary),
                              )
                            : const Icon(Icons.my_location_rounded, size: 16),
                        label: Text(
                          _isLocating ? 'Locating...' : 'My Location',
                          style: const TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w700),
                        ),
                        onPressed: _isLocating ? null : _useMyLocation,
                      ),
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.textSecondary,
                          side: const BorderSide(color: AppColors.border),
                          shape: RoundedRectangleBorder(
                            borderRadius:
                                BorderRadius.circular(AppDimensions.radiusMd),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 11),
                        ),
                        icon: const Icon(
                            Icons.map_outlined, size: 16),
                        label: const Text(
                          'Pick on Map',
                          style: TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w700),
                        ),
                        onPressed: _openMapPicker,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppDimensions.lg),

                // ── Address Type chips ─────────────────────────────────────
                Text('Address Type', style: AppTextStyles.labelLarge),
                const SizedBox(height: AppDimensions.sm),
                Row(
                  children: _commonLabels.map((label) {
                    final isSelected =
                        _selectedLabel.toLowerCase() == label.toLowerCase();
                    return Padding(
                      padding: const EdgeInsets.only(right: AppDimensions.sm),
                      child: ChoiceChip(
                        label: Text(label),
                        selected: isSelected,
                        selectedColor: AppColors.primary,
                        backgroundColor: Colors.white,
                        labelStyle: TextStyle(
                          color:
                              isSelected ? Colors.white : AppColors.textSecondary,
                          fontWeight:
                              isSelected ? FontWeight.w700 : FontWeight.w500,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _selectedLabel = label;
                            });
                          }
                        },
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: AppDimensions.lg),

                // ── Recipient Name ─────────────────────────────────────────
                CraveryTextField(
                  controller: _recipientNameController,
                  label: 'Recipient Full Name',
                  hint: 'e.g. John Doe',
                  prefixIcon: Icons.person_outline_rounded,
                  validator: (v) =>
                      (v == null || v.trim().isEmpty)
                          ? 'Please enter recipient name'
                          : null,
                ),
                const SizedBox(height: AppDimensions.md),

                // ── Phone Number ───────────────────────────────────────────
                CraveryTextField(
                  controller: _phoneController,
                  label: 'Contact Phone Number',
                  hint: 'e.g. 012 345 678',
                  prefixIcon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: (v) =>
                      (v == null || v.trim().isEmpty)
                          ? 'Please enter phone number'
                          : null,
                ),
                const SizedBox(height: AppDimensions.md),

                // ── Address Line ───────────────────────────────────────────
                CraveryTextField(
                  controller: _addressLineController,
                  label: 'Street Address & Apartment / Unit',
                  hint: 'e.g. St. 240, House 15B, BKK1',
                  prefixIcon: Icons.location_on_outlined,
                  validator: (v) =>
                      (v == null || v.trim().isEmpty)
                          ? 'Please enter street address'
                          : null,
                ),
                const SizedBox(height: AppDimensions.md),

                // ── City ───────────────────────────────────────────────────
                CraveryTextField(
                  controller: _cityController,
                  label: 'City / District',
                  hint: 'e.g. Phnom Penh',
                  prefixIcon: Icons.location_city_outlined,
                  validator: (v) =>
                      (v == null || v.trim().isEmpty)
                          ? 'Please enter city'
                          : null,
                ),
                const SizedBox(height: AppDimensions.lg),

                // ── Set Default Switch ─────────────────────────────────────
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: AppDimensions.md, vertical: AppDimensions.sm),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius:
                        BorderRadius.circular(AppDimensions.radiusMd),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Set as default address',
                              style: AppTextStyles.labelMedium),
                          const SizedBox(height: 2),
                          Text(
                            'Use this address automatically at checkout',
                            style: AppTextStyles.caption
                                .copyWith(color: AppColors.textMuted),
                          ),
                        ],
                      ),
                      Switch(
                        value: _isDefault,
                        activeColor: AppColors.primary,
                        onChanged: (value) {
                          setState(() {
                            _isDefault = value;
                          });
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppDimensions.xl),

                // ── Save Button ────────────────────────────────────────────
                BlocBuilder<AddressBloc, AddressState>(
                  builder: (context, state) {
                    final isLoading = state is AddressLoading;
                    return CraveryButton(
                      text: _isEditing ? 'Update Address' : 'Save Address',
                      icon: Icons.check_circle_outline_rounded,
                      isLoading: isLoading,
                      onPressed: _onSave,
                    );
                  },
                ),
                const SizedBox(height: AppDimensions.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
