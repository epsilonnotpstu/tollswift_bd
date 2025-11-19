import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:vibration/vibration.dart';
import 'package:go_router/go_router.dart';

class ScanQRScreen extends StatefulWidget {
  const ScanQRScreen({super.key});

  @override
  State<ScanQRScreen> createState() => _ScanQRScreenState();
}

class _ScanQRScreenState extends State<ScanQRScreen> {
  MobileScannerController controller = MobileScannerController(
    torchEnabled: false,
    formats: [BarcodeFormat.qrCode],
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Scan Toll QR"),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: controller,
            onDetect: (barcode) {
              final String? code = barcode.barcodes.first.rawValue;
              if (code != null && code.contains("tollswift://pay")) {
                Vibration.vibrate(pattern: [500, 500]);
                controller.stop();
                // Parse bridge ID and amount
                final uri = Uri.parse(code);
                final bridgeId = uri.queryParameters['bridge'];
                final amount = double.tryParse(uri.queryParameters['amount'] ?? "0") ?? 0;

                context.push('/toll/success?bridge=$bridgeId&amount=$amount');
              }
            },
          ),

          // Overlay
          Center(
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.green, width: 4),
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),

          const Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Text(
              "Align QR code within the frame",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}