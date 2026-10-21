import React from 'react';

export default function Header({ dateTime, boxed = false }) {
  return (
    <header className={`screen-header ${boxed ? 'screen-header-boxed' : ''}`}>
      <div className="header-left">
        <img
          src="/logo.png"
          alt="LEEWON Logo"
          className="leewon-logo"
          style={{
            height: boxed ? 66 : 76,
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />

        <span className="brand-text">LEEWON</span>
      </div>

      <h1 className="header-title">
        RAW MATERIAL FIFO MANAGEMENT SYSTEM
      </h1>

      <div className="header-right">
        <span className="live-clock">{dateTime}</span>
      </div>
    </header>
  );
}
