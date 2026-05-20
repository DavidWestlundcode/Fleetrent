import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Building2, Users, Truck, FileText, ChevronRight } from 'lucide-react';

export default async function AdminPage() {
  const admin = createAdminClient();

  const [
    { data: orgs },
    { data: profiles },
    { data: machines },
    { data: orders },
  ] = await Promise.all([
    admin.from('organizations').select('id, name, email, org_number, created_at').order('created_at', { ascending: false }),
    admin.from('profiles').select('organization_id'),
    admin.from('machines').select('organization_id'),
    admin.from('orders').select('organization_id'),
  ]);

  const countFor = (data: { organization_id: string | null }[] | null, orgId: string) =>
    data?.filter(r => r.organization_id === orgId).length ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Organisationer</h1>
        <p className="text-slate-500 text-sm mt-1">{orgs?.length ?? 0} totalt</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Företag</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">E-post</th>
              <th className="text-center px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Användare</th>
              <th className="text-center px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Maskiner</th>
              <th className="text-center px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Ordrar</th>
              <th className="text-left px-5 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Skapad</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orgs?.map(org => (
              <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{org.name || '(namnlöst)'}</p>
                      {org.org_number && <p className="text-[12px] text-slate-400">{org.org_number}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{org.email || '—'}</td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {countFor(profiles, org.id)}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    {countFor(machines, org.id)}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {countFor(orders, org.id)}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {new Date(org.created_at).toLocaleDateString('sv-SE')}
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/admin/${org.id}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-[13px]"
                  >
                    Visa <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
            {(!orgs || orgs.length === 0) && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-400">Inga organisationer hittades</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
