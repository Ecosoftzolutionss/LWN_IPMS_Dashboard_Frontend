import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Header from './Header';
import { getDocumentUrl } from '../api';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * How a PDF page is fitted on the screen:
 *  'width' - the page fills the full width, so the words are BIG and clear.
 *            A tall page scrolls slowly from top to bottom by itself while
 *            it is on screen.
 *  'page'  - the whole page is shown at once. A portrait page on a landscape
 *            screen is small, so the words become small.
 *  'auto'  - landscape pages (PowerPoint slides) are shown whole, portrait
 *            pages (Word / A4 PDF) fill the width and scroll.
 */
const FIT_MODE = 'auto';

// Seconds each PDF page stays on screen when `screenSeconds` is NOT given
const PAGE_SECONDS = 10;

// With `screenSeconds`, a page is never shown for less than this
const MIN_PAGE_SECONDS = 2;

// Page height / width used until the real page size is known (A4 portrait)
const DEFAULT_RATIO = 1.414;

/**
 * PDF screen - shows ONE page at a time.
 * Page 1 -> page 2 -> page 3 -> page 4 ... every `pageSeconds` seconds.
 *
 * After the last page:
 *  - if the parent passes `onComplete`, it is called (so the parent can move
 *    to the next screen),
 *  - otherwise the document starts again from page 1.
 */
export default function DocumentScreen({
  doc,
  index = 0,
  total = 1,
  dateTime,
  pageSeconds = PAGE_SECONDS,
  screenSeconds,
  onComplete,
}) {
  const viewerRef = useRef(null);

  // keep the latest callback without restarting the page timer when the
  // parent re-renders (the clock re-renders the parent every second)
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [box, setBox] = useState({ w: 800, h: 600 });
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const [error, setError] = useState(false);

  const hasDoc = Boolean(doc);
  const fitWidth = FIT_MODE === 'width' || (FIT_MODE === 'auto' && ratio > 1);

  // How long one page stays on screen.
  // doc.pageSeconds (set by useDashboard) = Seconds from Dashboard Settings.
  // With screenSeconds (and no doc.pageSeconds) every page shares the time the
  // screen is on display (1.5 s is kept back for loading and the screen change).
  const perPage = doc?.pageSeconds ?? pageSeconds;
  const pageMs =
    Math.max(
      1,
      screenSeconds && doc?.pageSeconds == null
        ? Math.max(MIN_PAGE_SECONDS, (screenSeconds - 1.5) / Math.max(1, numPages))
        : perPage
    ) * 1000;

  // page size inside the viewer
  const renderWidth = Math.max(
    100,
    Math.floor(
      fitWidth
        ? box.w - 2 // full width: big, clear words
        : Math.min(box.w - 2, (box.h - 2) / ratio) // whole page visible
    )
  );

  // measure the viewer
  useEffect(() => {
    const element = viewerRef.current;
    if (!element) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      setBox({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasDoc]);

  // new document (or new version) -> start again from page 1
  useEffect(() => {
    setNumPages(0);
    setPageNumber(1);
    setRatio(DEFAULT_RATIO);
    setError(false);
  }, [doc?.name, doc?.version]);

  // automatic page change
  useEffect(() => {
    if (!numPages || error) return undefined;

    const timer = setTimeout(() => {
      if (pageNumber < numPages) {
        setPageNumber(pageNumber + 1);
      } else if (onCompleteRef.current) {
        onCompleteRef.current();
      } else if (!screenSeconds && doc?.pageSeconds == null) {
        setPageNumber(1); // stand-alone use: start again from page 1
      }
      // otherwise the parent changes screen, so stay on the last page
    }, pageMs);

    return () => clearTimeout(timer);
  }, [numPages, pageNumber, pageMs, screenSeconds, doc?.pageSeconds, error]);

  // fit-width mode: scroll the page smoothly from top to bottom while it is on
  // screen (short pause at the top and at the bottom so the words can be read)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!fitWidth || !viewer || !numPages || error) return undefined;

    viewer.scrollTop = 0;

    const hold = Math.min(1500, pageMs * 0.15);
    let frame = 0;
    let start = null;

    const step = (now) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const distance = Math.max(0, viewer.scrollHeight - viewer.clientHeight);
      const span = Math.max(1, pageMs - 2 * hold);
      const progress = Math.min(1, Math.max(0, (elapsed - hold) / span));
      viewer.scrollTop = distance * progress;
      if (elapsed < pageMs) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [fitWidth, numPages, pageNumber, pageMs, error]);

  if (!doc) return null;

  const title = doc.name.replace(/\.(pdf|pptx?|docx?)$/i, '');
  const src = getDocumentUrl(doc.name, doc.version);

  const handlePageLoad = (page) => {
    const w = page.originalWidth || page.width;
    const h = page.originalHeight || page.height;
    if (w && h) setRatio(h / w);
  };

  return (
    <div className="screen-wrapper">
      <div className="screen-frame doc-screen-frame">
        <Header dateTime={dateTime} boxed />

        <div className="doc-caption">
          <span className="doc-caption-name" title={title}>
            {title}
          </span>

          <span className="doc-caption-count">
            {index + 1} / {total}
          </span>
        </div>

        <div className="pdf-toolbar">
          <span className="pdf-page-info">
            {numPages ? `Page ${pageNumber} / ${numPages}` : 'Loading PDF...'}
          </span>
        </div>

        <div
          className={`doc-viewer${fitWidth ? ' doc-viewer-scroll' : ''}`}
          ref={viewerRef}
        >
          {error ? (
            <div className="pdf-status">
              Unable to load this PDF. Please check the document API.
            </div>
          ) : (
            <Document
              key={`${doc.name}-${doc.version}`}
              file={src}
              onLoadSuccess={({ numPages: count }) => {
                setNumPages(count);
                setError(false);
              }}
              onLoadError={() => setError(true)}
              loading={<div className="pdf-status">Loading document...</div>}
              error={<div className="pdf-status">Unable to load PDF.</div>}
            >
              <div className="pdf-page">
                <Page
                  pageNumber={pageNumber}
                  width={renderWidth}
                  renderTextLayer
                  renderAnnotationLayer
                  onLoadSuccess={handlePageLoad}
                  devicePixelRatio={
                    fitWidth
                      ? 2 // sharp, without using too much memory on a big page
                      : Math.max(2, Math.min(window.devicePixelRatio || 1, 3))
                  }
                />
              </div>
            </Document>
          )}
        </div>
      </div>
    </div>
  );
}
