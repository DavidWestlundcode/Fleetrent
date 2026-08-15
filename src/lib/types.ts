export type MachineStatus = 'i_lager' | 'uthyrd' | 'reserverad' | 'service' | 'skadad' | 'utfasad';
export type FuelType = 'el' | 'diesel' | 'gas' | 'lithium' | 'bensin' | 'okand';
export type MachineCategory =
  | 'motviktstruck'
  | 'ledstaplare'
  | 'skjutstativtruck'
  | 'teleskoplastare'
  | 'hjullastare'
  | 'gravmaskin'
  | 'kompaktlastare'
  | 'ovrig';
export type OrderStatus = 'aktiv' | 'avslutad' | 'klar_for_fakturering' | 'forsenad' | 'annullerad' | 'reserverad';
export type UserRole = 'admin' | 'saljare' | 'verkstad';
export type ServiceType = 'periodisk' | 'reparation' | 'besiktning' | 'kontroll';
export type ServiceStatus = 'planerad' | 'pagaende' | 'avslutad';
export type ReturnCondition = 'bra' | 'skadat' | 'kraver_service' | 'kraver_kontroll';
export type ArticleType = 'hyra' | 'försäkring' | 'transport' | 'deposition' | 'service' | 'övrigt';
export type ArticleUnit = 'dag' | 'vecka' | 'månad' | 'st' | 'tim';

export interface OrderArticle {
  articleId: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  description?: string;
}

export interface ContactPerson {
  name: string;
  phone: string;
  email: string;
  title?: string;
}

export interface CustomerFacility {
  name: string;
  address: string;
  city: string;
  zip?: string;
  contacts?: ContactPerson[];
}

export interface SpMachine {
  spId: string;
  name: string;
  brand?: string;
  model?: string;
  serialNo?: string;
  objectNo?: string;
  tags?: string[];
}

export interface Article {
  id: string;
  articleNumber: string;
  name: string;
  description: string;
  type: ArticleType;
  unit: ArticleUnit;
  defaultPrice: number;
  accountNumber: string;
  vatRate: number;
  isActive: boolean;
  createdAt: string;
}

export interface Machine {
  id: string;
  name: string;
  model: string;
  brand: string;
  serialNumber: string;
  registrationNumber: string;
  internalCode: string;
  category: MachineCategory;
  capacity: number;
  fuelType: FuelType;
  // Tekniska specifikationer (valfria, beror på maskintyp)
  liftHeight?: number;    // mm – Lyfthöjd
  buildHeight?: number;   // mm – Bygghöjd
  forkLength?: number;    // mm – Gaffellängd
  freeLift?: number;      // mm – Frilyft
  maxReach?: number;      // mm – Max räckvidd
  digDepth?: number;      // mm – Grävdjup
  bucketVolume?: number;  // liter – Skopvolym
  workingWeight?: number; // kg – Tjänstevikt
  enginePower?: number;   // kW – Motoreffekt
  mastType?: string;      // Stativ (t.ex. Duplex, Triplex)
  powerUnit?: string;     // Aggregat
  cabin?: string;         // Hytt
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
  fortnoxCustomerNumber?: string;
  contacts: ContactPerson[];
  facilities: CustomerFacility[];
  spMachines?: SpMachine[];
  isActive?: boolean;
  createdAt: string;
  spId?: string;
}

export interface OrderEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId: string;
}

export interface InvoicePeriod {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  amount: number;
  fortnoxOrderNumber?: string;
  sentToAccounting?: boolean;
  createdAt: string;
}

