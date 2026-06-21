import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/profile_provider.dart';

class NidVerificationScreen extends ConsumerStatefulWidget {
  const NidVerificationScreen({super.key});

  @override
  ConsumerState<NidVerificationScreen> createState() => _NidVerificationScreenState();
}

class _NidVerificationScreenState extends ConsumerState<NidVerificationScreen> {
  final _nidController = TextEditingController();
  DateTime? _dob;
  File? _front;
  File? _back;
  File? _selfie;
  bool _submitting = false;

  @override
  void dispose() {
    _nidController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(String type) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 80,
      maxWidth: 1600,
    );
    if (picked == null || !mounted) return;
    setState(() {
      if (type == 'front') _front = File(picked.path);
      if (type == 'back') _back = File(picked.path);
      if (type == 'selfie') _selfie = File(picked.path);
    });
  }

  Future<void> _submit() async {
    final language = ref.read(languageProvider);
    final nid = _nidController.text.trim();
    final valid = RegExp(r'^\d{10}$|^\d{17}$').hasMatch(nid);
    if (!valid || _front == null || _back == null || _selfie == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            language == 'bn'
                ? '১০/১৭ সংখ্যার NID, এবং ৩টি ছবি প্রয়োজন'
                : 'Valid 10/17-digit NID and 3 photos are required',
          ),
        ),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await ref.read(profileActionsProvider).submitNidVerification(
            nidNumber: nid,
            dateOfBirth: _dob?.toIso8601String(),
            nidFront: _front!,
            nidBack: _back!,
            selfie: _selfie!,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(language == 'bn'
              ? 'যাচাই অনুরোধ জমা হয়েছে'
              : 'Verification request submitted'),
        ),
      );
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
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final verification = ref.watch(nidVerificationProvider).valueOrNull;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(language == 'bn' ? 'জাতীয় পরিচয়পত্র যাচাই' : 'NID Verification'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Text(
            language == 'bn'
                ? 'নিরাপদ যাচাই - আপনার তথ্য সুরক্ষিত থাকবে'
                : 'Secure verification - your data stays protected',
            style: AppTextStyles.bodyMedium,
          ),
          const SizedBox(height: AppSpacing.md),
          if (verification != null)
            Container(
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: verification.status == 'verified'
                    ? AppColors.successBg
                    : verification.status == 'rejected'
                        ? AppColors.errorBg
                        : AppColors.warningBg,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Text(
                verification.status == 'verified'
                    ? (language == 'bn' ? '✓ NID যাচাইকৃত' : '✓ NID verified')
                    : verification.status == 'rejected'
                        ? (language == 'bn'
                            ? 'প্রত্যাখ্যাত: ${verification.rejectionReason}'
                            : 'Rejected: ${verification.rejectionReason}')
                        : (language == 'bn'
                            ? 'যাচাই প্রক্রিয়াধীন... ১-২ কার্যদিবস লাগবে'
                            : 'Verification in progress... 1-2 business days'),
                style: AppTextStyles.bodySmall.copyWith(
                  fontWeight: FontWeight.w700,
                  color: verification.status == 'verified'
                      ? AppColors.success
                      : verification.status == 'rejected'
                          ? AppColors.error
                          : AppColors.warning,
                ),
              ),
            ),
          TextField(
            controller: _nidController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: language == 'bn' ? 'NID নম্বর' : 'NID number',
              hintText: language == 'bn' ? '১০ বা ১৭ সংখ্যা' : '10 or 17 digits',
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          OutlinedButton.icon(
            onPressed: () async {
              final picked = await showDatePicker(
                context: context,
                firstDate: DateTime(1940),
                lastDate: DateTime.now(),
                initialDate: DateTime(1990),
              );
              if (picked == null || !mounted) return;
              setState(() => _dob = picked);
            },
            icon: const Icon(Icons.date_range_rounded),
            label: Text(
              _dob == null
                  ? (language == 'bn' ? 'জন্ম তারিখ' : 'Date of Birth')
                  : '${_dob!.day}/${_dob!.month}/${_dob!.year}',
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          _UploadTile(
            title: language == 'bn' ? 'সামনের দিক' : 'NID Front',
            file: _front,
            onTap: () => _pickImage('front'),
          ),
          const SizedBox(height: AppSpacing.sm),
          _UploadTile(
            title: language == 'bn' ? 'পেছনের দিক' : 'NID Back',
            file: _back,
            onTap: () => _pickImage('back'),
          ),
          const SizedBox(height: AppSpacing.sm),
          _UploadTile(
            title: language == 'bn' ? 'সেলফি (Smile check)' : 'Selfie (Smile check)',
            file: _selfie,
            onTap: () => _pickImage('selfie'),
          ),
          const SizedBox(height: AppSpacing.lg),
          FilledButton(
            onPressed: _submitting ? null : _submit,
            child: _submitting
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : Text(language == 'bn' ? 'জমা দিন' : 'Submit'),
          ),
          const SizedBox(height: AppSpacing.md),
          _BenefitTile(text: language == 'bn' ? '✓ উচ্চতর দৈনিক লেনদেন সীমা' : '✓ Higher daily transaction limit'),
          _BenefitTile(text: language == 'bn' ? '✓ বিরোধ দাখিলে অগ্রাধিকার' : '✓ Priority dispute handling'),
          _BenefitTile(text: language == 'bn' ? '✓ ক্রেডিট-টোল বৈশিষ্ট্য (পরে আসবে)' : '✓ Credit toll feature (coming soon)'),
        ],
      ),
    );
  }
}

class _UploadTile extends StatelessWidget {
  const _UploadTile({
    required this.title,
    required this.file,
    required this.onTap,
  });

  final String title;
  final File? file;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(AppRadius.md),
      onTap: onTap,
      child: Container(
        height: 110,
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(
            color: file == null ? AppColors.cardBorder : AppColors.primary,
            style: BorderStyle.solid,
          ),
        ),
        child: Row(
          children: [
            const Icon(Icons.camera_alt_outlined, color: AppColors.textSecondary),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                file == null ? title : '$title ✓',
                style: AppTextStyles.bodyMedium,
              ),
            ),
            if (file != null) const Icon(Icons.check_circle_rounded, color: AppColors.success),
          ],
        ),
      ),
    );
  }
}

class _BenefitTile extends StatelessWidget {
  const _BenefitTile({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xs),
      child: Text(text, style: AppTextStyles.bodySmall),
    );
  }
}
