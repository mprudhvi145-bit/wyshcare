/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/core/theme/app_theme.dart
 *
 * Product:
 * WyshCare Healthcare Operating System
 *
 * Brand:
 * WYSH
 *
 * Founder:
 * Vimarshak Prudhvi
 *
 * Purpose:
 * Flutter/Dart module: app_theme
 *
 * Responsibilities:
 * - Implement doctor functionality in Flutter
 *
 * Used By:
 - apps/patient-mobile/lib/features/family/family_member_detail_screen.dart
 - apps/doctor-mobile/lib/features/specialties/ophthalmology_workspace.dart
 - apps/patient-mobile/lib/features/pharmacy/pharmacy_cart_screen.dart
 - apps/doctor-mobile/lib/features/telemedicine/live_consultation_screen.dart
 - apps/patient-mobile/lib/features/settings/notification_prefs_screen.dart
 - apps/doctor-mobile/lib/core/widgets/patient_context_bar.dart
 - apps/patient-mobile/lib/features/appointments/booking_screen.dart
 - apps/patient-mobile/lib/features/family/add_family_member_screen.dart
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Doctor
 *
 * Last Reviewed:
2026-06-12
 *
 * ============================================================================
 * (c) Wysh Technologies
 * Built by Vimarshak Prudhvi
 * All Rights Reserved
 * ============================================================================
 */

import 'package:flutter/material.dart';

class AppTheme {
  // Brand Harmonious HSL colors converted to HEX
  static const Color background = Color(0xFF0D0E12);
  static const Color surface = Color(0xFF161820);
  static const Color cardBg = Color(0xFF1E212D);
  static const Color glassBorder = Color(0xFF2E3245);
  
  // Accents
  static const Color primary = Color(0xFF8FD3D1); // Clean Teal
  static const Color secondary = Color(0xFF2EE59D); // Emerald Green
  static const Color warning = Color(0xFFFFD84D); // Soft Amber
  static const Color danger = Color(0xFFFF5A5A); // Coral Red
  static const Color accent = Color(0xFF5856D6); // Deep Indigo
  static const Color accentPurple = Color(0xFFAF52DE); // Royal Purple

  // Text
  static const Color textPrimary = Color(0xFFF1F2F6);
  static const Color textSecondary = Color(0xFFA0A5B5);
  static const Color textMuted = Color(0xFF626675);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      cardColor: cardBg,
      dividerColor: glassBorder,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: secondary,
        surface: surface,
        error: danger,
      ),
      fontFamily: 'Outfit',
      textTheme: const TextTheme(
        headlineLarge: TextStyle(fontSize: 32.0, fontWeight: FontWeight.bold, color: textPrimary, letterSpacing: -0.5),
        headlineMedium: TextStyle(fontSize: 24.0, fontWeight: FontWeight.w700, color: textPrimary, letterSpacing: -0.5),
        titleLarge: TextStyle(fontSize: 20.0, fontWeight: FontWeight.w600, color: textPrimary),
        titleMedium: TextStyle(fontSize: 16.0, fontWeight: FontWeight.w600, color: textPrimary),
        bodyLarge: TextStyle(fontSize: 16.0, color: textPrimary),
        bodyMedium: TextStyle(fontSize: 14.0, color: textSecondary),
        bodySmall: TextStyle(fontSize: 12.0, color: textMuted),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: background,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(fontSize: 20.0, fontWeight: FontWeight.w700, color: textPrimary),
        iconTheme: IconThemeData(color: textPrimary),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surface,
        selectedItemColor: primary,
        unselectedItemColor: textMuted,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
      ),
      cardTheme: CardThemeData(
        color: cardBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: glassBorder, width: 1),
        ),
        elevation: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        hintStyle: const TextStyle(color: textMuted, fontSize: 14),
        labelStyle: const TextStyle(color: textSecondary, fontSize: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: glassBorder, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: glassBorder, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
    );
  }
}
