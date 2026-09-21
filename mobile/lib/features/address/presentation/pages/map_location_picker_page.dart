import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';

/// A full-screen map picker. Returns a [LatLng] when the user confirms.
/// Usage:
///   final LatLng? result = await context.push<LatLng>(RouteNames.mapPicker);
class MapLocationPickerPage extends StatefulWidget {
  /// Optional initial position (e.g., previously saved coordinates)
  final LatLng? initialPosition;

  const MapLocationPickerPage({super.key, this.initialPosition});

  @override
  State<MapLocationPickerPage> createState() => _MapLocationPickerPageState();
}

class _MapLocationPickerPageState extends State<MapLocationPickerPage> {
  GoogleMapController? _mapController;

  // Phnom Penh city centre — fallback when no initial position is provided
  static const LatLng _phnomPenh = LatLng(11.5564, 104.9282);
  // Zoom 13 shows Phnom Penh's main districts clearly
  static const double _defaultZoom = 13.0;

  late LatLng _pickedPosition;
  bool _isLocating = false;

  @override
  void initState() {
    super.initState();
    _pickedPosition = widget.initialPosition ?? _phnomPenh;
    if (widget.initialPosition == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _goToMyLocation();
      });
    }
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  // ── Location permission + current position ─────────────────────────────────
  Future<void> _goToMyLocation() async {
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
        setState(() => _pickedPosition = newPos);
        _mapController?.animateCamera(
          CameraUpdate.newLatLngZoom(newPos, 17.0),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not get location: $e'),
            behavior: SnackBarBehavior.floating,
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // ── Full-screen Google Map ───────────────────────────────────────
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: _pickedPosition,
              zoom: widget.initialPosition != null ? 16.0 : _defaultZoom,
            ),
            onMapCreated: (controller) {
              _mapController = controller;
            },
            onCameraMove: (position) {
              // Update picked position as the camera center moves (pin stays centered)
              setState(() => _pickedPosition = position.target);
            },
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
            compassEnabled: true,
          ),

          // ── Center Pin (stays fixed, map moves beneath it) ───────────────
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Shadow dot
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.25),
                    shape: BoxShape.circle,
                  ),
                ),
                // The pin itself
                const Icon(
                  Icons.location_pin,
                  color: AppColors.primary,
                  size: 52,
                  shadows: [
                    Shadow(
                      color: Colors.black38,
                      blurRadius: 8,
                      offset: Offset(0, 3),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // ── Top Bar (back + title) ───────────────────────────────────────
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: AppDimensions.md, vertical: AppDimensions.sm),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: () => Navigator.of(context).pop(),
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.15),
                              blurRadius: 8,
                            )
                          ],
                        ),
                        child: const Icon(Icons.arrow_back_rounded, size: 20),
                      ),
                    ),
                    const SizedBox(width: AppDimensions.md),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: AppDimensions.md, vertical: AppDimensions.sm),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius:
                              BorderRadius.circular(AppDimensions.radiusMd),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.10),
                              blurRadius: 8,
                            )
                          ],
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.location_searching_rounded,
                                size: 16, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Move map to pick location',
                                style: AppTextStyles.bodySmall
                                    .copyWith(color: AppColors.textSecondary),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── My Location FAB ──────────────────────────────────────────────
          Positioned(
            bottom: 140,
            right: AppDimensions.lg,
            child: GestureDetector(
              onTap: _isLocating ? null : _goToMyLocation,
              child: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.15),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: _isLocating
                    ? const Padding(
                        padding: EdgeInsets.all(12),
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.primary,
                        ),
                      )
                    : const Icon(Icons.my_location_rounded,
                        color: AppColors.primary, size: 22),
              ),
            ),
          ),

          // ── Coordinate display + Confirm button ──────────────────────────
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: EdgeInsets.fromLTRB(
                AppDimensions.lg,
                AppDimensions.lg,
                AppDimensions.lg,
                MediaQuery.of(context).padding.bottom + AppDimensions.lg,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(AppDimensions.radiusXl),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_on_rounded,
                          color: AppColors.primary, size: 20),
                      const SizedBox(width: 8),
                      Text('Selected Location', style: AppTextStyles.h4),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Lat: ${_pickedPosition.latitude.toStringAsFixed(6)},  '
                    'Lng: ${_pickedPosition.longitude.toStringAsFixed(6)}',
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: AppDimensions.md),
                  SizedBox(
                    width: double.infinity,
                    height: AppDimensions.buttonHeightLg,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(AppDimensions.radiusMd),
                        ),
                        elevation: 0,
                      ),
                      icon: const Icon(Icons.check_circle_outline_rounded),
                      label: const Text(
                        'Confirm This Location',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                      onPressed: () =>
                          Navigator.of(context).pop(_pickedPosition),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
