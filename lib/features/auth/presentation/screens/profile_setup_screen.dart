import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/widgets/loading_overlay.dart';
import '../../../../core/widgets/toll_button.dart';
import '../providers/auth_provider.dart';

class ProfileSetupScreen extends ConsumerStatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  ConsumerState<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends ConsumerState<ProfileSetupScreen> {
  final _nameBnController = TextEditingController();
  final _nameEnController = TextEditingController();
  final _emailController = TextEditingController();
  File? _avatar;
  bool _loading = false;

  @override
  void dispose() {
    _nameBnController.dispose();
    _nameEnController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
      maxWidth: 800,
      maxHeight: 800,
    );
    if (file == null) return;
    setState(() => _avatar = File(file.path));
  }

  Future<void> _submit() async {
    final language = ref.read(languageProvider);
    if (_nameBnController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            language == 'bn' ? 'নাম লিখুন' : 'Please enter your name',
          ),
        ),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      await ref.read(authControllerProvider).createProfile(
            name: _nameEnController.text.trim().isEmpty
                ? _nameBnController.text.trim()
                : _nameEnController.text.trim(),
            nameBn: _nameBnController.text.trim(),
            email: _emailController.text.trim().isEmpty
                ? null
                : _emailController.text.trim(),
            avatar: _avatar,
          );
      if (!mounted) return;
      context.go('/biometric-setup?mode=setup');
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    return LoadingOverlay(
      loading: _loading,
      child: Scaffold(
        appBar: AppBar(),
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    _StepDot(active: true),
                    SizedBox(width: AppSpacing.sm),
                    _StepDot(active: false),
                  ],
                ),
                const SizedBox(height: AppSpacing.xl),
                Center(
                  child: InkWell(
                    onTap: _pickImage,
                    borderRadius: BorderRadius.circular(60),
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 52,
                          backgroundColor: AppColors.surfaceVariant,
                          backgroundImage:
                              _avatar != null ? FileImage(_avatar!) : null,
                          child: _avatar == null
                              ? const Icon(Icons.person_outline, size: 48)
                              : null,
                        ),
                        Positioned(
                          right: 2,
                          bottom: 2,
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.camera_alt,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                TextField(
                  controller: _nameBnController,
                  textInputAction: TextInputAction.next,
                  decoration: InputDecoration(
                    labelText: AppStrings.get('your_name', language),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                TextField(
                  controller: _nameEnController,
                  textInputAction: TextInputAction.next,
                  decoration: InputDecoration(
                    labelText: AppStrings.get('your_name_en', language),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email (optional)',
                  ),
                ),
                const SizedBox(height: AppSpacing.xxl),
                TollButton(
                  label: AppStrings.get('next', language),
                  onPressed: _submit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StepDot extends StatelessWidget {
  const _StepDot({required this.active});

  final bool active;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 14,
      height: 14,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: active ? AppColors.primary : AppColors.cardBorder,
      ),
    );
  }
}
