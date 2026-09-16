import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Boxes, TrendingUp, Package, Video,
  Lock, Sparkles, ChevronDown, ChevronUp, ChevronRight,
  Search, Filter, AlertTriangle, AlertCircle, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Clock, DollarSign, X,
  Bell, RefreshCw, Calendar, Wallet, ArrowRight, Zap,
  Activity, Eye, Play, Wand2, BellRing, ArrowDown,
  Ship, Plane, Anchor,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts';

// ============================================================
// COLOR SYSTEM — mirrors Pulse landing page
// ============================================================
const C = {
  bg: '#FAFAFA',
  bgAlt: '#F4F4F5',
  surface: '#FFFFFF',
  surfaceHi: '#FAFAFA',
  ink: '#0A0A0B',
  ink2: '#27272A',
  ink3: '#52525B',
  muted: '#71717A',
  faint: '#A1A1AA',
  border: '#E4E4E7',
  borderHi: '#D4D4D8',

  primary: '#059669',
  primaryHi: '#10B981',
  primaryLt: '#ECFDF5',
  primaryBd: '#A7F3D0',

  amber: '#D97706',
  amberLt: '#FFFBEB',
  amberBd: '#FDE68A',

  red: '#DC2626',
  redLt: '#FEF2F2',
  redBd: '#FECACA',

  blue: '#2563EB',
  blueLt: '#EFF6FF',
};

const fontDisplay = "'Instrument Serif', 'Source Serif Pro', Georgia, serif";
const fontUI = "'Inter', system-ui, sans-serif";
const fontMono = "'JetBrains Mono', 'SF Mono', Consolas, monospace";

// ============================================================
// MOCK DATA
// ============================================================
const FX = {
  today: 2585,
  d30: 2500,
  d365: 2286,
  yoyDepreciation: 13.1,
  d30Change: 3.4,
};

const SKUS = [
  {
    id: 'PRODUCT_01', name: 'PRODUCT_01',
    stock: 47, velocity7: 18, velocity30: 16.2,
    hppCNY: 12.5, hppIDR: 32312, // at today's FX
    sellPriceIDR: 149000, leadTimeDays: 21,
    status: 'restock_now', daysLeft: 2.6,
    lastMovement: '2 jam lalu', source: 'Marketplace',
    grossMargin: 78.3, netMarginToday: 31.2, netMargin30d: 35.7, netMargin365d: 44.1,
    monthlyRevenue: 100000000,
    trending: false,
  },
  {
    id: 'PRODUCT_02', name: 'PRODUCT_02',
    stock: 184, velocity7: 9.8, velocity30: 11.4,
    hppCNY: 18.0, hppIDR: 46530,
    sellPriceIDR: 229000, leadTimeDays: 28,
    status: 'healthy', daysLeft: 18.8,
    lastMovement: '47 menit lalu', source: 'Marketplace',
    grossMargin: 79.7, netMarginToday: 38.4, netMargin30d: 41.8, netMargin365d: 49.2,
    monthlyRevenue: 100000000,
    trending: false,
  },
  {
    id: 'PRODUCT_03', name: 'PRODUCT_03',
    stock: 28, velocity7: 12.4, velocity30: 8.7,
    hppCNY: 6.8, hppIDR: 17578,
    sellPriceIDR: 89000, leadTimeDays: 18,
    status: 'restock_soon', daysLeft: 2.3,
    lastMovement: '15 menit lalu', source: 'Marketplace',
    grossMargin: 80.2, netMarginToday: 42.1, netMargin30d: 44.6, netMargin365d: 51.3,
    monthlyRevenue: 100000000,
    trending: false,
  },
  {
    id: 'PRODUCT_04', name: 'PRODUCT_04',
    stock: 312, velocity7: 4.2, velocity30: 5.8,
    hppCNY: 14.0, hppIDR: 36190,
    sellPriceIDR: 169000, leadTimeDays: 21,
    status: 'slow_mover', daysLeft: 53.8,
    lastMovement: '6 jam lalu', source: 'Marketplace',
    grossMargin: 78.6, netMarginToday: 32.8, netMargin30d: 36.4, netMargin365d: 43.9,
    monthlyRevenue: 100000000,
    trending: false,
  },
  {
    id: 'PRODUCT_05', name: 'PRODUCT_05',
    stock: 89, velocity7: 7.1, velocity30: 6.4,
    hppCNY: 9.2, hppIDR: 23782,
    sellPriceIDR: 119000, leadTimeDays: 18,
    status: 'push_marketing', daysLeft: 13.9,
    lastMovement: '1 jam lalu', source: 'Marketplace',
    grossMargin: 80.0, netMarginToday: 39.8, netMargin30d: 42.3, netMargin365d: 50.1,
    monthlyRevenue: 100000000,
    trending: false,
  },
];

// Daily GMV for last 30 days (in juta IDR), ending ~1.1 miliar/month
const DAILY_GMV = (() => {
  const arr = [];
  const base = 36;
  for (let i = 29; i >= 0; i--) {
    const noise = Math.sin(i * 0.7) * 6 + Math.cos(i * 1.3) * 4;
    const trend = (29 - i) * 0.25;
    arr.push({
      day: `D-${i}`,
      date: i === 0 ? 'Hari ini' : `${i}h lalu`,
      gmv: Math.max(18, Math.round((base + noise + trend) * 10) / 10),
    });
  }
  return arr;
})();

// 7-day per SKU velocity (units sold per day)
const velocitySeries = (sku) => {
  const arr = [];
  const base = sku.velocity7;
  for (let i = 29; i >= 0; i--) {
    const noise = Math.sin(i * 0.5 + sku.id.length) * (base * 0.35);
    const v = Math.max(0, Math.round((base + noise) * 10) / 10);
    arr.push({ day: i, label: `D-${i}`, units: v });
  }
  return arr;
};

const FX_HISTORY = [
  { day: 'D-365', rate: 2286 },
  { day: 'D-300', rate: 2340 },
  { day: 'D-240', rate: 2395 },
  { day: 'D-180', rate: 2440 },
  { day: 'D-120', rate: 2470 },
  { day: 'D-90', rate: 2490 },
  { day: 'D-60', rate: 2510 },
  { day: 'D-30', rate: 2500 },
  { day: 'D-14', rate: 2540 },
  { day: 'D-7', rate: 2560 },
  { day: 'Hari ini', rate: 2585 },
];

const TRENDING_KEYWORDS = [
  { keyword: 'anxiety bracelet aesthetic', growth: 287, volume: '12.4K', matched: 'PRODUCT_01' },
  { keyword: 'crystal pendant healing', growth: 164, volume: '8.9K', matched: 'PRODUCT_03' },
  { keyword: 'mental health jewelry gift', growth: 142, volume: '15.2K', matched: null },
  { keyword: 'worry stone ring', growth: 118, volume: '6.1K', matched: null },
  { keyword: 'mindfulness necklace minimalist', growth: 94, volume: '9.7K', matched: 'PRODUCT_02' },
  { keyword: 'self care bracelet bundle', growth: 76, volume: '5.4K', matched: null },
  { keyword: 'chakra bracelet 7 stones', growth: 64, volume: '11.3K', matched: null },
];

const STOCK_MOVEMENTS = [
  { sku: 'PRODUCT_03', type: 'out', qty: 3, time: '15 menit lalu', source: 'Order #TS-882104' },
  { sku: 'PRODUCT_02', type: 'out', qty: 1, time: '47 menit lalu', source: 'Order #TS-882087' },
  { sku: 'PRODUCT_05', type: 'out', qty: 2, time: '1 jam lalu', source: 'Order #TS-882061' },
  { sku: 'PRODUCT_01', type: 'out', qty: 5, time: '2 jam lalu', source: 'Order #TS-881998' },
  { sku: 'PRODUCT_01', type: 'in', qty: 60, time: '6 jam lalu', source: 'PO-0042 (SUPPLIER_A)' },
  { sku: 'PRODUCT_03', type: 'out', qty: 2, time: '8 jam lalu', source: 'Order #TS-881874' },
  { sku: 'PRODUCT_04', type: 'out', qty: 1, time: '11 jam lalu', source: 'Order #TS-881802' },
];