export interface MachineSwap {
  id: string;
  fromMachineId: string;
  toMachineId: string;
  date: string;
  reason?: string;
  invoicePeriodId?: string;
  createdAt: string;
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
  orderReference: string;
  internalNotes: string;
  customerNotes: string;
  accessories: string[];
  facilityName?: string;
  ordererName?: string;
  ordererPhone?: string;
  ordererEmail?: string;
  insuranceCost?: number;
  returnCondition?: ReturnCondition;
  returnNotes?: string;
  returnImages: string[];
  returnOperatingHours?: number;
  pickupCondition?: ReturnCondition;
  pickupNotes?: string;
  pickupImages: string[];
  pickupOperatingHours?: number;
  pickupCompletedAt?: string;
  events: OrderEvent[];
  rentalArticleId?: string;
  insuranceArticleId?: string;
  transportArticleId?: string;
  depositArticleId?: string;
  openEnded?: boolean;
  chargeWeekends?: boolean;
  isLongTerm?: boolean;
  insuranceMonthlyRate?: number;
  discountPercent?: number;
  rentalDiscount?: number;
  transportDiscount?: number;
  insuranceDiscount?: number;
  sentToAccounting?: boolean;
  fortnoxOrderNumber?: string;
  orderArticles: OrderArticle[];
  invoicePeriods?: InvoicePeriod[];
  machineSwaps?: MachineSwap[];
  zignedAgreementId?: string;
  signingStatus?: 'not_sent' | 'pending' | 'signed' | 'cancelled';
  signingUrl?: string;
  createdAt: string;
  createdBy: string;
}

export interface PriceTemplate {
  id: string;
  name: string;
  description: string;
  category: MachineCategory;
  capacityMin: number;
  capacityMax: number;
  dailyPrice: number;
  dailyPriceDiscount?: number;
  weeklyPrice: number;
  weeklyPriceDiscount?: number;
  monthlyPrice: number;
  monthlyPriceDiscount?: number;
  longTermDailyPrice: number;
  longTermDailyDiscount?: number;
  longTermWeeklyPrice: number;
  longTermWeeklyDiscount?: number;
  longTermMonthlyPrice: number;
  longTermMonthlyDiscount?: number;
  insuranceDailyPrice: number;
  insuranceDailyDiscount?: number;
  insuranceWeeklyPrice: number;
  insuranceWeeklyDiscount?: number;
  insuranceMonthlyPrice: number;
  insuranceMonthlyDiscount?: number;
  startFee: number;
  startFeeDiscount?: number;
  transportCost: number;
  transportDiscount?: number;
  deposit: number;
  minRentalDays: number;
  standardTerms: string;
  internalNote: string;
  discountPercent?: number;
  rentalArticleId?: string;
  insuranceArticleId?: string;
  transportArticleId?: string;
  depositArticleId?: string;
  customerIds: string[];
  customerType: TemplateCustomerType;
  createdAt: string;
}

export type TemplateCustomerType = 'uthyrare' | 'slutkund' | 'alla';

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
  klar_for_fakturering: 'Klar för fakturering',
  forsenad: 'Försenad',
  annullerad: 'Annullerad',
  reserverad: 'Reserverad',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  aktiv: 'bg-blue-100 text-blue-800',
  avslutad: 'bg-emerald-100 text-emerald-800',
  klar_for_fakturering: 'bg-violet-100 text-violet-800',
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
  okand: '–',
};

export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  hyra: 'Hyra',
  försäkring: 'Försäkring',
  transport: 'Transport',
  deposition: 'Deposition',
  service: 'Service',
  övrigt: 'Övrigt',
};

export const ARTICLE_TYPE_COLORS: Record<ArticleType, string> = {
  hyra: 'bg-blue-100 text-blue-800',
  försäkring: 'bg-violet-100 text-violet-800',
  transport: 'bg-amber-100 text-amber-800',
  deposition: 'bg-slate-100 text-slate-700',
  service: 'bg-orange-100 text-orange-800',
  övrigt: 'bg-gray-100 text-gray-700',
};

export const ARTICLE_UNIT_LABELS: Record<ArticleUnit, string> = {
  dag: 'Dag',
  vecka: 'Vecka',
  månad: 'Månad',
  st: 'St',
  tim: 'Tim',
};
