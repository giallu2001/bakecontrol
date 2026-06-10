import { useState, useMemo } from "react";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";
console.log("APP CARICATA");

// ── Icons (inline SVG components) ──────────────────────────────────────────
const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);
const IconGrid = (p) => <Icon {...p} d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />;
const IconFile = (p) => <Icon {...p} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" />;
const IconBox = (p) => <Icon {...p} d={["M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", "M3.27 6.96L12 12.01l8.73-5.05", "M12 22.08V12"]} />;
const IconBook = (p) => <Icon {...p} d={["M4 19.5A2.5 2.5 0 0 1 6.5 17H20", "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"]} />;
const IconFactory = (p) => <Icon {...p} d="M2 20h20M4 20V10l6-6 6 6v10M10 20v-6h4v6" />;
const IconShop = (p) => <Icon {...p} d={["M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"]} />;
const IconChart = (p) => <Icon {...p} d={["M18 20V10", "M12 20V4", "M6 20v-6"]} />;
const IconSettings = (p) => <Icon {...p} d={["M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z", "M12 8v4l3 3"]} fill="none" />;
const IconTrend = (p) => <Icon {...p} d={["M22 7l-8.5 8.5-5-5L2 17", "M16 7h6v6"]} />;
const IconAlert = (p) => <Icon {...p} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />;
const IconPlus = (p) => <Icon {...p} d="M12 5v14M5 12h14" />;
const IconChevron = ({ dir = "down", ...p }) => {
  const ds = { down: "M6 9l6 6 6-6", up: "M18 15l-6-6-6 6", right: "M9 18l6-6-6-6" };
  return <Icon {...p} d={ds[dir]} />;
};
const IconGear = (p) => <Icon {...p} d={["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"]} />;

