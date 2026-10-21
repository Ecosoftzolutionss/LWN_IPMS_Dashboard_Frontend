// Sample data so the screens can be previewed without the backend
// (set VITE_USE_MOCK=true in .env or USE_MOCK: true in public/config.js).
const pallets = (prefix, from, count, qty, colour) =>
  Array.from({ length: count }, (_, i) => ({
    palletNo: `${prefix}-${String(from + i).padStart(2, '0')}`,
    qty,
    colour,
  }));

export const mockConfig = { rows: 11, seconds: 6, itemIds: [1, 2, 3, 4] };

export const mockBoard = [
  { itemId: 1, slNo: 1, partNo: '24110-07000', partName: 'CAMSHAFT INLET', fifoCode: 'N3IN', fifoColour: '#0066FF', lastGirn: '260210', lastPalletRange: '8~10', lastQty: 2100, fifoSequence: 'From Pallet No. 1 ~ 44', stock: 30800, level: 'Safety' },
  { itemId: 2, slNo: 2, partNo: '24210-03010', partName: 'Kappa DCVVT EXHAUST', fifoCode: 'EX', fifoColour: '#FF6600', lastGirn: '260214', lastPalletRange: '6~7', lastQty: 1400, fifoSequence: 'From Pallet No. 8 ~ 13', stock: 4200, level: 'Re-order' },
  { itemId: 3, slNo: 3, partNo: 'PKG-003', partName: 'Bubble Wrap Roll', fifoCode: 'IN', fifoColour: '#008000', lastGirn: '261018001', lastPalletRange: '2~3', lastQty: 200, fifoSequence: 'From Pallet No. 4 ~ 9', stock: 600, level: 'Safety' },
  { itemId: 4, slNo: 4, partNo: 'PKG-005', partName: 'Self Adhesive Packaging Label', fifoCode: '', fifoColour: '', lastGirn: '261018001', lastPalletRange: '2~3', lastQty: 800, fifoSequence: '-', stock: 0, level: 'Danger' },
];

export const mockParts = {
  1: { modelName: 'KAPPA PE 1.0L', partNumber: '24110-07000', partName: 'CAMSHAFT INLET', pallets: pallets('N3IN', 1, 44, 700, '#0066FF'), storageArea: 'Rack A', nextFifoPallet: 'N3IN-01', stockInHand: 30800, level: 'Safety' },
  2: { modelName: 'KAPPA PE 1.0L', partNumber: '24210-03010', partName: 'Kappa DCVVT EXHAUST', pallets: pallets('EX', 8, 6, 700, '#FF6600'), storageArea: 'Rack B', nextFifoPallet: 'EX-08', stockInHand: 4200, level: 'Re-order' },
  3: { modelName: 'Bubble Wrap Roll', partNumber: 'PKG-003', partName: 'Bubble Wrap Roll', pallets: pallets('IN', 4, 6, 100, '#008000'), storageArea: 'Rack A', nextFifoPallet: 'IN-04', stockInHand: 600, level: 'Safety' },
  4: { modelName: 'Self Adhesive Packaging Label', partNumber: 'PKG-005', partName: 'Self Adhesive Packaging Label', pallets: [], storageArea: '-', nextFifoPallet: null, stockInHand: 0, level: 'Danger' },
};
