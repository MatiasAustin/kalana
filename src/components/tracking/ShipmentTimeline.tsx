"use client";

import { useState } from "react";
import { 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  Calendar,
  AlertCircle
} from "lucide-react";

interface TimelineItem {
  id: string;
  timestamp: string;
  status: string;
  title: string;
  location?: string;
  note?: string;
}

interface ShipmentTimelineProps {
  courier?: string | null;
  courierService?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippingStatus?: string;
  estimatedDeliveryDate?: string | null;
  history?: TimelineItem[];
  destinationCity?: string;
  destinationAddress?: string;
  isRealtimeBiteship?: boolean;
  biteshipTrackingPortalUrl?: string | null;
  biteshipDriver?: {
    name?: string;
    phone?: string;
    photoUrl?: string;
    vehicle?: string;
  } | null;
}

export function ShipmentTimeline({
  courier,
  courierService,
  trackingNumber,
  trackingUrl,
  shippingStatus = "PENDING",
  estimatedDeliveryDate,
  history = [],
  destinationCity,
  destinationAddress,
  isRealtimeBiteship = false,
  biteshipTrackingPortalUrl,
  biteshipDriver,
}: ShipmentTimelineProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyResi = () => {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-kalana-black/15 rounded-xl p-4 sm:p-8 space-y-6 sm:space-y-8 shadow-sm">
      
      {/* Courier & AWB Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-kalana-offwhite/80 border border-kalana-black/10 rounded-lg">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-kalana-black/50 block mb-1">
            Jasa Kirim & Layanan
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base uppercase text-kalana-black font-mono">
              {courier || "Menunggu Kurir"}
            </span>
            {courierService && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-black text-white font-mono uppercase">
                {courierService}
              </span>
            )}
          </div>
          {estimatedDeliveryDate && (
            <p className="text-xs text-emerald-700 font-mono mt-1 font-medium">
              Estimasi Tiba: {estimatedDeliveryDate}
            </p>
          )}
        </div>

        {/* Resi & Action Buttons */}
        {trackingNumber ? (
          <div className="flex flex-col sm:items-end gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-kalana-black/50">
              Nomor Resi / AWB
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sm bg-white px-3 py-1.5 border border-kalana-black/20 rounded">
                {trackingNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyResi}
                className="p-2 border border-kalana-black/20 hover:border-black rounded bg-white hover:bg-gray-50 text-kalana-black transition-colors"
                title="Salin Nomor Resi"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-gray-800 rounded text-xs font-semibold uppercase tracking-wider transition-colors font-mono"
                  title="Cek di Biteship Tracking"
                >
                  <span>Biteship Track</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-right">
            <span className="text-xs text-kalana-black/50 italic">Nomor resi sedang diproses</span>
          </div>
        )}
      </div>

      {/* Realtime Biteship Connected Banner */}
      {isRealtimeBiteship && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-lg text-xs text-emerald-900 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terhubung ke <strong>Biteship Realtime Tracking Engine</strong></span>
          </div>
          {biteshipTrackingPortalUrl && (
            <a
              href={biteshipTrackingPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold underline flex items-center gap-1"
            >
              track.biteship.com <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Driver Info Card (if assigned by courier/Biteship) */}
      {biteshipDriver && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {biteshipDriver.photoUrl ? (
              <img
                src={biteshipDriver.photoUrl}
                alt={biteshipDriver.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-kalana-black text-white flex items-center justify-center font-bold text-xs font-mono">
                {biteshipDriver.name?.[0] || "K"}
              </div>
            )}
            <div>
              <span className="font-bold text-sm block font-sans text-gray-900">
                {biteshipDriver.name}
              </span>
              <span className="text-gray-500 text-[11px] block font-mono">
                {biteshipDriver.vehicle || "Kurir Pengantar Ekspedisi"}
              </span>
            </div>
          </div>
          {biteshipDriver.phone && (
            <a
              href={`tel:${biteshipDriver.phone}`}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded font-mono text-[11px] text-gray-700 hover:bg-gray-100"
            >
              Hubungi: {biteshipDriver.phone}
            </a>
          )}
        </div>
      )}

      {/* Destination Summary */}
      {(destinationCity || destinationAddress) && (
        <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-lg text-xs">
          <MapPin className="w-4 h-4 text-kalana-black shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-gray-900 block uppercase tracking-wider text-[10px]">
              Alamat Pengiriman Tujuan:
            </span>
            <p className="text-gray-700 mt-0.5 leading-relaxed">
              {destinationAddress ? `${destinationAddress}, ` : ""}{destinationCity}
            </p>
          </div>
        </div>
      )}

      {/* Chronological History Timeline */}
      <div>
        <h3 className="font-bold text-sm uppercase tracking-wider text-kalana-black mb-6 font-mono flex items-center gap-2">
          <Clock className="w-4 h-4 text-kalana-black" />
          Riwayat Perjalanan Paket (Tracking History)
        </h3>

        {history && history.length > 0 ? (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-kalana-black/15 font-mono">
            {history.map((event, idx) => {
              const isFirst = idx === 0;
              const isDelivered = event.status === "DELIVERED";

              return (
                <div key={event.id || idx} className="relative group">
                  {/* Dot Marker */}
                  <div
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-transform ${
                      isDelivered
                        ? "border-emerald-600 bg-emerald-500 text-white shadow-sm"
                        : isFirst
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isDelivered && <Check className="w-2.5 h-2.5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`text-xs font-bold uppercase tracking-wide ${
                        isDelivered ? "text-emerald-700" : isFirst ? "text-black" : "text-gray-600"
                      }`}>
                        {event.title}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {event.timestamp ? new Date(event.timestamp).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : "-"}
                      </span>
                    </div>

                    {event.location && (
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 font-sans">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        {event.location}
                      </p>
                    )}

                    {event.note && (
                      <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-100 font-sans mt-1">
                        {event.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 py-10 text-center text-xs text-gray-400 rounded-lg">
            Belum ada pembaruan log perjalanan. Paket sedang disiapkan di Roastery Cikampek.
          </div>
        )}
      </div>

    </div>
  );
}