// ── Design Tokens ──────────────────────────────────────────────────────────
const C = {
  cream: "#FAF6F0",
  creamDark: "#F0E8DC",
  brown: "#6B3F1A",
  brownLight: "#C8956C",
  orange: "#E8722A",
  orangeLight: "#F4A96A",
  white: "#FFFFFF",
  text: "#2C1810",
  textMuted: "#8B6355",
  border: "#E8D5C4",
  success: "#4CAF7C",
  danger: "#E53935",
  warning: "#F59E0B",
};

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n, dec = 2) => `€ ${Number(n).toFixed(dec)}`;
const pct = (n) => `${Number(n).toFixed(1)}%`;
const Badge = ({ color, children }) => {
  const colors = {
    green: { bg: "#E6F4EC", text: C.success },
    red: { bg: "#FDE8E8", text: C.danger },
    orange: { bg: "#FEF3E2", text: C.warning },
    brown: { bg: "#F0E0D0", text: C.brown },
  };
  const s = colors[color] || colors.brown;
  return (
    <span style={{ background: s.bg, color: s.text, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
      {children}
    </span>
  );
};

// ── Sample Data ────────────────────────────────────────────────────────────
const INVOICES = [
  { id: "F-001", supplier: "Molino Rossi", date: "2024-06-01", amount: 340.0, items: 4, status: "Pagata" },
  { id: "F-002", supplier: "Latticini Bianchi", date: "2024-06-03", amount: 185.5, items: 2, status: "In attesa" },
  { id: "F-003", supplier: "Frutta & Co.", date: "2024-06-05", amount: 92.0, items: 6, status: "Pagata" },
  { id: "F-004", supplier: "Dolciaria Sud", date: "2024-06-07", amount: 410.0, items: 8, status: "Scaduta" },
  { id: "F-005", supplier: "Uova Fresche SRL", date: "2024-06-08", amount: 78.0, items: 1, status: "Pagata" },
];

const STOCK = [
  { id: 1, name: "Farina 00", category: "Farine", qty: 45, unit: "kg", minQty: 20, cost: 1.2, supplier: "Molino Rossi" },
  { id: 2, name: "Burro", category: "Latticini", qty: 8, unit: "kg", minQty: 10, cost: 8.5, supplier: "Latticini Bianchi" },
  { id: 3, name: "Zucchero", category: "Dolcificanti", qty: 30, unit: "kg", minQty: 15, cost: 1.1, supplier: "Dolciaria Sud" },
  { id: 4, name: "Uova", category: "Freschi", qty: 120, unit: "pz", minQty: 60, cost: 0.25, supplier: "Uova Fresche SRL" },
  { id: 5, name: "Panna 35%", category: "Latticini", qty: 12, unit: "L", minQty: 8, cost: 3.2, supplier: "Latticini Bianchi" },
  { id: 6, name: "Cacao amaro", category: "Aromi", qty: 3, unit: "kg", minQty: 5, cost: 14.0, supplier: "Dolciaria Sud" },
  { id: 7, name: "Lievito di birra", category: "Lieviti", qty: 2, unit: "kg", minQty: 1, cost: 4.5, supplier: "Molino Rossi" },
  { id: 8, name: "Fragole", category: "Frutta", qty: 6, unit: "kg", minQty: 3, cost: 5.0, supplier: "Frutta & Co." },
];

const RECIPES = [
  { id: 1, name: "Torta Margherita", category: "Torte", portions: 12, costPerPortion: 0.85, salePrice: 2.8, margin: 69.6, time: 60 },
  { id: 2, name: "Cornetto Classico", category: "Lievitati", portions: 20, costPerPortion: 0.42, salePrice: 1.2, margin: 65.0, time: 120 },
  { id: 3, name: "Tiramisù", category: "Dolci al Cucchiaio", portions: 8, costPerPortion: 1.35, salePrice: 4.5, margin: 70.0, time: 30 },
  { id: 4, name: "Croissant Burro", category: "Lievitati", portions: 16, costPerPortion: 0.68, salePrice: 1.8, margin: 62.2, time: 180 },
  { id: 5, name: "Pane di Casa", category: "Pane", portions: 1, costPerPortion: 0.95, salePrice: 3.5, margin: 72.9, time: 90 },
  { id: 6, name: "Torta al Cioccolato", category: "Torte", portions: 10, costPerPortion: 1.1, salePrice: 3.2, margin: 65.6, time: 75 },
];

const PRODUCTION = [
  { id: 1, date: "2024-06-10", recipe: "Cornetto Classico", qty: 80, cost: 33.6, operator: "Marco" },
  { id: 2, date: "2024-06-10", recipe: "Croissant Burro", qty: 40, cost: 27.2, operator: "Lucia" },
  { id: 3, date: "2024-06-10", recipe: "Torta Margherita", qty: 5, cost: 51.0, operator: "Marco" },
  { id: 4, date: "2024-06-09", recipe: "Pane di Casa", qty: 30, cost: 28.5, operator: "Giovanni" },
  { id: 5, date: "2024-06-09", recipe: "Tiramisù", qty: 12, cost: 129.6, operator: "Lucia" },
];

const SALES = [
  { id: 1, date: "2024-06-10", product: "Cornetto Classico", sold: 68, unsold: 12, revenue: 81.6, cost: 33.6, waste: 5.04 },
  { id: 2, date: "2024-06-10", product: "Croissant Burro", sold: 35, unsold: 5, revenue: 63.0, cost: 27.2, waste: 3.4 },
  { id: 3, date: "2024-06-10", product: "Torta Margherita", sold: 4, unsold: 1, revenue: 134.4, cost: 51.0, waste: 10.2 },
  { id: 4, date: "2024-06-09", product: "Pane di Casa", sold: 26, unsold: 4, revenue: 91.0, cost: 28.5, waste: 3.8 },
  { id: 5, date: "2024-06-09", product: "Tiramisù", sold: 10, unsold: 2, revenue: 45.0, cost: 129.6, waste: 16.2 },
];

// ── UI Components ──────────────────────────────────────────────────────────
const Card = ({ children, style, className }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, ...style }} className={className}>
    {children}
  </div>
);

const StatCard = ({ label, value, sub, icon: IconComp, color, trend }) => (
  <Card style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>{label}</span>
      <span style={{ background: color + "20", color, borderRadius: 10, padding: "6px 8px", display: "flex" }}>
        <IconComp size={18} />
      </span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: C.text, fontFamily: "Playfair Display, serif" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: trend === "up" ? C.success : trend === "down" ? C.danger : C.textMuted }}>{sub}</div>}
  </Card>
);

