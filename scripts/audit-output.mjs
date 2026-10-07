import { resolve } from 'node:path';

// Keep new verification from overwriting a previous dated audit.
export function auditOutput(root, legacyPath) {
  if (!process.env.STATML_AUDIT_ROOT) return resolve(root, legacyPath);
  const group = legacyPath.replace(/^audit-evidence\//, '').replace(/-\d{4}-\d{2}-\d{2}/g, '');
  return resolve(process.env.STATML_AUDIT_ROOT, group);
}