// ============================================================
// HELPERS
// ============================================================
const formatIDR = (n) => {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)} M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)} rb`;
  return `Rp ${n}`;
};

const formatIDRFull = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS_META = {
  restock_now: { label: 'Restock Sekarang', color: C.red, bg: C.redLt, border: C.redBd, icon: AlertTriangle },
  restock_soon: { label: 'Restock Segera', color: C.amber, bg: C.amberLt, border: C.amberBd, icon: AlertCircle },
  push_marketing: { label: 'Push Marketing', color: C.blue, bg: C.blueLt, border: '#BFDBFE', icon: Zap },
  healthy: { label: 'Sehat', color: C.primary, bg: C.primaryLt, border: C.primaryBd, icon: CheckCircle2 },
  slow_mover: { label: 'Slow Mover', color: C.muted, bg: C.bgAlt, border: C.border, icon: Clock },
};

// ============================================================
// SHARED PRIMITIVES
// ============================================================
const StatusPill = ({ status, size = 'md' }) => {
  const m = STATUS_META[status];
  const Icon = m.icon;
  const fs = size === 'sm' ? 10.5 : 11.5;
  const pad = size === 'sm' ? '3px 8px' : '4px 10px';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: pad, borderRadius: 999,
      background: m.bg, color: m.color,
      border: `1px solid ${m.border}`,
      fontFamily: fontUI, fontSize: fs, fontWeight: 600,
      letterSpacing: '-0.005em', whiteSpace: 'nowrap',
    }}>
      <Icon size={size === 'sm' ? 10 : 11} strokeWidth={2.5} />
      {m.label}
    </span>
  );
};

const Card = ({ children, style, hover = false, ...rest }) => (
  <div
    {...rest}
    style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      transition: hover ? 'all 0.18s ease' : 'none',
      ...style,
    }}
    onMouseEnter={hover ? (e) => {
      e.currentTarget.style.borderColor = C.borderHi;
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(10, 10, 11, 0.04)';
    } : undefined}
    onMouseLeave={hover ? (e) => {
      e.currentTarget.style.borderColor = C.border;
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    } : undefined}
  >
    {children}
  </div>
);

const SectionLabel = ({ children, accent }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
  }}>
    <div style={{
      width: 4, height: 14, borderRadius: 2,
      background: accent || C.primary,
    }} />
    <span style={{
      fontFamily: fontUI, fontSize: 10.5, fontWeight: 600,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: C.muted,
    }}>
      {children}
    </span>
  </div>
);

// ============================================================
// LOGO
// ============================================================
const PulseLogo = ({ size = 22, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color || C.primary} strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="12" r="4" fill={color || C.primary} />
    <circle cx="12" cy="12" r="4" fill={color || C.primary} opacity="0.4">
      <animate attributeName="r" values="4;10;4" dur="2.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

// ============================================================
// TOP BAR
// ============================================================
const TopBar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'shipping', label: 'Shipping', icon: Ship },
    { id: 'ai_video', label: 'AI Video', icon: Video, locked: true },
  ];

  return (
    <div style={{
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Top row: logo + brand + actions */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <PulseLogo size={22} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{
              fontFamily: fontUI, fontSize: 15, fontWeight: 600,
              color: C.ink, letterSpacing: '-0.01em',
            }}>Pulse</span>
            <span style={{
              fontFamily: fontUI, fontSize: 9, color: C.muted,
              letterSpacing: '0.18em', marginTop: 2, fontWeight: 500,
            }}>BY AVANTIS</span>
          </div>
          <div style={{
            width: 1, height: 22, background: C.border, margin: '0 6px',
          }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 11px', borderRadius: 7,
            background: C.bgAlt, border: `1px solid ${C.border}`,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: C.primary,
              boxShadow: `0 0 0 3px ${C.primary}22`,
            }} />
            <span style={{
              fontFamily: fontUI, fontSize: 12, fontWeight: 500, color: C.ink2,
            }}>Desty API</span>
            <span style={{
              fontFamily: fontUI, fontSize: 10.5, color: C.muted,
            }}>• Marketplace Channel ID</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 7,
            background: C.surface, border: `1px solid ${C.border}`,
            fontFamily: fontUI, fontSize: 12, fontWeight: 500, color: C.ink2,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.bgAlt; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.surface; }}
          >
            <RefreshCw size={12} /> Sync sekarang
          </button>
          <button style={{
            position: 'relative', padding: 8, borderRadius: 7,
            background: C.surface, border: `1px solid ${C.border}`,
            cursor: 'pointer',
          }}>
            <Bell size={14} color={C.ink2} />
            <span style={{
              position: 'absolute', top: 5, right: 5,
              width: 7, height: 7, borderRadius: '50%', background: C.red,
              border: `1.5px solid ${C.surface}`,
            }} />
          </button>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryHi})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.surface, fontFamily: fontUI, fontSize: 12, fontWeight: 600,
          }}>R</div>
        </div>
      </div>

      {/* Tab row */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 28px',
        gap: 4,
      }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '14px 14px', background: 'transparent',
                border: 'none', borderBottom: `2px solid ${active ? C.ink : 'transparent'}`,
                fontFamily: fontUI, fontSize: 13.5, fontWeight: active ? 600 : 500,
                color: active ? C.ink : (t.locked ? C.faint : C.muted),
                cursor: 'pointer', transition: 'all 0.15s',
                marginBottom: -1,
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.color = C.ink2;
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.color = t.locked ? C.faint : C.muted;
              }}
            >
              <Icon size={14} strokeWidth={active ? 2.4 : 2} />
              {t.label}
              {t.locked && <Lock size={11} strokeWidth={2.5} style={{ marginLeft: 2 }} />}
              {t.id === 'ai_video' && (
                <span style={{
                  marginLeft: 4,
                  padding: '2px 6px', borderRadius: 4,
                  background: `linear-gradient(135deg, ${C.amber}15, ${C.primary}15)`,
                  border: `1px solid ${C.amberBd}`,
                  fontFamily: fontUI, fontSize: 9, fontWeight: 600,
                  color: C.amber, letterSpacing: '0.06em',
                }}>SOON</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// OVERVIEW — KPI STRIP
// ============================================================
const KPICard = ({ label, value, sub, delta, accent, icon: Icon, subLabel }) => (
  <Card style={{ padding: 20 }} hover>
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: 14,
    }}>
      <span style={{
        fontFamily: fontUI, fontSize: 11.5, fontWeight: 500,
        color: C.muted, letterSpacing: '-0.005em',
      }}>{label}</span>
      <div style={{
        width: 28, height: 28, borderRadius: 7,
        background: `${accent}12`, color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} strokeWidth={2.2} />
      </div>
    </div>
    <div style={{
      fontFamily: fontDisplay, fontSize: 32,
      color: C.ink, lineHeight: 1, letterSpacing: '-0.02em',
      marginBottom: 6,
    }}>{value}</div>
    {sub && (
      <div style={{
        fontFamily: fontUI, fontSize: 11.5, color: C.muted, marginBottom: 8,
      }}>{sub}</div>
    )}
    {delta && (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 6,
        background: delta.color === 'blue' ? C.blueLt : (delta.positive === false || delta.color === 'red') ? C.redLt : C.primaryLt,
        color: delta.color === 'blue' ? C.blue : (delta.positive === false || delta.color === 'red') ? C.red : C.primary,
        fontFamily: fontUI, fontSize: 11, fontWeight: 600,
      }}>
        {(delta.positive === false || delta.color === 'red') ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />}
        {delta.value}
        {subLabel && <span style={{ color: C.muted, fontWeight: 500, marginLeft: 4 }}>{subLabel}</span>}
      </div>
    )}
  </Card>
);

// ============================================================
// FX IMPACT PANEL
// ============================================================
const FXImpactPanel = () => {
  const [open, setOpen] = useState(false);

  const fxRows = SKUS.map(s => {
    const marginErosionVsD30 = s.netMargin30d - s.netMarginToday;
    const marginErosionVsYear = s.netMargin365d - s.netMarginToday;
    return { ...s, marginErosionVsD30, marginErosionVsYear };
  });

  return (
    <Card>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 22px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 9,
            background: `linear-gradient(135deg, ${C.amber}18, ${C.red}10)`,
            border: `1px solid ${C.amberBd}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DollarSign size={17} color={C.amber} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{
              fontFamily: fontUI, fontSize: 14.5, fontWeight: 600, color: C.ink,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              FX Impact Panel
              <span style={{
                padding: '2px 7px', borderRadius: 5,
                background: C.redLt, color: C.red,
                fontFamily: fontUI, fontSize: 10, fontWeight: 600,
                letterSpacing: '0.04em',
              }}>YoY −13.1%</span>
            </div>
            <div style={{
              fontFamily: fontUI, fontSize: 12, color: C.muted, marginTop: 3,
            }}>
              CNY/IDR menguat — margin Anda terkikis tiap restock baru
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: fontMono, fontSize: 17, fontWeight: 600, color: C.ink,
              letterSpacing: '-0.01em',
            }}>{FX.today.toLocaleString('id-ID')}</div>
            <div style={{
              fontFamily: fontUI, fontSize: 10.5, color: C.muted, marginTop: 2,
            }}>CNY/IDR hari ini</div>
          </div>
          {open ? <ChevronUp size={18} color={C.muted} /> : <ChevronDown size={18} color={C.muted} />}
        </div>
      </button>

      {open && (
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: '22px',
          background: C.surfaceHi,
          borderRadius: '0 0 12px 12px',
        }}>
          {/* FX history & comparison */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22,
            marginBottom: 22,
          }}>
            {/* Mini chart */}
            <Card style={{ padding: 18, background: C.surface }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: 14,
              }}>
                <div>
                  <div style={{
                    fontFamily: fontUI, fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: C.muted, marginBottom: 4,
                  }}>CNY → IDR (365 hari)</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{
                      fontFamily: fontDisplay, fontSize: 28, color: C.ink,
                      lineHeight: 1, letterSpacing: '-0.02em',
                    }}>{FX.today.toLocaleString('id-ID')}</span>
                    <span style={{
                      fontFamily: fontUI, fontSize: 12, fontWeight: 600, color: C.red,
                    }}>+{FX.yoyDepreciation}%</span>
                  </div>
                </div>
                <div style={{
                  fontFamily: fontUI, fontSize: 11, color: C.muted,
                  textAlign: 'right',
                }}>
                  Setahun lalu<br />
                  <span style={{ fontFamily: fontMono, color: C.ink2, fontSize: 12, fontWeight: 500 }}>
                    {FX.d365.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={FX_HISTORY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="fxGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.amber} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide />
                  <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                  <Tooltip
                    contentStyle={{
                      background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 8, fontFamily: fontUI, fontSize: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                    formatter={(v) => [`Rp ${v.toLocaleString('id-ID')}`, 'Rate']}
                  />
                  <Area
                    type="monotone" dataKey="rate"
                    stroke={C.amber} strokeWidth={2}
                    fill="url(#fxGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Comparison tiles */}
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { label: '30 hari lalu', value: FX.d30, change: `+${FX.d30Change}%`, color: C.amber },
                { label: '365 hari lalu', value: FX.d365, change: `+${FX.yoyDepreciation}%`, color: C.red },
                { label: 'Implikasi', value: 'HPP naik', change: '~13% YoY', color: C.ink, plain: true },
              ].map((row, i) => (
                <div key={i} style={{
                  padding: '12px 14px', background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: 9,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ fontFamily: fontUI, fontSize: 12, color: C.muted }}>
                    {row.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{
                      fontFamily: row.plain ? fontUI : fontMono,
                      fontSize: 13, fontWeight: 600, color: C.ink,
                    }}>{typeof row.value === 'number' ? row.value.toLocaleString('id-ID') : row.value}</span>
                    <span style={{
                      fontFamily: fontUI, fontSize: 11, fontWeight: 600,
                      color: row.color,
                    }}>{row.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-SKU margin erosion */}
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 12,
            }}>
              <div style={{
                fontFamily: fontUI, fontSize: 12.5, fontWeight: 600, color: C.ink2,
              }}>Erosi margin per SKU (saat restock di FX hari ini)</div>
              <div style={{
                fontFamily: fontUI, fontSize: 11, color: C.muted,
              }}>vs. 30 hari lalu • vs. setahun lalu</div>
            </div>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, overflow: 'hidden',
            }}>
              {fxRows.map((s, i) => (
                <div key={s.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr',
                  alignItems: 'center', gap: 14,
                  padding: '12px 16px',
                  borderTop: i > 0 ? `1px solid ${C.border}` : 'none',
                  background: i % 2 === 1 ? C.surfaceHi : C.surface,
                }}>
                  <div>
                    <div style={{ fontFamily: fontUI, fontSize: 13, fontWeight: 500, color: C.ink }}>
                      {s.name}
                    </div>
                    <div style={{ fontFamily: fontMono, fontSize: 10.5, color: C.faint, marginTop: 2 }}>
                      {s.id} • HPP ¥{s.hppCNY}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontFamily: fontUI, fontSize: 12.5, color: C.ink, fontWeight: 500,
                    }}>{s.netMarginToday.toFixed(1)}%</span>
                    <span style={{ fontFamily: fontUI, fontSize: 10.5, color: C.muted }}>margin hari ini</span>
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontFamily: fontUI, fontSize: 12, fontWeight: 600, color: C.amber,
                  }}>
                    <ArrowDown size={11} />
                    −{s.marginErosionVsD30.toFixed(1)}pp
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontFamily: fontUI, fontSize: 12, fontWeight: 600, color: C.red,
                  }}>
                    <ArrowDown size={11} />
                    −{s.marginErosionVsYear.toFixed(1)}pp vs 365h
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================================
// DECISION ENGINE TABLE
// ============================================================
const DecisionEngineTable = ({ onRowClick }) => (
  <Card>
    <div style={{
      padding: '18px 22px', borderBottom: `1px solid ${C.border}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <div style={{
          fontFamily: fontUI, fontSize: 14.5, fontWeight: 600, color: C.ink,
          display: 'flex', alignItems: 'center', gap: 9,
        }}>
          <Activity size={15} color={C.primary} strokeWidth={2.3} />
          Decision Engine
        </div>
        <div style={{ fontFamily: fontUI, fontSize: 11.5, color: C.muted, marginTop: 3 }}>
          Rekomendasi otomatis berdasar velocity, stock, dan FX
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <span style={{
          fontFamily: fontUI, fontSize: 11, color: C.muted,
          padding: '5px 10px', borderRadius: 6, background: C.bgAlt,
          border: `1px solid ${C.border}`,
        }}>
          Updated 2 menit lalu
        </span>
      </div>
    </div>

    <div style={{ overflow: 'auto' }}>
      <table style={{
        width: '100%', borderCollapse: 'separate', borderSpacing: 0,
        fontFamily: fontUI,
      }}>
        <thead>
          <tr style={{ background: C.surfaceHi }}>
            {['Produk', 'Stock', 'Velocity 7d', 'Days Left', 'Margin', 'Status', ''].map((h, i) => (
              <th key={i} style={{
                padding: '11px 16px', textAlign: i === 0 ? 'left' : 'left',
                fontFamily: fontUI, fontSize: 10.5, fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: C.muted, borderBottom: `1px solid ${C.border}`,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SKUS.map((s, i) => (
            <tr
              key={s.id}
              onClick={() => onRowClick && onRowClick(s)}
              style={{
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.bgAlt}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{
                padding: '14px 16px',
                borderBottom: i < SKUS.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{
                  fontFamily: fontUI, fontSize: 13.5, fontWeight: 500, color: C.ink,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {s.name}
                  {s.trending && (
                    <span style={{
                      padding: '1px 6px', borderRadius: 4,
                      background: C.amberLt, color: C.amber,
                      fontFamily: fontUI, fontSize: 9.5, fontWeight: 600,
                      letterSpacing: '0.04em', border: `1px solid ${C.amberBd}`,
                    }}>TRENDING</span>
                  )}
                </div>
                <div style={{
                  fontFamily: fontMono, fontSize: 10.5, color: C.faint, marginTop: 2,
                }}>{s.id}</div>
              </td>
              <td style={{
                padding: '14px 16px', borderBottom: i < SKUS.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ fontFamily: fontMono, fontSize: 13, color: C.ink, fontWeight: 500 }}>{s.stock}</div>
                <div style={{ fontFamily: fontUI, fontSize: 10.5, color: C.faint, marginTop: 2 }}>unit</div>
              </td>
              <td style={{
                padding: '14px 16px', borderBottom: i < SKUS.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ fontFamily: fontMono, fontSize: 13, color: C.ink, fontWeight: 500 }}>
                  {s.velocity7}/hari
                </div>
                <div style={{
                  fontFamily: fontUI, fontSize: 10.5, color: s.velocity7 > s.velocity30 ? C.primary : C.muted,
                  marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 3,
                }}>
                  {s.velocity7 > s.velocity30 ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                  vs 30d: {s.velocity30}
                </div>
              </td>
              <td style={{
                padding: '14px 16px', borderBottom: i < SKUS.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{
                  fontFamily: fontMono, fontSize: 13,
                  color: s.daysLeft < 5 ? C.red : s.daysLeft < 14 ? C.amber : C.ink,
                  fontWeight: 600,
                }}>{s.daysLeft.toFixed(1)} hari</div>
                <div style={{ fontFamily: fontUI, fontSize: 10.5, color: C.faint, marginTop: 2 }}>
                  Lead {s.leadTimeDays}d
                </div>
              </td>
              <td style={{
                padding: '14px 16px', borderBottom: i < SKUS.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ fontFamily: fontMono, fontSize: 13, color: C.ink, fontWeight: 500 }}>
                  {s.netMarginToday.toFixed(1)}%
                </div>
                <div style={{
                  fontFamily: fontUI, fontSize: 10.5, color: C.red,
                  marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 3,
                }}>
                  <ArrowDown size={9} />
                  −{(s.netMargin30d - s.netMarginToday).toFixed(1)}pp FX
                </div>
              </td>
              <td style={{
                padding: '14px 16px', borderBottom: i < SKUS.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <StatusPill status={s.status} />
              </td>
              <td style={{
                padding: '14px 16px', borderBottom: i < SKUS.length - 1 ? `1px solid ${C.border}` : 'none',
                textAlign: 'right',
              }}>
                <ChevronRight size={15} color={C.faint} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// ============================================================
// RESTOCK BUDGET WIDGET
// ============================================================
const RestockBudgetWidget = () => {
  const needsRestock = SKUS.filter(s =>
    s.status === 'restock_now' || s.status === 'restock_soon' || s.status === 'push_marketing'
  );

  const items = needsRestock.map(s => {
    const reorderQty = Math.ceil(s.velocity30 * (s.leadTimeDays + 14));
    const cost = reorderQty * s.hppIDR;
    return { ...s, reorderQty, cost };
  });

  const total = items.reduce((sum, i) => sum + i.cost, 0);

  return (
    <Card style={{ padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: `${C.primary}12`, color: C.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Wallet size={16} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontFamily: fontUI, fontSize: 14, fontWeight: 600, color: C.ink }}>
            Budget Restock
          </div>
          <div style={{ fontFamily: fontUI, fontSize: 11.5, color: C.muted, marginTop: 2 }}>
            Estimasi 30 hari ke depan
          </div>
        </div>
      </div>

      <div style={{
        padding: '18px 0', borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`, marginBottom: 16,
      }}>
        <div style={{ fontFamily: fontUI, fontSize: 11, color: C.muted, marginBottom: 6 }}>
          Total kebutuhan dana
        </div>
        <div style={{
          fontFamily: fontDisplay, fontStyle: 'italic',
          fontSize: 34, color: C.ink, lineHeight: 1, letterSpacing: '-0.02em',
        }}>
          {formatIDR(total)}
        </div>
        <div style={{
          marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5,
          fontFamily: fontUI, fontSize: 11.5, color: C.amber,
          padding: '4px 9px', borderRadius: 6,
          background: C.amberLt, border: `1px solid ${C.amberBd}`,
        }}>
          <AlertCircle size={11} strokeWidth={2.4} />
          FX hari ini lebih mahal — restock sebelum naik lagi
        </div>
      </div>

      <div style={{ display: 'grid', gap: 9 }}>
        {items.map(item => (
          <div key={item.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0',
          }}>
            <div>
              <div style={{ fontFamily: fontUI, fontSize: 12.5, color: C.ink2, fontWeight: 500 }}>
                {item.name}
              </div>
              <div style={{ fontFamily: fontUI, fontSize: 11, color: C.muted, marginTop: 2 }}>
                {item.reorderQty} unit × ¥{item.hppCNY}
              </div>
            </div>
            <div style={{ fontFamily: fontMono, fontSize: 12.5, color: C.ink, fontWeight: 600 }}>
              {formatIDR(item.cost)}
            </div>
          </div>
        ))}
      </div>

      <button style={{
        marginTop: 18, width: '100%', padding: '11px 16px', borderRadius: 9,
        background: C.ink, color: C.surface, border: 'none',
        fontFamily: fontUI, fontSize: 13, fontWeight: 600,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', gap: 6, transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = C.ink2}
        onMouseLeave={e => e.currentTarget.style.background = C.ink}
      >
        Generate Purchase Order <ArrowRight size={13} />
      </button>
    </Card>
  );
};

