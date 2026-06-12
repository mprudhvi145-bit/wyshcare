-- Enable Row-Level Security on the AuditLog table
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- POLICY: Allow ADMINs to read all audit logs for compliance and forensics.
CREATE POLICY "Allow admin read access on AuditLog"
ON "AuditLog" FOR SELECT
TO authenticated
USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- POLICY: Allow any authenticated user or system process to INSERT into the audit log.
CREATE POLICY "Allow all insert on AuditLog"
ON "AuditLog" FOR INSERT
TO authenticated
WITH CHECK (true);

-- POLICY: Deny all UPDATE and DELETE operations to ensure the audit log is append-only.
CREATE POLICY "Deny update and delete on AuditLog"
ON "AuditLog" FOR ALL
TO authenticated
USING (false);