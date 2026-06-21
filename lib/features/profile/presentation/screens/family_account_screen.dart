import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/profile_provider.dart';

class FamilyAccountScreen extends ConsumerStatefulWidget {
  const FamilyAccountScreen({super.key});

  @override
  ConsumerState<FamilyAccountScreen> createState() => _FamilyAccountScreenState();
}

class _FamilyAccountScreenState extends ConsumerState<FamilyAccountScreen> {
  bool _creating = false;

  Future<void> _createFamily() async {
    final language = ref.read(languageProvider);
    final nameController = TextEditingController();
    bool sharedWallet = true;

    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: AppSpacing.lg,
                right: AppSpacing.lg,
                bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.lg,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    language == 'bn' ? 'পরিবার তৈরি করুন' : 'Create family account',
                    style: AppTextStyles.h4,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  TextField(
                    controller: nameController,
                    decoration: InputDecoration(
                      labelText: language == 'bn' ? 'পরিবারের নাম' : 'Family name',
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    value: sharedWallet,
                    onChanged: (value) => setModalState(() => sharedWallet = value),
                    title: Text(
                      language == 'bn' ? 'শেয়ারড ওয়ালেট চালু' : 'Enable shared wallet',
                      style: AppTextStyles.bodyMedium,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () {
                        if (nameController.text.trim().isEmpty) return;
                        Navigator.of(context).pop(true);
                      },
                      child: Text(language == 'bn' ? 'তৈরি করুন' : 'Create'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );

    if (result != true || !mounted) return;

    setState(() => _creating = true);
    try {
      await ref.read(profileActionsProvider).createFamilyAccount(
            name: nameController.text.trim(),
            sharedWallet: sharedWallet,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(language == 'bn' ? 'পরিবার তৈরি হয়েছে' : 'Family account created')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    final uid = ref.watch(authStateProvider).valueOrNull?.uid ?? '';
    final familyAsync = ref.watch(familyAccountProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(language == 'bn' ? 'পারিবারিক অ্যাকাউন্ট' : 'Family Account'),
      ),
      body: familyAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text(error.toString())),
        data: (family) {
          if (family == null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F5F1),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: const Icon(Icons.family_restroom_rounded,
                          size: 60, color: AppColors.primary),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      language == 'bn'
                          ? 'পরিবারের সদস্যদের একই ওয়ালেট ব্যবহার করতে দিন'
                          : 'Let family members use one shared wallet',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.bodyMedium,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    FilledButton(
                      onPressed: _creating ? null : _createFamily,
                      child: Text(language == 'bn' ? 'পরিবার তৈরি করুন' : 'Create family'),
                    ),
                  ],
                ),
              ),
            );
          }

          final isAdmin = family.isAdmin(uid);

          return ListView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(family.name, style: AppTextStyles.h3),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      language == 'bn' ? 'সদস্য: ${family.members.length} জন' : 'Members: ${family.members.length}',
                      style: AppTextStyles.bodySmall,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      value: family.sharedWallet,
                      onChanged: isAdmin
                          ? (value) async {
                              await ref.read(profileActionsProvider).setSharedWallet(
                                    familyId: family.id,
                                    enabled: value,
                                  );
                            }
                          : null,
                      title: Text(
                        language == 'bn' ? 'শেয়ারড ওয়ালেট' : 'Shared wallet',
                        style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                      ),
                      subtitle: Text(
                        language == 'bn'
                            ? 'সদস্যরা আপনার ওয়ালেট ব্যালেন্স ব্যবহার করতে পারবে'
                            : 'Members can use owner wallet balance',
                        style: AppTextStyles.bodySmall,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      language == 'bn' ? 'সদস্য তালিকা' : 'Members',
                      style: AppTextStyles.h4,
                    ),
                  ),
                  if (isAdmin)
                    TextButton.icon(
                      onPressed: () => context.push('/profile/family/invite?familyId=${family.id}'),
                      icon: const Icon(Icons.person_add_alt_1_rounded),
                      label: Text(language == 'bn' ? 'সদস্য যোগ করুন' : 'Add member'),
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              ...family.members.map(
                (member) => Container(
                  margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Row(
                    children: [
                      const CircleAvatar(
                        backgroundColor: AppColors.surfaceVariant,
                        child: Icon(Icons.person_rounded, color: AppColors.textPrimary),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(member.name, style: AppTextStyles.bodyMedium),
                            Text(member.phone, style: AppTextStyles.bodySmall),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: member.role == 'admin'
                                  ? const Color(0xFFE8F5F1)
                                  : AppColors.surfaceVariant,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              member.role == 'admin'
                                  ? (language == 'bn' ? 'অ্যাডমিন' : 'Admin')
                                  : (language == 'bn' ? 'সদস্য' : 'Member'),
                              style: AppTextStyles.bodySmall.copyWith(
                                color: member.role == 'admin'
                                    ? AppColors.primary
                                    : AppColors.textSecondary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          if (member.uid == uid)
                            Text(
                              language == 'bn' ? 'আপনি' : 'You',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
