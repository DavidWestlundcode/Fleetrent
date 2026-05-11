'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Machine, Customer, Order, PriceTemplate, ServiceRecord, User } from '@/lib/types';
import {
  MOCK_MACHINES,
  MOCK_CUSTOMERS,
  MOCK_ORDERS,
  MOCK_TEMPLATES,
  MOCK_SERVICE_RECORDS,
  MOCK_USERS,
} from '@/lib/mock-data';
import { generateId, generateOrderNumber } from '@/lib/utils';

interface AppStore {
  machines: Machine[];
  customers: Customer[];
  orders: Order[];
  templates: PriceTemplate[];
  serviceRecords: ServiceRecord[];
  currentUser: User | null;

  login: (email: string) => boolean;
  logout: () => void;

  addMachine: (machine: Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => string;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'events' | 'returnImages'>) => string;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  returnMachine: (orderId: string, data: {
    returnCondition: string;
    returnNotes: string;
    returnOperatingHours: number;
    sendToService: boolean;
  }) => void;

  addTemplate: (template: Omit<PriceTemplate, 'id' | 'createdAt'>) => string;
  updateTemplate: (id: string, updates: Partial<PriceTemplate>) => void;
  deleteTemplate: (id: string) => void;

  addServiceRecord: (record: Omit<ServiceRecord, 'id' | 'createdAt'>) => string;
  updateServiceRecord: (id: string, updates: Partial<ServiceRecord>) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      machines: MOCK_MACHINES,
      customers: MOCK_CUSTOMERS,
      orders: MOCK_ORDERS,
      templates: MOCK_TEMPLATES,
      serviceRecords: MOCK_SERVICE_RECORDS,
      currentUser: null,

      login: (email) => {
        const user = MOCK_USERS.find((u) => u.email === email);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        // Demo: allow any login
        set({ currentUser: MOCK_USERS[0] });
        return true;
      },

      logout: () => set({ currentUser: null }),

      addMachine: (machine) => {
        const id = generateId();
        const now = new Date().toISOString();
        set((state) => ({
          machines: [...state.machines, { ...machine, id, createdAt: now, updatedAt: now }],
        }));
        return id;
      },

      updateMachine: (id, updates) =>
        set((state) => ({
          machines: state.machines.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
          ),
        })),

      deleteMachine: (id) =>
        set((state) => ({ machines: state.machines.filter((m) => m.id !== id) })),

      addCustomer: (customer) => {
        const id = generateId();
        set((state) => ({
          customers: [...state.customers, { ...customer, id, createdAt: new Date().toISOString() }],
        }));
        return id;
      },

      updateCustomer: (id, updates) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCustomer: (id) =>
        set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),

      addOrder: (order) => {
        const id = generateId();
        const orderNumber = generateOrderNumber();
        const now = new Date().toISOString();
        const newOrder: Order = {
          ...order,
          id,
          orderNumber,
          returnImages: [],
          events: [{ id: generateId(), type: 'skapad', description: 'Order skapad', timestamp: now, userId: get().currentUser?.id ?? 'u1' }],
          createdAt: now,
        };
        set((state) => {
          const machines = state.machines.map((m) =>
            m.id === order.machineId ? { ...m, status: 'uthyrd' as const, updatedAt: now } : m
          );
          const customers = state.customers.map((c) =>
            c.id === order.customerId ? { ...c, activeOrders: c.activeOrders + 1 } : c
          );
          return { orders: [...state.orders, newOrder], machines, customers };
        });
        return id;
      },

      updateOrder: (id, updates) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        })),

      returnMachine: (orderId, data) => {
        const now = new Date().toISOString();
        set((state) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return state;
          const newStatus = data.sendToService ? 'service' : 'i_lager';
          const machines = state.machines.map((m) =>
            m.id === order.machineId ? { ...m, status: newStatus as Machine['status'], updatedAt: now } : m
          );
          const customers = state.customers.map((c) =>
            c.id === order.customerId ? { ...c, activeOrders: Math.max(0, c.activeOrders - 1) } : c
          );
          const orders = state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'avslutad' as const,
                  actualReturnDate: now,
                  returnCondition: data.returnCondition as Order['returnCondition'],
                  returnNotes: data.returnNotes,
                  returnOperatingHours: data.returnOperatingHours,
                  events: [
                    ...o.events,
                    { id: generateId(), type: 'retur', description: `Maskin återlämnad. Skick: ${data.returnCondition}.`, timestamp: now, userId: get().currentUser?.id ?? 'u3' },
                  ],
                }
              : o
          );
          return { orders, machines, customers };
        });
      },

      addTemplate: (template) => {
        const id = generateId();
        set((state) => ({
          templates: [...state.templates, { ...template, id, createdAt: new Date().toISOString() }],
        }));
        return id;
      },

      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTemplate: (id) =>
        set((state) => ({ templates: state.templates.filter((t) => t.id !== id) })),

      addServiceRecord: (record) => {
        const id = generateId();
        set((state) => ({
          serviceRecords: [...state.serviceRecords, { ...record, id, createdAt: new Date().toISOString() }],
        }));
        return id;
      },

      updateServiceRecord: (id, updates) =>
        set((state) => ({
          serviceRecords: state.serviceRecords.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),
    }),
    { name: 'fleetrent-store' }
  )
);
