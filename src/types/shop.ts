export type ProductCategory =
  | 'Keychains & Tags'
  | 'Pooja & Decor'
  | 'Home Decor'
  | 'Custom Lithophanes';

export type CustomizerMode = 'plate' | 'name' | 'gym' | 'lithophane';

export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
  ringHex?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: ProductCategory;
  price: number;
  mrp: number;
  discountPercent?: number;
  onSale?: boolean;
  isStartingPrice?: boolean;
  image: string;
  customizable?: boolean;
  customizerMode?: CustomizerMode;
  inStock: boolean;
  swatches?: ColorSwatch[];
  sections: ('hero' | 'bestsellers' | 'customized' | 'pooja')[];
  dimensions?: string;
  material?: string;
}

export interface CategoryCardItem {
  id: string;
  title: string;
  category: ProductCategory;
  startingPrice: number;
  image: string;
  itemCountLabel: string;
  targetSectionId: string;
}

export interface CustomConfig {
  mode: CustomizerMode;
  primaryText: string;
  secondaryText?: string;
  plateStyle?: 'white-private' | 'yellow-commercial' | 'green-ev';
  baseColor: ColorSwatch;
  accentColor?: ColorSwatch;
  ringFinish?: 'Silver Steel' | 'Matte Black';
  photoDataUrl?: string;
  photoFileName?: string;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  title: string;
  image: string;
  unitPrice: number;
  mrp: number;
  quantity: number;
  selectedSwatch?: ColorSwatch;
  customConfig?: CustomConfig;
  printLabSummary?: string;
}

export interface OrderConfirmation {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  pincode: string;
  paymentMethod: 'UPI' | 'COD';
  totalPaid: number;
  itemCount: number;
  estimatedDispatch: string;
}

export type OrderStageIndex = 0 | 1 | 2 | 3 | 4;

export interface OrderTimelineStep {
  label: string;
  detail: string;
  timestamp: string;
}

export interface OrderTrackingRecord {
  orderId: string;
  customerName: string;
  phone: string;
  pincode: string;
  cityLabel: string;
  paymentMethod: 'UPI' | 'COD';
  totalPaid: number;
  itemsSummary: string;
  currentStage: OrderStageIndex;
  courierName: string;
  awbNumber: string;
  estimatedDelivery: string;
  steps: OrderTimelineStep[];
}
