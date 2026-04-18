import 'package:flutter/material.dart';

import '../constants/app_colors.dart';
import '../constants/app_text_styles.dart';

class AppThemeDark {
  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: const Color(0xFF12171D),
    fontFamily: 'HindSiliguri',
    colorScheme: const ColorScheme.dark(
      primary: AppColors.primaryLight,
      secondary: AppColors.accent,
      surface: Color(0xFF1D2430),
      error: AppColors.error,
    ),
    textTheme: TextTheme(
      headlineLarge: AppTextStyles.h1.copyWith(color: Colors.white),
      headlineMedium: AppTextStyles.h2.copyWith(color: Colors.white),
      headlineSmall: AppTextStyles.h3.copyWith(color: Colors.white),
      bodyLarge: AppTextStyles.bodyLarge.copyWith(color: Colors.white),
      bodyMedium: AppTextStyles.bodyMedium.copyWith(color: Colors.white),
      bodySmall: AppTextStyles.bodySmall.copyWith(color: Colors.white70),
      labelLarge: AppTextStyles.labelLarge.copyWith(color: Colors.white),
      labelSmall: AppTextStyles.labelSmall.copyWith(color: Colors.white70),
    ),
  );
}
