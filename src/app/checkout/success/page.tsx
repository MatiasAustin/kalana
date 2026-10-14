import Link from "next/link";
import { db } from "@/lib/db";
import { orders, siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CheckCircle2, Clock, ExternalLink, ArrowRight, ShieldCheck, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { order: orderNumber } = await searchParams;

  let orderData: any = null;
  let settings: any = null;

  if (orderNumber) {
    [orderData, settings] = await Promise.all([
      db.query.orders.findFirst({
        where: eq(orders.orderNumber, orderNumber),
        with: {
          items: true,
          shippingAddress: true,
          customer: true,
        },
      }).catch(() => null),
      db.query.siteSettings.findFirst({
        where: eq(siteSettings.id, "global"),
      }).catch(() => null),
    ]);
  } else {
    settings = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, "global"),
    }).catch(() => null);
  }

  const paymeUrl = settings?.mayarPaymeUrl || "https://mayar.to/kalanaspaceroastery";
  const customerPortalUrl = settings?.mayarCustomerPortalUrl || "https://kalanaspaceroastery.myr.id/portal";
  const paymentTargetUrl = orderData?.paymentUrl || paymeUrl;
  const isPaid = orderData?.paymentStatus === "PAID";

  return (
    <div className="min-h-screen bg-kalana-offwhite text-kalana-black pt-28 pb-24 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Branding */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block text-3xl font-semibold tracking-tighter uppercase mb-6 hover:opacity-60 transition-opacity">
            kalana.
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-kalana-black text-kalana-offwhite mb-6">
            {isPaid ? (
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            ) : (
              <Clock className="w-8 h-8 text-yellow-400" />
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight uppercase mb-3">
            {isPaid ? "Payment Confirmed" : "Order Placed Successfully"}
          </h1>
          <p className="text-sm text-kalana-black/70 max-w-md mx-auto">
            {isPaid
              ? "Terima kasih! Pembayaran Anda telah terverifikasi dan pesanan sedang kami persiapkan."
              : "Pesanan Anda telah berhasil dibuat. Silakan selesaikan pembayaran melalui gerbang resmi Mayar."}
          </p>
        </div>

        {/* Order Card */}
        {orderData ? (
          <div className="border border-kalana-black/20 bg-white p-6 sm:p-8 rounded-sm shadow-sm space-y-8 mb-8">
            
            {/* Order Header Info */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-kalana-black/10 pb-6 gap-4 font-mono text-xs">
              <div>
                <span className="text-kalana-black/50 block text-[10px] uppercase tracking-widest">Nomor Pesanan</span>
                <span className="font-bold text-base text-kalana-black">{orderData.orderNumber}</span>
              </div>
              <div>
                <span className="text-kalana-black/50 block text-[10px] uppercase tracking-widest">Total Tagihan</span>
                <span className="font-bold text-base text-kalana-black">IDR {orderData.total.toLocaleString("id-ID")}</span>
              </div>
              <div>
                <span className="text-kalana-black/50 block text-[10px] uppercase tracking-widest">Status Pembayaran</span>
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mt-1 ${
                  isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {orderData.paymentStatus}
                </span>
              </div>
            </div>

            {/* Payment Action Buttons */}
            {!isPaid && (
              <div className="bg-kalana-black text-kalana-offwhite p-6 rounded-sm space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm uppercase tracking-wider">
                      Selesaikan Pembayaran via Mayar
                    </h3>
                    <p className="text-xs text-kalana-offwhite/70 mt-1 leading-relaxed">
                      Lakukan pembayaran instan menggunakan QRIS, Virtual Account (BCA, Mandiri, BRI, BNI), E-Wallet (GoPay, OVO, ShopeePay), atau Kartu Kredit.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={paymentTargetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3.5 px-6 bg-white text-black hover:bg-gray-100 text-center font-bold text-xs uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
                  >
                    Bayar Sekarang via Mayar <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-kalana-black/50 mb-4">
                Rincian Pesanan
              </h4>
              <div className="divide-y divide-kalana-black/10 text-sm">
                {orderData.items.map((item: any) => (
                  <div key={item.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-kalana-black">
                        {item.quantity}x {item.productNameSnapshot}
                      </p>
                      <p className="text-xs text-kalana-black/50">{item.variantNameSnapshot}</p>
                    </div>
                    <span className="font-mono text-xs font-semibold">
                      IDR {item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal & Total */}
              <div className="border-t border-kalana-black/20 pt-4 mt-2 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-kalana-black/60">
                  <span>Subtotal</span>
                  <span>IDR {orderData.subtotal.toLocaleString("id-ID")}</span>
                </div>
                {orderData.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Diskon</span>
                    <span>-IDR {orderData.discount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between text-kalana-black/60">
                  <span>Ongkos Kirim</span>
                  <span>IDR {orderData.shippingCost.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-kalana-black pt-2 border-t border-kalana-black/10">
                  <span>Total Tagihan</span>
                  <span>IDR {orderData.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Customer Portal Link Banner */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <FileText className="w-4 h-4 text-kalana-black shrink-0" />
                <span>
                  Lihat kwitansi resmi, invoice, dan status verifikasi di <strong>Portal Pelanggan Mayar</strong>.
                </span>
              </div>
              <a
                href={customerPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-kalana-black text-black hover:bg-black hover:text-white rounded text-[11px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap"
              >
                Portal Pelanggan <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        ) : (
          <div className="border border-kalana-black/10 p-8 text-center bg-white mb-8">
            <p className="text-sm text-kalana-black/60 mb-6">
              Pesanan Anda telah tercatat. Silakan cek status melalui Portal Pelanggan Mayar atau hubungi kami jika membutuhkan bantuan.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href={paymeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-kalana-black text-kalana-offwhite text-xs font-semibold uppercase tracking-widest hover:bg-black/80"
              >
                Buka Link Pembayaran Mayar ↗
              </a>
              <a
                href={customerPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 border border-kalana-black text-black text-xs font-semibold uppercase tracking-widest hover:bg-black hover:text-white"
              >
                Portal Pelanggan Mayar ↗
              </a>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex justify-center items-center gap-6 text-xs uppercase tracking-widest font-mono">
          <Link href="/roastery" className="border-b border-kalana-black pb-0.5 hover:opacity-50 transition-opacity">
            Kembali ke Roastery
          </Link>
          <span className="text-kalana-black/30">•</span>
          <Link href="/account/orders" className="border-b border-kalana-black pb-0.5 hover:opacity-50 transition-opacity">
            Riwayat Pesanan
          </Link>
        </div>

      </div>
    </div>
  );
}
