# Row-Level Security (RLS) Policy Review

**Status:** Validated
**Last Reviewed:** 2026-05-13

## 1. Overview

This document outlines the expected structure and logic of the PostgreSQL Row-Level Security (RLS) policies that form the core of the application's healthcare data isolation boundary.

The RLS strategy is predicated on the application backend setting transaction-local session variables for every database query. These variables are:

*   `app.current_user_id`: The `userId` of the authenticated user.
*   `app.current_user_role`: The role of the user (e.g., `PATIENT`, `STAFF`, `ADMIN`).
*   `app.current_user_staff_role`: The specific staff role if applicable (e.g., `DOCTOR`, `NURSE`, `BILLING`).

**The security of the entire model relies on the application correctly and securely setting these variables for every transaction.** The adversarial test suite (`rls.test.js`) validates that the database connection pool cannot be contaminated and that missing context results in a "deny by default" posture.

## 2. Protected Tables & Policy Definitions

The following outlines the *expected* policy definitions for critical tables.

### Table: `MedicalRecord`

This table contains direct Patient Health Information (PHI).

*   **`SELECT` Policy (USING clause):**
    *   **Patients:** Allow if the record's `patientWyshId` corresponds to the `patientWyshId` linked to the current user (`current_setting('app.current_user_id')`).
    *   **Clinical Staff (`DOCTOR`, `NURSE`):** Allow if the staff member has an active assignment to the patient associated with the record. This requires a sub-select or `JOIN` to a `CareTeamAssignment` table.
        ```sql
        -- Simplified Example
        (
          current_setting('app.current_user_role') = 'STAFF' AND
          EXISTS (
            SELECT 1 FROM "CareTeamAssignment" cta
            WHERE cta."staffWyshId" = (SELECT "staffWyshId" FROM "Staff" WHERE "userId" = current_setting('app.current_user_id'))
            AND cta."patientWyshId" = "MedicalRecord"."patientWyshId"
          )
        )
        ```
    *   **Admins & Other Staff:** Deny access. `current_setting('app.current_user_role') = 'ADMIN'` should always evaluate to `false` for direct PHI access.
    *   **Default:** Deny.

*   **`INSERT`/`UPDATE` Policies (WITH CHECK clause):**
    *   Policies must mirror the `SELECT` logic to prevent a user from creating or modifying a record for a patient they do not have access to.

### Table: `Billing`

This table contains financial information, which is sensitive but distinct from clinical data.

*   **`SELECT` Policy (USING clause):**
    *   **Patients:** Allow if the record's `patientWyshId` matches their own.
    *   **Billing Staff:** Allow if `current_setting('app.current_user_staff_role') = 'BILLING'`.
    *   **Clinical Staff:** Deny access. A `DOCTOR` should not be able to see billing details unless explicitly permitted.

## 3. Key Assumptions

1.  **Application Sets Context:** The application layer is trusted to set the RLS context variables correctly on every request.
2.  **Deny by Default:** All tables with sensitive data have RLS enabled with a default-deny policy. If a `USING` clause evaluates to `false` or `NULL`, no rows are returned.
3.  **Admin Impersonation:** Administrators do not have direct PHI access. Their access is gated through a separate, fully audited impersonation mechanism that sets the RLS context to that of the impersonated user.

## 4. Potential Gaps & Future Work

*   **New Table Review:** A process must be in place to review any new database tables for sensitive information and apply RLS policies before they are used in production.
*   **`AuditLog` Table:** The `AuditLog` table itself contains sensitive data (e.g., which user accessed which patient's data). It should be protected by RLS to prevent non-administrative users from viewing or tampering with the audit trail.

### Table: `AuditLog`

This table contains the system's legal-grade traceability log. Access must be highly restricted.

*   **`SELECT` Policy (USING clause):**
    *   **Admins:** Allow full access for compliance and forensic analysis. `current_setting('app.current_user_role') = 'ADMIN'`.
    *   **All Other Roles:** Deny access. Patients and staff should not be able to query the audit log directly.
*   **`INSERT`/`UPDATE`/`DELETE` Policies:**
    *   **`INSERT`:** Should be allowed for all roles, as the application needs to write log entries.
    *   **`UPDATE`/`DELETE`:** Deny for all roles. The audit log must be append-only. Redaction should be handled via a specific, secure service function (`redactAuditEntry`) that is not subject to general RLS `UPDATE` policies.