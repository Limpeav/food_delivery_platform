import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';

class InteractiveDeliveryMap extends StatefulWidget {
  final double? restaurantLat;
  final double? restaurantLng;
  final double? customerLat;
  final double? customerLng;
  final double? driverLat;
  final double? driverLng;
  final String status;
  final String? driverName;
  final String? vehicleNumber;

  const InteractiveDeliveryMap({
    super.key,
    this.restaurantLat,
    this.restaurantLng,
    this.customerLat,
    this.customerLng,
    this.driverLat,
    this.driverLng,
    required this.status,
    this.driverName,
    this.vehicleNumber,
  });

  @override
  State<InteractiveDeliveryMap> createState() => _InteractiveDeliveryMapState();
}

class _InteractiveDeliveryMapState extends State<InteractiveDeliveryMap> {
  GoogleMapController? _mapController;
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};

  // Phnom Penh city centre — default when no order coordinates are available
  static const LatLng _defaultCenter = LatLng(11.5564, 104.9282);
  // Default zoom: 12 = shows Phnom Penh area clearly (recognisably Cambodia)
  static const double _defaultZoom = 12.0;

  @override
  void initState() {
    super.initState();
    _buildMarkersAndRoute();
  }

  @override
  void didUpdateWidget(InteractiveDeliveryMap oldWidget) {
    super.didUpdateWidget(oldWidget);
    final driverMoved = oldWidget.driverLat != widget.driverLat ||
        oldWidget.driverLng != widget.driverLng;
    final statusChanged = oldWidget.status != widget.status;
    if (driverMoved || statusChanged) {
      _buildMarkersAndRoute();
      _fitBounds();
    }
  }

  void _buildMarkersAndRoute() {
    final Set<Marker> markers = {};
    final List<LatLng> routePoints = [];

    // Restaurant marker
    if (widget.restaurantLat != null && widget.restaurantLng != null) {
      final pos = LatLng(widget.restaurantLat!, widget.restaurantLng!);
      markers.add(Marker(
        markerId: const MarkerId('restaurant'),
        position: pos,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        infoWindow: const InfoWindow(title: '🍽 Restaurant', snippet: 'Pickup point'),
      ));
      routePoints.add(pos);
    }

    // Driver marker (only when out for delivery or delivering)
    if (widget.driverLat != null && widget.driverLng != null) {
      final pos = LatLng(widget.driverLat!, widget.driverLng!);
      markers.add(Marker(
        markerId: const MarkerId('driver'),
        position: pos,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueViolet),
        infoWindow: InfoWindow(
          title: '🛵 ${widget.driverName ?? 'Driver'}',
          snippet: widget.vehicleNumber,
        ),
      ));
      routePoints.add(pos);
    }

    // Customer / destination marker
    if (widget.customerLat != null && widget.customerLng != null) {
      final pos = LatLng(widget.customerLat!, widget.customerLng!);
      markers.add(Marker(
        markerId: const MarkerId('customer'),
        position: pos,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        infoWindow: const InfoWindow(title: '📍 Delivery Location', snippet: 'Your address'),
      ));
      routePoints.add(pos);
    }

    // Draw a straight polyline connecting the route points
    if (routePoints.length >= 2) {
      _polylines.clear();
      _polylines.add(Polyline(
        polylineId: const PolylineId('delivery_route'),
        points: routePoints,
        color: AppColors.primary,
        width: 4,
        patterns: [PatternItem.dash(20), PatternItem.gap(10)],
      ));
    }

    setState(() {
      _markers
        ..clear()
        ..addAll(markers);
    });
  }

  LatLng _mapCenter() {
    // Priority: driver → midpoint of restaurant+customer → default
    if (widget.driverLat != null && widget.driverLng != null) {
      return LatLng(widget.driverLat!, widget.driverLng!);
    }
    if (widget.restaurantLat != null && widget.customerLat != null) {
      return LatLng(
        (widget.restaurantLat! + widget.customerLat!) / 2,
        (widget.restaurantLng! + widget.customerLng!) / 2,
      );
    }
    if (widget.customerLat != null) {
      return LatLng(widget.customerLat!, widget.customerLng!);
    }
    if (widget.restaurantLat != null) {
      return LatLng(widget.restaurantLat!, widget.restaurantLng!);
    }
    return _defaultCenter;
  }

  void _fitBounds() {
    if (_mapController == null) return;
    final points = [
      if (widget.restaurantLat != null)
        LatLng(widget.restaurantLat!, widget.restaurantLng!),
      if (widget.driverLat != null)
        LatLng(widget.driverLat!, widget.driverLng!),
      if (widget.customerLat != null)
        LatLng(widget.customerLat!, widget.customerLng!),
    ];
    if (points.length < 2) return;

    double minLat = points.first.latitude;
    double maxLat = points.first.latitude;
    double minLng = points.first.longitude;
    double maxLng = points.first.longitude;

    for (final p in points) {
      if (p.latitude < minLat) minLat = p.latitude;
      if (p.latitude > maxLat) maxLat = p.latitude;
      if (p.longitude < minLng) minLng = p.longitude;
      if (p.longitude > maxLng) maxLng = p.longitude;
    }

    _mapController!.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(minLat, minLng),
          northeast: LatLng(maxLat, maxLng),
        ),
        60, // padding in points
      ),
    );
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isLive = widget.status == 'OUT_FOR_DELIVERY';

    return Container(
      height: 260,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        child: Stack(
          children: [
            GoogleMap(
              initialCameraPosition: CameraPosition(
                target: _mapCenter(),
                zoom: _defaultZoom,
              ),
              markers: _markers,
              polylines: _polylines,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
              mapToolbarEnabled: false,
              compassEnabled: false,
              onMapCreated: (controller) {
                _mapController = controller;
                // Fit all markers once the map is ready
                Timer(const Duration(milliseconds: 500), _fitBounds);
              },
            ),

            // Live GPS badge – top right
            Positioned(
              top: 12,
              right: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.96),
                  borderRadius: BorderRadius.circular(AppDimensions.radiusPill),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.10),
                      blurRadius: 8,
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: isLive ? AppColors.success : AppColors.textMuted,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      isLive ? 'Live GPS Tracking' : 'Order Tracking',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: isLive ? AppColors.success : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Recenter button – bottom right
            Positioned(
              bottom: 12,
              right: 12,
              child: GestureDetector(
                onTap: _fitBounds,
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.12),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.my_location_rounded, size: 18, color: AppColors.primary),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
