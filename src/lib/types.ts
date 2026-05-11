export type MachineStatus = 'i_lager' | 'uthyrd' | 'reserverad' | 'service' | 'skadad' | 'utfasad';
export type FuelType = 'el' | 'diesel' | 'gas' | 'lithium' | 'bensin';
export type MachineCategory =
  | 'motviktstruck'
  | 'ledstaplare'
  | 'skjutstativtruck'
  | 'teleskoplastare'
  | 'hjullastare'
  | 'gravmaskin'
  | 'kompaktlastare'
  | 'ovrig';
export type OrderStatus = 'aktiv' | 'avslutad' | 'forsenad' | 'annullerad' | 'reserverad';
export type UserRole = 'admin' | 'saljare' | 'verkstad';
export type ServiceType = 'periodisk' | 'reparation' | 'besiktning' | 'kontroll';
export type ServiceStatus = 'planerad' | 'pagaende' | 'avslutad';
export type ReturnCondition = 'bra' | 'skadat' | 'kraver_service' | 'kraver_kontroll';

export interface Machine {
  id: string;
  name: string;
  model: string;
  brand: string;
  serialNumber: string;
  registrationNumber: string;
  internalCode: string;
  category: MachineCategory;
  capacity: string;
  fuelType: FuelType;
  year: number;
  operatingHours: number;
  status: MachineStatus;
  images: string[];
  documents: string[];
  notes: string;
  location: string;
  qrCode: string;
  purchasePrice: number;
  purchaseDate: string;
  leasingCost: number;
  financingCost: number;
  insuranceCost: number;
  serviceCost: number;
  otherCosts: number;
  totalRevenue: number;
  totalRentals: number;
  totalRentalDays: number;
  totalServiceCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  companyName: string;
  orgNumber: string;
  contactPerson: string;
  phone: string;
  email: string;
  invoiceAddress: string;
  deliveryAddress: string;
  notes: string;
  creditLimit: number;
  totalSpent: number;
  activeOrders: number;
  createdAt: string;
}

export interface OrderEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  machineId: string;
  customerId: string;
  templateId?: string;
  startDate: string;
  plannedReturnDate: string;
  actualReturnDate?: string;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  transportCost: number;
  deposit: number;
  totalPrice: number;
  status: OrderStatus;
  internalNotes: string;
  customerNotes: string;
  accessories: string[];
  returnCondition?: ReturnCondition;
  returnNotes?: string;
  returnImages: string[];
  returnOperatingHours?: number;
  events: OrderEvent[];
  createdAt: string;
  createdBy: string;
}

export interface PriceTemplate {
  id: string;
  name: string;
  description: string;
  category: MachineCategory;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  startFee: number;
  transportCost: number;
  deposit: number;
  minRentalDays: number;
  standardTerms: string;
  internalNote: string;
  createdAt: string;
}

export interface ServiceRecord {
  id: string;
  machineId: string;
  type: ServiceType;
  status: ServiceStatus;
  description: string;
  technicianName: string;
  startDate: string;
  completedDate?: string;
  cost: number;
  notes: string;
  images: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const STATUS_LABELS: Record<MachineStatus, string> = {
  i_lager: 'I lager',
  uthyrd: 'Uthyrd',
  reserverad: 'Reserverad',
  service: 'Service',
  skadad: 'Skadad',
  utfasad: 'Utfasad',
};

export const STATUS_COLORS: Record<MachineStatus, string> = {
  i_lager: 'bg-emerald-100 text-emerald-800',
  uthyrd: 'bg-blue-100 text-blue-800',
  reserverad: 'bg-amber-100 text-amber-800',
  service: 'bg-orange-100 text-orange-800',
  skadad: 'bg-red-100 text-red-800',
  utfasad: 'bg-slate-100 text-slate-600',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  aktiv: 'Aktiv',
  avslutad: 'Avslutad',
  forsenad: 'Försenad',
  annullerad: 'Annullerad',
  reserverad: 'Reserverad',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  aktiv: 'bg-blue-100 text-blue-800',
  avslutad: 'bg-emerald-100 text-emerald-800',
  forsenad: 'bg-red-100 text-red-800',
  annullerad: 'bg-slate-100 text-slate-600',
  reserverad: 'bg-amber-100 text-amber-800',
};

export const CATEGORY_LABELS: Record<MachineCategory, string> = {
  motviktstruck: 'Motviktstruck',
  ledstaplare: 'Ledstaplare',
  skjutstativtruck: 'Skjutstativtruck',
  teleskoplastare: 'Teleskoplastare',
  hjullastare: 'Hjullastare',
  gravmaskin: 'Grävmaskin',
  kompaktlastare: 'Kompaktlastare',
  ovrig: 'Övrig',
};

export const FUEL_LABELS: Record<FuelType, string> = {
  el: 'El',
  diesel: 'Diesel',
  gas: 'Gas',
  lithium: 'Lithium',
  bensin: 'Bensin',
};
