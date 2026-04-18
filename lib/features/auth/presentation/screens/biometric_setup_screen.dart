import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:local_auth/local_auth.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/widgets/loading_overlay.dart';
import '../../../../core/widgets/toll_button.dart';
import '../providers/auth_provider.dart';

class BiometricSetupScreen extends ConsumerStatefulWidget {
  const BiometricSetupScreen({super.key, required this.mode});

  final String mode;

  @override
  ConsumerState<BiometricSetupScreen> createState() =>
      _BiometricSetupScreenState();
}

class _BiometricSetupScreenState extends ConsumerState<BiometricSetupScreen> {
  final _localAuth = LocalAuthentication();
  bool _loading = false;

  Future<void> _authenticate({required bool setupMode}) async {
    setState(() => _loading = true);
    try {
      final canCheck = await _localAuth.canCheckBiometrics;
      final supported = await _localAuth.isDeviceSupported();
      if (!canCheck || !supported) {
        if (!mounted) return;
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Biometric is not available on this device.'),
          ),
        );
        return;
      }

      final ok = await _localAuth.authenticate(
        localizedReason: 'Use biometric to continue in TollBD',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
          useErrorDialogs: true,
        ),
      );
      if (!mounted) return;
      if (!ok) {
        setState(() => _loading = false);
        return;
      }
      if (setupMode) {
        await ref.read(authControllerProvider).saveBiometricEnabled(true);
        if (!mounted) return;
      }
      context.go('/home');
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _skip() async {
    await ref.read(authControllerProvider).saveBiometricEnabled(false);
    if (!mounted) return;
    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final setupMode = widget.mode != 'unlock';
    final title = setupMode
        ? AppStrings.get('biometric_title', language)
        : AppStrings.get('unlock_title', language);
    final subtitle = setupMode
        ? AppStrings.get('biometric_subtitle', language)
        : AppStrings.get('unlock_subtitle', language);
    return LoadingOverlay(
      loading: _loading,
      child: Scaffold(
        appBar: AppBar(automaticallyImplyLeading: false),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              children: [
                const Spacer(),
                const Icon(
                  Icons.fingerprint_rounded,
                  color: AppColors.primary,
                  size: 88,
                ),
                const SizedBox(height: AppSpacing.xl),
                Text(
                  title,
                  style: AppTextStyles.h2,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  subtitle,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const Spacer(),
                TollButton(
                  label: setupMode
                      ? AppStrings.get('biometric_enable', language)
                      : AppStrings.get('unlock_now', language),
                  onPressed: () => _authenticate(setupMode: setupMode),
                ),
                if (setupMode) ...[
                  const SizedBox(height: AppSpacing.sm),
                  TextButton(
                    onPressed: _skip,
                    child: Text(
                      AppStrings.get('not_now', language),
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: AppSpacing.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
