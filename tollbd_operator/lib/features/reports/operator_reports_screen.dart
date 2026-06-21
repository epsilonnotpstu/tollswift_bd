import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class OperatorReportsScreen extends StatelessWidget {
  const OperatorReportsScreen({
    super.key,
    required this.operatorData,
  });

  final Map<String, dynamic> operatorData;

  @override
  Widget build(BuildContext context) {
    final gateId = operatorData['assigned_gate_id']?.toString() ?? '';
    final dateKey = DateFormat('yyyyMMdd').format(DateTime.now());

    return Padding(
      padding: const EdgeInsets.all(16),
      child: StreamBuilder<DocumentSnapshot<Map<String, dynamic>>>(
        stream: FirebaseFirestore.instance
            .collection('analytics_daily')
            .doc('${gateId}_$dateKey')
            .snapshots(),
        builder: (context, snapshot) {
          final data = snapshot.data?.data() ?? const <String, dynamic>{};
          final hourly = (data['hourly_data'] as List?)
                  ?.map((item) => (item as Map).cast<String, dynamic>())
                  .toList() ??
              const <Map<String, dynamic>>[];

          return ListView(
            children: [
              Text('Operator Reports', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      _Metric(
                        title: 'Revenue',
                        value: '৳${(((data['total_revenue'] as num?)?.toDouble() ?? 0) / 100).toStringAsFixed(0)}',
                      ),
                      _Metric(
                        title: 'Vehicles',
                        value: '${(data['total_vehicles'] as num?)?.toInt() ?? 0}',
                      ),
                      _Metric(
                        title: 'Peak Hour',
                        value: '${(data['peak_hour'] as num?)?.toInt() ?? 0}:00',
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Card(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('Hour')),
                      DataColumn(label: Text('Vehicles')),
                      DataColumn(label: Text('Revenue')),
                    ],
                    rows: hourly
                        .map(
                          (row) => DataRow(cells: [
                            DataCell(Text('${row['hour'] ?? 0}:00')),
                            DataCell(Text('${row['vehicles'] ?? 0}')),
                            DataCell(Text('৳${((row['revenue'] as num?)?.toDouble() ?? 0) / 100}')),
                          ]),
                        )
                        .toList(),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.black54)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 20)),
        ],
      ),
    );
  }
}