// ============================================================
// GMV CHART
// ============================================================
// const GMVChart = () => (
//   <Card style={{ padding: 22 }}>
//     <div style={{
//       display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
//       marginBottom: 18,
//     }}>
//       <div>
//         <div style={{
//           fontFamily: fontUI, fontSize: 11, fontWeight: 600,
//           letterSpacing: '0.1em', textTransform: 'uppercase',
//           color: C.muted, marginBottom: 4,
//         }}>GMV 30 hari</div>
//         <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
//           <span style={{
//             fontFamily: fontDisplay, fontStyle: 'italic',
//             fontSize: 30, color: C.ink, lineHeight: 1, letterSpacing: '-0.02em',
//           }}>Rp 1.11 M</span>
//           <span style={{
//             fontFamily: fontUI, fontSize: 12, fontWeight: 600, color: C.primary,
//             display: 'inline-flex', alignItems: 'center', gap: 3,
//           }}>
//             <ArrowUpRight size={11} /> +14.2% MoM
//           </span>
//         </div>
//       </div>
//       <div style={{ display: 'flex', gap: 6 }}>
//         {['7d', '30d', '90d'].map((p, i) => (
//           <button key={p} style={{
//             padding: '5px 11px', borderRadius: 6,
//             background: i === 1 ? C.ink : C.surface,
//             color: i === 1 ? C.surface : C.muted,
//             border: `1px solid ${i === 1 ? C.ink : C.border}`,
//             fontFamily: fontUI, fontSize: 11.5, fontWeight: 500,
//             cursor: 'pointer',
//           }}>{p}</button>
//         ))}
//       </div>
//     </div>

