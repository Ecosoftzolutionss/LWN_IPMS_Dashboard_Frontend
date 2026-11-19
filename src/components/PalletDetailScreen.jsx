import React, { useMemo } from 'react';
import { CCard, CCardBody } from '@coreui/react';
import Header from './Header';
import FitText from './FitText';
import {
  FOOTER_MESSAGE,
  PALLET_COLUMNS,
  DEFAULT_PALLET_COLOUR,
  fmtNum,
  levelStyle,
  textOn,
} from '../constants';

// "KAP-12" -> 12  (trailing number of the pallet no.)
const palletNumber = (value) => {
  const match = String(value ?? '').match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
};

/** White rounded card: label, divider line, value box */
function InfoCard({ label, children }) {
  return (
    <CCard className="white-card">
      <CCardBody className="white-card-body">
        <div className="card-label">{label}</div>
        <div className="card-divider" />
        {children}
      </CCardBody>
    </CCard>
  );
}

/** Screen 2 - one part: details + every available pallet in its pallet colour */
export default function PalletDetailScreen({ part, dateTime }) {
  // Available pallets (remaining qty) in FIFO order = lowest pallet number first.
  // Same order the API uses, so the first tile is always the "Next FIFO Pallet".
  const pallets = useMemo(
    () =>
      [...(part?.pallets ?? [])].sort(
        (a, b) => palletNumber(a.palletNo) - palletNumber(b.palletNo)
      ),
    [part]
  );

  const gridRows = Math.max(2, Math.ceil(pallets.length / PALLET_COLUMNS));
  // smaller tile text when there are more than 2 rows of pallets
  const tileFont = gridRows <= 2 ? 21 : gridRows === 3 ? 14 : 10;

  // "KAPPA PE 1.0L" -> ["KAPPA PE", "1.0L"]  (two lines like the reference)
  const modelText = (part?.modelName ?? '').trim();
  const words = modelText.split(/\s+/).filter(Boolean);
  const modelLines =
    words.length > 2 ? [words.slice(0, -1).join(' '), words[words.length - 1]] : words;

  const lvl = levelStyle(part?.level);

  // Model / Part Number / Part Name / Storage Area / Next FIFO Pallet boxes take the
  // pallet colour of this part (colour of the next FIFO pallet).
  const themeBg = pallets[0]?.colour || DEFAULT_PALLET_COLOUR;
  const themeStyle = { backgroundColor: themeBg, color: textOn(themeBg, '#ffffff', '#000000') };

  return (
    <div className="screen-wrapper">
      <div className="screen-frame detail-frame">
        <Header dateTime={dateTime} boxed />

        {/* top: model / part number / part name */}
        <div className="cards-row cards-top">
          <InfoCard label="Model Name">
            <div className="value-box model-box" style={themeStyle}>
              {modelLines.length ? (
                <FitText max={74} min={26} className="value-text">
                  {modelLines.map((l, i) => (
                    <span key={i} className="line">
                      {l}
                    </span>
                  ))}
                </FitText>
              ) : (
                <FitText max={74} className="value-text">-</FitText>
              )}
            </div>
          </InfoCard>

          <InfoCard label="Part Number">
            <div className="value-box" style={themeStyle}>
              {/* Impact font (customer request) */}
              <FitText max={104} min={28} className="value-text part-number-text">
                {part?.partNumber ?? '-'}
              </FitText>
            </div>
          </InfoCard>

          <InfoCard label="Part Name">
            <div className="value-box" style={themeStyle}>
              {/* Part Name: always capitals, Impact font (customer request) */}
              <FitText max={104} min={28} className="value-text part-name-text">
                {(part?.partName ?? '-').toUpperCase()}
              </FitText>
            </div>
          </InfoCard>
        </div>

        {/* middle: all available pallets in FIFO order, coloured by pallet type */}
        <div className="pallet-order-box">
          <div className="pallet-box-legend">Available Pallets in FIFO Order</div>
          <div
            className="pallet-grid"
            style={{
              gridTemplateColumns: `repeat(${PALLET_COLUMNS}, 1fr)`,
              gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
              '--tile-font': `${tileFont}px`,
            }}
          >
            {pallets.map((p, i) => {
              const bg = p.colour || DEFAULT_PALLET_COLOUR;
              return (
                <div
                  key={`${p.palletNo}-${i}`}
                  className="pallet-cell"
                  title={`${p.palletNo} - ${p.qty}`}
                >
                  <div
                    className="pallet-tile"
                    style={{ backgroundColor: bg, color: textOn(bg, '#ffffff', '#000000') }}
                  >
                    <span>{p.palletNo}</span>
                    {/* remaining quantity of the pallet */}
                    <span>{fmtNum(p.qty)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* bottom: storage / next pallet / stock / level */}
        <div className="cards-row cards-bottom">
          <InfoCard label="Pallet Storage Area">
            <div className="value-box" style={themeStyle}>
              <FitText max={70} min={26} className="value-text">
                {part?.storageArea ?? '-'}
              </FitText>
            </div>
          </InfoCard>

          <InfoCard label="Next FIFO Pallet No.">
            <div className="value-box" style={themeStyle}>
              <FitText max={70} min={26} className="value-text">
                {part?.nextFifoPallet ?? '-'}
              </FitText>
            </div>
          </InfoCard>

          <InfoCard label="Stock in Hand">
            <div className="value-box" style={{ backgroundColor: lvl.bg, color: lvl.color }}>
              <FitText max={70} min={26} className="value-text">
                {part ? `${fmtNum(part.stockInHand)} Nos` : '-'}
              </FitText>
            </div>
          </InfoCard>

          <InfoCard label="Stock Level">
            <div className="value-box" style={{ backgroundColor: lvl.bg, color: lvl.color }}>
              <FitText max={70} min={26} className="value-text">
                {(part?.level ?? '-').toUpperCase()}
              </FitText>
            </div>
          </InfoCard>
        </div>

        <footer className="forklift-footer">{FOOTER_MESSAGE}</footer>
      </div>
    </div>
  );
}