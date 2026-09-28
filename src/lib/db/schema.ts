import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// --- USERS & CUSTOMERS ---
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  clerkUserId: text('clerk_user_id').unique().notNull(),
  role: text('role').notNull().default('CUSTOMER'), // CUSTOMER, ADMIN, EDITOR, MANAGER
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email').unique().notNull(),
  phone: text('phone'),
  customerType: text('customer_type').default('RETAIL'), // RETAIL, WHOLESALE, DISTRIBUTOR, CAFE, RESTAURANT, HOTEL
  country: text('country'),
  city: text('city'),
  businessName: text('business_name'),
  businessType: text('business_type'),
  monthlyCoffeeRequirement: text('monthly_coffee_requirement'),
  preferredProducts: text('preferred_products'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const addresses = sqliteTable('addresses', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').references(() => customers.id),
  type: text('type'), // BILLING, SHIPPING
  firstName: text('first_name'),
  lastName: text('last_name'),
  company: text('company'),
  address1: text('address1').notNull(),
  address2: text('address2'),
  city: text('city').notNull(),
  province: text('province'),
  country: text('country').notNull(),
  zip: text('zip').notNull(),
  phone: text('phone'),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// --- MEDIA ---
export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  key: text('key').notNull(), // R2 key
  filename: text('filename').notNull(),
  url: text('url').notNull(), // Public URL
  mimeType: text('mime_type'),
  size: integer('size'),
  width: integer('width'),
  height: integer('height'),
  altText: text('alt_text'),
  folder: text('folder'), // e.g. /products, /homepage
  uploadedBy: text('uploaded_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// --- PRODUCTS & COLLECTIONS ---
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  story: text('story'),
  blend: text('blend'),
  roast: text('roast'),
  tastingNotes: text('tasting_notes'), // JSON string or comma separated
  body: text('body'),
  acidity: text('acidity'),
  brewingGuide: text('brewing_guide'), // JSON array
  status: text('status').default('DRAFT'), // DRAFT, ACTIVE, ARCHIVED
  featured: integer('featured', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const productVariants = sqliteTable('product_variants', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  name: text('name').notNull(), // e.g., "500g", "1000g"
  sku: text('sku').unique(),
  price: real('price').notNull(),
  compareAtPrice: real('compare_at_price'),
  weight: real('weight'), // in grams
  status: text('status').default('ACTIVE'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const productMedia = sqliteTable('product_media', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  mediaId: text('media_id').notNull().references(() => media.id),
  sortOrder: integer('sort_order').default(0),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
});




export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  coverMediaId: text('cover_media_id').references(() => media.id),
  status: text('status').default('ACTIVE'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const collectionProducts = sqliteTable('collection_products', {
  id: text('id').primaryKey(),
  collectionId: text('collection_id').notNull().references(() => collections.id),
  productId: text('product_id').notNull().references(() => products.id),
  sortOrder: integer('sort_order').default(0),
});

// --- INVENTORY ---
export const inventory = sqliteTable('inventory', {
  id: text('id').primaryKey(),
  variantId: text('variant_id').notNull().unique().references(() => productVariants.id),
  available: integer('available').default(0),
  reserved: integer('reserved').default(0), // inside active carts/pending orders
  committed: integer('committed').default(0), // paid but not fulfilled
  incoming: integer('incoming').default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const inventoryMovements = sqliteTable('inventory_movements', {
  id: text('id').primaryKey(),
  variantId: text('variant_id').notNull().references(() => productVariants.id),
  userId: text('user_id').references(() => users.id),
  type: text('type').notNull(), // SALE, RESTOCK, ADJUSTMENT, RETURN, DAMAGE
  quantity: integer('quantity').notNull(), // positive or negative
  reason: text('reason'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// --- ORDERS ---
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').unique().notNull(),
  customerId: text('customer_id').references(() => customers.id),
  status: text('status').default('PENDING'), // PENDING, PROCESSING, COMPLETED, CANCELLED
  paymentStatus: text('payment_status').default('UNPAID'), // UNPAID, PAID, REFUNDED
  fulfillmentStatus: text('fulfillment_status').default('UNFULFILLED'), // UNFULFILLED, PARTIALLY_FULFILLED, FULFILLED
  subtotal: real('subtotal').notNull(),
  shippingCost: real('shipping_cost').default(0),
  discount: real('discount').default(0),
  total: real('total').notNull(),
  currency: text('currency').default('IDR'),
  shippingAddressId: text('shipping_address_id').references(() => addresses.id),
  billingAddressId: text('billing_address_id').references(() => addresses.id),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').references(() => products.id),
  variantId: text('variant_id').references(() => productVariants.id),
  productNameSnapshot: text('product_name_snapshot').notNull(),
  variantNameSnapshot: text('variant_name_snapshot').notNull(),
  skuSnapshot: text('sku_snapshot'),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  subtotal: real('subtotal').notNull(),
});

// --- REVIEWS ---
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  customerId: text('customer_id').references(() => customers.id),
  authorName: text('author_name'), // For guest reviews or manual entry
  rating: integer('rating').notNull(),
  title: text('title'),
  content: text('content').notNull(),
  status: text('status').default('PENDING'), // PENDING, APPROVED, REJECTED
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// --- CMS & CONTENT ---
export const siteSettings = sqliteTable('site_settings', {
  id: text('id').primaryKey(), // just use a single ID like 'global'
  brandName: text('brand_name').default('KALANA'),
  tagline: text('tagline'),
  primaryEmail: text('primary_email'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  country: text('country'),
  currency: text('currency'),
  timezone: text('timezone'),
  logoMediaId: text('logo_media_id').references(() => media.id),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const navigation = sqliteTable('navigation', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  handle: text('handle').unique().notNull(), // 'header', 'footer'
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const navigationItems = sqliteTable('navigation_items', {
  id: text('id').primaryKey(),
  navigationId: text('navigation_id').notNull().references(() => navigation.id),
  label: text('label').notNull(),
  url: text('url').notNull(),
  sortOrder: integer('sort_order').default(0),
  parentId: text('parent_id'), // For dropdowns, self-reference but SQLite might not like direct foreign key here without specific setup
});

export const locations = sqliteTable('locations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  city: text('city'),
  province: text('province'),
  country: text('country'),
  googleMapsUrl: text('google_maps_url'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  email: text('email'),
  openingHours: text('opening_hours'),
  coverMediaId: text('cover_media_id').references(() => media.id),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  type: text('type'), // EVENT, WORKSHOP
  locationId: text('location_id').references(() => locations.id),
  date: integer('date', { mode: 'timestamp' }),
  startTime: text('start_time'),
  endTime: text('end_time'),
  capacity: integer('capacity'),
  price: real('price').default(0),
  registrationUrl: text('registration_url'),
  coverMediaId: text('cover_media_id').references(() => media.id),
  status: text('status').default('UPCOMING'), // UPCOMING, COMPLETED, CANCELLED
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const socialLinks = sqliteTable('social_links', {
  id: text('id').primaryKey(),
  platform: text('platform').notNull(),
  url: text('url').notNull(),
  iconMediaId: text('icon_media_id').references(() => media.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').default(0),
});

export const homepageSections = sqliteTable('homepage_sections', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // HERO, FEATURED_COLLECTION, BRAND_STORY, SOCIAL_PROOF, SPACE, WORKSHOPS, NEWSLETTER
  sortOrder: integer('sort_order').default(0),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true),
  data: text('data'), // JSON blob of section specific content (headline, ctas, references)
});

import { relations } from 'drizzle-orm';

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
  media: many(productMedia),
  collections: many(collectionProducts),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.id],
  }),
  media: one(media, {
    fields: [productMedia.mediaId],
    references: [media.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(collectionProducts),
}));

export const collectionProductsRelations = relations(collectionProducts, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionProducts.collectionId],
    references: [collections.id],
  }),
  product: one(products, {
    fields: [collectionProducts.productId],
    references: [products.id],
  }),
}));

