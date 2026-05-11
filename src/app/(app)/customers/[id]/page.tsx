'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Phone, Mail, MapPin, FileText, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import { OrderStatusBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/store';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { customers, orders, machines } = useStore();

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

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title={customer.companyName}
        subtitle={`Org.nr ${customer.orgNumber}`}
        actions={
          <Link
            href={`/orders/new?customer=${customer.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ny order
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
          Tillbaka till kunder
        </Link>

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
