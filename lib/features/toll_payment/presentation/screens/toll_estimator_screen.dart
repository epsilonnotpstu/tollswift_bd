import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../wallet/presentation/providers/wallet_provider.dart';
import '../../domain/route_estimate_model.dart';
import '../providers/toll_provider.dart';

class TollEstimatorScreen extends ConsumerStatefulWidget {
  const TollEstimatorScreen({super.key});

  @override
  ConsumerState<TollEstimatorScreen> createState() => _TollEstimatorScreenState();
}

class _TollEstimatorScreenState extends ConsumerState<TollEstimatorScreen> {
  final _fromController = TextEditingController();
  final _toController = TextEditingController();
  bool _calculating = false;
  String _vehicleType = 'car';
  RouteEstimateModel? _result;
  String? _error;

  static const Map<String, (double lat, double lng)> _cityLocations = {
    'Dhaka': (23.8103, 90.4125),
    'Chattogram': (22.3569, 91.7832),
    'Sylhet': (24.8949, 91.8687),
    'Khulna': (22.8456, 89.5403),
    'Rajshahi': (24.3636, 88.6241),
    'Mymensingh': (24.7471, 90.4203),
    'Cumilla': (23.4607, 91.1809),
  };

  @override
  void dispose() {
    _fromController.dispose();
    _toController.dispose();
    super.dispose();
  }

  (double lat, double lng)? _resolveLocation(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) return null;

    final maybeCoords = trimmed.split(',');
    if (maybeCoords.length == 2) {
      final lat = double.tryParse(maybeCoords[0].trim());
      final lng = double.tryParse(maybeCoords[1].trim());
      if (lat != null && lng != null) return (lat, lng);
    }

    for (final entry in _cityLocations.entries) {
      if (entry.key.toLowerCase() == trimmed.toLowerCase()) {
        return entry.value;
      }
    }

    final gates = ref.read(tollGatesProvider).valueOrNull ?? const [];
    for (final gate in gates) {
      if (gate.name.toLowerCase() == trimmed.toLowerCase() ||
          gate.nameEn.toLowerCase() == trimmed.toLowerCase()) {
        return (gate.location.latitude, gate.location.longitude);
      }
    }

