import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone, Hash } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:    { label: 'Aktiv',     color: 'bg-emerald-100 text-emerald-700' },
  rented:    { label: 'Uthyrd',    color: 'bg-blue-100 text-blue-700' },
  service:   { label: 'Service',   color: 'bg-amber-100 text-amber-700' },
  inactive:  { label: 'Inaktiv',   color: 'bg-slate-100 text-slate-500' },
  draft:     { label: 'Utkast',    color: 'bg-slate-100 text-slate-500' },
  confirmed: { label: 'Bekräftad', color: 'bg-blue-100 text-blue-700' },
  ongoing:   { label: 'Pågående',  color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Avslutad',  color: 'bg-slate-100 text-slate-500' },
  cancelled: { label: 'Avbruten',  color: 'bg-red-100 text-red-700' },
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin:     { label: 'Admin',    color: 'bg-blue-100 text-blue-700' },
  saljare:   { label: 'Säljare',  color: 'bg-purple-100 text-purple-700' },
  verkstad:  { label: 'Verkstad', color: 'bg-amber-100 text-amber-700' },
};

export default async function OrgDetailPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const admin = createAdminClient();

  const [
    { data: org },
    { data: profiles },
    { data: machines },
    { data: orders },
    { data: authData },
  ] = await Promise.all([
    admin.from('organizations').select('*').eq('id', orgId).single(),
    admin.from('profiles').select('id, full_name, role, created_at').eq('organization_id', orgId).order('created_at'),
    admin.from('machines').select('id, name, brand, model, internal_code, status').eq('organization_id', orgId).order('created_at', { ascending: false }),
    admin.from('orders').select('id, rental_start, rental_end, status, created_at, customers(name), machines(name, brand, model)').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(30),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (!org) notFound();

  const emailMap = Object.fromEntries((authData?.users ?? []).map(u => [u.id, u.email ?? '']));

  const Section = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <span className="text-sm text-slate-500 font-medium">{count} st</span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{org.name || '(namnlöst)'}</h1>
      </div>

      {/* Org info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Building2, label: 'Företag', value: org.name },
            { icon: Hash, label: 'Org.nummer', value: org.org_number },
            { icon: Mail, label: 'E-post', value: org.email },
            { icon: Phone, label: 'Telefon', value: org.phone },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Icon className="w-3 h-3" />{label}
              </p>
              <p className="text-sm font-medium text-slate-700">{value || '—'}</p>
            </div>
          ))}
        </div>
        <p className="text-[12px] text-slate-400 mt-4">
          Kund sedan {new Date(org.created_at).toLocaleDateString('sv-SE')} · ID: {org.id}
        </p>
      </div>

      {/* Users */}
      <Section title="Användare" count={profiles?.length ?? 0}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Namn</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">E-post</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Roll</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Skapad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles?.map(p => {
              const role = ROLE_LABELS[p.role] ?? { label: p.role, color: 'bg-slate-100 text-slate-500' };
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{p.full_name || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{emailMap[p.id] || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${role.color}`}>{role.label}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{new Date(p.created_at).toLocaleDateString('sv-SE')}</td>
                </tr>
              );
            })}
            {!profiles?.length && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">Inga användare</td></tr>
            )}
          </tbody>
        </table>
      </Section>

      {/* Machines */}
      <Section title="Maskiner" count={machines?.length ?? 0}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Maskin</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ID</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {machines?.map(m => {
              const st = STATUS_LABELS[m.status] ?? { label: m.status, color: 'bg-slate-100 text-slate-500' };
              return (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{m.brand} {m.model} {m.name}</td>
                  <td className="px-5 py-3 text-slate-400 font-mono text-[12px]">{m.internal_code || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
            {!machines?.length && (
              <tr><td colSpan={3} className="px-5 py-6 text-center text-slate-400">Inga maskiner</td></tr>
            )}
          </tbody>
        </table>
      </Section>

      {/* Orders */}
      <Section title="Senaste ordrar" count={orders?.length ?? 0}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kund</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Maskin</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Period</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders?.map(o => {
              const st = STATUS_LABELS[o.status] ?? { label: o.status, color: 'bg-slate-100 text-slate-500' };
              type MachineRow = { name: string; brand: string; model: string };
              const machineRaw = o.machines as MachineRow | MachineRow[] | null;
              const machine = Array.isArray(machineRaw) ? machineRaw[0] ?? null : machineRaw;
              const customerRaw = o.customers as { name: string } | { name: string }[] | null;
              const customer = Array.isArray(customerRaw) ? customerRaw[0] ?? null : customerRaw;
              return (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{customer?.name || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{machine ? `${machine.brand} ${machine.model}` : '—'}</td>
                  <td className="px-5 py-3 text-slate-500 text-[12px]">
                    {o.rental_start ? new Date(o.rental_start).toLocaleDateString('sv-SE') : '—'}
                    {' → '}
                    {o.rental_end ? new Date(o.rental_end).toLocaleDateString('sv-SE') : '?'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
            {!orders?.length && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">Inga ordrar</td></tr>
            )}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
