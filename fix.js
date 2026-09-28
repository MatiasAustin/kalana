const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace {product.price}
c = c.replace(/\{product\.price\}/g, "{`IDR ${product.variants?.[0]?.price?.toLocaleString('id-ID') || 0}`}");

// Replace product.handle
c = c.replace(/product\.handle/g, 'product.slug');

// Replace product.blend / roast / tastingNotes
c = c.replace(/\{product\.blend\}/g, "{product.blend || '-'}");
c = c.replace(/\{product\.roast\}/g, "{product.roast || '-'}");
c = c.replace(/\{product\.tastingNotes\}/g, "{product.tastingNotes || '-'}");

// Replace the empty grey box with actual image
const greyBox = `<div className="w-full aspect-[4/5] bg-kalana-black/5 border border-kalana-black/10 relative mb-8"></div>`;
const newBox = `<Link href={\`/product/\${product.slug}\`} className="w-full aspect-[4/5] bg-kalana-black/5 border border-kalana-black/10 relative mb-8 overflow-hidden group">
  {product.media && product.media.length > 0 ? (
    <img src={product.media.find((m) => m.isPrimary)?.media?.url || product.media[0]?.media?.url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
  ) : (
    <div className="absolute inset-0 bg-kalana-black/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  )}
</Link>`;

c = c.replace(greyBox, newBox);
c = c.replace(greyBox, newBox); // In case it's there twice

fs.writeFileSync('src/app/page.tsx', c);