    return null;
  }

  Future<void> _estimate() async {
    final language = ref.read(languageProvider);
    final from = _resolveLocation(_fromController.text);
    final to = _resolveLocation(_toController.text);

    if (from == null || to == null) {
      setState(() {
        _error = language == 'bn'
            ? 'শুরু এবং শেষ অবস্থান সঠিকভাবে দিন (যেমন: Dhaka, অথবা 23.81,90.41)'
            : 'Provide valid start and destination (e.g. Dhaka or 23.81,90.41).';
      });
      return;
    }

    setState(() {
      _calculating = true;
      _error = null;
    });

    try {
      final estimate = await ref.read(tollActionsProvider).estimateRouteTolls(
            originLat: from.$1,
            originLng: from.$2,
            destLat: to.$1,
            destLng: to.$2,
            vehicleType: _vehicleType,
          );
      if (!mounted) return;
      setState(() {
        _result = estimate;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _calculating = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final gates = ref.watch(tollGatesProvider).valueOrNull ?? const [];
    final suggestions = <String>{
      ..._cityLocations.keys,
      ...gates.map((item) => item.name),
      ...gates.map((item) => item.nameEn),
    }.toList()
      ..sort();

    final balance = ref.watch(walletBalanceProvider).valueOrNull ?? 0;
    final total = _result?.totalAmount ?? 0;
    final shortfall = total - balance;
    final hasEnough = shortfall <= 0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(language == 'bn' ? 'যাত্রাপথ পরিকল্পনাকারী' : 'Route Toll Estimator'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          _LocationAutoField(
            label: language == 'bn' ? 'From' : 'From',
            hint: language == 'bn' ? 'ঢাকা / Gate নাম / lat,lng' : 'Dhaka / Gate name / lat,lng',
            controller: _fromController,
            suggestions: suggestions,
          ),
          const SizedBox(height: AppSpacing.md),
          _LocationAutoField(
            label: language == 'bn' ? 'To' : 'To',
            hint: language == 'bn' ? 'চট্টগ্রাম / Gate নাম / lat,lng' : 'Chattogram / Gate name / lat,lng',
            controller: _toController,
            suggestions: suggestions,
          ),
          const SizedBox(height: AppSpacing.md),
          DropdownButtonFormField<String>(
            initialValue: _vehicleType,
            decoration: InputDecoration(
              labelText: language == 'bn' ? 'যানবাহনের ধরণ' : 'Vehicle type',
            ),
            items: const [
              DropdownMenuItem(value: 'motorcycle', child: Text('🏍️ Motorcycle')),
              DropdownMenuItem(value: 'car', child: Text('🚗 Car')),
              DropdownMenuItem(value: 'microbus', child: Text('🚐 Microbus')),
              DropdownMenuItem(value: 'truck', child: Text('🚛 Truck')),
              DropdownMenuItem(value: 'bus', child: Text('🚌 Bus')),
            ],
            onChanged: (value) {
              if (value == null) return;
              setState(() => _vehicleType = value);
            },
          ),
          const SizedBox(height: AppSpacing.lg),
          FilledButton(
            onPressed: _calculating ? null : _estimate,
            child: _calculating
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : Text(language == 'bn' ? 'হিসাব করুন' : 'Estimate'),
          ),
          if (_error != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(_error!, style: AppTextStyles.bodySmall.copyWith(color: AppColors.error)),
          ],
          if (_result != null) ...[
            const SizedBox(height: AppSpacing.lg),
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    language == 'bn' ? 'রুট প্রিভিউ' : 'Route preview',
                    style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Container(
                    height: 140,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      gradient: const LinearGradient(
                        colors: [Color(0xFFE9F7F1), Color(0xFFD7EFE6)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: const Center(
                      child: Icon(Icons.alt_route_rounded, size: 48, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    language == 'bn' ? 'এই রুটের টোল গেট' : 'Toll gates on this route',
                    style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  ..._result!.tollsOnRoute.asMap().entries.map(
                    (entry) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              '${entry.key + 1}. ${entry.value.gateName} — ${entry.value.roadName}',
                              style: AppTextStyles.bodySmall,
                            ),
                          ),
                          Text(
                            CurrencyFormatter.formatPaisa(entry.value.amount),
                            style: AppTextStyles.amountSmall,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Divider(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          language == 'bn' ? 'মোট' : 'Total',
                          style: AppTextStyles.h4,
                        ),
                      ),
                      Text(
                        CurrencyFormatter.formatPaisa(_result!.totalAmount),
                        style: AppTextStyles.amountLarge.copyWith(color: AppColors.primary),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    hasEnough
                        ? (language == 'bn'
                            ? 'আপনার ব্যালেন্স: ${CurrencyFormatter.formatPaisa(balance)} ✓'
                            : 'Your balance: ${CurrencyFormatter.formatPaisa(balance)} ✓')
                        : (language == 'bn'
                            ? 'আপনার ব্যালেন্স: ${CurrencyFormatter.formatPaisa(balance)} ✗ (${CurrencyFormatter.formatPaisa(shortfall)} কম)'
                            : 'Your balance: ${CurrencyFormatter.formatPaisa(balance)} ✗ (short ${CurrencyFormatter.formatPaisa(shortfall)})'),
                    style: AppTextStyles.bodySmall.copyWith(
                      color: hasEnough ? AppColors.success : AppColors.error,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => context.push('/wallet/add'),
                          child: Text(language == 'bn' ? 'টাকা যোগ করুন' : 'Add money'),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: FilledButton(
                          onPressed: () => context.go('/pay'),
                          child: Text(language == 'bn' ? 'সরাসরি পেমেন্ট' : 'Start payment'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _LocationAutoField extends StatelessWidget {
  const _LocationAutoField({
    required this.label,
    required this.hint,
    required this.controller,
    required this.suggestions,
  });

  final String label;
  final String hint;
  final TextEditingController controller;
  final List<String> suggestions;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelLarge),
        const SizedBox(height: AppSpacing.xs),
        Autocomplete<String>(
          optionsBuilder: (textEditingValue) {
            final query = textEditingValue.text.trim().toLowerCase();
            if (query.isEmpty) return suggestions.take(8);
            return suggestions
                .where((item) => item.toLowerCase().contains(query))
                .take(8);
          },
          onSelected: (value) {
            controller.text = value;
          },
          fieldViewBuilder: (_, textController, focusNode, __) {
            textController.text = controller.text;
            textController.selection = TextSelection.collapsed(offset: textController.text.length);
            return TextField(
              controller: textController,
              focusNode: focusNode,
              onChanged: (value) => controller.text = value,
              decoration: InputDecoration(hintText: hint),
            );
          },
        ),
      ],
    );
  }
}
