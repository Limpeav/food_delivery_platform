import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/widgets/cravery_button.dart';
import '../../../../core/widgets/cravery_text_field.dart';
import '../../../address/presentation/pages/map_location_picker_page.dart';
import '../../../cart/presentation/bloc/cart_bloc.dart';
import '../../../cart/presentation/bloc/cart_event.dart';
import '../../../../shared/models/address_model.dart';
import '../bloc/checkout_bloc.dart';
import '../bloc/checkout_event.dart';
import '../bloc/checkout_state.dart';

class CheckoutPage extends StatefulWidget {
  const CheckoutPage({super.key});

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  final TextEditingController _couponController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();

  // New-address form controllers
  final _newAddressFormKey = GlobalKey<FormState>();
  final TextEditingController _newNameController = TextEditingController();
  final TextEditingController _newPhoneController = TextEditingController();
  final TextEditingController _newAddressLineController = TextEditingController();
  final TextEditingController _newCityController = TextEditingController(text: 'Phnom Penh');
  String _newAddressLabel = 'Home';
  bool _showNewAddressForm = false;

  // Map-picked coordinates for the new address
  LatLng? _pickedLocation;
  GoogleMapController? _deliveryMapController;
  GoogleMapController? _miniMapController;
  bool _isLocating = false;

  @override
  void initState() {
    super.initState();
    final cart = context.read<CartBloc>().state.cart;
    context.read<CheckoutBloc>().add(
          CheckoutInitRequested(
            subtotal: cart.subtotal,
            deliveryFee: cart.deliveryFee,
          ),
        );
  }

  @override
  void dispose() {
    _couponController.dispose();
    _notesController.dispose();
    _newNameController.dispose();
    _newPhoneController.dispose();
    _newAddressLineController.dispose();
    _newCityController.dispose();
    _deliveryMapController?.dispose();
    _miniMapController?.dispose();
    super.dispose();
  }

  void _clearNewAddressForm() {
    _newNameController.clear();
    _newPhoneController.clear();
    _newAddressLineController.clear();
    _newCityController.text = 'Phnom Penh';
    setState(() {
      _newAddressLabel = 'Home';
      _showNewAddressForm = false;
      _pickedLocation = null;
      _miniMapController = null;
    });
  }

  // ── Use Current GPS Location ───────────────────────────────────────────────
  Future<void> _useCurrentLocation({AddressModel? selectedAddress}) async {
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
              content: Text('Location permission is permanently denied. Please enable it in Settings.'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
        return;
      }

      final Position pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );

