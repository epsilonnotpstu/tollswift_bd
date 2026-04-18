import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/wallet_provider.dart';

class SSLCommerzWebviewScreen extends ConsumerStatefulWidget {
  const SSLCommerzWebviewScreen({
    super.key,
    required this.url,
    required this.transactionId,
  });

  final String url;
  final String transactionId;

  @override
  ConsumerState<SSLCommerzWebviewScreen> createState() =>
      _SSLCommerzWebviewScreenState();
}

class _SSLCommerzWebviewScreenState
    extends ConsumerState<SSLCommerzWebviewScreen> {
  late final WebViewController _controller;
  int _loadingProgress = 0;
  bool _validating = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (progress) {
            setState(() => _loadingProgress = progress);
          },
          onNavigationRequest: _onNavigationRequest,
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  NavigationDecision _onNavigationRequest(NavigationRequest request) {
    final url = request.url;
    if (url.startsWith('https://tollbd.app/payment/success')) {
      _handlePaymentSuccess();
      return NavigationDecision.prevent;
    }
    if (url.startsWith('https://tollbd.app/payment/fail')) {
      if (!mounted) return NavigationDecision.prevent;
      context.go('/wallet/payment-failed?txId=${widget.transactionId}');
      return NavigationDecision.prevent;
    }
    if (url.startsWith('https://tollbd.app/payment/cancel')) {
      if (!mounted) return NavigationDecision.prevent;
      context.go('/wallet/add');
      return NavigationDecision.prevent;
    }
    return NavigationDecision.navigate;
  }

  Future<void> _handlePaymentSuccess() async {
    if (_validating) return;
    setState(() => _validating = true);
    final valid = await ref
        .read(walletActionControllerProvider)
        .validatePayment(widget.transactionId);
    if (!mounted) return;
    if (valid) {
      context.go('/wallet/payment-success?txId=${widget.transactionId}');
    } else {
      context.go('/wallet/payment-failed?txId=${widget.transactionId}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    return Scaffold(
      appBar: AppBar(title: Text(AppStrings.get('safe_payment', language))),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_loadingProgress < 100)
            LinearProgressIndicator(
              value: _loadingProgress / 100,
              minHeight: 2,
              color: AppColors.primary,
            ),
          if (_validating)
            Container(
              color: Colors.black45,
              child: const Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
    );
  }
}
