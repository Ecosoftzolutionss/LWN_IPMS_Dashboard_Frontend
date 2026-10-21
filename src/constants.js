// Design size of the display. Everything is drawn at 1920x1080 and
// scaled to fit the real screen, so fonts/sizes look identical everywhere.
export const DESIGN_W = 1920;
export const DESIGN_H = 1080;

export const FOOTER_MESSAGE = 'FORKLIFT SAFE DRIVE : Keep it Slow, it’s not a race!';

export const PALLET_COLUMNS = 22; // tiles per row
export const DEFAULT_PALLET_COLOUR = '#0000ff';
export const DEFAULT_ROWS = 11;
export const DEFAULT_SECONDS = 8;

const LEVELS = {
  safety: { bg: '#00ff00', color: '#000000' },
  're-order': { bg: '#ffff00', color: '#000000' },
  reorder: { bg: '#ffff00', color: '#000000' },
  danger: { bg: '#ff0000', color: '#ffffff' },
};

export const levelStyle = (level) =>
  LEVELS[String(level ?? '').toLowerCase()] ?? { bg: '#0000ff', color: '#ffffff' };

// 10500 -> "10,500"  (use 'en-IN' if you prefer 1,05,000 style grouping)
export const fmtNum = (n) => Number(n ?? 0).toLocaleString('en-US');

// Black text on light backgrounds (yellow, light green...), white on dark ones
export function textOn(hex, fallbackLight = '#ffffff', fallbackDark = '#000000') {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex ?? '').trim());
  if (!m) return fallbackLight;
  const n = parseInt(m[1], 16);
  const luma = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return luma > 150 ? fallbackDark : fallbackLight;
}

export function formatDateTime(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  let h = date.getHours();
  const min = String(date.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${dd}/${mm}/${yyyy} ${String(h).padStart(2, '0')}:${min} ${ampm}`;
}
