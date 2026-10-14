"use server";

import { getShippingRates, CourierRateOption, ShippingItemInput } from "@/lib/shipping/biteship";
import { ensureDbSchema } from "@/lib/db/migrate-helper";

export async function fetchCourierRates(params: {
  city: string;
  province?: string;
  zip?: string;
  items: ShippingItemInput[];
}): Promise<{
  success: boolean;
  rates: CourierRateOption[];
  totalWeightGrams: number;
  note?: string;
  error?: string;
}> {
  try {
    await ensureDbSchema();

    if (!params.items || params.items.length === 0) {
      return { success: false, rates: [], totalWeightGrams: 0, error: "Keranjang kosong" };
    }

    if (!params.city || params.city.trim().length === 0) {
      return { success: false, rates: [], totalWeightGrams: 0, error: "Kota tujuan belum diisi" };
    }

    const result = await getShippingRates({
      destinationCity: params.city.trim(),
      destinationProvince: params.province?.trim(),
      destinationZip: params.zip?.trim(),
      items: params.items,
    });

    return result;
  } catch (error: any) {
    console.error("[FETCH_COURIER_RATES_ERROR]", error);
    return {
      success: false,
      rates: [],
      totalWeightGrams: 0,
      error: error.message || "Gagal memuat tarif kurir",
    };
  }
}

export async function testBiteshipConnection(apiKey: string) {
  try {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, error: "API Key tidak boleh kosong" };
    }

    const res = await fetch("https://api.biteship.com/v1/couriers", {
      headers: { Authorization: apiKey.trim() },
      cache: "no-store",
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        courierCount: Array.isArray(data.couriers) ? data.couriers.length : 0,
      };
    }
    return { success: false, error: data.error || "Koneksi ke Biteship gagal" };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghubungi server Biteship" };
  }
}
