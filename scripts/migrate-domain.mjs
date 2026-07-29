import fs from 'fs';
import path from 'path';

const filesToMigrate = [
  'src/app/layout.tsx',
  'src/app/sitemap.ts',
  'src/app/robots.ts',
  'src/lib/legal-metadata.ts',
  'src/lib/legal-content.ts',
  'src/lib/constants.ts',
  'src/lib/generate-receipt-pdf.ts',
  'src/lib/mock-user-store.ts',
  'src/app/(auth)/admin/login/page.tsx',
  'src/app/api/auth/admin/signup/route.ts',
  'prisma/seed.ts',
];

filesToMigrate.forEach((relPath) => {
  const filePath = path.resolve(process.cwd(), relPath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Perform targeted replacements
    content = content
      .replace(/https:\/\/artiaircon\.com/g, 'https://artiair.com')
      .replace(/http:\/\/artiaircon\.com/g, 'https://artiair.com')
      .replace(/www\.artiaircon\.com/g, 'www.artiair.com')
      .replace(/artiaircon\.com/g, 'artiair.com')
      .replace(/info@artiairco\.com/g, 'info@artiair.com')
      .replace(/admin@artiaircon\.com/g, 'admin@artiair.com');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${relPath}`);
  }
});
