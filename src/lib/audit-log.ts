import type { SupabaseClient } from '@supabase/supabase-js';

// Always called with the service-role client — audit_log has no INSERT policy for
// anon/authenticated roles, so writing via the regular client would be silently
// rejected by RLS. Never await/throw on failure: a logging error must not block
// the actual action it's describing.
export function logAuditEvent(
  admin: SupabaseClient,
  event: {
    organizationId: string | null;
    actorUserId: string | null;
    actorOrganizationId?: string | null;
    action: string;
    targetTable?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  admin.from('audit_log').insert({
    organization_id: event.organizationId,
    actor_user_id: event.actorUserId,
    actor_organization_id: event.actorOrganizationId ?? event.organizationId,
    action: event.action,
    target_table: event.targetTable ?? null,
    target_id: event.targetId ?? null,
    metadata: event.metadata ?? {},
  }).then(({ error }) => {
    if (error) console.error(`[audit-log] Failed to log "${event.action}":`, error.message);
  });
}
