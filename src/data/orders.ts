import { CartItem, OrderConfirmation, OrderTrackingRecord } from '../types/shop';

const STORAGE_KEY = 'apna3dshop_orders_v1';

export const SEED_TRACKING_ORDERS: OrderTrackingRecord[] = [
  {
    orderId: 'APNA-4821',
    customerName: 'Aarav Kulkarni',
    phone: '9820411290',
    pincode: '400001',
    cityLabel: 'Mumbai, Maharashtra',
    paymentMethod: 'UPI',
    totalPaid: 538,
    itemsSummary:
      'Vehicle Number Plate Keychain ("MH 02 CQ 5432") + Custom 3D Name Keychain',
    currentStage: 3,
    courierName: 'BlueDart Surface Express',
    awbNumber: 'BD774920184IN',
    estimatedDelivery: 'Arriving Tomorrow by 7:00 PM',
    steps: [
      {
        label: 'Order Placed',
        detail: 'Payment verified via UPI · Queued for slicing',
        timestamp: '13 Nov, 10:15 AM',
      },
      {
        label: '3D Printing in Lab',
        detail: 'Printed in Dual-Layer Matte PLA+ (0.20mm nozzle pass)',
        timestamp: '13 Nov, 03:40 PM',
      },
      {
        label: 'QC & Hardware Fitment',
        detail: 'Embossed lettering inspected · Steel split ring fitted',
        timestamp: '14 Nov, 11:20 AM',
      },
      {
        label: 'Dispatched Across India',
        detail: 'In transit via BlueDart Mumbai Hub (AWB BD774920184IN)',
        timestamp: '15 Nov, 08:10 AM',
      },
      {
        label: 'Delivered',
        detail: 'Doorstep handover at Fort, Mumbai 400001',
        timestamp: 'Expected 16 Nov',
      },
    ],
  },
  {
    orderId: 'APNA-4790',
    customerName: 'Priya Nair',
    phone: '9900184320',
    pincode: '560001',
    cityLabel: 'Bengaluru, Karnataka',
    paymentMethod: 'COD',
    totalPaid: 399,
    itemsSummary: 'Ganesha Mandala Holder (Ivory Alabaster PLA+)',
    currentStage: 1,
    courierName: 'Delhivery Air Parcel',
    awbNumber: 'Pending Dispatch',
    estimatedDelivery: 'Estimated 18 Nov',
    steps: [
      {
        label: 'Order Placed',
        detail: 'Cash on Delivery confirmed · Scheduled on Print Bed #04',
        timestamp: '15 Nov, 09:05 AM',
      },
      {
        label: '3D Printing in Lab',
        detail: 'Currently printing layer 184 / 410 (Heat-Treated Ivory PLA+)',
        timestamp: 'In Progress Now',
      },
      {
        label: 'QC & Hardware Fitment',
        detail: 'Foam-cushioned box inspection queued',
        timestamp: 'Pending',
      },
      {
        label: 'Dispatched Across India',
        detail: 'Pickup scheduled with Delhivery',
        timestamp: 'Pending',
      },
      {
        label: 'Delivered',
        detail: 'Doorstep delivery to Bengaluru 560001',
        timestamp: 'Pending',
      },
    ],
  },
];

export function loadSavedOrders(): OrderTrackingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_TRACKING_ORDERS;
    const parsed = JSON.parse(raw) as OrderTrackingRecord[];
    const merged = [...parsed];
    for (const seed of SEED_TRACKING_ORDERS) {
      if (!merged.some((o) => o.orderId === seed.orderId)) {
        merged.push(seed);
      }
    }
    return merged;
  } catch {
    return SEED_TRACKING_ORDERS;
  }
}

export function createAndSaveOrderRecord(
  confirmation: OrderConfirmation,
  items: CartItem[]
): OrderTrackingRecord {
  const summary = items
    .map((item) => `${item.title} ×${item.quantity}`)
    .join(', ');

  const record: OrderTrackingRecord = {
    orderId: confirmation.orderId,
    customerName: confirmation.customerName,
    phone: confirmation.phone.replace(/\D/g, ''),
    pincode: confirmation.pincode,
    cityLabel: `PIN ${confirmation.pincode}, India`,
    paymentMethod: confirmation.paymentMethod,
    totalPaid: confirmation.totalPaid,
    itemsSummary: summary || 'Custom 3D Printed Order',
    currentStage: 1,
    courierName: 'BlueDart / Delhivery Express',
    awbNumber: 'Generating on Dispatch',
    estimatedDelivery: 'Within 3–5 working days',
    steps: [
      {
        label: 'Order Placed',
        detail: `${
          confirmation.paymentMethod === 'COD'
            ? 'Cash on Delivery confirmed'
            : 'UPI verification completed'
        } · Added to workshop queue`,
        timestamp: 'Just now',
      },
      {
        label: '3D Printing in Lab',
        detail: 'Slicing G-code & calibrating filament bed temperature',
        timestamp: 'In Queue (Next Batch)',
      },
      {
        label: 'QC & Hardware Fitment',
        detail: 'Layer inspection & protective foam packaging',
        timestamp: 'Within 24 hrs',
      },
      {
        label: 'Dispatched Across India',
        detail: `Courier pickup for PIN ${confirmation.pincode}`,
        timestamp: 'Within 48 hrs',
      },
      {
        label: 'Delivered',
        detail: `Doorstep delivery to ${confirmation.address}`,
        timestamp: '3–5 Days',
      },
    ],
  };

  try {
    const current = loadSavedOrders().filter(
      (o) => o.orderId !== record.orderId
    );
    const updated = [record, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage quota failures
  }

  return record;
}
