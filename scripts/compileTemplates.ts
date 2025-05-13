import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { basename, extname, join } from 'path';

async function compileTemplates() {
  const templatesFolder = join(
    __dirname,
    '..',
    'src',
    'infrastructure',
    'mail',
    'templates'
  );
  const outputFolder = join(__dirname, '..', 'dist', 'assets', 'templates');

  if (!templatesFolder) {
    throw new Error('Templates folder not found');
  }

  await mkdir(outputFolder, { recursive: true });

  const files = await readdir(templatesFolder);
  const mjmlModule = await import('mjml');
  const mjml2html =
    typeof mjmlModule === 'function'
      ? mjmlModule
      : typeof mjmlModule.default === 'function'
        ? mjmlModule.default
        : undefined;

  for (const file of files) {
    if (extname(file) !== '.mjml') continue;

    const filePath = join(templatesFolder, file);
    const mjmlContent = await readFile(filePath, 'utf-8');
    const { errors, html } = mjml2html(mjmlContent, {});

    if (errors && errors.length > 0) {
      console.error(`Errors compiling ${file}:`, errors);
      continue;
    }

    const outputFile = join(outputFolder, `${basename(file, '.mjml')}.eta`);
    await writeFile(outputFile, html, 'utf-8');
    console.log(`Compiled ${file} -> ${outputFile}`);
  }
}

compileTemplates().catch((err) => {
  console.error('Failed to compile templates:', err);
  process.exit(1);
});
