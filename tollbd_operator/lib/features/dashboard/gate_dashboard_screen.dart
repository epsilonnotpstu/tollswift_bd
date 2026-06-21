import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'vehicle_queue_widget.dart';

class GateDashboardScreen extends StatefulWidget {
  const GateDashboardScreen({
    super.key,
    required this.operatorData,
  });

  final Map<String, dynamic> operatorData;

  @override
  State<GateDashboardScreen> createState() => _GateDashboardScreenState();
}

class _GateDashboardScreenState extends State<GateDashboardScreen> {
  String _feedFilter = 'all';

  String get _gateId => widget.operatorData['assigned_gate_id']?.toString() ?? '';

  Future<void> _setGateStatus(String status) async {
    if (_gateId.isEmpty) return;
    try {
      final callable =
          FirebaseFunctions.instance.httpsCallable('operatorSetGateStatus');
      await callable.call({
        'gateId': _gateId,
        'status': status,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gate status updated: $status')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  String _shiftRemaining(String shiftEnd) {
    final now = DateTime.now();
    final split = shiftEnd.split(':');
    if (split.length != 2) return '-';
    final end = DateTime(
      now.year,
      now.month,
      now.day,
      int.tryParse(split[0]) ?? 0,
      int.tryParse(split[1]) ?? 0,
    );
    final diff = end.difference(now);
    if (diff.isNegative) return 'Shift ended';
    final h = diff.inHours;
    final m = diff.inMinutes % 60;
    return '${h}h ${m}m';
  }

  bool _matchesFilter(Map<String, dynamic> item) {
    if (_feedFilter == 'all') return true;
    final status = item['status']?.toString() ?? '';
    final amount = (item['amount'] as num?)?.toInt() ?? 0;
    if (_feedFilter == 'success') return status == 'success' && amount > 0;
    if (_feedFilter == 'pass') return amount == 0;
    if (_feedFilter == 'dispute') return status == 'disputed' || status == 'failed';
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final gateStream = FirebaseFirestore.instance.collection('toll_gates').doc(_gateId).snapshots();
    final queueStream = FirebaseFirestore.instance.collection('gate_queue').doc(_gateId).snapshots();
    final txStream = FirebaseFirestore.instance
        .collection('toll_payments')
        .where('gate_id', isEqualTo: _gateId)
        .orderBy('created_at', descending: true)
        .limit(60)
        .snapshots();

    final dateKey = DateFormat('yyyyMMdd').format(DateTime.now());
    final analyticsStream = FirebaseFirestore.instance
        .collection('analytics_daily')
        .doc('${_gateId}_$dateKey')
        .snapshots();

    final shiftStart = widget.operatorData['shift_start']?.toString() ?? '08:00';
    final shiftEnd = widget.operatorData['shift_end']?.toString() ?? '20:00';

    return StreamBuilder<DocumentSnapshot<Map<String, dynamic>>>(
      stream: gateStream,
      builder: (context, gateSnapshot) {
        final gate = gateSnapshot.data?.data() ?? const <String, dynamic>{};
        final gateName = gate['name']?.toString() ?? 'Unknown Gate';
        final gateStatus = gate['status']?.toString() ?? 'inactive';
        final statusColor = gateStatus == 'active'
            ? const Color(0xFF0B8A5E)
            : const Color(0xFFB91C1C);
        final statusBg =
            gateStatus == 'active' ? const Color(0xFFEAF9F2) : const Color(0xFFFEF2F2);
        final statusLabel = gateStatus == 'active' ? '● সক্রিয়' : '● বন্ধ';

        return Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                flex: 4,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            gateName,
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusBg,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            statusLabel,
                            style: TextStyle(
                              color: statusColor,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    StreamBuilder<DocumentSnapshot<Map<String, dynamic>>>(
                      stream: analyticsStream,
                      builder: (context, analyticsSnapshot) {
                        final stats = analyticsSnapshot.data?.data() ?? const <String, dynamic>{};
                        final vehicleCounts = stats['vehicle_counts'] as Map<String, dynamic>?;

                        final items = [
                          ('আজকের আয়', '৳${((stats['total_revenue'] as num?)?.toDouble() ?? 0) / 100}'.split('.').first),
                          ('মোট গাড়ি', '${(stats['total_vehicles'] as num?)?.toInt() ?? 0}'),
                          ('FastPass', '${(stats['pass_usage_count'] as num?)?.toInt() ?? 0} টি'),
                          ('বিরোধ', '${(stats['dispute_count'] as num?)?.toInt() ?? 0} টি'),
                        ];

                        return GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: items.length,
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            mainAxisSpacing: 8,
                            crossAxisSpacing: 8,
                            childAspectRatio: 2,
                          ),
                          itemBuilder: (context, index) {
                            final item = items[index];
                            return Card(
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(item.$1, style: const TextStyle(color: Colors.black54)),
                                    const SizedBox(height: 4),
                                    Text(
                                      item.$2,
                                      style: const TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    if (vehicleCounts != null && index == 1)
                                      Text(
                                        '🚗 ${vehicleCounts['car'] ?? 0} • 🏍️ ${vehicleCounts['motorcycle'] ?? 0}',
                                        style: const TextStyle(fontSize: 12, color: Colors.black54),
                                      ),
                                  ],
                                ),
                              ),
                            );
                          },
                        );
                      },
                    ),
                    const SizedBox(height: 10),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Gate control',
                              style: TextStyle(fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  child: FilledButton.icon(
                                    onPressed: () => _setGateStatus('active'),
                                    icon: const Icon(Icons.play_arrow_rounded),
                                    label: const Text('গেট খোলো'),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: FilledButton.tonalIcon(
                                    onPressed: () => _setGateStatus('inactive'),
                                    icon: const Icon(Icons.stop_rounded),
                                    label: const Text('গেট বন্ধ'),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text('আপনার শিফট: $shiftStart — $shiftEnd'),
                            Text('অবশিষ্ট সময়: ${_shiftRemaining(shiftEnd)}'),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    StreamBuilder<DocumentSnapshot<Map<String, dynamic>>>(
                      stream: queueStream,
                      builder: (context, queueSnapshot) {
                        final queueData = queueSnapshot.data?.data() ?? const <String, dynamic>{};
                        final vehicles = (queueData['vehicles'] as List?)
                                ?.map((item) => (item as Map).cast<String, dynamic>())
                                .toList() ??
                            const <Map<String, dynamic>>[];

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Live Queue',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 8),
                            VehicleQueueWidget(vehicles: vehicles.take(6).toList()),
                          ],
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 6,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ('all', 'সব'),
                        ('success', 'শুধু সফল'),
                        ('pass', 'শুধু পাস'),
                        ('dispute', 'বিরোধ'),
                      ]
                          .map(
                            (chip) => ChoiceChip(
                              selected: _feedFilter == chip.$1,
                              label: Text(chip.$2),
                              onSelected: (_) => setState(() => _feedFilter = chip.$1),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 10),
                    Expanded(
                      child: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
                        stream: txStream,
                        builder: (context, txSnapshot) {
                          final rows = txSnapshot.data?.docs
                                  .map((doc) => doc.data())
                                  .where(_matchesFilter)
                                  .toList() ??
                              const <Map<String, dynamic>>[];

                          return Card(
                            child: ListView.separated(
                              itemCount: rows.length,
                              separatorBuilder: (_, __) => const Divider(height: 1),
                              itemBuilder: (context, index) {
                                final row = rows[index];
                                final createdAt =
                                    (row['created_at'] as Timestamp?)?.toDate() ?? DateTime.now();
                                final amount = (row['amount'] as num?)?.toInt() ?? 0;
                                final status = row['status']?.toString() ?? 'success';
                                final isPass = amount == 0;
                                final bg = status == 'success'
                                    ? (isPass ? const Color(0xFFEFF6FF) : const Color(0xFFECFDF5))
                                    : const Color(0xFFFEF2F2);

                                return Container(
                                  color: bg,
                                  child: ListTile(
                                    dense: true,
                                    title: Row(
                                      children: [
                                        SizedBox(
                                          width: 90,
                                          child: Text(DateFormat('h:mm a').format(createdAt)),
                                        ),
                                        Expanded(
                                          child: Text(
                                            row['vehicle_plate']?.toString() ?? '-',
                                            style: const TextStyle(fontWeight: FontWeight.w700),
                                          ),
                                        ),
                                        SizedBox(
                                          width: 110,
                                          child: Text(row['vehicle_type']?.toString() ?? '-'),
                                        ),
                                        SizedBox(width: 90, child: Text('৳${(amount / 100).toStringAsFixed(0)}')),
                                        SizedBox(
                                          width: 90,
                                          child: Text(
                                            status == 'success' ? '✓ সফল' : '⚠ বিরোধ',
                                            style: TextStyle(
                                              color: status == 'success'
                                                  ? const Color(0xFF0B8A5E)
                                                  : const Color(0xFFB91C1C),
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