const Table = ({ columns, data, emptyText = "Nessun dato" }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: `2px solid ${C.border}` }}>
          {columns.map((col) => (
            <th key={col.key} style={{ textAlign: "left", padding: "10px 12px", color: C.textMuted, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: 32, color: C.textMuted }}>{emptyText}</td></tr>
        ) : data.map((row, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.cream}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {columns.map((col) => (
              <td key={col.key} style={{ padding: "12px 12px", color: C.text, whiteSpace: "nowrap" }}>
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
    <div>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, fontFamily: "Playfair Display, serif", color: C.text }}>{title}</h1>
      {subtitle && <p style={{ margin: "4px 0 0", color: C.textMuted, fontSize: 14 }}>{subtitle}</p>}
    </div>
    {action && (
      <button onClick={action.onClick} style={{ display: "flex", alignItems: "center", gap: 8, background: C.orange, color: C.white, border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
        <IconPlus size={16} />{action.label}
      </button>
    )}
  </div>
);

// ── Mini Bar Chart ─────────────────────────────────────────────────────────
const MiniBarChart = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", background: color, borderRadius: 4, height: `${(d.value / max) * 64}px`, opacity: i === data.length - 1 ? 1 : 0.5 }} />
          <span style={{ fontSize: 10, color: C.textMuted }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── PAGES ──────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const weekData = [
    { label: "Lun", value: 420 }, { label: "Mar", value: 380 }, { label: "Mer", value: 510 },
    { label: "Gio", value: 460 }, { label: "Ven", value: 590 }, { label: "Sab", value: 720 }, { label: "Dom", value: 680 },
  ];
  const alerts = [
    { type: "danger", text: "Burro sotto scorta minima (8 kg / min 10 kg)" },
    { type: "danger", text: "Cacao amaro sotto scorta minima (3 kg / min 5 kg)" },
    { type: "warning", text: "Fattura F-004 scaduta — Dolciaria Sud € 410" },
  ];
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Panoramica operativa di oggi — 10 Giugno 2024" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Ricavi Oggi" value="€ 370" sub="↑ +12% vs ieri" icon={IconShop} color={C.orange} trend="up" />
        <StatCard label="Margine Medio" value="67.1%" sub="↑ +1.4 pp questa settimana" icon={IconTrend} color={C.success} trend="up" />
        <StatCard label="Prodotti Prodotti" value="137" sub="4 referenze oggi" icon={IconFactory} color={C.brownLight} />
        <StatCard label="Valore Magazzino" value="€ 1.248" sub="↓ 3 articoli in esaurimento" icon={IconBox} color={C.danger} trend="down" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>Ricavi Settimanali</h3>
          <MiniBarChart data={weekData} color={C.orange} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 13, color: C.textMuted }}>
            <span>Totale settimana: <strong style={{ color: C.text }}>€ 3.760</strong></span>
            <span>Media giornaliera: <strong style={{ color: C.text }}>€ 537</strong></span>
          </div>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>Avvisi</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: a.type === "danger" ? "#FDE8E8" : "#FEF3E2", borderRadius: 10 }}>
                <IconAlert size={16} stroke={a.type === "danger" ? C.danger : C.warning} />
                <span style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{a.text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>Top Prodotti per Margine</h3>
          {RECIPES.sort((a, b) => b.margin - a.margin).slice(0, 4).map((r) => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{r.name}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{r.category}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 80, background: C.creamDark, borderRadius: 4, height: 6 }}>
                  <div style={{ width: `${r.margin}%`, background: C.orange, borderRadius: 4, height: 6 }} />
                </div>
                <span style={{ fontWeight: 700, color: C.brown, fontSize: 14, minWidth: 44 }}>{pct(r.margin)}</span>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>Produzione di Oggi</h3>
          {PRODUCTION.filter(p => p.date === "2024-06-10").map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{p.recipe}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>Op. {p.operator}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: C.text }}>{p.qty} pz</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{fmt(p.cost)}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

const Fatture = () => {
  const [filter, setFilter] = useState("Tutti");
  const statuses = ["Tutti", "Pagata", "In attesa", "Scaduta"];
  const filtered = filter === "Tutti" ? INVOICES : INVOICES.filter(f => f.status === filter);
  const total = INVOICES.reduce((s, f) => s + f.amount, 0);
  const pending = INVOICES.filter(f => f.status === "In attesa").reduce((s, f) => s + f.amount, 0);
  const overdue = INVOICES.filter(f => f.status === "Scaduta").reduce((s, f) => s + f.amount, 0);

  const statusColor = { "Pagata": "green", "In attesa": "orange", "Scaduta": "red" };
  const cols = [
    { key: "id", label: "N° Fattura" },
    { key: "supplier", label: "Fornitore" },
    { key: "date", label: "Data" },
    { key: "items", label: "Articoli", render: v => `${v} voci` },
    { key: "amount", label: "Importo", render: v => <strong>{fmt(v)}</strong> },
    { key: "status", label: "Stato", render: v => <Badge color={statusColor[v]}>{v}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Fatture Fornitori" subtitle="Gestisci e monitora le fatture di acquisto" action={{ label: "Nuova Fattura", onClick: () => {} }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Totale Fatturato (mese)" value={fmt(total, 0)} icon={IconFile} color={C.brown} />
        <StatCard label="In Attesa di Pagamento" value={fmt(pending, 0)} sub="1 fattura" icon={IconAlert} color={C.warning} />
        <StatCard label="Fatture Scadute" value={fmt(overdue, 0)} sub="Attenzione richiesta" icon={IconAlert} color={C.danger} trend="down" />
      </div>
      <Card>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "6px 16px", borderRadius: 20, border: `1px solid ${filter === s ? C.orange : C.border}`, background: filter === s ? C.orange : "transparent", color: filter === s ? C.white : C.textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {s}
            </button>
          ))}
        </div>
        <Table columns={cols} data={filtered} />
      </Card>
    </div>
  );
};