//     <ResponsiveContainer width="100%" height={200}>
//       <AreaChart data={DAILY_GMV} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
//         <defs>
//           <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%" stopColor={C.primary} stopOpacity={0.22} />
//             <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
//           </linearGradient>
//         </defs>
//         <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
//         <XAxis
//           dataKey="day"
//           axisLine={false} tickLine={false}
//           tick={{ fontFamily: fontUI, fontSize: 10, fill: C.faint }}
//           interval={4}
//         />
//         <YAxis
//           axisLine={false} tickLine={false}
//           tick={{ fontFamily: fontUI, fontSize: 10, fill: C.faint }}
//           tickFormatter={(v) => `${v}jt`}
//         />
//         <Tooltip
//           contentStyle={{
//             background: C.surface, border: `1px solid ${C.border}`,
//             borderRadius: 8, fontFamily: fontUI, fontSize: 12,
//             boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
//           }}
//           formatter={(v) => [`Rp ${v} juta`, 'GMV']}
//           labelFormatter={(l) => `Hari ${l}`}
//         />
//         <Area
//           type="monotone" dataKey="gmv"
//           stroke={C.primary} strokeWidth={2}
//           fill="url(#gmvGrad)"
//         />
//       </AreaChart>
//     </ResponsiveContainer>
//   </Card>
// );

// ============================================================
// OVERVIEW TAB
// ============================================================
const OverviewTab = ({ openProduct }) => {
  const gmv7 = DAILY_GMV.slice(-7).reduce((s, d) => s + d.gmv, 0);
  const gmv30 = DAILY_GMV.reduce((s, d) => s + d.gmv, 0);
  const critical = SKUS.filter(s => s.status === 'restock_now').length;
  const trendingTop = SKUS.filter(s => s.trending).length;

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      {/* Page header */}
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <div style={{
          fontFamily: fontUI, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: C.muted, marginBottom: 8,
        }}>Dashboard</div>
        <h1 style={{
          fontFamily: fontDisplay, fontStyle: 'italic',
          fontSize: 38, color: C.ink, margin: 0, lineHeight: 1.1,
          letterSpacing: '-0.025em', fontWeight: 400,
        }}>
          Selamat pagi, ACME_CO.
        </h1>
        <p style={{
          fontFamily: fontUI, fontSize: 14, color: C.muted, marginTop: 8,
          lineHeight: 1.5, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Ada {critical} SKU butuh restock segera dan {trendingTop} produk Anda sedang trending.
          Berikut ringkasan operasi 30 hari terakhir.
        </p>
      </div>

      {/* KPI strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
      }}>
        <KPICard
          label="GMV 7 hari"
          value={`Rp ${(gmv7).toFixed(0)} jt`}
          delta={{ positive: true, value: '+8.4%' }}
          subLabel="vs minggu lalu"
          accent={C.primary}
          icon={DollarSign}
        />
        <KPICard
          label="Total Stock Value"
          value={formatIDR(SKUS.reduce((sum, s) => sum + (s.stock * s.hppIDR), 0))}
          sub="Berdasarkan HPP"
          delta={{ color: 'blue', value: '+12.4%' }}
          subLabel="vs minggu lalu"
          accent={C.primary}
          icon={Boxes}
        />
        <KPICard
          label="SKU Kritis"
          value={critical.toString()}
          sub="butuh restock dalam 7 hari"
          delta={{ positive: false, value: 'Aksi diperlukan' }}
          accent={C.red}
          icon={AlertTriangle}
        />
        <KPICard
          label="Avg Days of Stock"
          value="25"
          sub="hari"
          delta={{ positive: false, color: 'red', value: '-3 hari' }}
          subLabel="vs minggu lalu"
          accent={C.amber}
          icon={Clock}
        />
      </div>

      {/* FX Impact Panel */}
      <FXImpactPanel />
      {/* 
      GMV chart
      <GMVChart /> */}

      {/* Decision Engine + Budget */}
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 22,
      }}>
        <DecisionEngineTable onRowClick={openProduct} />
        <RestockBudgetWidget />
      </div>
    </div>
  );
};

