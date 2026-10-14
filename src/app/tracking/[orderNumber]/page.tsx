import Link from "next/link";
import { notFound } from "next/navigation";
import { getShipmentTracking } from "@/lib/actions/orders";
import { LiveShipmentMap } from "@/components/tracking/LiveShipmentMap";
import { ShipmentTimeline } from "@/components/tracking/ShipmentTimeline";
import { CancelOrderButton } from "@/components/orders/CancelOrderButton";
import { ArrowLeft, Package, Coffee, HelpCircle, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Lacak Pengiriman Pesanan ${orderNumber} | KALANA`,
    description: `Pantau status dan live map pengiriman pesanan ${orderNumber} dari KALANA Roastery Cikampek ke alamat Anda.`,
  };
}

export default async function TrackingDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const trackingData = await getShipmentTracking(orderNumber);

  if (!trackingData) {
    return (
      <div className="min-h-screen bg-kalana-offwhite text-kalana-black pt-32 pb-24 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-kalana-black/15 p-8 rounded-xl text-center space-y-6 shadow-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-kalana-black font-mono">
              Pesanan Tidak Ditemukan
            </h1>
            <p className="text-xs text-gray-500 mt-2">
              Nomor pesanan <strong className="font-mono text-black">{orderNumber}</strong> tidak ditemukan di database. Pastikan format nomor pesanan sesuai (contoh: KAL-XXXXXX).
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/tracking"
              className="py-2.5 px-4 bg-black text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors font-mono"
            >
              Cari Nomor Lain
            </Link>
            <Link
              href="/account/orders"
              className="py-2.5 px-4 border border-kalana-black/20 rounded text-xs font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors font-mono text-kalana-black"
            >
              Lihat Riwayat Pesanan Akun
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shippingAddr = trackingData.shippingAddress;
  const destinationCity = shippingAddr?.city || "DKI Jakarta";
  const destinationAddress = shippingAddr ? `${shippingAddr.address1}${shippingAddr.city ? `, ${shippingAddr.city}` : ""}` : undefined;

  return (
    <div className="min-h-screen bg-kalana-offwhite text-kalana-black pt-28 pb-24 px-6 lg:px-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-kalana-black/15 pb-4">
          <Link
            href="/account/orders"
            className="inline-flex items-center text-xs tracking-widest uppercase text-kalana-black/60 hover:text-kalana-black transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Kembali ke Riwayat Pesanan
          </Link>
          
          <Link
            href="/"
            className="text-xl font-semibold tracking-tighter uppercase font-mono hover:opacity-60 transition-opacity"
          >
            kalana.
          </Link>
        </div>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-kalana-black text-kalana-offwhite px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Biteship Radar
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-kalana-black/50">
                Order #{trackingData.orderNumber}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight uppercase leading-none">
              Pelacakan Pengiriman
            </h1>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <span className="text-kalana-black/50 block text-[10px] uppercase tracking-wider">Tujuan Penerima</span>
            <span className="font-bold text-sm text-kalana-black">{destinationCity}</span>
          </div>
        </div>

        {/* 1. Interactive Visual Live Map with Moving Courier Van */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-kalana-black/70 flex items-center gap-1.5">
              <span>🗺️</span> Peta Perjalanan Pengiriman
            </h2>
            <span className="text-[10px] font-mono text-gray-400">Rute Cikampek &rarr; {destinationCity}</span>
          </div>

          <LiveShipmentMap
            shippingStatus={trackingData.shippingStatus}
            courier={trackingData.courier}
            courierService={trackingData.courierService}
            trackingNumber={trackingData.trackingNumber}
            currentLocation={trackingData.currentLocation}
            estimatedDeliveryDate={trackingData.estimatedDeliveryDate}
            destinationCity={destinationCity}
            destinationAddress={destinationAddress}
            isRealtimeBiteship={trackingData.isRealtimeBiteship}
            biteshipTrackingPortalUrl={trackingData.biteshipTrackingPortalUrl}
          />
        </section>

        {/* 2. Shipment Timeline & Courier Info */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <ShipmentTimeline
              courier={trackingData.courier}
              courierService={trackingData.courierService}
              trackingNumber={trackingData.trackingNumber}
              trackingUrl={trackingData.trackingUrl}
              shippingStatus={trackingData.shippingStatus}
              estimatedDeliveryDate={trackingData.estimatedDeliveryDate}
              history={trackingData.history}
              destinationCity={destinationCity}
              destinationAddress={destinationAddress}
              isRealtimeBiteship={trackingData.isRealtimeBiteship}
              biteshipTrackingPortalUrl={trackingData.biteshipTrackingPortalUrl}
              biteshipDriver={trackingData.biteshipDriver}
            />
          </div>

          {/* 3. Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-white border border-kalana-black/15 rounded-xl p-6 space-y-6 shadow-sm font-mono">
            <h3 className="font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3 text-kalana-black">
              Ringkasan Pesanan
            </h3>

            <div className="divide-y divide-gray-100 text-xs">
              {trackingData.items?.map((item: any) => (
                <div key={item.id} className="py-2.5 flex justify-between items-start gap-2">
                  <div>
                    <span className="font-semibold text-gray-900 block font-sans">
                      {item.quantity}x {item.productNameSnapshot}
                    </span>
                    <span className="text-[10px] text-gray-400 block">{item.variantNameSnapshot}</span>
                  </div>
                  <span className="font-semibold whitespace-nowrap">
                    IDR {item.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>IDR {trackingData.subtotal?.toLocaleString("id-ID") || 0}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Ongkos Kirim</span>
                <span>IDR {trackingData.shippingCost?.toLocaleString("id-ID") || 0}</span>
              </div>
              {Number(trackingData.discount || 0) > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Diskon</span>
                  <span>-IDR {(trackingData.discount || 0).toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>IDR {trackingData.total?.toLocaleString("id-ID") || 0}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded text-[11px] text-amber-900 leading-relaxed font-sans">
              <span className="font-bold font-mono text-[10px] uppercase block mb-0.5">Roastery Fresh Guarantee</span>
              Biji kopi disangrai segar dan dikemas dengan katup degassing satu arah untuk menjaga aroma & crema optimal hingga tiba di tempat Anda.
            </div>

            {/* Order Cancellation (Available for Guests & Members) */}
            {trackingData.status === "CANCELLED" ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-center">
                <span className="font-bold text-xs uppercase tracking-wider text-red-700 block font-mono">
                  Pesanan Dibatalkan
                </span>
                <span className="text-[10px] text-red-600 block mt-0.5 font-sans">
                  Pesanan ini telah dibatalkan dan tidak ditagihkan/dikirimkan.
                </span>
              </div>
            ) : (
              trackingData.fulfillmentStatus !== "FULFILLED" && ["PENDING", "PROCESSED"].includes(trackingData.shippingStatus) && (
                <div className="pt-2 border-t border-gray-100 flex flex-col items-center gap-1.5">
                  <CancelOrderButton orderNumber={trackingData.orderNumber} variant="outline" className="w-full text-center py-2" />
                  <span className="text-[10px] text-gray-400 text-center font-sans">
                    Pesanan dapat dibatalkan selama belum diserahkan ke kurir.
                  </span>
                </div>
              )
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
