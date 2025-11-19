import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:tollswift_bd/presentation/providers/auth_provider.dart';
import 'package:tollswift_bd/presentation/providers/vehicle_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final vehicles = ref.watch(vehicleListProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Balance Card - Google Pay Style
              Card(
                elevation: 8,
                shadowColor: Colors.blue.withOpacity(0.3),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1A73E8), Color(0xFF4285F4)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Wallet Balance', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.white70)),
                            const SizedBox(height: 8),
                            Text(
                              '৳ ${user?.walletBalance.toStringAsFixed(0) ?? "0"}',
                              style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.account_balance_wallet, size: 48, color: Colors.white),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 32),

              Text('Your Vehicles', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),

              vehicles.when(
                data: (list) => list.isEmpty
                    ? _buildEmptyVehicle(context)
                    : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: list.length,
                        itemBuilder: (ctx, i) => VehicleCard(vehicle: list[i]),
                      ),
                loading: () => const CircularProgressIndicator(),
                error: (_, __) => const Text("Error loading vehicles"),
              ),
            ],
          ),
        ),
      ),

      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/toll/scan'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
        label: const Text("Scan to Pay Toll", style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _buildEmptyVehicle(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.directions_car, size: 40),
        title: const Text("No vehicle added"),
        subtitle: const Text("Add your first vehicle to pay toll instantly"),
        trailing: const Icon(Icons.arrow_forward),
        onTap: () => context.push('/vehicle/add'),
      ),
    );
  }
}

class VehicleCard extends StatelessWidget {
  final dynamic vehicle;
  const VehicleCard({super.key, required this.vehicle});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(backgroundColor: Colors.blue[100], child: const Icon(Icons.directions_car)),
        title: Text(vehicle.regNumber),
        subtitle: Text("${vehicle.type} • Default"),
        trailing: vehicle.isDefault ? Chip(label: Text("Default"), backgroundColor: Colors.green[100]) : null,
      ),
    );
  }
}