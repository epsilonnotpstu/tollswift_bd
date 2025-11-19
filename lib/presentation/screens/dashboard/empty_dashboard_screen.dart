import 'package:flutter/material.dart';

class EmptyDashboardScreen extends StatelessWidget {
  const EmptyDashboardScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text(
          'Welcome to TollSwift BD!',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}