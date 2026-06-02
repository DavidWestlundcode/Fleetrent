'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Phone, Mail, MapPin, FileText, Plus, Trash2, Ban, RotateCcw, Users, Home } from 'lucide-react';
import Header from '@/components/layout/Header';
import { OrderStatusBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/store';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { customers, orders, machines, updateCustomer, deleteCustomer } = useStore();

  const customer = customers.find((c) => c.id === id);
  const customerOrders = orders
    .filter((o) => o.customerId === id)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  if (!customer) {
    return (
      <div className="flex items-center justify-center flex-1 text-slate-400">
        <p>Kunden hittades inte</p>
      </div>
    );
  }

  const activeOrders = customerOrders.filter((o) => o.status === 'aktiv' || o.status === 'reserverad');
  const completedOrders = customerOrders.filter((o) => o.status === 'avslutad');
  const isActive = customer.isActive !== false;

  const handleDeactivate = () => {
    if (confirm(`Inaktivera ${customer.companyName}? Kunden döljs från kundlistan men kan återaktiveras.`)) {
      updateCustomer(customer.id, { isActive: false });
    }
  };

  const handleActivate = () => {
    updateCustomer(customer.id, { isActive: true });
  };

  const handleDelete = () => {
    if (activeOrders.length > 0) {
      alert(`Kan inte radera kund med ${activeOrders.length} aktiv${activeOrders.length !== 1 ? 'a' : ''} order. Avsluta orderna först.`);
      return;
    }
    if (confirm(`Radera ${customer.companyName} permanent? Detta går inte att ångra.`)) {
      deleteCustomer(customer.id);
      router.push('/customers');
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title={customer.companyName}
        subtitle={`Org.nr ${customer.orgNumber}`}
        actions={
          <div className="flex items-center gap-2">
            {isActive ? (
              <>
                <Link
                  href={`/orders/new?customer=${customer.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ny order
                </Link>
                <button
                  onClick={handleDeactivate}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  Inaktivera
                </button>
              </>
            ) : (
              <button
                onClick={handleActivate}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Återaktivera
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Radera
            </button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
          Tillbaka till kunder
        </Link>

        {!isActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <Ban className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Inaktiv kund</p>
              <p className="text-sm text-amber-700">Kunden visas inte i kundlistan och kan inte väljas vid nya ordrar.</p>
            </div>
            <button onClick={handleActivate} className="shrink-0 text-sm font-medium text-amber-700 underline hover:text-amber-900">
              Återaktivera
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{customer.companyName}</h2>
                  <p className="text-sm text-slate-500">{customer.orgNumber}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Kontaktperson</p>
                  <p className="text-sm font-medium text-slate-800">{customer.contactPerson}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {customer.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {customer.email}
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{customer.invoiceAddress}</span>
                </div>
              </div>
              {customer.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Anteckningar</p>
                  <p className="text-sm text-slate-700">{customer.notes}</p>
                </div>
              )}
            </div>

            {customer.contacts && customer.contacts.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-slate-500" />
                  <h3 className="font-semibold text-slate-900">Kontaktpersoner</h3>
                </div>
                <div className="space-y-3">
                  {customer.contacts.map((c, i) => (
                    <div key={i} className="pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-slate-800">{c.name}</p>
                      {c.title && <p className="text-xs text-slate-400 mt-0.5">{c.title}</p>}
                      <div className="mt-1 space-y-0.5">
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" />{c.phone}
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400" />{c.email}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {customer.facilities && customer.facilities.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="w-4 h-4 text-slate-500" />
                  <h3 className="font-semibold text-slate-900">Anläggningar</h3>
                </div>
                <div className="space-y-2.5">
                  {customer.facilities.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 pb-2.5 border-b border-slate-50 last:border-0 last:pb-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        {f.name && <p className="text-sm font-medium text-slate-800">{f.name}</p>}
                        <p className="text-xs text-slate-500">{[f.address, f.zip, f.city].filter(Boolean).join(' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Statistik</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total hyresintäkt', value: formatCurrency(customer.totalSpent), color: 'text-emerald-600' },
                  { label: 'Aktiva order', value: activeOrders.length.toString(), color: 'text-blue-600' },
                  { label: 'Avslutade order', value: completedOrders.length.toString(), color: 'text-slate-700' },
                  { label: 'Totalt antal order', value: customerOrders.length.toString(), color: 'text-slate-700' },
                  { label: 'Kreditgräns', value: formatCurrency(customer.creditLimit), color: 'text-slate-700' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className={`text-sm font-semibold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <FileText className="w-4 h-4 text-slate-500" />
                <h2 className="font-semibold text-slate-900">Orderhistorik</h2>
                <span className="ml-auto text-xs font-medium text-slate-500">{customerOrders.length} order totalt</span>
              </div>
              {customerOrders.length === 0 ? (
                <p className="px-5 py-8 text-center text-slate-400 text-sm">Inga order registrerade</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Order</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Maskin</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Period</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Belopp</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {customerOrders.map((order) => {
                      const machine = machines.find((m) => m.id === order.machineId);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline font-medium">
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{machine?.name ?? '–'}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs">
                            {formatDate(order.startDate)} – {formatDate(order.plannedReturnDate)}
                          </td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(order.totalPrice)}</td>
                          <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
