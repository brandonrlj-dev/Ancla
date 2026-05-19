'use client';

import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';

/* iOS-style calculator — Modo silencioso */
type Op = '+' | '-' | '×' | '÷' | null;

export default function SilenciosoPage() {
  const [display, setDisplay]     = useState('0');
  const [prev, setPrev]           = useState<number | null>(null);
  const [op, setOp]               = useState<Op>(null);
  const [waiting, setWaiting]     = useState(false);
  const [justCalc, setJustCalc]   = useState(false);

  function compute(a: number, b: number, operator: Op): number {
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default:  return b;
    }
  }

  function fmt(n: number): string {
    const s = String(n);
    if (s.length > 10) return parseFloat(n.toPrecision(8)).toString();
    return s;
  }

  const handleNumber = useCallback((d: string) => {
    setJustCalc(false);
    if (waiting || justCalc) {
      setDisplay(d);
      setWaiting(false);
    } else {
      setDisplay((cur) => cur === '0' ? d : cur.length >= 10 ? cur : cur + d);
    }
  }, [waiting, justCalc]);

  const handleDecimal = useCallback(() => {
    setJustCalc(false);
    if (waiting) { setDisplay('0.'); setWaiting(false); return; }
    if (!display.includes('.')) setDisplay((cur) => cur + '.');
  }, [display, waiting]);

  const handleOperator = useCallback((next: Op) => {
    const cur = parseFloat(display);
    if (prev !== null && op && !waiting) {
      const result = compute(prev, cur, op);
      setDisplay(fmt(result));
      setPrev(result);
    } else {
      setPrev(cur);
    }
    setOp(next);
    setWaiting(true);
    setJustCalc(false);
  }, [display, prev, op, waiting]);

  const handleEquals = useCallback(() => {
    if (prev !== null && op) {
      const cur    = parseFloat(display);
      const result = compute(prev, cur, op);
      setDisplay(fmt(result));
      setPrev(null);
      setOp(null);
      setWaiting(false);
      setJustCalc(true);
    }
  }, [display, prev, op]);

  const handleAC = useCallback(() => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setWaiting(false);
    setJustCalc(false);
  }, []);

  const handleToggleSign = useCallback(() => {
    setDisplay((cur) => cur.startsWith('-') ? cur.slice(1) : '-' + cur);
  }, []);

  const handlePercent = useCallback(() => {
    setDisplay((cur) => fmt(parseFloat(cur) / 100));
  }, []);

  /* Button definitions */
  const rows = [
    [
      { label: 'AC',  fn: handleAC,         type: 'fn'  },
      { label: '+/-', fn: handleToggleSign,  type: 'fn'  },
      { label: '%',   fn: handlePercent,     type: 'fn'  },
      { label: '÷',   fn: () => handleOperator('÷'), type: 'op', active: op === '÷' && waiting },
    ],
    [
      { label: '7', fn: () => handleNumber('7'), type: 'num' },
      { label: '8', fn: () => handleNumber('8'), type: 'num' },
      { label: '9', fn: () => handleNumber('9'), type: 'num' },
      { label: '×', fn: () => handleOperator('×'), type: 'op', active: op === '×' && waiting },
    ],
    [
      { label: '4', fn: () => handleNumber('4'), type: 'num' },
      { label: '5', fn: () => handleNumber('5'), type: 'num' },
      { label: '6', fn: () => handleNumber('6'), type: 'num' },
      { label: '-', fn: () => handleOperator('-'), type: 'op', active: op === '-' && waiting },
    ],
    [
      { label: '1', fn: () => handleNumber('1'), type: 'num' },
      { label: '2', fn: () => handleNumber('2'), type: 'num' },
      { label: '3', fn: () => handleNumber('3'), type: 'num' },
      { label: '+', fn: () => handleOperator('+'), type: 'op', active: op === '+' && waiting },
    ],
    [
      { label: '0',  fn: () => handleNumber('0'), type: 'zero' },
      { label: '.',  fn: handleDecimal,           type: 'num'  },
      { label: '=',  fn: handleEquals,            type: 'op'   },
    ],
  ] as { label: string; fn: () => void; type: string; active?: boolean }[][];

  function btnStyle(type: string, active = false) {
    const base: React.CSSProperties = {
      border: 'none',
      borderRadius: '50%',
      fontSize: '1.5rem',
      fontFamily: 'var(--font-body)',
      fontWeight: 400,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'filter 100ms',
      aspectRatio: '1',
    };
    if (type === 'op')  return { ...base, background: active ? '#ffffff' : '#FF9F0A', color: active ? '#FF9F0A' : '#000' };
    if (type === 'fn')  return { ...base, background: '#A5A5A5', color: '#000' };
    if (type === 'zero') return { ...base, borderRadius: 999, aspectRatio: 'unset', padding: '0 28px', justifyContent: 'flex-start' };
    return { ...base, background: '#333333', color: '#fff' };
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 16px 32px',
        position: 'relative',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: '0 8px 16px',
            textAlign: 'right',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: display.length > 8 ? '2.8rem' : display.length > 6 ? '3.5rem' : '4.5rem',
              fontWeight: 300,
              color: '#fff',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              transition: 'font-size 100ms',
            }}
          >
            {display}
          </div>
          {op && (
            <div style={{ fontSize: '0.8rem', color: '#666', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {prev} {op}
            </div>
          )}
        </motion.div>

        {/* Buttons grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: ri === 4 ? '2fr 1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
              {row.map((btn) => (
                <motion.button
                  key={btn.label}
                  onClick={btn.fn}
                  whileTap={{ scale: 0.88, filter: 'brightness(0.8)' }}
                  style={{
                    ...btnStyle(btn.type, btn.active),
                    height: 72,
                  }}
                >
                  {btn.label}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Blue dot — único rastro de ANCLA */}
      <div
        title="ANCLA"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#5b81a8',
          boxShadow: '0 0 6px #5b81a880',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      />
    </div>
  );
}
