import axios from 'axios';
import { mockBoard, mockConfig, mockParts } from './mock';

const cfg = window.APP_CONFIG || {};
const USE_MOCK = cfg.USE_MOCK === true || import.meta.env.VITE_USE_MOCK === 'true';

const http = axios.create({
  baseURL: window.APP_CONFIG?.API_BASE_URL || '',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const delay = (v) => new Promise((r) => setTimeout(() => r(v), 150));

// GET /api/dashboard/config -> { rows, seconds, itemIds: [...] } (already in display order)
export const getDashboardConfig = async () =>
  USE_MOCK ? delay(mockConfig) : (await http.get('/dashboard/config')).data;

// GET /api/dashboard/fifo-board -> rows for the grid table (configured parts only)
export const getFifoBoard = async () =>
  USE_MOCK ? delay(mockBoard) : (await http.get('/dashboard/fifo-board')).data;

// GET /api/dashboard/part/{itemId} -> one part with all its pallets + colours
export const getPartBoard = async (itemId) =>
  USE_MOCK ? delay(mockParts[itemId]) : (await http.get(`/dashboard/part/${itemId}`)).data;

// GET /api/dashboard/documents -> { files: [{ name, version }] }
// PDF files found in the Input Path configured in Dashboard Settings.
export const getDashboardDocuments = async () =>
  USE_MOCK
    ? delay({ files: [] })
    : (await http.get('/dashboard/documents')).data;

// URL of one PDF (used as the iframe src). `version` changes when the file changes,
// so a replaced PDF is reloaded instead of served from the browser cache.
export const getDocumentUrl = (name, version) => {
  const base = (http.defaults.baseURL || '').replace(/\/$/, '');
  return `${base}/dashboard/document/${encodeURIComponent(name)}?v=${version ?? ''}`;
};