      final newPos = LatLng(pos.latitude, pos.longitude);
      if (mounted) {
        setState(() {
          _pickedLocation = newPos;
        });
        _deliveryMapController?.animateCamera(
          CameraUpdate.newLatLngZoom(newPos, 16.5),
        );
        _miniMapController?.animateCamera(
          CameraUpdate.newLatLngZoom(newPos, 16.5),
        );

        if (selectedAddress != null) {
          context.read<CheckoutBloc>().add(
                CheckoutAddressPinUpdated(
                  latitude: newPos.latitude,
                  longitude: newPos.longitude,
                ),
              );
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Delivery updated to current location (${newPos.latitude.toStringAsFixed(4)}, ${newPos.longitude.toStringAsFixed(4)})',
              ),
              behavior: SnackBarBehavior.floating,
              backgroundColor: AppColors.success,
              duration: const Duration(seconds: 2),
            ),
          );
        } else {
          setState(() => _showNewAddressForm = true);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Current location detected! Confirm your recipient details below.'),
              behavior: SnackBarBehavior.floating,
              duration: Duration(seconds: 2),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not get current location: $e'),
            behavior: SnackBarBehavior.floating,
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  // ── Open full-screen Google Maps picker ───────────────────────────────────
  Future<void> _openMapPicker({AddressModel? selectedAddress}) async {
    final LatLng initialPos = _pickedLocation ??
        (selectedAddress?.latitude != null && selectedAddress?.longitude != null
            ? LatLng(selectedAddress!.latitude!, selectedAddress.longitude!)
            : const LatLng(11.5564, 104.9282));

    final LatLng? result = await Navigator.of(context).push<LatLng>(
      MaterialPageRoute(
        builder: (_) => MapLocationPickerPage(initialPosition: initialPos),
        fullscreenDialog: true,
      ),
    );
    if (result != null && mounted) {
      setState(() => _pickedLocation = result);
      _deliveryMapController?.animateCamera(
        CameraUpdate.newLatLngZoom(result, 16),
      );
      _miniMapController?.animateCamera(
        CameraUpdate.newLatLngZoom(result, 16),
      );
      if (selectedAddress != null) {
        context.read<CheckoutBloc>().add(
              CheckoutAddressPinUpdated(
                latitude: result.latitude,
                longitude: result.longitude,
              ),
            );
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Delivery pin updated (${result.latitude.toStringAsFixed(4)}, ${result.longitude.toStringAsFixed(4)})',
            ),
            behavior: SnackBarBehavior.floating,
            backgroundColor: AppColors.success,
            duration: const Duration(seconds: 2),
          ),
        );
      } else {
        setState(() => _showNewAddressForm = true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Pin selected! Confirm your recipient details below.'),
            behavior: SnackBarBehavior.floating,
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
  }

  void _submitNewAddress(BuildContext context) {
    if (!(_newAddressFormKey.currentState?.validate() ?? false)) return;
    context.read<CheckoutBloc>().add(
          CheckoutAddressCreateRequested(
            label: _newAddressLabel,
            recipientName: _newNameController.text.trim(),
            phoneNumber: _newPhoneController.text.trim(),
            addressLine: _newAddressLineController.text.trim(),
            city: _newCityController.text.trim(),
            latitude: _pickedLocation?.latitude,
            longitude: _pickedLocation?.longitude,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<CheckoutBloc, CheckoutState>(
      listener: (context, state) {
        if (state is CheckoutOrderSuccess) {
          // Clear cart on successful order placement
          context.read<CartBloc>().add(CartResetRequested());

          if (state.order.paymentMethod == 'ONLINE_PAYMENT') {
            context.go(RouteNames.paymentPath(state.order.id));
          } else {
            context.go(RouteNames.orderConfirmationPath(state.order.id));
          }
        } else if (state is CheckoutReady && state.selectedAddress != null && _showNewAddressForm) {
          // Address was saved successfully — collapse the form
          _clearNewAddressForm();
        } else if (state is CheckoutError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      },
      builder: (context, state) {
        if (state is CheckoutLoading) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
          );
        } else if (state is CheckoutReady) {
          final cart = context.read<CartBloc>().state.cart;

          return Scaffold(
            backgroundColor: AppColors.background,
            appBar: AppBar(
              title: const Text('Checkout'),
            ),
            body: SingleChildScrollView(
              padding: const EdgeInsets.all(AppDimensions.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // ─── 1. Delivery Address Card with Google Map ───────────────────────────
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header row
                        Padding(
                          padding: const EdgeInsets.fromLTRB(
                              AppDimensions.md, AppDimensions.md, AppDimensions.sm, AppDimensions.xs),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.location_on_rounded,
                                      color: AppColors.primary, size: 20),
                                  const SizedBox(width: AppDimensions.sm),
                                  Text('Delivery Address', style: AppTextStyles.h4),
                                ],
                              ),
                              if (state.selectedAddress != null)
                                TextButton(
                                  onPressed: () => _showAddressPicker(context, state),
                                  child: const Text('Change',
                                      style: TextStyle(fontWeight: FontWeight.w700)),
                                ),
                            ],
                          ),
                        ),

                        // ── Google Map Banner Preview ───────────────────────────────
                        Builder(
                          builder: (context) {
                            final hasSavedCoords = state.selectedAddress?.latitude != null &&
                                state.selectedAddress?.longitude != null;
                            final targetCoords = _pickedLocation ??
                                (hasSavedCoords
                                    ? LatLng(state.selectedAddress!.latitude!,
                                        state.selectedAddress!.longitude!)
                                    : const LatLng(11.5564, 104.9282));

                            return Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppDimensions.md,
                                vertical: AppDimensions.xs,
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                                child: SizedBox(
                                  height: 165,
                                  child: Stack(
                                    children: [
                                      ExcludeSemantics(
                                        child: GoogleMap(
                                          initialCameraPosition: CameraPosition(
                                            target: targetCoords,
                                            zoom: (hasSavedCoords || _pickedLocation != null) ? 16 : 13.5,
                                          ),
                                          onMapCreated: (c) => _deliveryMapController = c,
                                          markers: {
                                            Marker(
                                              markerId: const MarkerId('delivery_map_pin'),
                                              position: targetCoords,
                                              icon: BitmapDescriptor.defaultMarkerWithHue(
                                                  BitmapDescriptor.hueRed),
                                            ),
                                          },
                                          myLocationEnabled: true,
                                          scrollGesturesEnabled: false,
                                          zoomGesturesEnabled: false,
                                          rotateGesturesEnabled: false,
                                          tiltGesturesEnabled: false,
                                          zoomControlsEnabled: false,
                                          myLocationButtonEnabled: false,
                                          mapToolbarEnabled: false,
                                        ),
                                      ),
                                      // Tap overlay to open full interactive map picker
                                      Positioned.fill(
                                        child: GestureDetector(
                                          behavior: HitTestBehavior.opaque,
                                          onTap: () => _openMapPicker(
                                              selectedAddress: state.selectedAddress),
                                          child: Container(
                                            decoration: BoxDecoration(
                                              gradient: LinearGradient(
                                                begin: Alignment.topCenter,
                                                end: Alignment.bottomCenter,
                                                colors: [
                                                  Colors.black.withValues(alpha: 0.05),
                                                  Colors.black.withValues(alpha: 0.35),
                                                ],
                                              ),
                                            ),
                                            alignment: Alignment.bottomCenter,
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 12, vertical: 8),
                                            child: Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets.symmetric(
                                                      horizontal: 10, vertical: 4),
                                                  decoration: BoxDecoration(
                                                    color: Colors.white,
                                                    borderRadius:
                                                        BorderRadius.circular(20),
                                                    boxShadow: [
                                                      BoxShadow(
                                                        color: Colors.black
                                                            .withValues(alpha: 0.15),
                                                        blurRadius: 6,
                                                      ),
                                                    ],
                                                  ),
                                                  child: Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      const Icon(Icons.pin_drop_rounded,
                                                          size: 14, color: AppColors.primary),
                                                      const SizedBox(width: 4),
                                                      Text(
                                                        (hasSavedCoords || _pickedLocation != null)
                                                            ? 'Pin Set'
                                                            : 'Tap Map to Pin',
                                                        style: const TextStyle(
                                                          fontSize: 11,
                                                          fontWeight: FontWeight.w700,
                                                          color: AppColors.primary,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                Container(
                                                  padding: const EdgeInsets.symmetric(
                                                      horizontal: 10, vertical: 5),
                                                  decoration: BoxDecoration(
                                                    color: AppColors.primary,
                                                    borderRadius:
                                                        BorderRadius.circular(20),
                                                    boxShadow: [
                                                      BoxShadow(
                                                        color: Colors.black
                                                            .withValues(alpha: 0.2),
                                                        blurRadius: 6,
                                                      ),
                                                    ],
                                                  ),
                                                  child: const Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      Icon(Icons.edit_location_alt_rounded,
                                                          size: 14, color: Colors.white),
                                                      SizedBox(width: 4),
                                                      Text(
                                                        'Select on Map',
                                                        style: TextStyle(
                                                          fontSize: 12,
                                                          fontWeight: FontWeight.w700,
                                                          color: Colors.white,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                      // Top-Right Current Location GPS Button
                                      Positioned(
                                        top: 8,
                                        right: 8,
                                        child: GestureDetector(
                                          behavior: HitTestBehavior.opaque,
                                          onTap: _isLocating
                                              ? null
                                              : () => _useCurrentLocation(
                                                  selectedAddress: state.selectedAddress),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 8, vertical: 5),
                                            decoration: BoxDecoration(
                                              color: Colors.white,
                                              borderRadius: BorderRadius.circular(16),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: Colors.black.withValues(alpha: 0.2),
                                                  blurRadius: 5,
                                                  offset: const Offset(0, 2),
                                                ),
                                              ],
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                if (_isLocating)
                                                  const SizedBox(
                                                    width: 12,
                                                    height: 12,
                                                    child: CircularProgressIndicator(
                                                      strokeWidth: 2,
                                                      color: AppColors.primary,
                                                    ),
                                                  )
                                                else
                                                  const Icon(Icons.my_location_rounded,
                                                      size: 13, color: AppColors.primary),
                                                const SizedBox(width: 4),
                                                const Text(
                                                  'My Location',
                                                  style: TextStyle(
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.w700,
                                                    color: AppColors.primary,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),

                        // Selected address display
                        if (state.selectedAddress != null)
                          Padding(
                            padding: const EdgeInsets.fromLTRB(AppDimensions.md, AppDimensions.xs,
                                AppDimensions.md, AppDimensions.xs),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryLight,
                                        borderRadius:
                                            BorderRadius.circular(AppDimensions.radiusSm),
                                      ),
                                      child: Text(
                                        state.selectedAddress!.label,
                                        style: const TextStyle(
                                          color: AppColors.primary,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        '${state.selectedAddress!.recipientName}  ·  ${state.selectedAddress!.phoneNumber}',
                                        style: AppTextStyles.bodyMedium
                                            .copyWith(fontWeight: FontWeight.w600),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${state.selectedAddress!.addressLine}, ${state.selectedAddress!.city}',
                                  style: AppTextStyles.bodySmall
                                      .copyWith(color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          )
                        else
                          Padding(
                            padding: const EdgeInsets.fromLTRB(
                                AppDimensions.md, AppDimensions.xs, AppDimensions.md, AppDimensions.sm),
                            child: Text(
                              'No address selected. Tap the map above to select location or add address details below.',
                              style: AppTextStyles.bodySmall.copyWith(color: AppColors.error),
                            ),
                          ),

                        // Quick Location Action Buttons
                        Padding(
                          padding: const EdgeInsets.fromLTRB(
                              AppDimensions.md, AppDimensions.xs, AppDimensions.md, AppDimensions.xs),
                          child: Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: _isLocating
                                      ? null
                                      : () => _useCurrentLocation(
                                          selectedAddress: state.selectedAddress),
                                  icon: _isLocating
                                      ? const SizedBox(
                                          width: 14,
                                          height: 14,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: AppColors.primary,
                                          ),
                                        )
                                      : const Icon(Icons.my_location_rounded,
                                          size: 15, color: AppColors.primary),
                                  label: const Text(
                                    'Current Location',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: AppColors.primary),
                                    shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(AppDimensions.radiusMd),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                  ),
                                ),
                              ),
                              const SizedBox(width: AppDimensions.sm),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () => _openMapPicker(
                                      selectedAddress: state.selectedAddress),
                                  icon: const Icon(Icons.map_rounded,
                                      size: 15, color: Colors.white),
                                  label: const Text(
                                    'Pick on Map',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(AppDimensions.radiusMd),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    elevation: 0,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        // ── "Add New Address" toggle button ──────────────
                        Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: AppDimensions.md, vertical: AppDimensions.sm),
                          child: InkWell(
                            onTap: () {
                              setState(() => _showNewAddressForm = !_showNewAddressForm);
                            },
                            borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              decoration: BoxDecoration(
                                color: _showNewAddressForm
                                    ? AppColors.primaryLight
                                    : AppColors.background,
                                borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                                border: Border.all(
                                  color: _showNewAddressForm
                                      ? AppColors.primary
                                      : AppColors.border,
                                  width: _showNewAddressForm ? 1.5 : 1.0,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    _showNewAddressForm
                                        ? Icons.remove_circle_outline_rounded
                                        : Icons.add_location_alt_outlined,
                                    color: _showNewAddressForm
                                        ? AppColors.primary
                                        : AppColors.textSecondary,
                                    size: 20,
                                  ),
                                  const SizedBox(width: AppDimensions.sm),
                                  Text(
                                    _showNewAddressForm
                                        ? 'Cancel new address'
                                        : 'Add new delivery address',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: _showNewAddressForm
                                          ? AppColors.primary
                                          : AppColors.textSecondary,
                                    ),
                                  ),
                                  const Spacer(),
                                  Icon(
                                    _showNewAddressForm
                                        ? Icons.keyboard_arrow_up_rounded
                                        : Icons.keyboard_arrow_down_rounded,
                                    color: _showNewAddressForm
                                        ? AppColors.primary
                                        : AppColors.textMuted,
                                    size: 20,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),

                        // ── Inline new-address form ──────────────────────
                        AnimatedCrossFade(
                          duration: const Duration(milliseconds: 280),
                          crossFadeState: _showNewAddressForm
                              ? CrossFadeState.showFirst
                              : CrossFadeState.showSecond,
                          firstChild: _buildNewAddressForm(context, state),
                          secondChild: const SizedBox.shrink(),
                        ),

                        const SizedBox(height: AppDimensions.sm),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppDimensions.md),

                  // ─── 2. Restaurant Summary ──────────────────────────────
                  if (cart.restaurantName != null)
                    Container(
                      padding: const EdgeInsets.all(AppDimensions.md),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.restaurant_rounded,
                              color: AppColors.primary, size: 20),
                          const SizedBox(width: AppDimensions.sm),
                          Text(cart.restaurantName!, style: AppTextStyles.h4),
                          const Spacer(),
                          Text('${cart.totalItems} items', style: AppTextStyles.bodySmall),
                        ],
                      ),
                    ),
                  const SizedBox(height: AppDimensions.md),

                  // ─── 3. Delivery Instructions / Notes ──────────────────
                  Container(
                    padding: const EdgeInsets.all(AppDimensions.md),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Delivery Instructions', style: AppTextStyles.h4),
                        const SizedBox(height: AppDimensions.sm),
                        TextField(
                          controller: _notesController,
                          onChanged: (notes) {
                            context.read<CheckoutBloc>().add(CheckoutNotesChanged(notes));
                          },
                          style: AppTextStyles.bodyMedium
                              .copyWith(color: AppColors.textPrimary),
                          decoration: const InputDecoration(
                            hintText: 'e.g. Please leave at the door or ring the bell',
                            contentPadding:
                                EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppDimensions.md),

                  // ─── 4. Coupon Code Section ─────────────────────────────
                  Container(
                    padding: const EdgeInsets.all(AppDimensions.md),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Promo Code', style: AppTextStyles.h4),
                        const SizedBox(height: AppDimensions.sm),
                        if (state.appliedCouponCode != null)
                          Container(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: AppColors.successLight,
                              borderRadius:
                                  BorderRadius.circular(AppDimensions.radiusSm),
                              border: Border.all(
                                  color: AppColors.success.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.check_circle_rounded,
                                    color: AppColors.success, size: 18),
                                const SizedBox(width: 8),
                                Text(
                                  '${state.appliedCouponCode} (-${CurrencyFormatter.format(state.discount)})',
                                  style: const TextStyle(
                                    color: AppColors.success,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                  ),
                                ),
                                const Spacer(),
                                IconButton(
                                  icon: const Icon(Icons.close_rounded,
                                      size: 18, color: AppColors.textMuted),
                                  onPressed: () {
                                    _couponController.clear();
                                    context
                                        .read<CheckoutBloc>()
                                        .add(CheckoutCouponRemoveRequested());
                                  },
                                ),
                              ],
                            ),
                          )
                        else
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _couponController,
                                  textCapitalization: TextCapitalization.characters,
                                  style: AppTextStyles.bodyMedium
                                      .copyWith(fontWeight: FontWeight.w700),
                                  decoration: const InputDecoration(
                                    hintText: 'Enter coupon (e.g. SAVE10)',
                                    contentPadding:
                                        EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                  ),
                                ),
                              ),
                              const SizedBox(width: AppDimensions.sm),
                              SizedBox(
                                width: 90,
                                height: 46,
                                child: CraveryButton(
                                  text: 'Apply',
                                  type: CraveryButtonType.primary,
                                  onPressed: () {
                                    if (_couponController.text.trim().isNotEmpty) {
                                      context.read<CheckoutBloc>().add(
                                            CheckoutCouponApplyRequested(
                                                _couponController.text),
                                          );
                                    }
                                  },
                                ),
                              ),
                            ],
                          ),
                        if (state.couponError != null) ...[
                          const SizedBox(height: 6),
                          Text(
                            state.couponError!,
                            style: const TextStyle(color: AppColors.error, fontSize: 12),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: AppDimensions.md),

                  // ─── 5. Payment Method Selector ─────────────────────────
                  Container(
                    padding: const EdgeInsets.all(AppDimensions.md),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Payment Method', style: AppTextStyles.h4),
                        const SizedBox(height: AppDimensions.sm),
                        _buildPaymentTile(
                          context: context,
                          title: 'Cash on Delivery',
                          subtitle: 'Pay when your food arrives',
                          icon: Icons.payments_outlined,
                          isSelected: state.paymentMethod == 'CASH_ON_DELIVERY',
                          onTap: () {
                            context.read<CheckoutBloc>().add(
                                  const CheckoutPaymentMethodSelected('CASH_ON_DELIVERY'),
                                );
                          },
                        ),
                        const SizedBox(height: 6),
                        _buildPaymentTile(
                          context: context,
                          title: 'KHQR / Online Payment',
                          subtitle: 'Scan QR code instantly with any banking app',
                          icon: Icons.qr_code_scanner_rounded,
                          isSelected: state.paymentMethod == 'ONLINE_PAYMENT',
                          onTap: () {
                            context.read<CheckoutBloc>().add(
                                  const CheckoutPaymentMethodSelected('ONLINE_PAYMENT'),
                                );
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppDimensions.md),

                  // ─── 6. Price Summary Breakdown ─────────────────────────
                  Container(
                    padding: const EdgeInsets.all(AppDimensions.md),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Order Summary', style: AppTextStyles.h4),
                        const SizedBox(height: AppDimensions.md),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Subtotal', style: AppTextStyles.bodyMedium),
                            Text(
                              CurrencyFormatter.format(state.subtotal),
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Delivery Fee', style: AppTextStyles.bodyMedium),
                            Text(
                              state.deliveryFee == 0
                                  ? 'Free'
                                  : CurrencyFormatter.format(state.deliveryFee),
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        if (state.discount > 0) ...[
                          const SizedBox(height: 6),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Voucher Discount',
                                  style: AppTextStyles.bodyMedium
                                      .copyWith(color: AppColors.success)),
                              Text(
                                '-${CurrencyFormatter.format(state.discount)}',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.success,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ],
                        const SizedBox(height: 8),
                        const Divider(),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Total Amount', style: AppTextStyles.h3),
                            Text(
                              CurrencyFormatter.format(state.totalAmount),
                              style: AppTextStyles.h2.copyWith(color: AppColors.primary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppDimensions.xl),

                  // Place Order Action Button
                  CraveryButton(
                    text: 'Place Order • ${CurrencyFormatter.format(state.totalAmount)}',
                    isLoading: state.isSubmitting,
                    onPressed: state.isSubmitting
                        ? null
                        : () {
                            context
                                .read<CheckoutBloc>()
                                .add(CheckoutPlaceOrderRequested());
                          },
                  ),
                  const SizedBox(height: AppDimensions.xxl),
                ],
              ),
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }

  // ── Inline new-address form ────────────────────────────────────────────────
  Widget _buildNewAddressForm(BuildContext context, CheckoutReady state) {
    const labelOptions = ['Home', 'Office', 'Other'];

    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppDimensions.md, 0, AppDimensions.md, AppDimensions.md),
      child: Form(
        key: _newAddressFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Divider(),
            const SizedBox(height: AppDimensions.sm),

            // Address type chips
            Text('Address Type', style: AppTextStyles.labelMedium),
            const SizedBox(height: AppDimensions.xs),
            Row(
              children: labelOptions.map((label) {
                final isSelected =
                    _newAddressLabel.toLowerCase() == label.toLowerCase();
                return Padding(
                  padding: const EdgeInsets.only(right: AppDimensions.sm),
                  child: ChoiceChip(
                    label: Text(label),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    backgroundColor: Colors.white,
                    side: BorderSide(
                      color: isSelected ? AppColors.primary : AppColors.border,
                    ),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                      fontWeight:
                          isSelected ? FontWeight.w700 : FontWeight.w500,
                      fontSize: 13,
                    ),
                    onSelected: (selected) {
                      if (selected) setState(() => _newAddressLabel = label);
                    },
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: AppDimensions.md),

            // Recipient name
            CraveryTextField(
              controller: _newNameController,
              label: 'Recipient Full Name',
              hint: 'e.g. John Doe',
              prefixIcon: Icons.person_outline_rounded,
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Please enter recipient name' : null,
            ),
            const SizedBox(height: AppDimensions.md),

            // Phone number
            CraveryTextField(
              controller: _newPhoneController,
              label: 'Contact Phone Number',
              hint: 'e.g. 012 345 678',
              prefixIcon: Icons.phone_outlined,
              keyboardType: TextInputType.phone,
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Please enter phone number' : null,
            ),
            const SizedBox(height: AppDimensions.md),

            // Street address
            CraveryTextField(
              controller: _newAddressLineController,
              label: 'Street Address & Apartment / Unit',
              hint: 'e.g. St. 240, House 15B, BKK1',
              prefixIcon: Icons.location_on_outlined,
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Please enter street address' : null,
            ),
            const SizedBox(height: AppDimensions.md),

            // City
            CraveryTextField(
              controller: _newCityController,
              label: 'City / District',
              hint: 'e.g. Phnom Penh',
              prefixIcon: Icons.location_city_outlined,
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Please enter city' : null,
            ),
            const SizedBox(height: AppDimensions.md),

            // ── GPS & Map Location Pickers ───────────────────────────────────
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _isLocating ? null : () => _useCurrentLocation(),
                    icon: _isLocating
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.primary,
                            ),
                          )
                        : const Icon(Icons.my_location_rounded,
                            size: 16, color: AppColors.primary),
                    label: const Text(
                      'Use GPS',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.primary),
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(AppDimensions.radiusMd),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: AppDimensions.sm),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _openMapPicker(),
                    icon: const Icon(Icons.map_rounded,
                        size: 16, color: Colors.white),
                    label: const Text(
                      'Pin on Map',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(AppDimensions.radiusMd),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      elevation: 0,
                    ),
                  ),
                ),
              ],
            ),
            if (_pickedLocation != null) ...[
              const SizedBox(height: 6),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded,
                        size: 14, color: AppColors.success),
                    const SizedBox(width: 4),
                    Text(
                      'Pinned: ${_pickedLocation!.latitude.toStringAsFixed(4)}, ${_pickedLocation!.longitude.toStringAsFixed(4)}',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.success,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Mini-map preview (visible only after a location is picked)
            if (_pickedLocation != null) ...[
              const SizedBox(height: AppDimensions.sm),
              ClipRRect(
                borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                child: SizedBox(
                  height: 160,
                  child: Stack(
                    children: [
                      ExcludeSemantics(
                        child: GoogleMap(
                          initialCameraPosition: CameraPosition(
                            target: _pickedLocation!,
                            zoom: 16,
                          ),
                          onMapCreated: (c) => _miniMapController = c,
                          markers: {
                            Marker(
                              markerId: const MarkerId('picked'),
                              position: _pickedLocation!,
                            ),
                          },
                          myLocationEnabled: true,
                          scrollGesturesEnabled: false,
                          zoomGesturesEnabled: false,
                          rotateGesturesEnabled: false,
                          tiltGesturesEnabled: false,
                          zoomControlsEnabled: false,
                          myLocationButtonEnabled: false,
                          mapToolbarEnabled: false,
                        ),
                      ),
                      // Tap overlay → re-open picker
                      Positioned.fill(
                        child: GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onTap: () => _openMapPicker(),
                          child: Align(
                            alignment: Alignment.topRight,
                            child: Padding(
                              padding: const EdgeInsets.all(8),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20),
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
                                    Icon(Icons.edit_location_alt_rounded,
                                        size: 14, color: AppColors.primary),
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
                    ],
                  ),
                ),
              ),
            ],

            const SizedBox(height: AppDimensions.lg),

            // Save & Use button
            SizedBox(
              height: AppDimensions.buttonHeightLg,
              child: CraveryButton(
                text: 'Save & Use This Address',
                icon: Icons.check_circle_outline_rounded,
                isLoading: state.isSavingAddress,
                onPressed: state.isSavingAddress
                    ? null
                    : () => _submitNewAddress(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Payment tile ───────────────────────────────────────────────────────────
  Widget _buildPaymentTile({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryLight : AppColors.background,
          borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Icon(icon,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
                size: 22),
            const SizedBox(width: AppDimensions.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight:
                          isSelected ? FontWeight.w700 : FontWeight.w600,
                      color:
                          isSelected ? AppColors.primary : AppColors.textPrimary,
                    ),
                  ),
                  Text(subtitle, style: AppTextStyles.bodySmall),
                ],
              ),
            ),
            Icon(
              isSelected
                  ? Icons.radio_button_checked
                  : Icons.radio_button_off,
              color: isSelected ? AppColors.primary : AppColors.textMuted,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  // ── Address picker bottom sheet ────────────────────────────────────────────
  void _showAddressPicker(BuildContext context, CheckoutReady state) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius:
            BorderRadius.vertical(top: Radius.circular(AppDimensions.radiusXl)),
      ),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(AppDimensions.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Select Delivery Address', style: AppTextStyles.h3),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.of(ctx).pop(),
                ),
              ],
            ),
            const Divider(),
            // Use current GPS location option
            ListTile(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                side: BorderSide(color: AppColors.primary.withValues(alpha: 0.35)),
              ),
              tileColor: AppColors.primaryLight.withValues(alpha: 0.5),
              leading: Container(
                width: 36,
                height: 36,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.my_location_rounded, color: Colors.white, size: 18),
              ),
              title: const Text(
                'Use Current GPS Location',
                style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary),
              ),
              subtitle: const Text('Deliver to where you are right now'),
              trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.primary),
              onTap: () {
                Navigator.of(ctx).pop();
                _useCurrentLocation(selectedAddress: state.selectedAddress);
              },
            ),
            const SizedBox(height: AppDimensions.xs),
            // Map location picker option
            ListTile(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                side: BorderSide(color: AppColors.primary.withValues(alpha: 0.35)),
              ),
              tileColor: AppColors.primaryLight.withValues(alpha: 0.5),
              leading: Container(
                width: 36,
                height: 36,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.map_rounded, color: Colors.white, size: 18),
              ),
              title: const Text(
                'Choose Location on Google Map',
                style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary),
              ),
              subtitle: const Text('Pin your exact delivery location on the map'),
              trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.primary),
              onTap: () {
                Navigator.of(ctx).pop();
                _openMapPicker(selectedAddress: state.selectedAddress);
              },
            ),
            const SizedBox(height: AppDimensions.sm),
            if (state.addresses.isEmpty)
              Padding(
                padding: const EdgeInsets.all(AppDimensions.lg),
                child: Center(
                  child: Column(
                    children: [
                      const Text('No saved addresses found.'),
                      const SizedBox(height: 12),
                      CraveryButton(
                        text: 'Add New Address',
                        onPressed: () {
                          Navigator.of(ctx).pop();
                          context.push(RouteNames.addressNew);
                        },
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                itemCount: state.addresses.length,
                itemBuilder: (_, index) {
                  final addr = state.addresses[index];
                  final isSelected = state.selectedAddress?.id == addr.id;

                  return ListTile(
                    leading: const Icon(Icons.location_on_outlined,
                        color: AppColors.primary),
                    title: Text('${addr.label}  ·  ${addr.recipientName}'),
                    subtitle: Text('${addr.addressLine}, ${addr.city}'),
                    trailing: isSelected
                        ? const Icon(Icons.check_circle_rounded,
                            color: AppColors.primary)
                        : null,
                    onTap: () {
                      context
                          .read<CheckoutBloc>()
                          .add(CheckoutAddressSelected(addr));
                      Navigator.of(ctx).pop();
                    },
                  );
                },
              ),
            // Always-visible "add new" option at the bottom of the picker
            const SizedBox(height: AppDimensions.xs),
            ListTile(
              leading: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.add_location_alt_outlined,
                    color: AppColors.primary, size: 18),
              ),
              title: const Text(
                'Add New Address',
                style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary),
              ),
              subtitle: const Text('Enter and save a new delivery location'),
              onTap: () {
                Navigator.of(ctx).pop();
                setState(() => _showNewAddressForm = true);
                // Scroll to top to reveal the form
              },
            ),
          ],
        ),
      ),
    );
  }
}
