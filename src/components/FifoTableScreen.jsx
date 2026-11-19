import React, { useRef } from 'react';
import Header from './Header';
import { useFitGroups } from '../hooks/useFitGroups';
import { fmtNum, levelStyle, textOn } from '../constants';

// Sl.No | Part No | Part Name | FIFO Code | GIRN | Pallet No | QTY | Sequence | Stock | Level
const COLUMNS = ['6%', '13%', '19%', '8%', '10%', '6%', '7%', '16%', '7%', '8%'];

// Customer request: exactly 15 items on one sheet
const ROWS_PER_SHEET = 15;

// Space the body rows have inside the 1920x1080 stage (px)
const BODY_AREA = 826;

/** Text that is shrunk by useFitGroups so it never gets cut off */
function Fit({ group, max, min = 14, children }) {
  return (
    <span className="fit-cell" data-fit={group} data-max={max} data-min={min}>
      {children}
    </span>
  );
}

/** Header cell text (defined outside the screen so it is not rebuilt every second) */
function H({ id, children, max = 24 }) {
  return (
    <Fit group={`h-${id}`} max={max} min={13}>
      {children}
    </Fit>
  );
}

/** Screen 1 - grid table of every configured part (15 rows per sheet) */
export default function FifoTableScreen({ rows = [], dateTime }) {
  const tableRef = useRef(null);

  const total = ROWS_PER_SHEET;
  const shown = rows.slice(0, total);
  const emptyCount = total - shown.length;

  // body font follows the row height
  const rowH = BODY_AREA / total;
  const bodyFont = Math.max(16, Math.min(28, Math.round(rowH * 0.4)));

  useFitGroups(tableRef, [rows, total, bodyFont]);

  return (
    <div className="screen-wrapper">
      <div className="screen-frame">
        <Header dateTime={dateTime} boxed={false} />

        <div className="table-container">
          <table
            ref={tableRef}
            className="fifo-table"
            style={{ '--rows': total, '--body-font': `${bodyFont}px` }}
          >
            <colgroup>
              {COLUMNS.map((w, i) => (
                <col key={i} style={{ width: w }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th rowSpan="2"><H id="sl">Sl.No.</H></th>
                <th rowSpan="2"><H id="partno">Part No.</H></th>
                <th rowSpan="2"><H id="partname">Part Name</H></th>
                <th rowSpan="2">
                  <H id="code">
                    FIFO
                    <br />
                    Code
                  </H>
                </th>
                <th colSpan="3"><H id="prev">Previous Issued Details</H></th>
                <th rowSpan="2">
                  <H id="seq">
                    Pallets in FIFO
                    <br />
                    Sequence
                  </H>
                </th>
                <th rowSpan="2"><H id="stock">Stock</H></th>
                <th rowSpan="2"><H id="level">Level</H></th>
              </tr>
              <tr className="sub-head">
                <th><H id="girn" max={22}>GIRN</H></th>
                <th>
                  <H id="pno" max={22}>
                    Pallet
                    <br />
                    No.
                  </H>
                </th>
                <th><H id="qty" max={22}>QTY</H></th>
              </tr>
            </thead>

            <tbody>
              {shown.map((row) => {
                const lvl = levelStyle(row.level);
                const codeBg = row.fifoColour || '#00ff00';
                return (
                  <tr key={row.itemId}>
                    <td className="c"><Fit group="b0" max={bodyFont}>{row.slNo}</Fit></td>
                    <td className="l"><Fit group="b1" max={bodyFont}>{row.partNo}</Fit></td>
                    {/* Part Name always in capital letters */}
                    <td className="l">
                      <Fit group="b2" max={bodyFont}>{(row.partName ?? '').toUpperCase()}</Fit>
                    </td>

                    {/* FIFO Code - colour box filling the cell */}
                    <td className="box-cell">
                      {row.fifoCode && (
                        <div
                          className="cell-box"
                          style={{ backgroundColor: codeBg, color: textOn(codeBg, '#fff', '#000') }}
                        >
                          <Fit group="b3" max={bodyFont}>{row.fifoCode}</Fit>
                        </div>
                      )}
                    </td>

                    <td className="c"><Fit group="b4" max={bodyFont}>{row.lastGirn ?? ''}</Fit></td>
                    <td className="c"><Fit group="b5" max={bodyFont}>{row.lastPalletRange ?? ''}</Fit></td>
                    <td className="c">
                      <Fit group="b6" max={bodyFont}>{row.lastGirn ? fmtNum(row.lastQty) : ''}</Fit>
                    </td>
                    <td className="l"><Fit group="b7" max={bodyFont}>{row.fifoSequence}</Fit></td>
                    <td className="c"><Fit group="b8" max={bodyFont}>{fmtNum(row.stock)}</Fit></td>

                    {/* Level - colour box filling the cell */}
                    <td className="box-cell">
                      <div
                        className="cell-box"
                        style={{ backgroundColor: lvl.bg, color: lvl.color }}
                      >
                        <Fit group="b9" max={bodyFont}>{row.level}</Fit>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {Array.from({ length: Math.max(0, emptyCount) }, (_, i) => (
                <tr key={`empty-${i}`}>
                  {COLUMNS.map((_, c) => (
                    <td key={c}>&nbsp;</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}