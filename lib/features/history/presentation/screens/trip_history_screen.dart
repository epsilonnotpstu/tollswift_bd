import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../vehicle/presentation/providers/vehicle_provider.dart';
import '../../domain/trip_model.dart';
import '../providers/history_provider.dart';

class TripHistoryScreen extends ConsumerStatefulWidget {
  const TripHistoryScreen({super.key, this.showAppBar = false});

  final bool showAppBar;

  @override
  ConsumerState<TripHistoryScreen> createState() => _TripHistoryScreenState();
}

class _TripHistoryScreenState extends ConsumerState<TripHistoryScreen> {
  String _typeFilter = 'all';
  String _vehicleFilter = 'all';

  List<TripModel> _applyFilters(List<TripModel> items) {
    return items.where((item) {
      final typeOk = _typeFilter == 'all' || item.type == _typeFilter;
      final vehicleOk = _vehicleFilter == 'all' || item.vehicleId == _vehicleFilter;
      return typeOk && vehicleOk;
    }).toList();
  }

  Map<String, List<TripModel>> _groupByDate(List<TripModel> trips, String language) {
    final grouped = <String, List<TripModel>>{};
    for (final trip in trips) {
      final key = DateFormatter.formatShortDate(trip.createdAt, language: language);
      grouped.putIfAbsent(key, () => []).add(trip);
    }
    return grouped;
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final tripsAsync = ref.watch(tripsProvider);
    final vehicles = ref.watch(vehiclesProvider).valueOrNull ?? const [];
    final title = language == 'bn' ? 'ট্রিপ ইতিহাস' : 'Trip History';

    return Scaffold(
      appBar: widget.showAppBar ? AppBar(title: Text(title)) : null,
      backgroundColor: AppColors.background,
      body: tripsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text(error.toString())),
        data: (trips) {
          final filtered = _applyFilters(trips);
          final grouped = _groupByDate(filtered, language);
          final totalSpent = filtered
              .where((t) => t.amount < 0 && t.type == 'toll')
              .fold<int>(0, (sum, t) => sum + t.amount.abs());

          return ListView(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.lg,
              AppSpacing.lg,
              90,
            ),
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Row(
                  children: [
                    _Stat(
                      label: language == 'bn' ? 'যাত্রা' : 'Trips',
                      value: '${filtered.where((i) => i.type == 'toll').length}',
                    ),
                    _Stat(
                      label: language == 'bn' ? 'মোট ব্যয়' : 'Spent',
                      value: CurrencyFormatter.formatPaisa(totalSpent),
                    ),
                    _Stat(
                      label: language == 'bn' ? 'গেট' : 'Gates',
                      value: '${filtered.map((e) => e.gateId).toSet().length}',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: [
                  ChoiceChip(
                    selected: _typeFilter == 'all',
                    label: Text(language == 'bn' ? 'সব' : 'All'),
                    onSelected: (_) => setState(() => _typeFilter = 'all'),
                  ),
                  ChoiceChip(
                    selected: _typeFilter == 'toll',
                    label: Text(language == 'bn' ? 'টোল' : 'Toll'),
                    onSelected: (_) => setState(() => _typeFilter = 'toll'),
                  ),
                  ChoiceChip(
                    selected: _typeFilter == 'pass',
                    label: Text(language == 'bn' ? 'পাস' : 'Pass'),
                    onSelected: (_) => setState(() => _typeFilter = 'pass'),
                  ),
                  DropdownButton<String>(
                    value: _vehicleFilter,
                    underline: const SizedBox.shrink(),
                    items: [
                      DropdownMenuItem(
                        value: 'all',
                        child: Text(language == 'bn' ? 'সব গাড়ি' : 'All vehicles'),
                      ),
                      ...vehicles.map(
                        (v) => DropdownMenuItem(
                          value: v.id,
                          child: Text(v.plateNumber),
                        ),
                      ),
                    ],
                    onChanged: (value) {
                      if (value == null) return;
                      setState(() => _vehicleFilter = value);
                    },
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              if (filtered.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Text(
                      language == 'bn'
                          ? 'কোনো ট্রিপ পাওয়া যায়নি'
                          : 'No trips found',
                    ),
                  ),
                ),
              ...grouped.entries.map(
                (entry) => _DateGroup(
                  dateLabel: entry.key,
                  trips: entry.value,
                  language: language,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _DateGroup extends StatelessWidget {
  const _DateGroup({
    required this.dateLabel,
    required this.trips,
    required this.language,
  });

  final String dateLabel;
  final List<TripModel> trips;
  final String language;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            dateLabel,
            style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: AppSpacing.sm),
          ...trips.map(
            (trip) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: Dismissible(
                key: ValueKey(trip.id),
                direction: DismissDirection.endToStart,
                confirmDismiss: (_) async {
                  if (trip.type != 'toll' || trip.paymentId == null) return false;
                  context.push('/history/dispute?paymentId=${trip.paymentId}');
                  return false;
                },
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: AppColors.error,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                  ),
                  child: Text(
                    language == 'bn' ? 'বিরোধ দাখিল করুন' : 'Raise dispute',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                child: _TripTile(trip: trip, language: language),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TripTile extends StatelessWidget {
  const _TripTile({required this.trip, required this.language});

  final TripModel trip;
  final String language;

  @override
  Widget build(BuildContext context) {
    final isCredit = trip.isCredit;
    final color = isCredit ? AppColors.success : AppColors.error;
    return InkWell(
      onTap: () {
        if (trip.paymentId != null) {
          context.push('/history/receipt?paymentId=${trip.paymentId}');
        }
      },
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 18,
              alignment: Alignment.topCenter,
              child: Column(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                  ),
                  Container(
                    width: 2,
                    height: 34,
                    color: AppColors.cardBorder,
                  ),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          trip.title,
                          style: AppTextStyles.bodyMedium
                              .copyWith(fontWeight: FontWeight.w700),
                        ),
                      ),
                      Text(
                        '${isCredit ? '+' : '-'} ${CurrencyFormatter.formatPaisa(trip.amount.abs())}',
                        style: AppTextStyles.amountSmall.copyWith(color: color),
                      ),
                    ],
                  ),
                  Text(trip.subtitle, style: AppTextStyles.bodySmall),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        DateFormatter.formatTime(trip.createdAt, language: language),
                        style: AppTextStyles.bodySmall,
                      ),
                      const SizedBox(width: 8),
                      if (trip.vehiclePlate != null)
                        Text(
                          trip.vehiclePlate!,
                          style: AppTextStyles.bodySmall,
                        ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: trip.status == 'success'
                              ? AppColors.successBg
                              : AppColors.errorBg,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          trip.status,
                          style: AppTextStyles.bodySmall.copyWith(
                            color: trip.status == 'success'
                                ? AppColors.success
                                : AppColors.error,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(label, style: AppTextStyles.bodySmall),
          const SizedBox(height: 2),
          Text(value, style: AppTextStyles.amountSmall),
        ],
      ),
    );
  }
}
