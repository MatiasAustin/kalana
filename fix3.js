const fs = require('fs');
let c = fs.readFileSync('src/lib/actions/products.ts', 'utf8');

c = c.replace(/revalidatePath\("\/admin\/products"\);\r?\n\s*revalidatePath\("\/roastery"\);/g, 
  'revalidatePath("/admin/products");\n    revalidatePath("/roastery");\n    revalidatePath("/");\n    if (data && data.slug) revalidatePath("/product/" + data.slug);');

fs.writeFileSync('src/lib/actions/products.ts', c);