const Magazzino = () => {
  const [search, setSearch] = useState("");
  const filtered = STOCK.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));
  const totalValue = STOCK.reduce((s, i) => s + i.qty * i.cost, 0);
  const lowStock = STOCK.filter(i => i.qty <= i.minQty);

  const cols = [
    { key: "name", label: "Ingrediente", render: (v, r) => <div><div style={{ fontWeight: 600 }}>{v}</div><div style={{ fontSize: 12, color: C.textMuted }}>{r.supplier}</div></div> },
    { key: "category", label: "Categoria", render: v => <Badge color="brown">{v}</Badge> },
    { key: "qty", label: "Quantità", render: (v, r) => (
      <span style={{ color: v <= r.minQty ? C.danger : C.text, fontWeight: v <= r.minQty ? 700 : 400 }}>{v} {r.unit}</span>
    )},
    { key: "minQty", label: "Scorta Min.", render: (v, r) => `${v} ${r.unit}` },
    { key: "cost", label: "Costo Unit.", render: v => fmt(v) },
    { key: "id", label: "Val. Stock", render: (_, r) => <strong>{fmt(r.qty * r.cost)}</strong> },
    { key: "qty", label: "Stato", render: (v, r) => v <= r.minQty ? <Badge color="red">Esaurimento</Badge> : <Badge color="green">OK</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Magazzino Ingredienti" subtitle="Monitora scorte e valore del magazzino" action={{ label: "Carico Merce", onClick: () => {} }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Valore Totale Magazzino" value={fmt(totalValue, 0)} icon={IconBox} color={C.brown} />
        <StatCard label="Articoli Totali" value={STOCK.length} icon={IconBox} color={C.orange} />
        <StatCard label="Articoli in Esaurimento" value={lowStock.length} sub={lowStock.map(i => i.name).join(", ")} icon={IconAlert} color={C.danger} />
      </div>
      <Card>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca ingrediente o categoria…"
          style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, marginBottom: 20, outline: "none", background: C.cream, boxSizing: "border-box" }} />
        <Table columns={cols} data={filtered} />
      </Card>
    </div>
  );
};