// ============================================================
// INVENTORY TAB
// ============================================================
const InventoryTab = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return SKUS.filter(s => {
      const matchFilter = filter === 'all' || s.status === filter;
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [filter, search]);

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <div style={{
          fontFamily: fontUI, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: C.muted, marginBottom: 8,
        }}>Inventory</div>
        <h1 style={{
          fontFamily: fontDisplay, fontStyle: 'italic',
          fontSize: 32, color: C.ink, margin: 0, lineHeight: 1.1,
          letterSpacing: '-0.025em', fontWeight: 400,
        }}>
          Stok dan pergerakan.
        </h1>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 22,
      }}>
        {/* SKU table */}
        <div>
          <Card style={{ padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{
                flex: 1, position: 'relative',
                display: 'flex', alignItems: 'center',
              }}>
                <Search size={14} color={C.muted} style={{
                  position: 'absolute', left: 12, pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari produk atau SKU code…"
                  style={{
                    width: '100%', padding: '8px 12px 8px 34px',
                    border: `1px solid ${C.border}`, borderRadius: 8,
                    fontFamily: fontUI, fontSize: 13, color: C.ink,
                    background: C.surface, outline: 'none',
                  }}
                />
              </div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  fontFamily: fontUI, fontSize: 13, color: C.ink2,
                  background: C.surface, cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="all">Semua status</option>
                <option value="restock_now">Restock Sekarang</option>
                <option value="restock_soon">Restock Segera</option>
                <option value="push_marketing">Push Marketing</option>
                <option value="healthy">Sehat</option>
                <option value="slow_mover">Slow Mover</option>
              </select>
            </div>
          </Card>

          <Card>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: C.surfaceHi }}>
                    {['Produk', 'Stock', 'V7', 'V30', 'Days Left', 'Status', 'Last Movement'].map((h, i) => (
                      <th key={i} style={{
                        padding: '11px 14px', textAlign: 'left',
                        fontFamily: fontUI, fontSize: 10.5, fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: C.muted, borderBottom: `1px solid ${C.border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id}>
                      <td style={{
                        padding: '13px 14px',
                        borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                      }}>
                        <div style={{
                          fontFamily: fontUI, fontSize: 13, color: C.ink, fontWeight: 500,
                        }}>{s.name}</div>
                        <div style={{
                          fontFamily: fontMono, fontSize: 10.5, color: C.faint, marginTop: 2,
                        }}>{s.id}</div>
                      </td>
                      <td style={{
                        padding: '13px 14px',
                        borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                      }}>
                        <span style={{ fontFamily: fontMono, fontSize: 13, color: C.ink, fontWeight: 500 }}>
                          {s.stock}
                        </span>
                      </td>
                      <td style={{
                        padding: '13px 14px',
                        borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                      }}>
                        <span style={{ fontFamily: fontMono, fontSize: 12.5, color: C.ink2 }}>
                          {s.velocity7}
                        </span>
                      </td>
                      <td style={{
                        padding: '13px 14px',
                        borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                      }}>
                        <span style={{ fontFamily: fontMono, fontSize: 12.5, color: C.ink2 }}>
                          {s.velocity30}
                        </span>
                      </td>
                      <td style={{
                        padding: '13px 14px',
                        borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                      }}>
                        <span style={{
                          fontFamily: fontMono, fontSize: 13, fontWeight: 600,
                          color: s.daysLeft < 5 ? C.red : s.daysLeft < 14 ? C.amber : C.ink,
                        }}>
                          {s.daysLeft.toFixed(1)}h
                        </span>
                      </td>
                      <td style={{
                        padding: '13px 14px',
                        borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                      }}>
                        <StatusPill status={s.status} size="sm" />
                      </td>
                      <td style={{
                        padding: '13px 14px',
                        borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                      }}>
                        <div style={{ fontFamily: fontUI, fontSize: 11.5, color: C.ink2 }}>
                          {s.lastMovement}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Stock movements feed */}
        <Card style={{ padding: 0 }}>
          <div style={{
            padding: '18px 20px', borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                fontFamily: fontUI, fontSize: 14, fontWeight: 600, color: C.ink,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Activity size={14} color={C.primary} strokeWidth={2.3} />
                Pergerakan Stok
              </div>
              <div style={{ fontFamily: fontUI, fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                Real-time dari Marketplace
              </div>
            </div>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: C.primary,
              boxShadow: `0 0 0 4px ${C.primary}22`,
            }} />
          </div>
          <div style={{ padding: '6px 0', maxHeight: 540, overflow: 'auto' }}>
            {STOCK_MOVEMENTS.map((m, i) => {
              const sku = SKUS.find(s => s.id === m.sku);
              const isOut = m.type === 'out';
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px',
                  borderBottom: i < STOCK_MOVEMENTS.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: isOut ? C.redLt : C.primaryLt,
                    color: isOut ? C.red : C.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isOut ? <ArrowUpRight size={14} strokeWidth={2.3} />
                      : <ArrowDownRight size={14} strokeWidth={2.3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: fontUI, fontSize: 12.5, color: C.ink, fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {sku?.name || m.sku}
                    </div>
                    <div style={{
                      fontFamily: fontUI, fontSize: 11, color: C.muted, marginTop: 2,
                    }}>
                      {m.source} • {m.time}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: fontMono, fontSize: 13, fontWeight: 600,
                    color: isOut ? C.red : C.primary,
                  }}>
                    {isOut ? '−' : '+'}{m.qty}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ============================================================
// TRENDS TAB
// ============================================================
const TRENDING_INFLUENCERS = [
  { name: '@jewel.aura', followers: '1.2M', niche: 'Jewelry & Accessories', growth: 42, engagement: '8.7%', platform: 'TikTok' },
  { name: '@mindful.mira', followers: '890K', niche: 'Wellness & Self-care', growth: 67, engagement: '11.2%', platform: 'TikTok' },
  { name: '@style.therapy', followers: '2.1M', niche: 'Fashion & Mental Health', growth: 31, engagement: '6.4%', platform: 'TikTok' },
  { name: '@crystal.vibes', followers: '540K', niche: 'Healing Crystals', growth: 89, engagement: '14.1%', platform: 'TikTok' },
  { name: '@daily.gems', followers: '1.5M', niche: 'Affordable Jewelry', growth: 24, engagement: '7.3%', platform: 'TikTok' },
];

const TRENDING_CATEGORIES = [
  { name: 'Category A', volume: '28.4K', growth: 156, rank: 1, trend: 'up' },
  { name: 'Category B', volume: '19.7K', growth: 94, rank: 2, trend: 'up' },
  { name: 'Category C', volume: '45.2K', growth: 38, rank: 3, trend: 'up' },
  { name: 'Category D', volume: '12.1K', growth: 72, rank: 4, trend: 'up' },
  { name: 'Category E', volume: '8.9K', growth: 210, rank: 5, trend: 'up' },
  { name: 'Category F', volume: '15.6K', growth: 47, rank: 6, trend: 'up' },
];

const TrendsTab = () => {
  const matched = TRENDING_KEYWORDS.filter(k => k.matched);

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{
            fontFamily: fontUI, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: C.muted, marginBottom: 8,
          }}>Trends</div>
          <h1 style={{
            fontFamily: fontDisplay, fontStyle: 'italic',
            fontSize: 32, color: C.ink, margin: 0, lineHeight: 1.1,
            letterSpacing: '-0.025em', fontWeight: 400,
          }}>
            Apa yang naik minggu ini.
          </h1>
          <p style={{
            fontFamily: fontUI, fontSize: 13.5, color: C.muted, marginTop: 8,
          }}>
            Data dari Analytics Tool — keyword Marketplace kategori jewelry & wellness.
          </p>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 8,
          background: C.amberLt, border: `1px solid ${C.amberBd}`,
          color: C.amber,
        }}>
          <Calendar size={13} strokeWidth={2.3} />
          <span style={{ fontFamily: fontUI, fontSize: 12, fontWeight: 600 }}>
            Update Analytics Tool berikutnya: Senin
          </span>
        </div>
      </div>

      {/* Matched trends */}
      <Card style={{ padding: 22 }}>
        <SectionLabel accent={C.primary}>Match — produk Anda yang lagi trending</SectionLabel>
        <div style={{ display: 'grid', gap: 10 }}>
          {matched.map(k => {
            const sku = SKUS.find(s => s.id === k.matched);
            return (
              <div key={k.keyword} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1.4fr',
                alignItems: 'center', gap: 14,
                padding: '14px 16px',
                background: C.primaryLt + '60',
                border: `1px solid ${C.primaryBd}`,
                borderRadius: 10,
              }}>
                <div>
                  <div style={{
                    fontFamily: fontUI, fontSize: 13.5, color: C.ink, fontWeight: 500,
                  }}>
                    "{k.keyword}"
                  </div>
                  <div style={{
                    fontFamily: fontUI, fontSize: 11, color: C.muted, marginTop: 3,
                  }}>
                    {k.volume} searches/minggu
                  </div>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontFamily: fontUI, fontSize: 13.5, fontWeight: 700, color: C.primary,
                }}>
                  <ArrowUpRight size={13} strokeWidth={2.5} />
                  +{k.growth}%
                </div>
                <div style={{ fontFamily: fontUI, fontSize: 12, color: C.muted }}>
                  Match:
                  <div style={{ color: C.ink2, fontWeight: 500, marginTop: 2 }}>
                    {sku?.name}
                  </div>
                </div>
                <button style={{
                  justifySelf: 'end',
                  padding: '7px 12px', borderRadius: 7,
                  background: C.primary, color: C.surface,
                  border: 'none', cursor: 'pointer',
                  fontFamily: fontUI, fontSize: 12, fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  Push iklan <ArrowRight size={11} />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Trending Influencers */}
      <Card style={{ padding: 22 }}>
        <SectionLabel accent={C.blue}>Trending Influencers — kreator yang lagi naik</SectionLabel>
        <div style={{ display: 'grid', gap: 8 }}>
          {TRENDING_INFLUENCERS.map(inf => (
            <div key={inf.name} style={{
              display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 0.8fr 0.8fr',
              alignItems: 'center', gap: 14,
              padding: '14px 16px',
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              transition: 'all 0.15s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#BFDBFE';
                e.currentTarget.style.background = C.blueLt + '80';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = C.surface;
              }}
            >
              <div>
                <div style={{
                  fontFamily: fontUI, fontSize: 13.5, color: C.ink, fontWeight: 600,
                }}>{inf.name}</div>
                <div style={{
                  fontFamily: fontUI, fontSize: 11, color: C.muted, marginTop: 3,
                }}>{inf.niche}</div>
              </div>
              <div>
                <div style={{ fontFamily: fontMono, fontSize: 13, color: C.ink, fontWeight: 500 }}>
                  {inf.followers}
                </div>
                <div style={{ fontFamily: fontUI, fontSize: 10.5, color: C.faint, marginTop: 2 }}>followers</div>
              </div>
              <div>
                <div style={{ fontFamily: fontMono, fontSize: 13, color: C.ink, fontWeight: 500 }}>
                  {inf.engagement}
                </div>
                <div style={{ fontFamily: fontUI, fontSize: 10.5, color: C.faint, marginTop: 2 }}>engagement</div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontFamily: fontUI, fontSize: 12.5, fontWeight: 600, color: C.primary,
              }}>
                <ArrowUpRight size={11} strokeWidth={2.5} />
                +{inf.growth}%
              </div>
              <span style={{
                justifySelf: 'end',
                padding: '3px 9px', borderRadius: 5,
                background: C.blueLt, color: C.blue,
                fontFamily: fontUI, fontSize: 10.5, fontWeight: 600,
                border: `1px solid #BFDBFE`,
                letterSpacing: '0.04em',
              }}>
                {inf.platform}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Trending Categories */}
      <Card style={{ padding: 22 }}>
        <SectionLabel accent={C.amber}>Trending Categories — kategori produk naik di marketplace</SectionLabel>
        <div style={{ display: 'grid', gap: 8 }}>
          {TRENDING_CATEGORIES.map(cat => (
            <div key={cat.name} style={{
              display: 'grid', gridTemplateColumns: '0.3fr 2fr 1fr 1fr 0.6fr',
              alignItems: 'center', gap: 14,
              padding: '14px 16px',
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.amberBd;
                e.currentTarget.style.background = C.amberLt + '50';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = C.surface;
              }}
            >
              <div style={{
                fontFamily: fontDisplay, fontSize: 22, color: C.faint,
                fontStyle: 'italic', textAlign: 'center',
              }}>#{cat.rank}</div>
              <div style={{
                fontFamily: fontUI, fontSize: 13.5, color: C.ink, fontWeight: 500,
              }}>{cat.name}</div>
              <div>
                <div style={{ fontFamily: fontMono, fontSize: 12.5, color: C.ink2 }}>
                  {cat.volume}
                </div>
                <div style={{ fontFamily: fontUI, fontSize: 10.5, color: C.faint, marginTop: 2 }}>searches/minggu</div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontFamily: fontUI, fontSize: 13, fontWeight: 700,
                color: cat.growth > 100 ? C.primary : C.amber,
              }}>
                <ArrowUpRight size={12} strokeWidth={2.5} />
                +{cat.growth}%
              </div>
              <span style={{
                justifySelf: 'end',
                padding: '3px 9px', borderRadius: 5,
                background: cat.growth > 100 ? C.primaryLt : C.amberLt,
                color: cat.growth > 100 ? C.primary : C.amber,
                fontFamily: fontUI, fontSize: 10, fontWeight: 600,
                border: `1px solid ${cat.growth > 100 ? C.primaryBd : C.amberBd}`,
                letterSpacing: '0.04em',
              }}>
                {cat.growth > 100 ? 'HOT' : 'RISING'}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============================================================
// PRODUCT DRILL-DOWN
// ============================================================

const ProductDrillDown = ({ product, onClose }) => {
  const velData = useMemo(() => velocitySeries(product), [product]);

  // Margin breakdown calculation
  const sellPrice = product.sellPriceIDR;
  const hpp = product.hppIDR;
  const tikTokFee = sellPrice * 0.06;
  const shipping = 8000;
  const adsCost = sellPrice * 0.12;
  const packaging = 3000;
  const net = sellPrice - hpp - tikTokFee - shipping - adsCost - packaging;
  const netPct = (net / sellPrice) * 100;

  // Restock simulation
  const simQty = Math.ceil(product.velocity30 * (product.leadTimeDays + 14));
  const simCostToday = simQty * product.hppIDR;
  const simCost30d = simQty * (product.hppCNY * FX.d30);
  const simSavings = simCostToday - simCost30d;

  const breakdownBars = [
    { label: 'Harga jual', value: sellPrice, color: C.primary, isTotal: true },
    { label: 'HPP', value: -hpp, color: C.red, breakdown: `¥${product.hppCNY} × ${FX.today.toLocaleString('id-ID')}` },
    { label: 'Platform fee 6%', value: -tikTokFee, color: C.amber },
    { label: 'Ads 12%', value: -adsCost, color: C.amber },
    { label: 'Shipping', value: -shipping, color: C.muted },
    { label: 'Packaging', value: -packaging, color: C.muted },
    { label: 'Net margin', value: net, color: C.ink, isTotal: true },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(10, 10, 11, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(720px, 100vw)', height: '100vh',
          background: C.surface, overflow: 'auto',
          animation: 'slideIn 0.3s ease-out',
          boxShadow: '-20px 0 40px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          position: 'sticky', top: 0, background: C.surface, zIndex: 5,
        }}>
          <div>
            <div style={{
              fontFamily: fontUI, fontSize: 11, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: C.muted, marginBottom: 6,
            }}>
              {product.id}
            </div>
            <div style={{
              fontFamily: fontDisplay, fontStyle: 'italic',
              fontSize: 26, color: C.ink, lineHeight: 1.1,
              letterSpacing: '-0.02em', fontWeight: 400,
            }}>
              {product.name}
            </div>
            <div style={{ marginTop: 10 }}>
              <StatusPill status={product.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 7, borderRadius: 7,
              background: C.surface, border: `1px solid ${C.border}`,
              cursor: 'pointer',
            }}
          >
            <X size={16} color={C.muted} />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'grid', gap: 22 }}>
          {/* Velocity chart */}
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: fontUI, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 4 }}>
                  Velocity 30 hari
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: fontDisplay, fontSize: 24, color: C.ink }}>
                    {product.velocity7}
                  </span>
                  <span style={{ fontFamily: fontUI, fontSize: 12, color: C.muted }}>
                    unit/hari (rata-rata 7d)
                  </span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={velData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.primary} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: C.faint }} interval={5} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: C.faint }} />
                <Tooltip
                  contentStyle={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 8, fontFamily: fontUI, fontSize: 12,
                  }}
                  formatter={(v) => [`${v} unit`, 'Sold']}
                />
                <Area type="monotone" dataKey="units" stroke={C.primary} strokeWidth={2} fill="url(#velGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Margin breakdown */}
          <Card style={{ padding: 22 }}>
            <SectionLabel accent={C.amber}>Breakdown margin per unit</SectionLabel>
            <div style={{ display: 'grid', gap: 8 }}>
              {breakdownBars.map((b, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1.4fr 2fr 1fr',
                  alignItems: 'center', gap: 14,
                  padding: b.isTotal ? '12px 0' : '6px 0',
                  borderTop: b.isTotal && i > 0 ? `1px solid ${C.border}` : 'none',
                  borderBottom: b.isTotal && i === breakdownBars.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div>
                    <div style={{
                      fontFamily: fontUI, fontSize: b.isTotal ? 13.5 : 12.5,
                      color: b.isTotal ? C.ink : C.ink2,
                      fontWeight: b.isTotal ? 600 : 500,
                    }}>{b.label}</div>
                    {b.breakdown && (
                      <div style={{ fontFamily: fontMono, fontSize: 10.5, color: C.faint, marginTop: 2 }}>
                        {b.breakdown}
                      </div>
                    )}
                  </div>
                  <div style={{
                    height: 6, background: C.bgAlt, borderRadius: 999,
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 999,
                      width: `${Math.min(100, Math.abs(b.value) / sellPrice * 100)}%`,
                      background: b.color, opacity: b.isTotal ? 1 : 0.7,
                    }} />
                  </div>
                  <div style={{
                    fontFamily: fontMono, fontSize: 13, fontWeight: b.isTotal ? 700 : 500,
                    color: b.value < 0 ? C.red : C.ink, textAlign: 'right',
                  }}>
                    {b.value < 0 ? '−' : ''}{formatIDR(Math.abs(b.value))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 14, padding: '12px 14px',
              background: C.primaryLt, border: `1px solid ${C.primaryBd}`,
              borderRadius: 9,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontFamily: fontUI, fontSize: 12.5, color: C.ink2, fontWeight: 500 }}>
                Net margin %
              </span>
              <span style={{ fontFamily: fontMono, fontSize: 18, color: C.primary, fontWeight: 700 }}>
                {netPct.toFixed(1)}%
              </span>
            </div>
          </Card>

          {/* FX cost basis history */}
          <Card style={{ padding: 22 }}>
            <SectionLabel accent={C.red}>FX cost basis — kalau Anda restock di tanggal X</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: '365 hari lalu', rate: FX.d365, idr: product.hppCNY * FX.d365, color: C.primary },
                { label: '30 hari lalu', rate: FX.d30, idr: product.hppCNY * FX.d30, color: C.amber },
                { label: 'Hari ini', rate: FX.today, idr: product.hppCNY * FX.today, color: C.red },
              ].map((r, i) => (
                <div key={i} style={{
                  padding: 14, background: C.surfaceHi,
                  border: `1px solid ${C.border}`, borderRadius: 9,
                }}>
                  <div style={{ fontFamily: fontUI, fontSize: 11, color: C.muted }}>{r.label}</div>
                  <div style={{ fontFamily: fontMono, fontSize: 11, color: C.faint, marginTop: 4 }}>
                    @ {r.rate.toLocaleString('id-ID')}
                  </div>
                  <div style={{
                    fontFamily: fontDisplay, fontStyle: 'italic',
                    fontSize: 20, color: r.color, lineHeight: 1.1,
                    marginTop: 8, letterSpacing: '-0.01em',
                  }}>
                    {formatIDR(r.idr)}
                  </div>
                  <div style={{ fontFamily: fontUI, fontSize: 10.5, color: C.muted, marginTop: 3 }}>
                    HPP/unit
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Restock simulation */}
          <Card style={{
            padding: 22,
            background: `linear-gradient(135deg, ${C.surface}, ${C.primaryLt}40)`,
            border: `1px solid ${C.primaryBd}`,
          }}>
            <SectionLabel accent={C.primary}>Simulasi restock</SectionLabel>
            <div style={{
              fontFamily: fontUI, fontSize: 13, color: C.ink2, lineHeight: 1.6,
              marginBottom: 16,
            }}>
              Kalau restock <strong>{simQty} unit</strong> hari ini di FX {FX.today.toLocaleString('id-ID')}:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ padding: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9 }}>
                <div style={{ fontFamily: fontUI, fontSize: 11, color: C.muted }}>Modal dibutuhkan</div>
                <div style={{
                  fontFamily: fontDisplay, fontStyle: 'italic', fontSize: 22,
                  color: C.ink, marginTop: 6, letterSpacing: '-0.02em',
                }}>{formatIDR(simCostToday)}</div>
              </div>
              <div style={{ padding: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9 }}>
                <div style={{ fontFamily: fontUI, fontSize: 11, color: C.muted }}>Net margin baru</div>
                <div style={{
                  fontFamily: fontDisplay, fontStyle: 'italic', fontSize: 22,
                  color: C.primary, marginTop: 6, letterSpacing: '-0.02em',
                }}>{netPct.toFixed(1)}%</div>
              </div>
            </div>
            <div style={{
              padding: '11px 14px',
              background: C.amberLt, border: `1px solid ${C.amberBd}`,
              borderRadius: 8,
              fontFamily: fontUI, fontSize: 12, color: C.amber,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertCircle size={13} strokeWidth={2.3} />
              Kalau Anda restock 30 hari lalu: hemat ~{formatIDR(Math.abs(simSavings))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SHIPPING TAB
// ============================================================
const SAFETY_BUFFER = 14;
const WATER_LEAD = 45;
const AIR_LEAD = 7;

const getShipmentMode = (daysLeft) => {
  if (daysLeft < 7) return 'critical';
  if (daysLeft < SAFETY_BUFFER) return 'air';
  if (daysLeft < WATER_LEAD + SAFETY_BUFFER) return 'water_urgent';
  return 'water';
};

const SHIP_META = {
  water: { label: 'LAUT', color: C.primary, bg: C.primaryLt, border: C.primaryBd, icon: Ship, desc: 'Masih punya waktu order via laut' },
  water_urgent: { label: 'LAUT — SEGERA', color: C.amber, bg: C.amberLt, border: C.amberBd, icon: Anchor, desc: 'Deadline order laut sudah dekat' },
  air: { label: 'UDARA', color: C.amber, bg: C.amberLt, border: C.amberBd, icon: Plane, desc: 'Laut sudah tidak memungkinkan — harus air shipment' },
  critical: { label: 'CRITICAL', color: C.red, bg: C.redLt, border: C.redBd, icon: AlertTriangle, desc: 'Bahkan air shipment cutting it close' },
};

const ShippingTab = () => {
  const [filter, setFilter] = useState('all');

  const today = new Date();
  const formatDate = (d) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  const shipData = useMemo(() => {
    return SKUS.map(s => {
      const daysLeft = s.stock / s.velocity7;
      const mode = getShipmentMode(daysLeft);
      const reorderQty = Math.ceil(s.velocity30 * (WATER_LEAD + SAFETY_BUFFER));
      const costIDR = reorderQty * s.hppIDR;
      let orderDeadline, estArrival;
      if (mode === 'water' || mode === 'water_urgent') {
        const deadlineDays = Math.max(0, Math.floor(daysLeft - WATER_LEAD - SAFETY_BUFFER));
        orderDeadline = addDays(today, deadlineDays);
        estArrival = addDays(orderDeadline, WATER_LEAD);
      } else {
        orderDeadline = addDays(today, Math.max(0, Math.floor(daysLeft - AIR_LEAD)));
        estArrival = addDays(orderDeadline, AIR_LEAD);
      }
      return { ...s, daysLeft, mode, reorderQty, costIDR, orderDeadline, estArrival };
    }).filter(s => s.daysLeft < 60).sort((a, b) => a.daysLeft - b.daysLeft);
  }, []);

  const filtered = filter === 'all' ? shipData : shipData.filter(s => {
    if (filter === 'water') return s.mode === 'water' || s.mode === 'water_urgent';
    if (filter === 'air') return s.mode === 'air';
    return s.mode === 'critical';
  });

  const waterCount = shipData.filter(s => s.mode === 'water' || s.mode === 'water_urgent').length;
  const airCount = shipData.filter(s => s.mode === 'air').length;
  const critCount = shipData.filter(s => s.mode === 'critical').length;
  const totalCost = shipData.reduce((sum, s) => sum + s.costIDR, 0);

  const waLines = shipData.map(s => {
    const m = SHIP_META[s.mode];
    if (s.mode === 'water' || s.mode === 'water_urgent')
      return `• ${s.name} → ORDER SEKARANG via laut, deadline ${formatDate(s.orderDeadline)}`;
    if (s.mode === 'air')
      return `• ${s.name} → UDARA only, stok ${s.daysLeft.toFixed(0)} hari lagi`;
    return `• ${s.name} → CRITICAL, pertimbangkan air shipment darurat`;
  });

  const filters = [
    { id: 'all', label: 'Semua', count: shipData.length },
    { id: 'water', label: 'Laut', count: waterCount, color: C.primary },
    { id: 'air', label: 'Udara', count: airCount, color: C.amber },
    { id: 'critical', label: 'Critical', count: critCount, color: C.red },
  ];

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      {/* Header */}
      <div>
        <div style={{
          fontFamily: fontUI, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: C.muted, marginBottom: 8,
        }}>Shipping</div>
        <h1 style={{
          fontFamily: fontDisplay, fontStyle: 'italic',
          fontSize: 32, color: C.ink, margin: 0, lineHeight: 1.1,
          letterSpacing: '-0.025em', fontWeight: 400,
        }}>
          Laut atau udara — keputusan restock Anda.
        </h1>
        <p style={{
          fontFamily: fontUI, fontSize: 13.5, color: C.muted, marginTop: 8,
        }}>
          Rekomendasi otomatis berdasarkan days-left, lead time pengiriman, dan safety buffer {SAFETY_BUFFER} hari.
        </p>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <Card style={{ padding: 18 }} hover>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: `${C.primary}14`, color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ship size={14} strokeWidth={2.2} />
            </div>
            <span style={{ fontFamily: fontUI, fontSize: 11, color: C.muted }}>Bisa via Laut</span>
          </div>
          <div style={{ fontFamily: fontDisplay, fontSize: 30, color: C.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>{waterCount}</div>
          <div style={{ fontFamily: fontUI, fontSize: 11, color: C.primary, marginTop: 6, fontWeight: 600 }}>SKU • hemat biaya</div>
        </Card>
        <Card style={{ padding: 18 }} hover>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: `${C.amber}14`, color: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plane size={14} strokeWidth={2.2} />
            </div>
            <span style={{ fontFamily: fontUI, fontSize: 11, color: C.muted }}>Harus via Udara</span>
          </div>
          <div style={{ fontFamily: fontDisplay, fontSize: 30, color: C.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>{airCount}</div>
          <div style={{ fontFamily: fontUI, fontSize: 11, color: C.amber, marginTop: 6, fontWeight: 600 }}>SKU • biaya ~3× lipat</div>
        </Card>
        <Card style={{ padding: 18 }} hover>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: `${C.red}14`, color: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={14} strokeWidth={2.2} />
            </div>
            <span style={{ fontFamily: fontUI, fontSize: 11, color: C.muted }}>Critical Zone</span>
          </div>
          <div style={{ fontFamily: fontDisplay, fontSize: 30, color: C.red, lineHeight: 1, letterSpacing: '-0.02em' }}>{critCount}</div>
          <div style={{ fontFamily: fontUI, fontSize: 11, color: C.red, marginTop: 6, fontWeight: 600 }}>SKU • risiko stockout</div>
        </Card>
        <Card style={{ padding: 18 }} hover>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: `${C.blue}14`, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={14} strokeWidth={2.2} />
            </div>
            <span style={{ fontFamily: fontUI, fontSize: 11, color: C.muted }}>Est. Restock Cost</span>
          </div>
          <div style={{ fontFamily: fontDisplay, fontSize: 26, color: C.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>{formatIDR(totalCost)}</div>
          <div style={{ fontFamily: fontUI, fontSize: 11, color: C.muted, marginTop: 6 }}>di FX {FX.today.toLocaleString('id-ID')} CNY/IDR</div>
        </Card>
      </div>

      {/* Filter bar */}
      <Card style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={14} color={C.muted} />
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 14px', borderRadius: 7,
                background: filter === f.id ? (f.color || C.ink) : C.surface,
                color: filter === f.id ? C.surface : (f.color || C.ink2),
                border: `1px solid ${filter === f.id ? (f.color || C.ink) : C.border}`,
                fontFamily: fontUI, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              {f.label}
              <span style={{
                padding: '1px 6px', borderRadius: 4, fontSize: 10,
                background: filter === f.id ? 'rgba(255,255,255,0.25)' : C.bgAlt,
                color: filter === f.id ? C.surface : C.muted,
              }}>{f.count}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* SKU shipment table */}
      <Card>
        <div style={{
          padding: '18px 22px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontFamily: fontUI, fontSize: 14.5, fontWeight: 600, color: C.ink,
              display: 'flex', alignItems: 'center', gap: 9,
            }}>
              <Ship size={15} color={C.primary} strokeWidth={2.3} />
              Shipment Planner
            </div>
            <div style={{ fontFamily: fontUI, fontSize: 11.5, color: C.muted, marginTop: 3 }}>
              Laut 45 hari • Udara 7 hari • Safety buffer {SAFETY_BUFFER} hari
            </div>
          </div>
        </div>

        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontFamily: fontUI }}>
            <thead>
              <tr style={{ background: C.surfaceHi }}>
                {['Produk', 'Stock', 'Velocity', 'Days Left', 'Mode', 'Deadline Order', 'Est. Arrival', 'Biaya Restock'].map((h, i) => (
                  <th key={i} style={{
                    padding: '11px 14px', textAlign: 'left',
                    fontFamily: fontUI, fontSize: 10.5, fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: C.muted, borderBottom: `1px solid ${C.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const m = SHIP_META[s.mode];
                const MIcon = m.icon;
                return (
                  <tr key={s.id}
                    style={{ cursor: 'default', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bgAlt}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ fontFamily: fontUI, fontSize: 13, fontWeight: 500, color: C.ink }}>{s.name}</div>
                      <div style={{ fontFamily: fontMono, fontSize: 10.5, color: C.faint, marginTop: 2 }}>{s.id}</div>
                    </td>
                    <td style={{ padding: '14px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ fontFamily: fontMono, fontSize: 13, color: C.ink, fontWeight: 500 }}>{s.stock}</div>
                      <div style={{ fontFamily: fontUI, fontSize: 10.5, color: C.faint, marginTop: 2 }}>unit</div>
                    </td>
                    <td style={{ padding: '14px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ fontFamily: fontMono, fontSize: 13, color: C.ink, fontWeight: 500 }}>{s.velocity7}/hari</div>
                    </td>
                    <td style={{ padding: '14px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{
                        fontFamily: fontMono, fontSize: 14, fontWeight: 700,
                        color: s.daysLeft < 7 ? C.red : s.daysLeft < 14 ? C.amber : C.ink,
                      }}>{s.daysLeft.toFixed(1)} hari</div>
                    </td>
                    <td style={{ padding: '14px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', borderRadius: 999,
                        background: m.bg, color: m.color,
                        border: `1px solid ${m.border}`,
                        fontFamily: fontUI, fontSize: 11, fontWeight: 600,
                        letterSpacing: '-0.005em', whiteSpace: 'nowrap',
                      }}>
                        <MIcon size={11} strokeWidth={2.5} />
                        {m.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ fontFamily: fontUI, fontSize: 12.5, color: s.mode === 'critical' ? C.red : C.ink, fontWeight: 600 }}>
                        {formatDate(s.orderDeadline)}
                      </div>
                    </td>
                    <td style={{ padding: '14px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ fontFamily: fontUI, fontSize: 12.5, color: C.muted }}>
                        {formatDate(s.estArrival)}
                      </div>
                    </td>
                    <td style={{ padding: '14px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ fontFamily: fontMono, fontSize: 12.5, color: C.ink, fontWeight: 600 }}>
                        {formatIDR(s.costIDR)}
                      </div>
                      {(s.mode === 'air' || s.mode === 'critical') && (
                        <div style={{ fontFamily: fontUI, fontSize: 10, color: C.red, marginTop: 3, fontWeight: 500 }}>
                          air ~3× lebih mahal
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* WhatsApp briefing preview */}
      <Card style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: '#25D36614', color: '#25D366',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.29-1.233l-.307-.184-2.87.852.852-2.87-.184-.307A8 8 0 1112 20z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: fontUI, fontSize: 14, fontWeight: 600, color: C.ink }}>
              WhatsApp Briefing Preview
            </div>
            <div style={{ fontFamily: fontUI, fontSize: 11.5, color: C.muted, marginTop: 2 }}>
              Pesan yang dikirim Pulse setiap pagi ke WA ACME_CO
            </div>
          </div>
        </div>
        <div style={{
          padding: '16px 18px', borderRadius: 10,
          background: '#DCF8C6', border: `1px solid #B8E6A3`,
          fontFamily: fontUI, fontSize: 12.5, color: '#1B3A1B',
          lineHeight: 1.8, whiteSpace: 'pre-wrap',
        }}>
          {`Shipment alert hari ini:\n${waLines.join('\n')}`}
        </div>
      </Card>
    </div>
  );
};

// ============================================================
// AI VIDEO TAB (LOCKED)
// ============================================================
const AIVideoLockedTab = () => {
  // Blurred mock interface behind the modal
  return (
    <div style={{ position: 'relative', minHeight: 600 }}>
      {/* Blurred mock interface */}
      <div style={{
        filter: 'blur(8px)', opacity: 0.45, pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <div style={{ display: 'grid', gap: 22 }}>
          <div>
            <div style={{
              fontFamily: fontUI, fontSize: 11, fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: C.muted, marginBottom: 8,
            }}>AI Video Generator</div>
            <h1 style={{
              fontFamily: fontDisplay, fontStyle: 'italic',
              fontSize: 32, color: C.ink, margin: 0,
              letterSpacing: '-0.025em', fontWeight: 400,
            }}>
              Generate video promosi dari katalog Anda.
            </h1>
          </div>

          {/* Mock generate panel */}
          <Card style={{ padding: 22 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div>
                <div style={{ fontFamily: fontUI, fontSize: 12, color: C.muted, marginBottom: 8 }}>
                  Pilih produk
                </div>
                <div style={{
                  padding: 14, background: C.surfaceHi,
                  border: `1px solid ${C.border}`, borderRadius: 9,
                  fontFamily: fontUI, fontSize: 13.5, color: C.ink, fontWeight: 500,
                }}>
                  PRODUCT_01
                </div>
              </div>
              <div>
                <div style={{ fontFamily: fontUI, fontSize: 12, color: C.muted, marginBottom: 8 }}>
                  Gaya video
                </div>
                <div style={{
                  padding: 14, background: C.surfaceHi,
                  border: `1px solid ${C.border}`, borderRadius: 9,
                  fontFamily: fontUI, fontSize: 13.5, color: C.ink, fontWeight: 500,
                }}>
                  Aesthetic GRWM
                </div>
              </div>
            </div>
          </Card>

          {/* Mock video grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} style={{
                aspectRatio: '9 / 16',
                background: `linear-gradient(${135 + i * 30}deg, ${C.primary}30, ${C.amber}20, ${C.ink}40)`,
                borderRadius: 10,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `radial-gradient(circle at ${20 + i * 10}% 30%, rgba(255,255,255,0.3), transparent)`,
                }} />
                <div style={{
                  position: 'absolute', bottom: 12, left: 12, right: 12,
                  height: 8, background: 'rgba(255,255,255,0.7)', borderRadius: 4,
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Centered modal overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{
          maxWidth: 480, width: '100%',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 36,
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(10, 10, 11, 0.12), 0 4px 12px rgba(10, 10, 11, 0.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative gradient blobs */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 180, height: 180, borderRadius: '50%',
            background: `radial-gradient(circle, ${C.amber}25, transparent 70%)`,
            filter: 'blur(30px)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -80, left: -80,
            width: 220, height: 220, borderRadius: '50%',
            background: `radial-gradient(circle, ${C.primary}20, transparent 70%)`,
            filter: 'blur(40px)', pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative' }}>
            {/* Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: `linear-gradient(135deg, ${C.ink}, ${C.ink2})`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24, position: 'relative',
            }}>
              <Wand2 size={26} color={C.surface} strokeWidth={2} />
              <div style={{
                position: 'absolute', top: -4, right: -4,
                width: 22, height: 22, borderRadius: '50%',
                background: C.amber, color: C.surface,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={11} strokeWidth={2.5} />
              </div>
            </div>

            {/* Phase badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 11px', borderRadius: 999,
              background: C.amberLt, color: C.amber,
              border: `1px solid ${C.amberBd}`,
              fontFamily: fontUI, fontSize: 10.5, fontWeight: 600,
              letterSpacing: '0.1em', marginBottom: 18,
            }}>
              <Lock size={10} strokeWidth={2.5} />
              PHASE 2 — COMING SOON
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: fontDisplay, fontStyle: 'italic',
              fontSize: 36, color: C.ink, margin: '0 0 14px',
              lineHeight: 1.1, letterSpacing: '-0.025em', fontWeight: 400,
            }}>
              Pulse AI Video Automation
            </h2>

            <p style={{
              fontFamily: fontUI, fontSize: 14, color: C.muted,
              margin: '0 0 8px', lineHeight: 1.6,
            }}>
              Generate video promosi untuk produk Anda secara otomatis. Powered by AI —
              skrip, voiceover, dan footage produk.
            </p>
            <p style={{
              fontFamily: fontUI, fontSize: 13, color: C.faint,
              margin: '0 0 28px', lineHeight: 1.6,
            }}>
              Tersedia setelah Pulse stabil di operasi Anda — Phase 2.
            </p>

            {/* CTA */}
            <button style={{
              padding: '12px 22px', borderRadius: 10,
              background: C.ink, color: C.surface, border: 'none',
              fontFamily: fontUI, fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = C.ink2;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = C.ink;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <BellRing size={14} />
              Notify saya saat ready
            </button>

            <div style={{
              marginTop: 24, paddingTop: 20,
              borderTop: `1px solid ${C.border}`,
              display: 'flex', justifyContent: 'center', gap: 18,
              fontFamily: fontUI, fontSize: 11, color: C.muted,
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Sparkles size={11} color={C.amber} />
                Auto script
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Play size={11} color={C.primary} />
                AI voiceover
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Zap size={11} color={C.blue} />
                Produk match
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN
// ============================================================
export default function PulseDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [drillDown, setDrillDown] = useState(null);

  const openProduct = (sku) => setDrillDown(sku);
  const closeDrill = () => setDrillDown(null);

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, color: C.ink,
      fontFamily: fontUI,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.borderHi}; }
      `}</style>

      <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ padding: '28px 28px 60px', maxWidth: 1480, margin: '0 auto' }}>
        {activeTab === 'overview' && <OverviewTab openProduct={openProduct} />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'trends' && <TrendsTab />}
        {activeTab === 'shipping' && <ShippingTab />}
        {activeTab === 'ai_video' && <AIVideoLockedTab />}
      </div>

      {drillDown && <ProductDrillDown product={drillDown} onClose={closeDrill} />}
    </div>
  );
}