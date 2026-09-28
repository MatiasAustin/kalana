CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text,
	`type` text,
	`first_name` text,
	`last_name` text,
	`company` text,
	`address1` text NOT NULL,
	`address2` text,
	`city` text NOT NULL,
	`province` text,
	`country` text NOT NULL,
	`zip` text NOT NULL,
	`phone` text,
	`is_default` integer DEFAULT false,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `collection_products` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_id` text NOT NULL,
	`product_id` text NOT NULL,
	`sort_order` integer DEFAULT 0,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`cover_media_id` text,
	`status` text DEFAULT 'ACTIVE',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`cover_media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collections_slug_unique` ON `collections` (`slug`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`first_name` text,
	`last_name` text,
	`email` text NOT NULL,
	`phone` text,
	`customer_type` text DEFAULT 'RETAIL',
	`country` text,
	`city` text,
	`business_name` text,
	`business_type` text,
	`monthly_coffee_requirement` text,
	`preferred_products` text,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_email_unique` ON `customers` (`email`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`type` text,
	`location_id` text,
	`date` integer,
	`start_time` text,
	`end_time` text,
	`capacity` integer,
	`price` real DEFAULT 0,
	`registration_url` text,
	`cover_media_id` text,
	`status` text DEFAULT 'UPCOMING',
	`is_featured` integer DEFAULT false,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cover_media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE TABLE `homepage_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`sort_order` integer DEFAULT 0,
	`is_enabled` integer DEFAULT true,
	`data` text
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`available` integer DEFAULT 0,
	`reserved` integer DEFAULT 0,
	`committed` integer DEFAULT 0,
	`incoming` integer DEFAULT 0,
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_variant_id_unique` ON `inventory` (`variant_id`);--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`user_id` text,
	`type` text NOT NULL,
	`quantity` integer NOT NULL,
	`reason` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`city` text,
	`province` text,
	`country` text,
	`google_maps_url` text,
	`latitude` real,
	`longitude` real,
	`phone` text,
	`whatsapp` text,
	`email` text,
	`opening_hours` text,
	`cover_media_id` text,
	`is_primary` integer DEFAULT false,
	FOREIGN KEY (`cover_media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`filename` text NOT NULL,
	`url` text NOT NULL,
	`mime_type` text,
	`size` integer,
	`width` integer,
	`height` integer,
	`alt_text` text,
	`folder` text,
	`uploaded_by` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `navigation` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`handle` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `navigation_handle_unique` ON `navigation` (`handle`);--> statement-breakpoint
CREATE TABLE `navigation_items` (
	`id` text PRIMARY KEY NOT NULL,
	`navigation_id` text NOT NULL,
	`label` text NOT NULL,
	`url` text NOT NULL,
	`sort_order` integer DEFAULT 0,
	`parent_id` text,
	FOREIGN KEY (`navigation_id`) REFERENCES `navigation`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text,
	`variant_id` text,
	`product_name_snapshot` text NOT NULL,
	`variant_name_snapshot` text NOT NULL,
	`sku_snapshot` text,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`subtotal` real NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`customer_id` text,
	`status` text DEFAULT 'PENDING',
	`payment_status` text DEFAULT 'UNPAID',
	`fulfillment_status` text DEFAULT 'UNFULFILLED',
	`subtotal` real NOT NULL,
	`shipping_cost` real DEFAULT 0,
	`discount` real DEFAULT 0,
	`total` real NOT NULL,
	`currency` text DEFAULT 'IDR',
	`shipping_address_id` text,
	`billing_address_id` text,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`billing_address_id`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE TABLE `product_media` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`media_id` text NOT NULL,
	`sort_order` integer DEFAULT 0,
	`is_primary` integer DEFAULT false,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`price` real NOT NULL,
	`compare_at_price` real,
	`weight` real,
	`status` text DEFAULT 'ACTIVE',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_variants_sku_unique` ON `product_variants` (`sku`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`story` text,
	`blend` text,
	`roast` text,
	`tasting_notes` text,
	`body` text,
	`acidity` text,
	`brewing_guide` text,
	`status` text DEFAULT 'DRAFT',
	`featured` integer DEFAULT false,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`customer_id` text,
	`author_name` text,
	`rating` integer NOT NULL,
	`title` text,
	`content` text NOT NULL,
	`status` text DEFAULT 'PENDING',
	`is_featured` integer DEFAULT false,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_name` text DEFAULT 'KALANA',
	`tagline` text,
	`primary_email` text,
	`phone` text,
	`whatsapp` text,
	`country` text,
	`currency` text,
	`timezone` text,
	`logo_media_id` text,
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`logo_media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `social_links` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`url` text NOT NULL,
	`icon_media_id` text,
	`is_active` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	FOREIGN KEY (`icon_media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_user_id` text NOT NULL,
	`role` text DEFAULT 'CUSTOMER' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_user_id_unique` ON `users` (`clerk_user_id`);