'use client';
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type {
  Machine, Customer, Order, PriceTemplate, ServiceRecord, Article,
  MachineCategory, MachineStatus, FuelType, OrderStatus, ReturnCondition,
  ServiceType, ServiceStatus, ArticleType, ArticleUnit, OrderArticle,
} from '@/lib/types';
import { generateOrderNumber } from '@/lib/utils';

type DbRow = Record<string, unknown>;

function syncQuery(query: unknown, label: string) {
  (query as Promise<{ error: unknown }>).then(({ error }) => {
    if (error) console.error(label, error);
  });
}

// ---- MAPPERS ----

function fromDbMachine(r: DbRow): Machine {
  return {
    id: r.id as string,
    name: r.name as string,
    model: (r.model as string) ?? '',
    brand: (r.brand as string) ?? '',
    serialNumber: (r.serial_number as string) ?? '',
    registrationNumber: (r.registration_number as string) ?? '',
    internalCode: (r.internal_code as string) ?? '',
    category: r.category as MachineCategory,
    capacity: (r.capacity as number) ?? 0,
    fuelType: r.fuel_type as FuelType,
    liftHeight: r.lift_height != null ? (r.lift_height as number) : undefined,
    buildHeight: r.build_height != null ? (r.build_height as number) : undefined,
    forkLength: r.fork_length != null ? (r.fork_length as number) : undefined,
    freeLift: r.free_lift != null ? (r.free_lift as number) : undefined,
    maxReach: r.max_reach != null ? (r.max_reach as number) : undefined,
    digDepth: r.dig_depth != null ? (r.dig_depth as number) : undefined,
    bucketVolume: r.bucket_volume != null ? (r.bucket_volume as number) : undefined,
    workingWeight: r.working_weight != null ? (r.working_weight as number) : undefined,
    enginePower: r.engine_power != null ? (r.engine_power as number) : undefined,
    year: (r.year as number) ?? 0,
    operatingHours: (r.operating_hours as number) ?? 0,
    status: r.status as MachineStatus,
    images: (r.images as string[]) ?? [],
    documents: (r.documents as string[]) ?? [],
    notes: (r.notes as string) ?? '',
    location: (r.location as string) ?? '',
    qrCode: (r.qr_code as string) ?? '',
    purchasePrice: (r.purchase_price as number) ?? 0,
    purchaseDate: (r.purchase_date as string) ?? '',
    leasingCost: (r.leasing_cost as number) ?? 0,
    financingCost: (r.financing_cost as number) ?? 0,
    insuranceCost: (r.insurance_cost as number) ?? 0,
    serviceCost: (r.service_cost as number) ?? 0,
    otherCosts: (r.other_costs as number) ?? 0,
    totalRevenue: (r.total_revenue as number) ?? 0,
    totalRentals: (r.total_rentals as number) ?? 0,
    totalRentalDays: (r.total_rental_days as number) ?? 0,
    totalServiceCost: (r.total_service_cost as number) ?? 0,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toDbMachine(m: Machine, orgId: string): DbRow {
  return {
    id: m.id,
    organization_id: orgId,
    name: m.name,
    model: m.model,
    brand: m.brand,
    serial_number: m.serialNumber,
    registration_number: m.registrationNumber,
    internal_code: m.internalCode,
    category: m.category,
    capacity: m.capacity,
    fuel_type: m.fuelType,
    lift_height: m.liftHeight ?? null,
    build_height: m.buildHeight ?? null,
    fork_length: m.forkLength ?? null,
    free_lift: m.freeLift ?? null,
    max_reach: m.maxReach ?? null,
    dig_depth: m.digDepth ?? null,
    bucket_volume: m.bucketVolume ?? null,
    working_weight: m.workingWeight ?? null,
    engine_power: m.enginePower ?? null,
    year: m.year,
    operating_hours: m.operatingHours,
    status: m.status,
    images: m.images,
    documents: m.documents,
    notes: m.notes,
    location: m.location,
    qr_code: m.qrCode,
    purchase_price: m.purchasePrice,
    purchase_date: m.purchaseDate || '',
    leasing_cost: m.leasingCost,
    financing_cost: m.financingCost,
    insurance_cost: m.insuranceCost,
    service_cost: m.serviceCost,
    other_costs: m.otherCosts,
    total_revenue: m.totalRevenue,
    total_rentals: m.totalRentals,
    total_rental_days: m.totalRentalDays,
    total_service_cost: m.totalServiceCost,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}

function fromDbCustomer(r: DbRow): Customer {
  return {
    id: r.id as string,
    companyName: r.company_name as string,
    orgNumber: (r.org_number as string) ?? '',
    contactPerson: (r.contact_person as string) ?? '',
    phone: (r.phone as string) ?? '',
    email: (r.email as string) ?? '',
    invoiceAddress: (r.invoice_address as string) ?? '',
    deliveryAddress: (r.delivery_address as string) ?? '',
    notes: (r.notes as string) ?? '',
    creditLimit: (r.credit_limit as number) ?? 0,
    totalSpent: (r.total_spent as number) ?? 0,
    activeOrders: (r.active_orders as number) ?? 0,
    fortnoxCustomerNumber: (r.fortnox_customer_number as string) || undefined,
    createdAt: r.created_at as string,
  };
}

function toDbCustomer(c: Customer, orgId: string): DbRow {
  return {
    id: c.id,
    organization_id: orgId,
    company_name: c.companyName,
    org_number: c.orgNumber,
    contact_person: c.contactPerson,
    phone: c.phone,
    email: c.email,
    invoice_address: c.invoiceAddress,
    delivery_address: c.deliveryAddress,
    notes: c.notes,
    credit_limit: c.creditLimit,
    total_spent: c.totalSpent,
    active_orders: c.activeOrders,
    fortnox_customer_number: c.fortnoxCustomerNumber ?? null,
    created_at: c.createdAt,
  };
}

function fromDbOrder(r: DbRow): Order {
  const events = ((r.order_events as DbRow[]) ?? []).map((e) => ({
    id: e.id as string,
    type: e.type as string,
    description: (e.description as string) ?? '',
    timestamp: e.timestamp as string,
    userId: (e.user_id as string) ?? '',
  }));
  return {
    id: r.id as string,
    orderNumber: r.order_number as string,
    machineId: r.machine_id as string,
    customerId: r.customer_id as string,
    templateId: r.template_id as string | undefined,
    startDate: r.start_date as string,
    plannedReturnDate: (r.planned_return_date as string) ?? '',
    actualReturnDate: r.actual_return_date as string | undefined,
    dailyPrice: (r.daily_price as number) ?? 0,
    weeklyPrice: (r.weekly_price as number) ?? 0,
    monthlyPrice: (r.monthly_price as number) ?? 0,
    transportCost: (r.transport_cost as number) ?? 0,
    deposit: (r.deposit as number) ?? 0,
    totalPrice: (r.total_price as number) ?? 0,
    status: r.status as OrderStatus,
    orderReference: (r.order_reference as string) ?? '',
    internalNotes: (r.internal_notes as string) ?? '',
    customerNotes: (r.customer_notes as string) ?? '',
    accessories: (r.accessories as string[]) ?? [],
    insuranceCost: r.insurance_cost != null ? (r.insurance_cost as number) : undefined,
    returnCondition: r.return_condition as ReturnCondition | undefined,
    returnNotes: r.return_notes as string | undefined,
    returnImages: (r.return_images as string[]) ?? [],
    returnOperatingHours: r.return_operating_hours != null ? (r.return_operating_hours as number) : undefined,
    events,
    rentalArticleId: r.rental_article_id as string | undefined,
    insuranceArticleId: r.insurance_article_id as string | undefined,
    transportArticleId: r.transport_article_id as string | undefined,
    depositArticleId: r.deposit_article_id as string | undefined,
    openEnded: (r.open_ended as boolean) ?? false,
    insuranceMonthlyRate: r.insurance_monthly_rate != null ? (r.insurance_monthly_rate as number) : undefined,
    sentToAccounting: (r.sent_to_accounting as boolean) ?? false,
    fortnoxOrderNumber: (r.fortnox_order_number as string) || undefined,
    orderArticles: (r.order_articles as OrderArticle[]) ?? [],
    createdAt: r.created_at as string,
    createdBy: (r.created_by as string) ?? '',
  };
}

function toDbOrder(o: Order, orgId: string): DbRow {
  return {
    id: o.id,
    organization_id: orgId,
    order_number: o.orderNumber,
    machine_id: o.machineId,
    customer_id: o.customerId,
    template_id: o.templateId ?? null,
    start_date: o.startDate,
    planned_return_date: o.plannedReturnDate || null,
    actual_return_date: o.actualReturnDate ?? null,
    daily_price: o.dailyPrice,
    weekly_price: o.weeklyPrice,
    monthly_price: o.monthlyPrice,
    transport_cost: o.transportCost,
    deposit: o.deposit,
    total_price: o.totalPrice,
    status: o.status,
    order_reference: o.orderReference,
    internal_notes: o.internalNotes,
    customer_notes: o.customerNotes,
    accessories: o.accessories,
    insurance_cost: o.insuranceCost ?? null,
    return_condition: o.returnCondition ?? null,
    return_notes: o.returnNotes ?? null,
    return_images: o.returnImages,
    return_operating_hours: o.returnOperatingHours ?? null,
    rental_article_id: o.rentalArticleId ?? null,
    insurance_article_id: o.insuranceArticleId ?? null,
    transport_article_id: o.transportArticleId ?? null,
    deposit_article_id: o.depositArticleId ?? null,
    open_ended: o.openEnded ?? false,
    insurance_monthly_rate: o.insuranceMonthlyRate ?? null,
    sent_to_accounting: o.sentToAccounting ?? false,
    fortnox_order_number: o.fortnoxOrderNumber ?? null,
    order_articles: o.orderArticles ?? [],
    created_by: o.createdBy || null,
    created_at: o.createdAt,
  };
}

function fromDbTemplate(r: DbRow): PriceTemplate {
  return {
    id: r.id as string,
    name: r.name as string,
    description: (r.description as string) ?? '',
    category: r.category as MachineCategory,
    capacityMin: (r.capacity_min as number) ?? 0,
    capacityMax: (r.capacity_max as number) ?? 0,
    dailyPrice: (r.daily_price as number) ?? 0,
    weeklyPrice: (r.weekly_price as number) ?? 0,
    monthlyPrice: (r.monthly_price as number) ?? 0,
    longTermDailyPrice: (r.long_term_daily_price as number) ?? 0,
    longTermWeeklyPrice: (r.long_term_weekly_price as number) ?? 0,
    longTermMonthlyPrice: (r.long_term_monthly_price as number) ?? 0,
    insuranceDailyPrice: (r.insurance_daily_price as number) ?? 0,
    insuranceWeeklyPrice: (r.insurance_weekly_price as number) ?? 0,
    insuranceMonthlyPrice: (r.insurance_monthly_price as number) ?? 0,
    startFee: (r.start_fee as number) ?? 0,
    transportCost: (r.transport_cost as number) ?? 0,
    deposit: (r.deposit as number) ?? 0,
    minRentalDays: (r.min_rental_days as number) ?? 0,
    standardTerms: (r.standard_terms as string) ?? '',
    internalNote: (r.internal_note as string) ?? '',
    rentalArticleId: r.rental_article_id as string | undefined,
    insuranceArticleId: r.insurance_article_id as string | undefined,
    transportArticleId: r.transport_article_id as string | undefined,
    depositArticleId: r.deposit_article_id as string | undefined,
    createdAt: r.created_at as string,
  };
}

function toDbTemplate(t: PriceTemplate, orgId: string): DbRow {
  return {
    id: t.id,
    organization_id: orgId,
    name: t.name,
    description: t.description,
    category: t.category,
    capacity_min: t.capacityMin,
    capacity_max: t.capacityMax,
    daily_price: t.dailyPrice,
    weekly_price: t.weeklyPrice,
    monthly_price: t.monthlyPrice,
    long_term_daily_price: t.longTermDailyPrice,
    long_term_weekly_price: t.longTermWeeklyPrice,
    long_term_monthly_price: t.longTermMonthlyPrice,
    insurance_daily_price: t.insuranceDailyPrice,
    insurance_weekly_price: t.insuranceWeeklyPrice,
    insurance_monthly_price: t.insuranceMonthlyPrice,
    start_fee: t.startFee,
    transport_cost: t.transportCost,
    deposit: t.deposit,
    min_rental_days: t.minRentalDays,
    standard_terms: t.standardTerms,
    internal_note: t.internalNote,
    rental_article_id: t.rentalArticleId ?? null,
    insurance_article_id: t.insuranceArticleId ?? null,
    transport_article_id: t.transportArticleId ?? null,
    deposit_article_id: t.depositArticleId ?? null,
    created_at: t.createdAt,
  };
}

function fromDbArticle(r: DbRow): Article {
  return {
    id: r.id as string,
    articleNumber: (r.article_number as string) ?? '',
    name: r.name as string,
    description: (r.description as string) ?? '',
    type: r.type as ArticleType,
    unit: r.unit as ArticleUnit,
    defaultPrice: (r.default_price as number) ?? 0,
    accountNumber: (r.account_number as string) ?? '',
    vatRate: (r.vat_rate as number) ?? 25,
    isActive: (r.is_active as boolean) ?? true,
    createdAt: r.created_at as string,
  };
}

function toDbArticle(a: Article, orgId: string): DbRow {
  return {
    id: a.id,
    organization_id: orgId,
    article_number: a.articleNumber,
    name: a.name,
    description: a.description,
    type: a.type,
    unit: a.unit,
    default_price: a.defaultPrice,
    account_number: a.accountNumber,
    vat_rate: a.vatRate,
    is_active: a.isActive,
    created_at: a.createdAt,
  };
}

function fromDbServiceRecord(r: DbRow): ServiceRecord {
  return {
    id: r.id as string,
    machineId: r.machine_id as string,
    type: r.type as ServiceType,
    status: r.status as ServiceStatus,
    description: (r.description as string) ?? '',
    technicianName: (r.technician_name as string) ?? '',
    startDate: r.start_date as string,
    completedDate: r.completed_date as string | undefined,
    cost: (r.cost as number) ?? 0,
    notes: (r.notes as string) ?? '',
    images: (r.images as string[]) ?? [],
    createdAt: r.created_at as string,
  };
}

function toDbServiceRecord(s: ServiceRecord, orgId: string): DbRow {
  return {
    id: s.id,
    organization_id: orgId,
    machine_id: s.machineId,
    type: s.type,
    status: s.status,
    description: s.description,
    technician_name: s.technicianName,
    start_date: s.startDate,
    completed_date: s.completedDate ?? null,
    cost: s.cost,
    notes: s.notes,
    images: s.images,
    created_at: s.createdAt,
  };
}

// Singleton Supabase browser client
let _client: ReturnType<typeof createClient> | null = null;
function sb() {
  if (!_client) _client = createClient();
  return _client;
}

// ---- STORE INTERFACE ----

interface AppStore {
  machines: Machine[];
  customers: Customer[];
  orders: Order[];
  templates: PriceTemplate[];
  serviceRecords: ServiceRecord[];
  articles: Article[];
  members: { id: string; fullName: string }[];
  organizationId: string | null;
  userId: string | null;
  userName: string | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  reset: () => void;

  addMachine: (machine: Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => string;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'events' | 'returnImages'>) => string;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  editOrder: (orderId: string, data: {
    machineId: string;
    customerId: string;
    templateId?: string;
    startDate: string;
    plannedReturnDate: string;
    dailyPrice: number;
    weeklyPrice: number;
    monthlyPrice: number;
    transportCost: number;
    deposit: number;
    insuranceCost?: number;
    totalPrice: number;
    internalNotes: string;
    customerNotes: string;
    accessories: string[];
    rentalArticleId?: string;
    insuranceArticleId?: string;
    transportArticleId?: string;
    depositArticleId?: string;
    openEnded?: boolean;
    insuranceMonthlyRate?: number;
    orderReference?: string;
    orderArticles?: OrderArticle[];
  }) => void;
  deleteOrder: (id: string) => void;
  returnMachine: (orderId: string, data: {
    returnCondition: string;
    returnNotes: string;
    returnOperatingHours: number;
    sendToService: boolean;
    finalTotalPrice?: number;
  }) => void;

  addTemplate: (template: Omit<PriceTemplate, 'id' | 'createdAt'>) => string;
  updateTemplate: (id: string, updates: Partial<PriceTemplate>) => void;
  deleteTemplate: (id: string) => void;

  addServiceRecord: (record: Omit<ServiceRecord, 'id' | 'createdAt'>) => string;
  updateServiceRecord: (id: string, updates: Partial<ServiceRecord>) => void;

  addArticle: (article: Omit<Article, 'id' | 'createdAt'>) => string;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
}

const EMPTY_STATE = {
  machines: [] as Machine[],
  customers: [] as Customer[],
  orders: [] as Order[],
  templates: [] as PriceTemplate[],
  serviceRecords: [] as ServiceRecord[],
  articles: [] as Article[],
  members: [] as { id: string; fullName: string }[],
  organizationId: null as string | null,
  userId: null as string | null,
  userName: null as string | null,
  loading: false,
  initialized: false,
};

// ---- STORE ----

export const useStore = create<AppStore>()((set, get) => ({
  ...EMPTY_STATE,

  initialize: async () => {
    const { initialized, loading } = get();
    if (initialized || loading) return;
    set({ loading: true });

    try {
      const { data: { user } } = await sb().auth.getUser();
      if (!user) {
        set({ loading: false, initialized: true });
        return;
      }

      const { data: profile } = await sb()
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      let orgId: string | null = profile?.organization_id as string ?? null;

      if (!orgId) {
        // Profile missing or has no org — auto-create via server route
        try {
          const res = await fetch('/api/ensure-org', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            orgId = data.organization_id ?? null;
          }
        } catch {
          // Schema not yet applied — swallow and show empty state
        }
      }

      if (!orgId) {
        set({ loading: false, initialized: true });
        return;
      }

      const [machinesRes, customersRes, ordersRes, templatesRes, articlesRes, serviceRes, membersRes] =
        await Promise.all([
          sb().from('machines').select('*').eq('organization_id', orgId),
          sb().from('customers').select('*').eq('organization_id', orgId),
          sb().from('orders').select('*, order_events(*)').eq('organization_id', orgId),
          sb().from('templates').select('*').eq('organization_id', orgId),
          sb().from('articles').select('*').eq('organization_id', orgId),
          sb().from('service_records').select('*').eq('organization_id', orgId),
          sb().from('profiles').select('id, full_name').eq('organization_id', orgId),
        ]);

      const members = (membersRes.data ?? []).map((r) => ({
        id: r.id as string,
        fullName: (r.full_name as string) || 'Okänd användare',
      }));

      const currentMember = members.find((m) => m.id === user.id);

      set({
        organizationId: orgId,
        userId: user.id,
        userName: currentMember?.fullName ?? null,
        members,
        machines: (machinesRes.data ?? []).map((r) => fromDbMachine(r as DbRow)),
        customers: (customersRes.data ?? []).map((r) => fromDbCustomer(r as DbRow)),
        orders: (ordersRes.data ?? []).map((r) => fromDbOrder(r as DbRow)),
        templates: (templatesRes.data ?? []).map((r) => fromDbTemplate(r as DbRow)),
        articles: (articlesRes.data ?? []).map((r) => fromDbArticle(r as DbRow)),
        serviceRecords: (serviceRes.data ?? []).map((r) => fromDbServiceRecord(r as DbRow)),
        loading: false,
        initialized: true,
      });
    } catch (e) {
      console.error('Store initialization failed:', e);
      set({ loading: false, initialized: true });
    }
  },

  reset: () => {
    _client = null;
    set({ ...EMPTY_STATE });
  },

  // ---- MACHINES ----

  addMachine: (machine) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newMachine: Machine = { ...machine, id, qrCode: id, createdAt: now, updatedAt: now };
    set((s) => ({ machines: [...s.machines, newMachine] }));
    const { organizationId } = get();
    if (organizationId) {
      syncQuery(sb().from('machines').insert(toDbMachine(newMachine, organizationId)), 'sync addMachine:');
    }
    return id;
  },

  updateMachine: (id, updates) => {
    const now = new Date().toISOString();
    set((s) => ({
      machines: s.machines.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: now } : m
      ),
    }));
    const { organizationId } = get();
    if (organizationId) {
      const updated = get().machines.find((m) => m.id === id);
      if (updated) {
        syncQuery(sb().from('machines').update(toDbMachine(updated, organizationId)).eq('id', id), 'sync updateMachine:');
      }
    }
  },

  deleteMachine: (id) => {
    set((s) => ({ machines: s.machines.filter((m) => m.id !== id) }));
    const { organizationId } = get();
    if (organizationId) {
      syncQuery(sb().from('machines').delete().eq('id', id), 'sync deleteMachine:');
    }
  },

  // ---- CUSTOMERS ----

  addCustomer: (customer) => {
    const id = crypto.randomUUID();
    const newCustomer: Customer = { ...customer, id, createdAt: new Date().toISOString() };
    set((s) => ({ customers: [...s.customers, newCustomer] }));
    const { organizationId } = get();
    if (organizationId) {
      syncQuery(sb().from('customers').insert(toDbCustomer(newCustomer, organizationId)), 'sync addCustomer:');
    }
    return id;
  },

  updateCustomer: (id, updates) => {
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    const { organizationId } = get();
    if (organizationId) {
      const updated = get().customers.find((c) => c.id === id);
      if (updated) {
        syncQuery(sb().from('customers').update(toDbCustomer(updated, organizationId)).eq('id', id), 'sync updateCustomer:');
      }
    }
  },

  deleteCustomer: (id) => {
    set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }));
    const { organizationId } = get();
    if (organizationId) {
      syncQuery(sb().from('customers').delete().eq('id', id), 'sync deleteCustomer:');
    }
  },

  // ---- ORDERS ----

  addOrder: (orderData) => {
    const id = crypto.randomUUID();
    const orderNumber = generateOrderNumber();
    const now = new Date().toISOString();
    const { organizationId, userId, userName } = get();
    const eventId = crypto.randomUUID();
    const byName = userName ? ` av ${userName}` : '';

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      returnImages: [],
      events: [{ id: eventId, type: 'skapad', description: `Order skapad${byName}`, timestamp: now, userId: userId ?? '' }],
      createdAt: now,
      createdBy: userId ?? '',
    };

    set((s) => ({
      orders: [...s.orders, newOrder],
      machines: s.machines.map((m) =>
        m.id === orderData.machineId ? { ...m, status: 'uthyrd' as const, updatedAt: now } : m
      ),
      customers: s.customers.map((c) =>
        c.id === orderData.customerId ? { ...c, activeOrders: c.activeOrders + 1 } : c
      ),
    }));

    if (organizationId) {
      const client = sb();
      const newActiveOrders = get().customers.find((c) => c.id === orderData.customerId)?.activeOrders ?? 1;
      Promise.all([
        client.from('orders').insert(toDbOrder(newOrder, organizationId)),
        client.from('order_events').insert({
          id: eventId, order_id: id, organization_id: organizationId,
          type: 'skapad', description: 'Order skapad', timestamp: now, user_id: userId ?? null,
        }),
        client.from('machines').update({ status: 'uthyrd', updated_at: now }).eq('id', orderData.machineId),
        client.from('customers').update({ active_orders: newActiveOrders }).eq('id', orderData.customerId),
      ]).then((results) => {
        results.forEach((r, i) => {
          if (r.error) console.error(`sync addOrder[${i}]:`, r.error);
        });
      });
    }

    return id;
  },

  updateOrder: (id, updates) => {
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    }));
    const { organizationId } = get();
    if (organizationId) {
      const dbUpdates: DbRow = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.totalPrice !== undefined) dbUpdates.total_price = updates.totalPrice;
      if (updates.actualReturnDate !== undefined) dbUpdates.actual_return_date = updates.actualReturnDate;
      if (updates.returnCondition !== undefined) dbUpdates.return_condition = updates.returnCondition;
      if (updates.returnNotes !== undefined) dbUpdates.return_notes = updates.returnNotes;
      if (updates.returnOperatingHours !== undefined) dbUpdates.return_operating_hours = updates.returnOperatingHours;
      if (updates.returnImages !== undefined) dbUpdates.return_images = updates.returnImages;
      if (updates.sentToAccounting !== undefined) dbUpdates.sent_to_accounting = updates.sentToAccounting;
      if (updates.fortnoxOrderNumber !== undefined) dbUpdates.fortnox_order_number = updates.fortnoxOrderNumber;
      if (updates.orderArticles !== undefined) dbUpdates.order_articles = updates.orderArticles;
      if (Object.keys(dbUpdates).length > 0) {
        syncQuery(sb().from('orders').update(dbUpdates).eq('id', id), 'sync updateOrder:');
      }
    }
  },

  editOrder: (orderId, data) => {
    const now = new Date().toISOString();
    const { organizationId, userId } = get();
    const oldOrder = get().orders.find((o) => o.id === orderId);
    if (!oldOrder) return;
    const eventId = crypto.randomUUID();
    const isActive = oldOrder.status === 'aktiv' || oldOrder.status === 'reserverad';
    const machineChanged = data.machineId !== oldOrder.machineId;
    const customerChanged = data.customerId !== oldOrder.customerId;

    set((s) => {
      let machines = s.machines;
      if (machineChanged) {
        machines = machines.map((m) => {
          if (m.id === oldOrder.machineId) return { ...m, status: 'i_lager' as const, updatedAt: now };
          if (m.id === data.machineId) return { ...m, status: 'uthyrd' as const, updatedAt: now };
          return m;
        });
      }
      let customers = s.customers;
      if (customerChanged && isActive) {
        customers = customers.map((c) => {
          if (c.id === oldOrder.customerId) return { ...c, activeOrders: Math.max(0, c.activeOrders - 1) };
          if (c.id === data.customerId) return { ...c, activeOrders: c.activeOrders + 1 };
          return c;
        });
      }
      const orders = s.orders.map((o) =>
        o.id === orderId
          ? {
              ...o, ...data,
              events: [
                ...o.events,
                { id: eventId, type: 'redigerad', description: 'Order redigerad', timestamp: now, userId: userId ?? '' },
              ],
            }
          : o
      );
      return { orders, machines, customers };
    });

    if (organizationId) {
      const client = sb();
      const updatedOrder = get().orders.find((o) => o.id === orderId);
      const ops: Promise<{ error: unknown }>[] = [];
      if (updatedOrder) {
        ops.push(client.from('orders').update(toDbOrder(updatedOrder, organizationId)).eq('id', orderId) as unknown as Promise<{ error: unknown }>);
      }
      ops.push(client.from('order_events').insert({
        id: eventId, order_id: orderId, organization_id: organizationId,
        type: 'redigerad', description: 'Order redigerad', timestamp: now, user_id: userId ?? null,
      }) as unknown as Promise<{ error: unknown }>);
      if (machineChanged) {
        ops.push(client.from('machines').update({ status: 'i_lager', updated_at: now }).eq('id', oldOrder.machineId) as unknown as Promise<{ error: unknown }>);
        ops.push(client.from('machines').update({ status: 'uthyrd', updated_at: now }).eq('id', data.machineId) as unknown as Promise<{ error: unknown }>);
      }
      if (customerChanged && isActive) {
        const updatedOldCust = get().customers.find((c) => c.id === oldOrder.customerId);
        const updatedNewCust = get().customers.find((c) => c.id === data.customerId);
        if (updatedOldCust) ops.push(client.from('customers').update({ active_orders: updatedOldCust.activeOrders }).eq('id', oldOrder.customerId) as unknown as Promise<{ error: unknown }>);
        if (updatedNewCust) ops.push(client.from('customers').update({ active_orders: updatedNewCust.activeOrders }).eq('id', data.customerId) as unknown as Promise<{ error: unknown }>);
      }
      Promise.all(ops).then((results) => {
        results.forEach((r, i) => { if (r.error) console.error(`sync editOrder[${i}]:`, r.error); });
      });
    }
  },

  deleteOrder: (id) => {
    const { organizationId } = get();
    const order = get().orders.find((o) => o.id === id);
    if (!order) return;
    const now = new Date().toISOString();

    // Machine was still out on rent — needs to be released
    const releasesMachine = order.status === 'aktiv' || order.status === 'reserverad';

    // Revenue stats were recorded when machine was physically returned
    const hasRevenue = !!order.actualReturnDate;

    // Reconstruct the rental days that were added when the machine was returned
    const rentalDaysToReverse = hasRevenue
      ? Math.max(1, Math.round(
          (new Date(order.actualReturnDate!).getTime() - new Date(order.startDate).getTime()) / 86400000
        ))
      : 0;

    set((s) => ({
      orders: s.orders.filter((o) => o.id !== id),
      machines: s.machines.map((m) => {
        if (m.id !== order.machineId) return m;
        return {
          ...m,
          ...(releasesMachine ? { status: 'i_lager' as const } : {}),
          updatedAt: now,
          totalRevenue: hasRevenue ? Math.max(0, m.totalRevenue - order.totalPrice) : m.totalRevenue,
          totalRentals: hasRevenue ? Math.max(0, m.totalRentals - 1) : m.totalRentals,
          totalRentalDays: hasRevenue ? Math.max(0, m.totalRentalDays - rentalDaysToReverse) : m.totalRentalDays,
        };
      }),
      customers: s.customers.map((c) => {
        if (c.id !== order.customerId) return c;
        return {
          ...c,
          activeOrders: releasesMachine ? Math.max(0, c.activeOrders - 1) : c.activeOrders,
          totalSpent: hasRevenue ? Math.max(0, c.totalSpent - order.totalPrice) : c.totalSpent,
        };
      }),
    }));

    if (organizationId) {
      const client = sb();
      const updatedMachine = get().machines.find((m) => m.id === order.machineId);
      const updatedCust = get().customers.find((c) => c.id === order.customerId);
      const ops: Promise<{ error: unknown }>[] = [
        client.from('orders').delete().eq('id', id) as unknown as Promise<{ error: unknown }>,
      ];
      if (updatedMachine) {
        const machineUpdates: Record<string, unknown> = {
          updated_at: now,
          total_revenue: updatedMachine.totalRevenue,
          total_rentals: updatedMachine.totalRentals,
          total_rental_days: updatedMachine.totalRentalDays,
        };
        if (releasesMachine) machineUpdates.status = 'i_lager';
        ops.push(client.from('machines').update(machineUpdates).eq('id', order.machineId) as unknown as Promise<{ error: unknown }>);
      }
      if (updatedCust && (releasesMachine || hasRevenue)) {
        ops.push(client.from('customers').update({
          active_orders: updatedCust.activeOrders,
          total_spent: updatedCust.totalSpent,
        }).eq('id', order.customerId) as unknown as Promise<{ error: unknown }>);
      }
      Promise.all(ops).then((results) => {
        results.forEach((r, i) => { if (r.error) console.error(`sync deleteOrder[${i}]:`, r.error); });
      });
    }
  },

  returnMachine: (orderId, data) => {
    const now = new Date().toISOString();
    const { organizationId, userId, userName } = get();
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return;
    const newMachineStatus = data.sendToService ? 'service' : 'i_lager';
    const eventId = crypto.randomUUID();
    const finalPrice = data.finalTotalPrice !== undefined ? data.finalTotalPrice : order.totalPrice;
    const byName = userName ? ` av ${userName}` : '';

    const startDate = new Date(order.startDate);
    const rentalDays = Math.max(1, Math.round((Date.now() - startDate.getTime()) / 86400000));

    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'klar_for_fakturering' as const,
              actualReturnDate: now,
              returnCondition: data.returnCondition as Order['returnCondition'],
              returnNotes: data.returnNotes,
              returnOperatingHours: data.returnOperatingHours,
              ...(data.finalTotalPrice !== undefined ? { totalPrice: data.finalTotalPrice } : {}),
              events: [
                ...o.events,
                {
                  id: eventId,
                  type: 'retur',
                  description: `Maskin återlämnad${byName}. Skick: ${data.returnCondition}.`,
                  timestamp: now,
                  userId: userId ?? '',
                },
              ],
            }
          : o
      ),
      machines: s.machines.map((m) =>
        m.id === order.machineId
          ? {
              ...m,
              status: newMachineStatus as Machine['status'],
              updatedAt: now,
              totalRevenue: m.totalRevenue + finalPrice,
              totalRentals: m.totalRentals + 1,
              totalRentalDays: m.totalRentalDays + rentalDays,
            }
          : m
      ),
      customers: s.customers.map((c) =>
        c.id === order.customerId
          ? { ...c, activeOrders: Math.max(0, c.activeOrders - 1), totalSpent: c.totalSpent + finalPrice }
          : c
      ),
    }));

    if (organizationId) {
      const client = sb();
      const updatedMachine = get().machines.find((m) => m.id === order.machineId);
      const updatedCust = get().customers.find((c) => c.id === order.customerId);
      const ops: Promise<{ error: unknown }>[] = [
        client.from('machines').update({
          status: newMachineStatus,
          updated_at: now,
          total_revenue: updatedMachine?.totalRevenue,
          total_rentals: updatedMachine?.totalRentals,
          total_rental_days: updatedMachine?.totalRentalDays,
        }).eq('id', order.machineId) as unknown as Promise<{ error: unknown }>,
        client.from('order_events').insert({
          id: eventId, order_id: orderId, organization_id: organizationId,
          type: 'retur', description: `Maskin återlämnad. Skick: ${data.returnCondition}.`,
          timestamp: now, user_id: userId ?? null,
        }) as unknown as Promise<{ error: unknown }>,
        client.from('orders').update({
          status: 'klar_for_fakturering',
          actual_return_date: now,
          return_condition: data.returnCondition,
          return_notes: data.returnNotes,
          return_operating_hours: data.returnOperatingHours,
          ...(data.finalTotalPrice !== undefined ? { total_price: data.finalTotalPrice } : {}),
        }).eq('id', orderId) as unknown as Promise<{ error: unknown }>,
      ];
      if (updatedCust) {
        ops.push(client.from('customers').update({
          active_orders: updatedCust.activeOrders,
          total_spent: updatedCust.totalSpent,
        }).eq('id', order.customerId) as unknown as Promise<{ error: unknown }>);
      }
      Promise.all(ops).then((results) => {
        results.forEach((r, i) => { if (r.error) console.error(`sync returnMachine[${i}]:`, r.error); });
      });
    }
  },

  // ---- TEMPLATES ----

  addTemplate: (template) => {
    const id = crypto.randomUUID();
    const newTemplate: PriceTemplate = { ...template, id, createdAt: new Date().toISOString() };
    set((s) => ({ templates: [...s.templates, newTemplate] }));
    const { organizationId } = get();
    if (organizationId) {
      syncQuery(sb().from('templates').insert(toDbTemplate(newTemplate, organizationId)), 'sync addTemplate:');
    }
    return id;
  },

  updateTemplate: (id, updates) => {
    set((s) => ({
      templates: s.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    const { organizationId } = get();
    if (organizationId) {
      const updated = get().templates.find((t) => t.id === id);
      if (updated) {
        syncQuery(sb().from('templates').update(toDbTemplate(updated, organizationId)).eq('id', id), 'sync updateTemplate:');
      }
    }
  },

  deleteTemplate: (id) => {
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }));
    const { organizationId } = get();
    if (organizationId) {
      syncQuery(sb().from('templates').delete().eq('id', id), 'sync deleteTemplate:');
    }
  },

  // ---- SERVICE RECORDS ----

  addServiceRecord: (record) => {
    const id = crypto.randomUUID();
    const newRecord: ServiceRecord = { ...record, id, createdAt: new Date().toISOString() };
    set((s) => ({ serviceRecords: [...s.serviceRecords, newRecord] }));
    const { organizationId } = get();
    if (organizationId) {
      syncQuery(sb().from('service_records').insert(toDbServiceRecord(newRecord, organizationId)), 'sync addServiceRecord:');
    }
    return id;
  },

  updateServiceRecord: (id, updates) => {
    set((s) => ({
      serviceRecords: s.serviceRecords.map((sr) => (sr.id === id ? { ...sr, ...updates } : sr)),
    }));
    const { organizationId } = get();
    if (organizationId) {
      const updated = get().serviceRecords.find((sr) => sr.id === id);
      if (updated) {
        syncQuery(sb().from('service_records').update(toDbServiceRecord(updated, organizationId)).eq('id', id), 'sync updateServiceRecord:');
      }
    }
  },

  // ---- ARTICLES ----

  addArticle: (article) => {
    const id = crypto.randomUUID();
    const newArticle: Article = { ...article, id, createdAt: new Date().toISOString() };
    set((s) => ({ articles: [...s.articles, newArticle] }));
    const { organizationId } = get();
    if (organizationId) {
      syncQuery(sb().from('articles').insert(toDbArticle(newArticle, organizationId)), 'sync addArticle:');
    }
    return id;
  },

  updateArticle: (id, updates) => {
    set((s) => ({
      articles: s.articles.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
    const { organizationId } = get();
    if (organizationId) {
      const updated = get().articles.find((a) => a.id === id);
      if (updated) {
        syncQuery(sb().from('articles').update(toDbArticle(updated, organizationId)).eq('id', id), 'sync updateArticle:');
      }
    }
  },

  deleteArticle: (id) => {
    set((s) => ({ articles: s.articles.filter((a) => a.id !== id) }));
    const { organizationId } = get();
    if (organizationId) {
      syncQuery(sb().from('articles').delete().eq('id', id), 'sync deleteArticle:');
    }
  },
}));
