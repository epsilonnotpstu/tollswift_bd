import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pinput/pinput.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/loading_overlay.dart';
import '../providers/auth_provider.dart';

class OtpVerifyScreen extends ConsumerStatefulWidget {
  const OtpVerifyScreen({
    super.key,
    required this.verificationId,
    required this.phone,
  });

  final String verificationId;
  final String phone;

  @override
  ConsumerState<OtpVerifyScreen> createState() => _OtpVerifyScreenState();
}

class _OtpVerifyScreenState extends ConsumerState<OtpVerifyScreen> {
  final _pinController = TextEditingController();
  Timer? _timer;
  int _seconds = 45;
  bool _loading = false;
  bool _invalidOtp = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _seconds = 45;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_seconds == 0) {
        timer.cancel();
      } else {
        setState(() => _seconds -= 1);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pinController.dispose();
    super.dispose();
  }

  Future<void> _verify(String code) async {
    setState(() {
      _loading = true;
      _invalidOtp = false;
    });
    try {
      await ref
          .read(authRepositoryProvider)
          .signInWithOtp(verificationId: widget.verificationId, smsCode: code);
      if (!mounted) return;
      final profile = await ref
          .read(authRepositoryProvider)
          .getUserProfile(FirebaseAuth.instance.currentUser!.uid);
      if (!mounted) return;
      if (profile == null) {
        context.go('/profile-setup');
        return;
      }
      if (profile.biometricEnabled) {
        context.go('/biometric-setup?mode=unlock');
      } else {
        context.go('/biometric-setup?mode=setup');
      }
    } on FirebaseAuthException {
      setState(() {
        _invalidOtp = true;
        _loading = false;
      });
    } catch (_) {
      setState(() {
        _invalidOtp = true;
        _loading = false;
      });
    }
  }

  Future<void> _resendOtp() async {
    if (_seconds != 0) return;
    _startTimer();
    await ref.read(authRepositoryProvider).verifyPhoneNumber(
          phoneNumber: widget.phone,
          verificationCompleted: (credential) async {
            await FirebaseAuth.instance.signInWithCredential(credential);
          },
          verificationFailed: (e) {
            if (!mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(e.message ?? 'OTP resend failed')),
            );
          },
          codeSent: (verificationId, resendToken) {
            if (!mounted) return;
            final encodedVerificationId =
                Uri.encodeQueryComponent(verificationId);
            final encodedPhone = Uri.encodeQueryComponent(widget.phone);
            context.pushReplacement(
              '/otp?vid=$encodedVerificationId&phone=$encodedPhone',
            );
          },
          codeAutoRetrievalTimeout: (_) {},
        );
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final baseTheme = PinTheme(
      width: 52,
      height: 60,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(
          color: _invalidOtp ? AppColors.error : AppColors.cardBorder,
        ),
      ),
      textStyle: AppTextStyles.h3,
    );
    final focusedTheme = baseTheme.copyDecorationWith(
      color: AppColors.primary.withValues(alpha: 0.05),
      border: Border.all(
        color: _invalidOtp ? AppColors.error : AppColors.primary,
        width: 1.8,
      ),
    );
    final submittedTheme = baseTheme.copyWith(
      decoration: BoxDecoration(
        color: _invalidOtp ? AppColors.errorBg : AppColors.primary,
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      textStyle: AppTextStyles.h3.copyWith(
        color: _invalidOtp ? AppColors.error : Colors.white,
        fontWeight: FontWeight.w700,
      ),
    );

    return LoadingOverlay(
      loading: _loading,
      child: Scaffold(
        appBar: AppBar(),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  Validators.maskPhone(widget.phone),
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  AppStrings.get('verify_otp', language),
                  style: AppTextStyles.h2,
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  AppStrings.get('otp_sent_to', language),
                  style: AppTextStyles.bodyMedium,
                ),
                const SizedBox(height: AppSpacing.xl),
                Pinput(
                  controller: _pinController,
                  length: 6,
                  autofocus: true,
                  defaultPinTheme: baseTheme,
                  focusedPinTheme: focusedTheme,
                  submittedPinTheme: submittedTheme,
                  onChanged: (_) => setState(() {}),
                  onCompleted: _verify,
                ),
                if (_invalidOtp) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    AppStrings.get('wrong_otp', language),
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.error,
                    ),
                  ),
                ],
                const SizedBox(height: AppSpacing.lg),
                InkWell(
                  onTap: _seconds == 0 ? _resendOtp : null,
                  child: Text(
                    _seconds == 0
                        ? AppStrings.get('resend_otp', language)
                        : AppStrings.get(
                            'resend_otp_in',
                            language,
                            args: {
                              'time':
                                  '${(_seconds ~/ 60).toString().padLeft(1, '0')}:${(_seconds % 60).toString().padLeft(2, '0')}',
                            },
                          ),
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: _seconds == 0
                          ? AppColors.primary
                          : AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: FilledButton(
                    onPressed: _pinController.text.length == 6
                        ? () => _verify(_pinController.text)
                        : null,
                    child: Text(AppStrings.get('verify', language)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
