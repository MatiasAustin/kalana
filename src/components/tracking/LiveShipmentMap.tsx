"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, 
  MapPin, 
  Navigation, 
  RotateCcw, 
  ShieldCheck, 
  Coffee, 
  Compass, 
  CheckCircle2, 
  Clock,
  Layers,
  Sparkles,
  ExternalLink
} from "lucide-react";

interface LiveShipmentMapProps {
  shippingStatus: string; // 'PENDING' | 'PROCESSED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
  courier?: string | null;
  courierService?: string | null;
  trackingNumber?: string | null;
  currentLocation?: string | null;
  estimatedDeliveryDate?: string | null;
  originCity?: string;
  destinationCity?: string;
  destinationAddress?: string;
  isRealtimeBiteship?: boolean;
  biteshipTrackingPortalUrl?: string | null;
}

// Coordinates lookup dictionary for Indonesian cities
const INDONESIA_COORDINATES: Record<string, { x: number; y: number; label: string }> = {
  // Java West & Jabodetabek
  cikampek: { x: 380, y: 250, label: "KALANA Roastery (Cikampek)" },
  karawang: { x: 370, y: 245, label: "Karawang" },
  purwakarta: { x: 375, y: 265, label: "Purwakarta" },
  subang: { x: 410, y: 255, label: "Subang" },
  majalengka: { x: 440, y: 275, label: "Majalengka" },
  cirebon: { x: 470, y: 260, label: "Cirebon" },
  indramayu: { x: 445, y: 240, label: "Indramayu" },
  kuningan: { x: 475, y: 285, label: "Kuningan" },
  sumedang: { x: 425, y: 285, label: "Sumedang" },
  bandung: { x: 400, y: 300, label: "Bandung" },
  cimahi: { x: 395, y: 295, label: "Cimahi" },
  garut: { x: 415, y: 320, label: "Garut" },
  tasikmalaya: { x: 440, y: 320, label: "Tasikmalaya" },
  ciamis: { x: 455, y: 325, label: "Ciamis" },
  banjar: { x: 470, y: 330, label: "Banjar" },
  pangandaran: { x: 475, y: 350, label: "Pangandaran" },
  cianjur: { x: 355, y: 285, label: "Cianjur" },
  sukabumi: { x: 330, y: 300, label: "Sukabumi" },
  bogor: { x: 315, y: 265, label: "Bogor" },
  depok: { x: 320, y: 245, label: "Depok" },
  bekasi: { x: 345, y: 235, label: "Bekasi" },
  jakarta: { x: 320, y: 220, label: "DKI Jakarta" },
  tangerang: { x: 295, y: 225, label: "Tangerang" },
  serang: { x: 260, y: 215, label: "Serang" },
  cilegon: { x: 250, y: 210, label: "Cilegon" },
  pandeglang: { x: 255, y: 235, label: "Pandeglang" },
  lebak: { x: 265, y: 245, label: "Lebak" },

  // Java Central & East
  semarang: { x: 550, y: 280, label: "Semarang" },
  solo: { x: 570, y: 320, label: "Surakarta / Solo" },
  surakarta: { x: 570, y: 320, label: "Surakarta / Solo" },
  yogyakarta: { x: 540, y: 340, label: "DI Yogyakarta" },
  jogja: { x: 540, y: 340, label: "DI Yogyakarta" },
  surabaya: { x: 680, y: 300, label: "Surabaya" },
  malang: { x: 670, y: 340, label: "Malang" },
  sidoarjo: { x: 685, y: 310, label: "Sidoarjo" },
  banyuwangi: { x: 760, y: 340, label: "Banyuwangi" },

  // Bali & Nusa Tenggara
  denpasar: { x: 800, y: 360, label: "Denpasar, Bali" },
  bali: { x: 800, y: 360, label: "Bali" },
  mataram: { x: 840, y: 370, label: "Lombok" },

  // Sumatra
  lampung: { x: 260, y: 190, label: "Bandar Lampung" },
  palembang: { x: 230, y: 120, label: "Palembang" },
  medan: { x: 130, y: 30, label: "Medan" },
  padang: { x: 150, y: 95, label: "Padang" },
  pekanbaru: { x: 180, y: 70, label: "Pekanbaru" },
  batam: { x: 240, y: 55, label: "Batam" },

  // Kalimantan & Sulawesi
  pontianak: { x: 380, y: 80, label: "Pontianak" },
  banjarmasin: { x: 580, y: 170, label: "Banjarmasin" },
  balikpapan: { x: 640, y: 130, label: "Balikpapan" },
  samarinda: { x: 650, y: 110, label: "Samarinda" },
  makassar: { x: 740, y: 220, label: "Makassar" },
  manado: { x: 830, y: 40, label: "Manado" },
};

