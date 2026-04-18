import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../vehicle/presentation/providers/vehicle_provider.dart';
import '../../domain/toll_gate_model.dart';
import '../providers/toll_provider.dart';

class ScanQrScreen extends ConsumerStatefulWidget {
  const ScanQrScreen({super.key});

  @override
  ConsumerState<ScanQrScreen> createState() => _ScanQrScreenState();
}

class _ScanQrScreenState extends ConsumerState<ScanQrScreen> {
  final _controller = MobileScannerController(formats: [BarcodeFormat.qrCode]);
  bool _processing = false;
  bool _torchEnabled = false;
  final _manualController = TextEditingController();

  @override
  void dispose() {
    _manualController.dispose();
    _controller.dispose();
    super.dispose();
  }

  Future<void> _handlePayload(String payload) async {
    if (_processing) return;
    setState(() => _processing = true);
    HapticFeedback.mediumImpact();
    await _controller.stop();
    try {
      final gate = await ref.read(tollActionsProvider).verifyGate(payload);
      if (!mounted) return;
      ref.read(verifiedGateProvider.notifier).state = gate;
      context.push('/pay/confirm');
    } catch (error) {
      if (!mounted) return;
      setState(() => _processing = false);
      await _controller.start();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  Future<void> _showVehicleSelector() async {
    final language = ref.read(languageProvider);
    final vehicles = ref.read(vehiclesProvider).valueOrNull ?? const [];
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return ListView(
          shrinkWrap: true,
          children: [
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Text(
                language == 'bn' ? 'সক্রিয় গাড়ি নির্বাচন' : 'Select vehicle',
                style: AppTextStyles.h4,
              ),
            ),
            ...vehicles.map(
              (vehicle) => ListTile(
                leading: const Icon(Icons.directions_car_filled_rounded),
                title: Text(vehicle.plateNumber),
                subtitle: Text(vehicle.displayName),
                trailing: ref.read(selectedVehicleIdProvider) == vehicle.id
                    ? const Icon(Icons.check_circle, color: AppColors.primary)
                    : null,
                onTap: () {
                  ref.read(selectedVehicleIdProvider.notifier).state = vehicle.id;
                  Navigator.of(context).pop();
                },
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _handleManualCode() async {
    final code = _manualController.text.trim();
    if (code.length < 6) return;
    final payload = jsonEncode({
      'gate_code': code,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    });
    await _handlePayload(payload);
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final activeVehicle = ref.watch(activeVehicleProvider);
    final selectedId = ref.watch(selectedVehicleIdProvider);
    final selectedVehicle = (ref.watch(vehiclesProvider).valueOrNull ?? const [])
        .where((v) => v.id == selectedId)
        .toList()
        .firstOrNull;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: (capture) {
              final barcode = capture.barcodes.firstOrNull;
              final value = barcode?.rawValue;
              if (value == null || value.isEmpty) return;
              _handlePayload(value);
            },
          ),
          _ScannerOverlay(processing: _processing, language: language),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.go('/home'),
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.black45,
                    ),
                    icon: const Icon(Icons.close_rounded, color: Colors.white),
                  ),
                  const Spacer(),
                  Text(
                    language == 'bn' ? 'টোল স্ক্যান করুন' : 'Scan Toll QR',
                    style: AppTextStyles.h4.copyWith(color: Colors.white),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () async {
                      await _controller.toggleTorch();
                      setState(() => _torchEnabled = !_torchEnabled);
                    },
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.black45,
                    ),
                    icon: Icon(
                      _torchEnabled
                          ? Icons.flash_on_rounded
                          : Icons.flash_off_rounded,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  InkWell(
                    onTap: _showVehicleSelector,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    child: Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.directions_car_rounded),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Text(
                              language == 'bn'
                                  ? 'সক্রিয় গাড়ি: ${selectedVehicle?.plateNumber ?? activeVehicle?.plateNumber ?? "-"}'
                                  : 'Active vehicle: ${selectedVehicle?.plateNumber ?? activeVehicle?.plateNumber ?? "-"}',
                              style: AppTextStyles.bodyMedium,
                            ),
                          ),
                          const Icon(Icons.keyboard_arrow_down_rounded),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      language == 'bn'
                          ? 'কাছের টোল গেট দেখুন'
                          : 'See nearby toll gates',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    trailing: const Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 14,
                      color: AppColors.primary,
                    ),
                    onTap: () => context.push('/pay/nearby-gates'),
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _manualController,
                          keyboardType: TextInputType.number,
                          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                          decoration: InputDecoration(
                            hintText: language == 'bn'
                                ? 'ম্যানুয়াল গেট কোড (৮ ডিজিট)'
                                : 'Manual gate code (8 digits)',
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      OutlinedButton(
                        onPressed: _handleManualCode,
                        child: Text(language == 'bn' ? 'যাচাই' : 'Verify'),
                      ),
                    ],
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

class _ScannerOverlay extends StatelessWidget {
  const _ScannerOverlay({required this.processing, required this.language});

  final bool processing;
  final String language;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Stack(
        children: [
          ColorFiltered(
            colorFilter: ColorFilter.mode(
              Colors.black.withValues(alpha: 0.46),
              BlendMode.srcOut,
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                Container(
                  decoration: const BoxDecoration(
                    color: Colors.black,
                    backgroundBlendMode: BlendMode.dstOut,
                  ),
                ),
                Align(
                  alignment: Alignment.center,
                  child: Container(
                    width: 250,
                    height: 250,
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Align(
            alignment: Alignment.center,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.85),
                  width: 2.3,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            top: MediaQuery.sizeOf(context).height * 0.64,
            child: Text(
              processing
                  ? (language == 'bn'
                      ? 'গেটের তথ্য যাচাই হচ্ছে...'
                      : 'Verifying gate data...')
                  : (language == 'bn'
                      ? 'QR কোডটি ফ্রেমের ভেতরে রাখুন'
                      : 'Keep QR code inside the frame'),
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyMedium.copyWith(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}

extension _FirstOrNullExtension<T> on List<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
