const fs = require('fs');
let c = fs.readFileSync('src/lib/actions/products.ts', 'utf8');

c = c.replace(/revalidatePath\("\/"\);\s*revalidatePath\("\/"\);/g, 'revalidatePath("/");');

// Ensure updateProduct has it
const target = 'revalidatePath("/admin/products");\n    revalidatePath("/roastery");\n    \n    return { success: true, id };';
const rep = 'revalidatePath("/admin/products");\n    revalidatePath("/roastery");\n    revalidatePath("/");\n    \n    return { success: true, id };';
c = c.replace(target, rep);

// Fix CRLF issues if any
c = c.replace(/revalidatePath\("\/roastery"\);\r?\n\s*revalidatePath\("\/"\);\r?\n\s*revalidatePath\("\/"\);/g, 'revalidatePath("/roastery");\n    revalidatePath("/");');

fs.writeFileSync('src/lib/actions/products.ts', c);
