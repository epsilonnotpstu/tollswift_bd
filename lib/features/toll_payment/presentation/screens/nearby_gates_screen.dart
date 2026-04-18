import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../domain/toll_gate_model.dart';
import '../providers/toll_provider.dart';

class NearbyGatesScreen extends ConsumerStatefulWidget {
  const NearbyGatesScreen({super.key});

  @override
  ConsumerState<NearbyGatesScreen> createState() => _NearbyGatesScreenState();
}

class _NearbyGatesScreenState extends ConsumerState<NearbyGatesScreen> {
  LatLng? _myLocation;

  @override
  void initState() {
    super.initState();
    _resolveLocation();
  }

  Future<void> _resolveLocation() async {
    try {
      final perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }
      final pos = await Geolocator.getCurrentPosition();
      if (!mounted) return;
      setState(() => _myLocation = LatLng(pos.latitude, pos.longitude));
    } catch (_) {}
  }

  double _distanceKm(LatLng a, LatLng b) {
    const earth = 6371;
    final dLat = _radians(b.latitude - a.latitude);
    final dLon = _radians(b.longitude - a.longitude);
    final q = sin(dLat / 2) * sin(dLat / 2) +
        cos(_radians(a.latitude)) *
            cos(_radians(b.latitude)) *
            sin(dLon / 2) *
            sin(dLon / 2);
    return earth * 2 * atan2(sqrt(q), sqrt(1 - q));
  }

  double _radians(double degrees) => degrees * pi / 180;

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final gates = ref.watch(tollGatesProvider).valueOrNull ?? const [];
    final current = _myLocation ?? const LatLng(23.8103, 90.4125);
    final sorted = [...gates]
      ..sort((a, b) => _distanceKm(current, a.location).compareTo(_distanceKm(current, b.location)));
    final nearest = sorted.isNotEmpty ? sorted.first : null;

    final markers = <Marker>{
      Marker(
        markerId: const MarkerId('me'),
        position: current,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
      ),
      ...sorted.map(
        (gate) => Marker(
          markerId: MarkerId(gate.id),
          position: gate.location,
          icon: BitmapDescriptor.defaultMarkerWithHue(
            gate.status == 'active' ? BitmapDescriptor.hueGreen : BitmapDescriptor.hueOrange,
          ),
          onTap: () => _showGateDetail(gate),
        ),
      ),
    };

    return Scaffold(
      appBar: AppBar(
        title: Text(language == 'bn' ? 'কাছের টোল গেট' : 'Nearby Toll Gates'),
      ),
      body: Column(
        children: [
          Expanded(
            child: GoogleMap(
              initialCameraPosition: CameraPosition(
                target: nearest?.location ?? current,
                zoom: 11.8,
              ),
              markers: markers,
              myLocationEnabled: true,
              myLocationButtonEnabled: true,
              zoomControlsEnabled: true,
            ),
          ),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemBuilder: (context, index) {
                final gate = sorted[index];
                final km = _distanceKm(current, gate.location);
                final active = gate.status == 'active';
                final color = active
                    ? AppColors.success
                    : gate.status == 'maintenance'
                        ? AppColors.warning
                        : AppColors.textHint;
                return InkWell(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  onTap: () => _showGateDetail(gate),
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 34,
                          height: 34,
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.14),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.toll_rounded, color: color, size: 18),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                language == 'bn' ? gate.name : gate.nameEn,
                                style: AppTextStyles.bodyMedium.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                gate.roadName,
                                style: AppTextStyles.bodySmall,
                              ),
                              Text(
                                language == 'bn'
                                    ? '${km.toStringAsFixed(1)} কিমি দূরে'
                                    : '${km.toStringAsFixed(1)} km away',
                                style: AppTextStyles.bodySmall
                                    .copyWith(color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          language == 'bn' ? 'দেখুন →' : 'View →',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
              itemCount: sorted.length,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showGateDetail(TollGateModel gate) async {
    final language = ref.read(languageProvider);
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  language == 'bn' ? gate.name : gate.nameEn,
                  style: AppTextStyles.h3,
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(gate.roadName, style: AppTextStyles.bodySmall),
                const SizedBox(height: AppSpacing.md),
                ...gate.tollRates.entries.map(
                  (entry) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      children: [
                        Expanded(child: Text(entry.key, style: AppTextStyles.bodySmall)),
                        Text(
                          '৳${(entry.value / 100).toStringAsFixed(0)}',
                          style: AppTextStyles.amountSmall,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                FilledButton(
                  onPressed: () {
                    ref.read(verifiedGateProvider.notifier).state = gate;
                    Navigator.of(context).pop();
                    context.go('/pay/confirm');
                  },
                  child: Text(
                    language == 'bn'
                        ? 'এখানে পেমেন্ট করুন'
                        : 'Pay for this gate',
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
