/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: apps/doctor-mobile/lib/core/storage/offline_sync.dart
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
 * Flutter/Dart module: offline_sync
 *
 * Responsibilities:
 * - Implement doctor functionality in Flutter
 *
 * Used By:
 - apps/doctor-mobile/lib/features/specialties/widgets/billing_panel.dart
 - apps/doctor-mobile/lib/features/specialties/ophthalmology_workspace.dart
 - apps/patient-mobile/lib/features/auth/login_screen.dart
 - apps/doctor-mobile/lib/features/encounters/emr_workspace_screen.dart
 - apps/doctor-mobile/lib/features/telemedicine/live_consultation_screen.dart
 - apps/doctor-mobile/lib/features/messages/messages_screen.dart
 - apps/doctor-mobile/lib/core/authentication/auth_notifier.dart
 - apps/doctor-mobile/lib/main.dart
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

import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:wyshcare_doctor_sdk/wyshcare_doctor_sdk.dart';
import '../network/sdk_provider.dart';

/// Representation of an offline queued API action
class OutboxAction {
  final String id;
  final String type; // 'SAVE_SPECIALTY_ENCOUNTER' | 'CREATE_PRESCRIPTION' | 'CREATE_NOTE'
  final String endpoint;
  final Map<String, dynamic> payload;
  final DateTime timestamp;

  OutboxAction({
    required this.id,
    required this.type,
    required this.endpoint,
    required this.payload,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'endpoint': endpoint,
        'payload': payload,
        'timestamp': timestamp.toIso8601String(),
      };

  factory OutboxAction.fromJson(Map<String, dynamic> json) => OutboxAction(
        id: json['id'] as String,
        type: json['type'] as String,
        endpoint: json['endpoint'] as String,
        payload: Map<String, dynamic>.from(json['payload'] as Map),
        timestamp: DateTime.parse(json['timestamp'] as String),
      );
}

class OfflineSyncManager {
  final WyshCareDoctorSDK _sdk;
  late final Box _draftBox;
  late final Box _outboxBox;
  bool _isSyncing = false;

  OfflineSyncManager(this._sdk);

  Future<void> init() async {
    _draftBox = await Hive.openBox('wyshcare_drafts');
    _outboxBox = await Hive.openBox('wyshcare_outbox');
  }

  /// Save local draft encounter data (offline patient cache)
  Future<void> saveDraft(String key, Map<String, dynamic> data) async {
    await _draftBox.put(key, jsonEncode(data));
  }

  /// Get cached local draft encounter
  Map<String, dynamic>? getDraft(String key) {
    final raw = _draftBox.get(key);
    if (raw == null) return null;
    return Map<String, dynamic>.from(jsonDecode(raw as String) as Map);
  }

  /// Remove cached draft
  Future<void> deleteDraft(String key) async {
    await _draftBox.delete(key);
  }

  /// Add an API call to the offline outbox
  Future<void> queueAction({
    required String type,
    required String endpoint,
    required Map<String, dynamic> payload,
  }) async {
    final action = OutboxAction(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      type: type,
      endpoint: endpoint,
      payload: payload,
      timestamp: DateTime.now(),
    );
    
    await _outboxBox.put(action.id, jsonEncode(action.toJson()));
    
    // Proactively try to sync if online
    triggerSync();
  }

  /// Sync all pending outbox actions sequentially
  Future<void> triggerSync() async {
    if (_isSyncing || _outboxBox.isEmpty) return;
    _isSyncing = true;
    
    try {
      final keys = List<String>.from(_outboxBox.keys);
      // Sort keys (timestamps) to preserve execution order
      keys.sort();

      for (final id in keys) {
        final raw = _outboxBox.get(id);
        if (raw == null) continue;
        
        final action = OutboxAction.fromJson(
          Map<String, dynamic>.from(jsonDecode(raw as String) as Map),
        );

        try {
          if (action.type == 'SAVE_SPECIALTY_ENCOUNTER') {
            final specialtyCode = action.endpoint.split('/')[1];
            await _sdk.client.post(
              '/specialties/$specialtyCode/encounters',
              action.payload,
            );
          } else if (action.type == 'CREATE_PRESCRIPTION') {
            await _sdk.prescriptions.create(action.payload);
          } else if (action.type == 'CREATE_NOTE') {
            final patientId = action.payload['patientId'] as String? ?? 'patient-id-unknown';
            await _sdk.ehr.createNote(patientId, action.payload);
          } else {
            await _sdk.client.post(action.endpoint, action.payload);
          }

          // Successfully synchronized. Remove from outbox.
          await _outboxBox.delete(id);
        } catch (e) {
          // If server error is 4xx (client error / bad request), drop to prevent blockage
          // If server is offline/5xx, stop queue sync and retry later
          if (e.toString().contains('400') || e.toString().contains('422')) {
            debugPrint('Dropping corrupted outbox action $id: $e');
            await _outboxBox.delete(id);
          } else {
            debugPrint('Failed to sync action $id, will retry: $e');
            break;
          }
        }
      }
    } finally {
      _isSyncing = false;
    }
  }

  /// Get count of pending outbox items
  int get pendingCount => _outboxBox.length;
}

/// Provider for OfflineSyncManager
final offlineSyncProvider = Provider<OfflineSyncManager>((ref) {
  final sdk = ref.watch(doctorSdkProvider);
  final manager = OfflineSyncManager(sdk);
  return manager;
});