const Ricette = () => {
  const [selected, setSelected] = useState(null);
  const avgMargin = (RECIPES.reduce((s, r) => s + r.margin, 0) / RECIPES.length).toFixed(1);

  const cols = [
    { key: "name", label: "Ricetta", render: (v, r) => <div><div style={{ fontWeight: 600 }}>{v}</div><div style={{ fontSize: 12, color: C.textMuted }}>{r.time} min</div></div> },
    { key: "category", label: "Categoria", render: v => <Badge color="brown">{v}</Badge> },
    { key: "portions", label: "Porzioni" },
    { key: "costPerPortion", label: "Costo/pz", render: v => fmt(v) },
    { key: "salePrice", label: "Prezzo Vendita", render: v => <strong>{fmt(v)}</strong> },
    { key: "margin", label: "Margine", render: v => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 60, background: C.creamDark, borderRadius: 4, height: 6 }}>
          <div style={{ width: `${v}%`, background: v >= 65 ? C.success : C.warning, borderRadius: 4, height: 6 }} />
        </div>
        <span style={{ fontWeight: 700, color: v >= 65 ? C.success : C.warning }}>{pct(v)}</span>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Ricettario" subtitle="Gestisci ricette e analizza i costi di produzione" action={{ label: "Nuova Ricetta", onClick: () => {} }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Ricette Attive" value={RECIPES.length} icon={IconBook} color={C.brown} />
        <StatCard label="Margine Medio" value={pct(avgMargin)} sub="Tutte le ricette" icon={IconTrend} color={C.success} />
        <StatCard label="Ricetta Top" value="Pane di Casa" sub="Margine 72.9%" icon={IconChart} color={C.orange} />
      </div>
      <Card>
        <Table columns={cols} data={RECIPES} />
      </Card>
    </div>
  );
};

