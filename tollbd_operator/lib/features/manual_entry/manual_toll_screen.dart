import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class ManualTollScreen extends StatefulWidget {
  const ManualTollScreen({
    super.key,
    required this.operatorData,
  });

  final Map<String, dynamic> operatorData;

  @override
  State<ManualTollScreen> createState() => _ManualTollScreenState();
}

class _ManualTollScreenState extends State<ManualTollScreen> {
  final _plateController = TextEditingController();
  final _phoneController = TextEditingController();

  String _vehicleType = 'car';
  String _paymentMethod = 'cash';
  int _amount = 0;
  bool _submitting = false;
  Map<String, dynamic>? _matchedVehicle;
  Map<String, dynamic>? _matchedUser;

  String get _gateId => widget.operatorData['assigned_gate_id']?.toString() ?? '';

  @override
  void dispose() {
    _plateController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _lookupVehicle() async {
    final plate = _plateController.text.trim();
    if (plate.isEmpty) return;

    final snapshot = await FirebaseFirestore.instance
        .collection('vehicles')
        .where('plate_number', isEqualTo: plate)
        .limit(1)
        .get();

    if (snapshot.docs.isEmpty) {
      setState(() {
        _matchedVehicle = null;
      });
      return;
    }

    final data = snapshot.docs.first.data();
    setState(() {
      _matchedVehicle = data;
      _vehicleType = data['vehicle_type']?.toString() ?? _vehicleType;
    });
    await _refreshAmount();
  }

  Future<void> _lookupUserByPhone() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) return;
    final snapshot = await FirebaseFirestore.instance
        .collection('users')
        .where('phone', isEqualTo: phone)
        .limit(1)
        .get();
    setState(() {
      _matchedUser = snapshot.docs.isEmpty ? null : snapshot.docs.first.data();
    });
  }

  Future<void> _refreshAmount() async {
    if (_gateId.isEmpty) return;

    final gateDoc = await FirebaseFirestore.instance.collection('toll_gates').doc(_gateId).get();
    final rates = gateDoc.data()?['toll_rates'] as Map<String, dynamic>? ?? const {};
    final amount = (rates[_vehicleType] as num?)?.toInt() ?? (rates['car'] as num?)?.toInt() ?? 0;

    setState(() {
      _amount = amount;
    });
  }

  Future<void> _submit() async {
    if (_plateController.text.trim().isEmpty) return;
    if (_paymentMethod == 'app' && _phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter phone number for TollBD App payment')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final callable =
          FirebaseFunctions.instance.httpsCallable('operatorManualTollEntry');
      final response = await callable.call({
        'gateId': _gateId,
        'plateNumber': _plateController.text.trim(),
        'vehicleType': _vehicleType,
        'paymentMethod': _paymentMethod,
        'userPhone': _paymentMethod == 'app' ? _phoneController.text.trim() : null,
      });
      final result = (response.data as Map?)?.cast<String, dynamic>() ?? const {};

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _paymentMethod == 'app'
                ? 'App payment charged successfully (ID: ${result['paymentId'] ?? '-'})'
                : 'Manual cash entry recorded',
          ),
        ),
      );
      _plateController.clear();
      _phoneController.clear();
      setState(() {
        _matchedVehicle = null;
        _matchedUser = null;
      });
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  void initState() {
    super.initState();
    _refreshAmount();
  }

  @override
  Widget build(BuildContext context) {
    const vehicleTypes = {
      'motorcycle': '🏍️',
      'car': '🚗',
      'microbus': '🚐',
      'truck': '🚛',
      'bus': '🚌',
      'cng': '🛺',
    };

    return Padding(
      padding: const EdgeInsets.all(16),
      child: ListView(
        children: [
          Text('ম্যানুয়াল টোল এন্ট্রি', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _plateController,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
                  decoration: const InputDecoration(
                    hintText: 'ঢাকা মেট্রো ঘ ১১-১১১১',
                    labelText: 'Vehicle Plate',
                  ),
                ),
              ),
              const SizedBox(width: 8),
              FilledButton.icon(
                onPressed: _lookupVehicle,
                icon: const Icon(Icons.search),
                label: const Text('Lookup'),
              ),
            ],
          ),
          if (_matchedVehicle != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                'Matched: ${_matchedVehicle!['owner_uid'] ?? ''}',
                style: const TextStyle(color: Colors.black54),
              ),
            ),
          const SizedBox(height: 16),
          Text('Vehicle Type', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: vehicleTypes.entries
                .map(
                  (entry) => ChoiceChip(
                    selected: _vehicleType == entry.key,
                    label: Text('${entry.value} ${entry.key}'),
                    onSelected: (_) async {
                      setState(() => _vehicleType = entry.key);
                      await _refreshAmount();
                    },
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  const Text('টোল ফি:', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Text(
                    '৳${(_amount / 100).toStringAsFixed(0)}',
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'app', icon: Icon(Icons.phone_iphone_rounded), label: Text('TollBD App')),
              ButtonSegment(value: 'cash', icon: Icon(Icons.payments_rounded), label: Text('নগদ')),
            ],
            selected: {_paymentMethod},
            onSelectionChanged: (value) {
              setState(() => _paymentMethod = value.first);
            },
          ),
          if (_paymentMethod == 'app') ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _phoneController,
                    decoration: const InputDecoration(
                      labelText: 'User Phone Number',
                    ),
                    keyboardType: TextInputType.phone,
                  ),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  onPressed: _lookupUserByPhone,
                  child: const Text('Lookup'),
                ),
              ],
            ),
            if (_phoneController.text.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  _matchedUser == null
                      ? 'No account found for this number'
                      : 'User found: ${_matchedUser!['name'] ?? ''}',
                  style: TextStyle(
                    color: _matchedUser == null ? Colors.red : const Color(0xFF0B8A5E),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
          ],
          const SizedBox(height: 24),
          SizedBox(
            height: 56,
            child: FilledButton(
              onPressed: _submitting ? null : _submit,
              style: FilledButton.styleFrom(backgroundColor: const Color(0xFF0B8A5E)),
              child: _submitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text(
                      'কনফার্ম করুন',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
