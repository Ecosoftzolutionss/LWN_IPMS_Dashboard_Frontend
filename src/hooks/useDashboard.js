import { useEffect, useMemo, useRef, useState } from 'react';
import { pdfjs } from 'react-pdf';
import {
  getDashboardConfig,
  getDashboardDocuments,
  getDocumentUrl,
  getFifoBoard,
  getPartBoard,
} from '../api';
import { DEFAULT_ROWS, DEFAULT_SECONDS } from '../constants';

// the PDF worker is also set in DocumentScreen; this only guards the order of loading
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

const REFRESH_MS = 30000; // reload settings + grid table + document list every 30 s
const DOC_PREFIX = 'doc:';

// extra second for a document screen: the PDF needs a moment to load, and this
// keeps the last page on screen for its full time
const DOC_EXTRA_SECONDS = 1;

/**
 * Screens rotate as:
 *   'table' -> part 1 -> part 2 -> ... -> doc 1 -> doc 2 -> ... -> 'table' ...
 *
 * - Parts, their order and the seconds come from Dashboard Settings (/dashboard/config).
 * - Documents are the PDF files found in the Input Path (/dashboard/documents).
 *   "Seconds" (DisplaySeconds) is the time of every screen. A document page counts as
 *   one screen, so a PDF with 4 pages stays 4 x Seconds and shows its pages one by one.
 *   New or changed files appear within 30 s.
 * Last good data is kept, so a short network drop never blanks the display.
 */
export function useDashboard(screenIndex) {
  const [config, setConfig] = useState({ rows: DEFAULT_ROWS, seconds: DEFAULT_SECONDS, itemIds: [] });
  const [rows, setRows] = useState([]);
  const [parts, setParts] = useState({});
  const [docs, setDocs] = useState([]);
  const [docPages, setDocPages] = useState({}); // "name|version" -> number of pages
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const alive = useRef(true);
  const pagesRequested = useRef(new Set());

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // settings + grid table + document list
  useEffect(() => {
    const load = async () => {
      try {
        const [c, r] = await Promise.all([getDashboardConfig(), getFifoBoard()]);
        if (!alive.current) return;
        setConfig(c);
        setRows(r);
        setError(null);
        setReady(true);
      } catch (e) {
        if (!alive.current) return;
        setError(e?.response?.data?.message || e.message || 'Cannot reach the server');
        setReady(true);
      }

      // Documents are optional: a failure here must never break the dashboard.
      try {
        const d = await getDashboardDocuments();
        if (!alive.current) return;
        setDocs(Array.isArray(d?.files) ? d.files : []);
      } catch {
        /* keep the last known document list */
      }
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  // count the pages of every document as soon as it is listed, so the time
  // a document stays on screen is known before its screen comes up
  useEffect(() => {
    docs.forEach((d) => {
      const key = `${d.name}|${d.version}`;
      if (pagesRequested.current.has(key)) return;
      pagesRequested.current.add(key);

      const task = pdfjs.getDocument(getDocumentUrl(d.name, d.version));
      task.promise
        .then((pdf) => {
          if (alive.current) {
            setDocPages((prev) => ({ ...prev, [key]: pdf.numPages }));
          }
          return pdf.destroy();
        })
        .catch(() => pagesRequested.current.delete(key)); // try again on the next refresh
    });
  }, [docs]);

  const screens = ['table', ...config.itemIds, ...docs.map((d) => `${DOC_PREFIX}${d.name}`)];
  const idx = screens.length ? screenIndex % screens.length : 0;
  const current = screens[idx];
  const next = screens[(idx + 1) % screens.length];

  const isDoc = typeof current === 'string' && current.startsWith(DOC_PREFIX);
  const docIndex = isDoc ? docs.findIndex((d) => `${DOC_PREFIX}${d.name}` === current) : -1;
  const baseDoc = docIndex >= 0 ? docs[docIndex] : null;

  // "Seconds" from Dashboard Settings = time of one screen / one document page
  const seconds = config.seconds > 0 ? config.seconds : DEFAULT_SECONDS;

  const pages = baseDoc ? docPages[`${baseDoc.name}|${baseDoc.version}`] : undefined;

  // DocumentScreen reads pageSeconds from the doc, so it needs no extra prop
  const currentDoc = useMemo(
    () => (baseDoc ? { ...baseDoc, pageSeconds: seconds } : null),
    [baseDoc, seconds]
  );

  // a document stays for (pages x Seconds); every other screen for Seconds
  const currentSeconds = isDoc && pages ? pages * seconds + DOC_EXTRA_SECONDS : seconds;

  // load the part that is showing now, and pre-load the next one
  useEffect(() => {
    [current, next].forEach((id) => {
      if (typeof id !== 'number') return; // skip 'table' and documents
      getPartBoard(id)
        .then((p) => alive.current && setParts((prev) => ({ ...prev, [id]: p })))
        .catch(() => {});
    });
  }, [current, next, screenIndex]);

  return {
    config,
    rows,
    parts,
    docs,
    screens,
    current,
    currentDoc,
    docIndex,
    currentSeconds,
    error,
    ready,
  };
}

export function useClock(format) {
  const [text, setText] = useState(() => format(new Date()));
  useEffect(() => {
    const t = setInterval(() => setText(format(new Date())), 1000);
    return () => clearInterval(t);
  }, [format]);
  return text;
}