const Produzione = () => {
  const [date, setDate] = useState("2024-06-10");
  const filtered = PRODUCTION.filter(p => p.date === date);
  const totalCost = filtered.reduce((s, p) => s + p.cost, 0);
  const totalQty = filtered.reduce((s, p) => s + p.qty, 0);

  const cols = [
    { key: "recipe", label: "Prodotto", render: v => <strong>{v}</strong> },
    { key: "qty", label: "Quantità", render: v => `${v} pz` },
    { key: "cost", label: "Costo Produzione", render: v => fmt(v) },
    { key: "operator", label: "Operatore", render: v => <Badge color="brown">{v}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Registra Produzione" subtitle="Inserisci la produzione giornaliera per turno" action={{ label: "Aggiungi Lotto", onClick: () => {} }} />
      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
        <span style={{ fontSize: 14, color: C.textMuted, fontWeight: 500 }}>Data:</span>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.cream, cursor: "pointer" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Lotti Prodotti" value={filtered.length} icon={IconFactory} color={C.brown} />
        <StatCard label="Totale Pezzi" value={totalQty} icon={IconBox} color={C.orange} />
        <StatCard label="Costo Totale" value={fmt(totalCost)} icon={IconFile} color={C.brownLight} />
      </div>
      <Card>
        {filtered.length === 0
          ? <div style={{ textAlign: "center", padding: 48, color: C.textMuted }}>Nessuna produzione registrata per questa data.</div>
          : <Table columns={cols} data={filtered} />
        }
      </Card>
    </div>
  );
};

const Vendite = () => {
  const cols = [
    { key: "date", label: "Data" },
    { key: "product", label: "Prodotto", render: v => <strong>{v}</strong> },
    { key: "sold", label: "Venduti", render: v => <span style={{ color: C.success, fontWeight: 700 }}>{v}</span> },
    { key: "unsold", label: "Invenduto", render: v => <span style={{ color: v > 0 ? C.danger : C.success, fontWeight: 700 }}>{v}</span> },
    { key: "revenue", label: "Ricavi", render: v => fmt(v) },
    { key: "cost", label: "Costo", render: v => fmt(v) },
    { key: "waste", label: "Scarto €", render: v => <span style={{ color: C.danger }}>{fmt(v)}</span> },
    { key: "revenue", label: "Margine", render: (v, r) => {
      const m = ((v - r.cost) / v) * 100;
      return <span style={{ color: m > 50 ? C.success : C.warning, fontWeight: 700 }}>{pct(m)}</span>;
    }},
  ];

  const totalRevenue = SALES.reduce((s, v) => s + v.revenue, 0);
  const totalWaste = SALES.reduce((s, v) => s + v.waste, 0);
  const totalCost = SALES.reduce((s, v) => s + v.cost, 0);
  const overallMargin = ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1);

  return (
    <div>
      <PageHeader title="Vendite & Invenduto" subtitle="Analizza le vendite giornaliere e gli sprechi" action={{ label: "Registra Vendite", onClick: () => {} }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Ricavi Totali" value={fmt(totalRevenue)} icon={IconShop} color={C.orange} trend="up" />
        <StatCard label="Costi Totali" value={fmt(totalCost)} icon={IconFile} color={C.brownLight} />
        <StatCard label="Margine Complessivo" value={pct(overallMargin)} icon={IconTrend} color={C.success} />
        <StatCard label="Valore Sprechi" value={fmt(totalWaste)} sub="Da ottimizzare" icon={IconAlert} color={C.danger} trend="down" />
      </div>
      <Card>
        <Table columns={cols} data={SALES} />
      </Card>
    </div>
  );
};

const Report = () => {
  const [period, setPeriod] = useState("Giornaliero");
  const periods = ["Giornaliero", "Settimanale", "Mensile"];
  const reportData = [
    { metric: "Ricavi Totali", value: "€ 415", change: "+12%", trend: "up" },
    { metric: "Costo Produzione", value: "€ 136", change: "-3%", trend: "down" },
    { metric: "Margine Lordo", value: "€ 279", change: "+18%", trend: "up" },
    { metric: "Margine %", value: "67.2%", change: "+1.4 pp", trend: "up" },
    { metric: "Invenduto", value: "€ 38", change: "+5%", trend: "down" },
    { metric: "Pezzi Prodotti", value: "195", change: "0%", trend: "neutral" },
    { metric: "Pezzi Venduti", value: "168", change: "+8%", trend: "up" },
    { metric: "Tasso Vendita", value: "86.2%", change: "+2 pp", trend: "up" },
  ];

  const weekBar = [
    { label: "L", value: 320 }, { label: "M", value: 280 }, { label: "M", value: 410 },
    { label: "G", value: 360 }, { label: "V", value: 480 }, { label: "S", value: 620 }, { label: "D", value: 580 },
  ];

  return (
    <div>
      <PageHeader title="Report & Analisi" subtitle="Monitora performance, margini e sprechi nel tempo" />
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {periods.map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{ padding: "8px 20px", borderRadius: 20, border: `1px solid ${period === p ? C.orange : C.border}`, background: period === p ? C.orange : "transparent", color: period === p ? C.white : C.textMuted, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            {p}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {reportData.map(r => (
          <Card key={r.metric} style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 500, marginBottom: 4 }}>{r.metric}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "Playfair Display, serif" }}>{r.value}</div>
            <div style={{ fontSize: 12, color: r.trend === "up" ? C.success : r.trend === "down" ? C.danger : C.textMuted, fontWeight: 600, marginTop: 4 }}>
              {r.trend === "up" ? "↑ " : r.trend === "down" ? "↓ " : ""}{r.change}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>Ricavi per Giorno</h3>
          <MiniBarChart data={weekBar} color={C.orange} />
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>Spread Margini per Prodotto</h3>
          {RECIPES.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: C.text, minWidth: 140 }}>{r.name}</span>
              <div style={{ flex: 1, background: C.creamDark, borderRadius: 4, height: 8 }}>
                <div style={{ width: `${r.margin}%`, background: r.margin >= 65 ? C.success : C.warning, borderRadius: 4, height: 8 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.brown, minWidth: 44 }}>{pct(r.margin)}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

const Impostazioni = () => {
  const sections = [
    { title: "Dati Aziendali", fields: [
      { label: "Nome Pasticceria", value: "Pasticceria Conti" },
      { label: "P.IVA", value: "01234567890" },
      { label: "Indirizzo", value: "Via Roma 14, Milano" },
      { label: "Email", value: "info@pasticceriaconti.it" },
    ]},
    { title: "Parametri Produzione", fields: [
      { label: "Ricarico Default (%)", value: "200" },
      { label: "Ore Turno Mattutino", value: "04:00 - 12:00" },
      { label: "Valuta", value: "EUR (€)" },
      { label: "Soglia Scarto Allerta (%)", value: "15" },
    ]},
  ];

  return (
    <div>
      <PageHeader title="Impostazioni" subtitle="Configura la tua pasticceria e i parametri di sistema" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {sections.map(sec => (
          <Card key={sec.title}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: C.text }}>{sec.title}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {sec.fields.map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 4 }}>{f.label}</label>
                  <input defaultValue={f.value} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.cream, boxSizing: "border-box", color: C.text }} />
                </div>
              ))}
            </div>
            <button style={{ marginTop: 20, padding: "10px 20px", background: C.orange, color: C.white, border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
              Salva Modifiche
            </button>
          </Card>
        ))}
        <Card>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: C.text }}>Fornitori</h3>
          {["Molino Rossi", "Latticini Bianchi", "Frutta & Co.", "Dolciaria Sud", "Uova Fresche SRL"].map(s => (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 14, color: C.text }}>{s}</span>
              <button style={{ fontSize: 12, color: C.orange, background: "none", border: `1px solid ${C.orange}`, borderRadius: 8, padding: "4px 12px", cursor: "pointer" }}>Modifica</button>
            </div>
          ))}
          <button style={{ marginTop: 16, width: "100%", padding: "10px", border: `2px dashed ${C.border}`, background: "none", borderRadius: 10, color: C.textMuted, cursor: "pointer", fontSize: 14 }}>
            + Aggiungi Fornitore
          </button>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: C.text }}>Operatori</h3>
          {[{ name: "Marco Bianchi", role: "Maestro Pasticcere" }, { name: "Lucia Ferri", role: "Pasticcera" }, { name: "Giovanni Rossi", role: "Fornaio" }].map(op => (
            <div key={op.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{op.name}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{op.role}</div>
              </div>
              <Badge color="brown">{op.role.split(" ")[0]}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ── NAV CONFIG ─────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: IconGrid, page: Dashboard },
  { id: "fatture", label: "Fatture", icon: IconFile, page: Fatture },
  { id: "magazzino", label: "Magazzino", icon: IconBox, page: Magazzino },
  { id: "ricette", label: "Ricette", icon: IconBook, page: Ricette },
  { id: "produzione", label: "Produzione", icon: IconFactory, page: Produzione },
  { id: "vendite", label: "Vendite", icon: IconShop, page: Vendite },
  { id: "report", label: "Report", icon: IconChart, page: Report },
  { id: "impostazioni", label: "Impostazioni", icon: IconGear, page: Impostazioni },
];

// ── APP ────────────────────────────────────────────────────────────────────
export default function App() {
    useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from("recipes").select("*");
      console.log("SUPABASE DATA:", data);
      console.log("SUPABASE ERROR:", error);
    }

    testConnection();
  }, []);

  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const current = NAV.find(n => n.id === active);
  const PageComponent = current.page;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: ${C.cream}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* Sidebar */}
        <aside style={{
          width: collapsed ? 68 : 220,
          minHeight: "100vh",
          background: `linear-gradient(180deg, ${C.brown} 0%, #4A2A0E 100%)`,
          display: "flex", flexDirection: "column",
          transition: "width .25s ease",
          flexShrink: 0,
          position: "sticky", top: 0, height: "100vh",
        }}>
          {/* Logo */}
          <div style={{ padding: collapsed ? "24px 14px" : "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
            <div style={{ width: 36, height: 36, background: C.orange, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
              🥐
            </div>
            {!collapsed && (
              <div>
                <div style={{ color: C.white, fontWeight: 700, fontSize: 16, fontFamily: "Playfair Display, serif", lineHeight: 1.1 }}>BakeControl</div>
                <div style={{ color: C.orangeLight, fontSize: 11, marginTop: 2 }}>Gestione Pasticceria</div>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV.map(item => {
              const isActive = active === item.id;
              return (
                <button key={item.id} onClick={() => setActive(item.id)} title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: collapsed ? "10px 14px" : "10px 14px",
                    borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", width: "100%",
                    background: isActive ? C.orange : "transparent",
                    color: isActive ? C.white : "rgba(255,255,255,0.65)",
                    transition: "all .15s",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                  <item.icon size={18} />
                  {!collapsed && <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, whiteSpace: "nowrap" }}>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Collapse Toggle */}
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ margin: "8px", padding: "10px", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", justifyContent: "center" }}>
            <IconChevron dir={collapsed ? "right" : "right"} size={16} stroke="rgba(255,255,255,0.5)" />
          </button>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Top bar */}
          <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: C.textMuted }}>BakeControl</span>
              <span style={{ color: C.border }}>›</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{current.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 13, color: C.textMuted }}>Lunedì, 10 Giugno 2024</div>
              <div style={{ width: 36, height: 36, background: C.orange, borderRadius: 50, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 700, fontSize: 14 }}>MC</div>
            </div>
          </header>

          {/* Page Content */}
          <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
            <PageComponent />
          </main>
        </div>
      </div>
    </>
  );
}
