import React, { useEffect, useState } from 'react';
import Stage from './components/Stage';
import FifoTableScreen from './components/FifoTableScreen';
import PalletDetailScreen from './components/PalletDetailScreen';
import DocumentScreen from './components/DocumentScreen';
import { useClock, useDashboard } from './hooks/useDashboard';
// keep your existing CSS import(s) here, e.g. import './styles.css';

// 20/10/2026 12:25 pm
const formatDateTime = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  const h = d.getHours();
  const h12 = h % 12 || 12;
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(h12)}:${p(d.getMinutes())} ${h >= 12 ? 'pm' : 'am'}`;
};

export default function App() {
  const [screenIndex, setScreenIndex] = useState(0);
  const dateTime = useClock(formatDateTime);

  const {
    config,
    rows,
    parts,
    docs,
    current,
    currentDoc,
    docIndex,
    currentSeconds,
    error,
    ready,
  } = useDashboard(screenIndex);

  // CHANGE 1: rotate with a setTimeout; every screen (table, parts and PDF
  // documents) stays for the same "Seconds" from Dashboard Settings.
  useEffect(() => {
    const t = setTimeout(
      () => setScreenIndex((i) => i + 1),
      Math.max(1, currentSeconds) * 1000
    );
    return () => clearTimeout(t);
  }, [screenIndex, currentSeconds]);

  if (!ready) {
    return (
      <Stage>
        <div style={{ color: '#fff', fontSize: 48, padding: 60 }}>Loading...</div>
      </Stage>
    );
  }

  // CHANGE 2: choose the screen
  let screen;
  if (current === 'table') {
    screen = <FifoTableScreen rows={rows} dateTime={dateTime} displayRows={config.rows} />;
  } else if (currentDoc) {
    screen = (
      <DocumentScreen
        doc={currentDoc}
        index={docIndex}
        total={docs.length}
        dateTime={dateTime}
      />
    );
  } else {
    screen = <PalletDetailScreen part={parts[current]} dateTime={dateTime} />;
  }

  return (
    <Stage>
      {screen}
      {error && (
        <div
          style={{
            position: 'absolute',
            right: 24,
            bottom: 8,
            color: '#ffcc00',
            fontSize: 18,
          }}
        >
          Server not reachable - showing last data
        </div>
      )}
    </Stage>
  );
}
