import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/operator_theme.dart';
import 'features/auth/operator_login_screen.dart';
import 'features/dashboard/gate_dashboard_screen.dart';
import 'features/manual_entry/manual_toll_screen.dart';
import 'features/reports/operator_reports_screen.dart';
import 'firebase_options.dart';

final authStateProvider = StreamProvider<User?>((ref) {
  return FirebaseAuth.instance.authStateChanges();
});

final operatorDocProvider = StreamProvider<Map<String, dynamic>?>((ref) {
  final user = ref.watch(authStateProvider).valueOrNull;
  if (user == null) return Stream.value(null);

  return FirebaseFirestore.instance
      .collection('gate_operators')
      .doc(user.uid)
      .snapshots()
      .map((doc) => doc.data());
});

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  runApp(const ProviderScope(child: TollBdOperatorApp()));
}

class TollBdOperatorApp extends StatelessWidget {
  const TollBdOperatorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TollBD Operator',
      debugShowCheckedModeBanner: false,
      theme: OperatorTheme.light,
      home: const _AuthGate(),
    );
  }
}

class _AuthGate extends ConsumerWidget {
  const _AuthGate();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authAsync = ref.watch(authStateProvider);
    return authAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (error, _) => Scaffold(body: Center(child: Text(error.toString()))),
      data: (user) {
        if (user == null) return const OperatorLoginScreen();

        final operatorAsync = ref.watch(operatorDocProvider);
        return operatorAsync.when(
          loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
          error: (error, _) => Scaffold(body: Center(child: Text(error.toString()))),
          data: (operator) {
            if (operator == null || operator['status'] != 'active') {
              return const _BlockedScreen();
            }
            return OperatorShell(operatorData: operator);
          },
        );
      },
    );
  }
}

class OperatorShell extends StatefulWidget {
  const OperatorShell({super.key, required this.operatorData});

  final Map<String, dynamic> operatorData;

  @override
  State<OperatorShell> createState() => _OperatorShellState();
}

class _OperatorShellState extends State<OperatorShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      GateDashboardScreen(operatorData: widget.operatorData),
      ManualTollScreen(operatorData: widget.operatorData),
      OperatorReportsScreen(operatorData: widget.operatorData),
    ];

    return Scaffold(
      body: SafeArea(
        child: Row(
          children: [
            NavigationRail(
              selectedIndex: _index,
              onDestinationSelected: (value) => setState(() => _index = value),
              labelType: NavigationRailLabelType.all,
              destinations: const [
                NavigationRailDestination(
                  icon: Icon(Icons.dashboard_outlined),
                  selectedIcon: Icon(Icons.dashboard_rounded),
                  label: Text('Dashboard'),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.edit_note_rounded),
                  selectedIcon: Icon(Icons.edit_note_rounded),
                  label: Text('Manual'),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.bar_chart_rounded),
                  selectedIcon: Icon(Icons.bar_chart_rounded),
                  label: Text('Reports'),
                ),
              ],
              trailing: Expanded(
                child: Align(
                  alignment: Alignment.bottomCenter,
                  child: IconButton(
                    tooltip: 'Logout',
                    icon: const Icon(Icons.logout_rounded),
                    onPressed: () async {
                      await FirebaseAuth.instance.signOut();
                    },
                  ),
                ),
              ),
            ),
            const VerticalDivider(width: 1),
            Expanded(child: pages[_index]),
          ],
        ),
      ),
    );
  }
}

class _BlockedScreen extends StatelessWidget {
  const _BlockedScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.block_rounded, size: 48, color: Colors.redAccent),
              const SizedBox(height: 12),
              Text(
                'Operator account inactive',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              const Text('Please contact your supervisor or admin.'),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () => FirebaseAuth.instance.signOut(),
                child: const Text('Logout'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
