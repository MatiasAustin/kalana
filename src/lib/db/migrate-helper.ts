import { client } from "@/lib/db";

let schemaEnsured = false;

const schemaStatements = [
  // site_settings columns
  `ALTER TABLE site_settings ADD COLUMN active_payment_gateway TEXT DEFAULT 'NONE';`,
  `ALTER TABLE site_settings ADD COLUMN mayar_api_key TEXT;`,
  `ALTER TABLE site_settings ADD COLUMN mayar_payme_url TEXT DEFAULT 'https://mayar.to/kalanaspaceroastery';`,
  `ALTER TABLE site_settings ADD COLUMN mayar_customer_portal_url TEXT DEFAULT 'https://kalanaspaceroastery.myr.id/portal';`,
  `ALTER TABLE site_settings ADD COLUMN doku_client_id TEXT;`,
  `ALTER TABLE site_settings ADD COLUMN doku_secret_key TEXT;`,
  `ALTER TABLE site_settings ADD COLUMN logo_url TEXT;`,
  `ALTER TABLE site_settings ADD COLUMN favicon_url TEXT;`,

  // orders columns
  `ALTER TABLE orders ADD COLUMN payment_provider TEXT;`,
  `ALTER TABLE orders ADD COLUMN payment_token TEXT;`,
  `ALTER TABLE orders ADD COLUMN payment_url TEXT;`,
  `ALTER TABLE orders ADD COLUMN courier TEXT;`,
  `ALTER TABLE orders ADD COLUMN courier_service TEXT;`,
  `ALTER TABLE orders ADD COLUMN tracking_number TEXT;`,
  `ALTER TABLE orders ADD COLUMN tracking_url TEXT;`,
  `ALTER TABLE orders ADD COLUMN shipping_status TEXT DEFAULT 'PENDING';`,
  `ALTER TABLE orders ADD COLUMN current_location TEXT;`,
  `ALTER TABLE orders ADD COLUMN estimated_delivery_date TEXT;`,
  `ALTER TABLE orders ADD COLUMN tracking_history TEXT;`,
];

export async function ensureDbSchema() {
  if (schemaEnsured) return;

  for (const stmt of schemaStatements) {
    try {
      await client.execute(stmt);
    } catch {
      // Column or table alteration already applied; safely ignore duplicate column errors
    }
  }

  // Ensure default global row in site_settings
  try {
    await client.execute({
      sql: `INSERT OR IGNORE INTO site_settings (id, brand_name) VALUES ('global', 'KALANA');`,
      args: [],
    });
  } catch {
    // Safely ignore
  }

  schemaEnsured = true;
}