function resolveCoordinates(cityStr?: string | null): { x: number; y: number; label: string } {
  if (!cityStr) return { x: 320, y: 220, label: "DKI Jakarta" };
  const lower = cityStr.toLowerCase().trim();

  for (const [key, coord] of Object.entries(INDONESIA_COORDINATES)) {
    if (lower.includes(key) && key !== "cikampek") {
      return { ...coord, label: cityStr };
    }
  }

  // Default to Jakarta if not specifically mapped
  return { x: 320, y: 220, label: cityStr };
}

export function LiveShipmentMap({
  shippingStatus = "IN_TRANSIT",
  courier = "JNE Express",
  courierService = "Reguler",
  trackingNumber,
  currentLocation,
  estimatedDeliveryDate,
  destinationCity = "Jakarta Selatan",
  destinationAddress,
  isRealtimeBiteship = false,
  biteshipTrackingPortalUrl,
}: LiveShipmentMapProps) {
  const origin = INDONESIA_COORDINATES.cikampek;
  const destination = resolveCoordinates(destinationCity);

  // Status to Progress Percentage
  const getProgressByStatus = (status: string): number => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return 0.05;
      case "PROCESSED":
        return 0.15;
      case "PICKED_UP":
        return 0.35;
      case "IN_TRANSIT":
        return 0.65;
      case "OUT_FOR_DELIVERY":
        return 0.88;
      case "DELIVERED":
        return 1.0;
      default:
        return 0.5;
    }
  };

  const targetProgress = getProgressByStatus(shippingStatus);
  const [currentProgress, setCurrentProgress] = useState(targetProgress);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mapTheme, setMapTheme] = useState<"dark" | "editorial">("dark");

  useEffect(() => {
    setCurrentProgress(targetProgress);
  }, [targetProgress]);

  // Curve control point (creates elegant arc between origin and destination)
  const midX = (origin.x + destination.x) / 2;
  const midY = Math.min(origin.y, destination.y) - 60;

  // Quadratic Bezier Calculation: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
  const getPositionOnCurve = (t: number) => {
    const inv = 1 - t;
    const x = inv * inv * origin.x + 2 * inv * t * midX + t * t * destination.x;
    const y = inv * inv * origin.y + 2 * inv * t * midY + t * t * destination.y;

    // Derivative to calculate tangent angle for car rotation
    const dx = 2 * inv * (midX - origin.x) + 2 * t * (destination.x - midX);
    const dy = 2 * inv * (midY - origin.y) + 2 * t * (destination.y - midY);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return { x, y, angle };
  };

  const vehicle = getPositionOnCurve(currentProgress);

  // Replay Trip Animation
  const handleReplay = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setCurrentProgress(0.05);

    let progress = 0.05;
    const interval = setInterval(() => {
      progress += 0.015;
      if (progress >= targetProgress) {
        progress = targetProgress;
        clearInterval(interval);
        setIsSimulating(false);
      }
      setCurrentProgress(progress);
    }, 40);
  };

  // Status Styling Badge
  const getStatusBadge = () => {
    switch (shippingStatus.toUpperCase()) {
      case "DELIVERED":
        return { label: "Paket Telah Tiba", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      case "OUT_FOR_DELIVERY":
        return { label: "Sedang Diantar Kurir", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
      case "IN_TRANSIT":
        return { label: "Dalam Perjalanan", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" };
      case "PICKED_UP":
        return { label: "Diserahkan ke Kurir", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" };
      case "PROCESSED":
        return { label: "Dikemas di Roastery", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" };
      default:
        return { label: "Menunggu Pengiriman", color: "bg-gray-500/20 text-gray-300 border-gray-500/40" };
    }
  };

  const badge = getStatusBadge();
  const pathD = `M ${origin.x} ${origin.y} Q ${midX} ${midY} ${destination.x} ${destination.y}`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-kalana-black/20 shadow-2xl bg-[#0d0f12] text-white">
      
      {/* Top Map Header Bar */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-[#14171d]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide uppercase font-mono">
                {courier || "Ekspedisi Indonesia"}
              </span>
              {courierService && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70 font-mono">
                  {courierService}
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 font-mono">
              Resi / AWB: <span className="text-white/90 font-semibold">{trackingNumber || "Belum Diterbitkan"}</span>
            </p>
          </div>
        </div>

        {/* Live Status Pill & Replay Button */}
        <div className="flex items-center gap-2">
          {isRealtimeBiteship ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Biteship Realtime
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono text-white/50 bg-white/5 border border-white/10">
              Biteship Radar
            </span>
          )}

          {biteshipTrackingPortalUrl && (
            <a
              href={biteshipTrackingPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-mono text-white/70 hover:text-white px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              title="Buka pelacakan resmi di track.biteship.com"
            >
              <span>Biteship Track</span>
              <ExternalLink className="w-3 h-3 text-white/50" />
            </a>
          )}

          <span className={`text-xs px-3 py-1 rounded-full border font-semibold tracking-wider uppercase flex items-center gap-1.5 ${badge.color}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {badge.label}
          </span>

          <button
            type="button"
            onClick={handleReplay}
            disabled={isSimulating}
            title="Putar Ulang Animasi Perjalanan"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-colors disabled:opacity-40"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Interactive Map Visual Area */}
      <div className="relative w-full aspect-[16/9] min-h-[360px] sm:min-h-[440px] bg-[#090b0e] overflow-hidden select-none">
        
        {/* Subtle Map Grid & Topographic Radar Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: `36px 36px`
          }}
        />

        {/* Realistic Indonesia Regional Island Silhouette Guides */}
        <svg
          viewBox="0 0 950 480"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Glowing route gradient */}
            <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>

            <filter id="neonPulse" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Stylized Island Mass (Java & Sunda Region Contour Outline) */}
          <g opacity="0.12" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
            {/* Java Outline Representation */}
            <path d="M 270 210 Q 350 200 480 230 Q 620 250 780 290 Q 770 340 680 340 Q 520 330 380 310 Q 280 290 270 210 Z" />
            {/* Southern Sumatra fragment */}
            <path d="M 120 40 Q 210 100 270 190 Q 230 210 150 140 Z" />
            {/* Bali fragment */}
            <path d="M 790 320 Q 820 310 830 340 Q 800 360 790 320 Z" />
          </g>

          {/* Planned Delivery Trajectory Line (Dashed Base) */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {/* Active Travel Progress Glow Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#routeGlow)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#neonPulse)"
            strokeDasharray="950"
            strokeDashoffset={950 * (1 - currentProgress)}
            style={{ transition: "stroke-dashoffset 0.1s linear" }}
          />

          {/* 1. Origin Marker (KALANA Roastery Cikampek) */}
          <g transform={`translate(${origin.x}, ${origin.y})`}>
            {/* Pulse wave */}
            <circle r="18" fill="rgba(212, 175, 55, 0.25)" className="animate-ping" />
            <circle r="10" fill="#14171d" stroke="#d4af37" strokeWidth="2.5" />
            <circle r="4" fill="#d4af37" />
          </g>

          {/* 2. Destination Marker (Customer Address) */}
          <g transform={`translate(${destination.x}, ${destination.y})`}>
            {/* Target pulse wave */}
            <circle r="22" fill="rgba(16, 185, 129, 0.2)" className="animate-pulse" />
            <circle r="11" fill="#14171d" stroke="#10b981" strokeWidth="2.5" />
            <circle r="4" fill="#10b981" />
          </g>

          {/* 3. Dynamic Moving Delivery Van Pin */}
          <g
            transform={`translate(${vehicle.x}, ${vehicle.y})`}
            style={{
              transition: isSimulating ? "none" : "transform 0.4s ease-out",
            }}
          >
            {/* Rotating Radar Beacon */}
            <circle r="24" fill="rgba(56, 189, 248, 0.15)" className="animate-pulse" />
            <circle r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />

            {/* Van Icon on map */}
            <g transform="translate(-8, -8)">
              <Truck className="w-4 h-4 text-cyan-300" />
            </g>

            {/* Floating Tag over moving vehicle */}
            <g transform="translate(0, -28)">
              <rect
                x="-50"
                y="-10"
                width="100"
                height="20"
                rx="10"
                fill="#0f172a"
                stroke="rgba(56, 189, 248, 0.7)"
                strokeWidth="1.2"
              />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {courier ? courier.split(" ")[0] : "KURIR"} • {Math.round(currentProgress * 100)}%
              </text>
            </g>
          </g>
        </svg>

        {/* Origin Pill (Overlay) */}
        <div 
          className="absolute text-[11px] font-mono font-medium px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-[#d4af37]/40 text-amber-200 shadow-lg pointer-events-none"
          style={{
            left: `calc(${(origin.x / 950) * 100}% - 70px)`,
            top: `calc(${(origin.y / 480) * 100}% + 20px)`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <Coffee className="w-3 h-3 text-[#d4af37]" />
            <span>KALANA Roastery</span>
          </div>
          <span className="text-[9px] text-white/50 block">Cikampek Hub</span>
        </div>

        {/* Destination Pill (Overlay) */}
        <div 
          className="absolute text-[11px] font-mono font-medium px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-emerald-500/40 text-emerald-200 shadow-lg pointer-events-none"
          style={{
            left: `calc(${(destination.x / 950) * 100}% - 60px)`,
            top: `calc(${(destination.y / 480) * 100}% + 20px)`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span className="truncate max-w-[120px]">{destination.label}</span>
          </div>
          <span className="text-[9px] text-white/50 block">Alamat Penerima</span>
        </div>

        {/* Compass & Scale Overlay Bottom Left */}
        <div className="absolute bottom-4 left-4 p-2.5 rounded-lg bg-[#14171d]/85 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/60 space-y-1">
          <div className="flex items-center gap-1.5 text-white/80 font-bold">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>RADAR PENGIRIMAN LIVE</span>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span>Asal: Cikampek</span>
            <span>&rarr;</span>
            <span>Tujuan: {destination.label}</span>
          </div>
        </div>

        {/* Live Trip Status Overlay Bottom Right */}
        <div className="absolute bottom-4 right-4 p-3 rounded-lg bg-[#14171d]/90 backdrop-blur-md border border-white/10 text-right font-mono space-y-0.5">
          <span className="text-[10px] text-white/50 uppercase tracking-wider block">Lokasi Terakhir</span>
          <span className="text-xs font-bold text-white block">
            {currentLocation || (shippingStatus === "DELIVERED" ? "Diterima di Alamat" : "Dalam Rute Ekspedisi")}
          </span>
          {estimatedDeliveryDate && (
            <span className="text-[10px] text-emerald-400 block pt-0.5">
              Estimasi Tiba: {estimatedDeliveryDate}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Progress Bar & Milestones */}
      <div className="p-4 sm:p-6 bg-[#14171d] border-t border-white/10 space-y-4">
        <div className="flex justify-between items-center text-xs font-mono text-white/70">
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            Progress Pengantaran: <strong className="text-white font-bold">{Math.round(currentProgress * 100)}%</strong>
          </span>
          <span className="text-[11px] text-white/50">
            {shippingStatus === "DELIVERED" ? "Status: Selesai" : "Status: Aktif"}
          </span>
        </div>

        {/* Custom Progress Track */}
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 rounded-full"
            style={{ width: `${currentProgress * 100}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </div>

        {/* 5-Step Visual Checkpoints */}
        <div className="grid grid-cols-5 gap-1 text-center pt-1 font-mono">
          {[
            { step: "Dikemas", active: currentProgress >= 0.15 },
            { step: "Di Pick-up", active: currentProgress >= 0.35 },
            { step: "In Transit", active: currentProgress >= 0.65 },
            { step: "Diantar", active: currentProgress >= 0.88 },
            { step: "Terkirim", active: currentProgress >= 1.0 },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full mb-1 transition-colors ${
                  item.active ? "bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" : "bg-white/20"
                }`}
              />
              <span
                className={`text-[9px] sm:text-[10px] leading-tight ${
                  item.active ? "text-white font-bold" : "text-white/40"
                }`}
              >
                {item.step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
