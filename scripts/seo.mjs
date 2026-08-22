/* eslint-env node */
/**
 * Пост-сборка: SEO-слой.
 *
 * Главная проблема, которую это чинит: GitHub Pages отдаёт SPA-fallback (404.html)
 * со статусом 404. Человек страницу видит, а поисковый робот получает 404 и
 * НЕ индексирует /repertoire, /about и /gallery. Поэтому для каждого маршрута
 * кладём настоящий index.html — он отдаётся со статусом 200 и со своими
 * заголовком, описанием, canonical и Open Graph.
 *
 * Плюс robots.txt и sitemap.xml, которых просто не было.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const base = process.env.BASE_PATH || '/';
const ORIGIN = process.env.SITE_ORIGIN || 'https://edgarhovsepyan.github.io';
const abs = (p = '') => `${ORIGIN}${base}${p}`.replace(/([^:]\/)\/+/g, '$1');

const NAME = 'Рудольф Овсепян';

/* Заголовок и описание для каждой страницы: у каждой свой смысл и свой запрос,
   поэтому один общий title на весь сайт в выдаче работал бы плохо. */
const ROUTES = [
    {
        path: '',
        priority: '1.0',
        changefreq: 'weekly',
    },
    {
        path: 'repertoire',
        priority: '0.9',
        changefreq: 'monthly',
        title: 'Репертуар: эстрада, песни Магомаева, арии и романсы',
        description:
            '26 песен из репертуара Магомаева, 59 эстрадных хитов, 9 оперных арий и 30 романсов. Любую песню добавлю к программе вашего вечера.',
    },
    {
        path: 'about',
        priority: '0.8',
        changefreq: 'monthly',
        title: `Биография, образование и награды — ${NAME}`,
        description:
            'Баритон, лауреат международных конкурсов. МГПИ им. Ипполитова-Иванова, класс Р.П. Лисициана, премия С.Я. Лемешева, гастроли с фондом Спивакова.',
    },
    {
        path: 'gallery',
        priority: '0.7',
        changefreq: 'monthly',
        title: `Фотографии с концертов и праздников — ${NAME}`,
        description:
            'Фотогалерея баритона Рудольфа Овсепяна: концерты с симфоническим оркестром, филармонические сцены, праздничные площадки и портреты со сцены.',
    },
];

const indexPath = resolve(dist, 'index.html');
if (!existsSync(indexPath)) {
    console.error('seo.mjs: dist/index.html не найден — сначала соберите проект');
    process.exit(1);
}
const html = readFileSync(indexPath, 'utf8');

const replaceTag = (src, pattern, replacement) => (pattern.test(src) ? src.replace(pattern, replacement) : src);

const pageHtml = (route) => {
    let out = html;
    if (route.title) {
        out = replaceTag(out, /<title>[\s\S]*?<\/title>/, `<title>${route.title}</title>`);
        out = replaceTag(out, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${route.title}$2`);
    }
    if (route.description) {
        out = replaceTag(out, /(<meta\s*\n?\s*name="description"\s*\n?\s*content=")[\s\S]*?(")/, `$1${route.description}$2`);
        out = replaceTag(out, /(<meta\s*\n?\s*property="og:description"\s*\n?\s*content=")[\s\S]*?(")/, `$1${route.description}$2`);
    }
    const url = abs(route.path ? `${route.path}/` : '');
    out = replaceTag(out, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`);
    // canonical добавляем всегда: без него дубли /about и /about/ конкурируют между собой
    out = out.replace('</head>', `  <link rel="canonical" href="${url}" />\n  </head>`);
    return out;
};

// Корень: только canonical (title и описание уже верные)
writeFileSync(indexPath, pageHtml(ROUTES[0]), 'utf8');

// Остальные маршруты — настоящие страницы со статусом 200
for (const route of ROUTES.slice(1)) {
    const dir = resolve(dist, route.path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'index.html'), pageHtml(route), 'utf8');
}

// 404.html обновляем после правок корня, чтобы fallback совпадал с актуальной сборкой
writeFileSync(resolve(dist, '404.html'), readFileSync(indexPath, 'utf8'), 'utf8');

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.w3.org/1999/sitemap/0.9">
${ROUTES.map(
    (r) => `  <url>
    <loc>${abs(r.path ? `${r.path}/` : '')}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
).join('\n')}
</urlset>
`.replace('http://www.w3.org/1999/sitemap/0.9', 'http://www.sitemaps.org/schemas/sitemap/0.9');
writeFileSync(resolve(dist, 'sitemap.xml'), sitemap, 'utf8');

writeFileSync(
    resolve(dist, 'robots.txt'),
    `User-agent: *
Allow: /

Sitemap: ${ORIGIN}${base}sitemap.xml
`,
    'utf8',
);

console.log(`seo: ${ROUTES.length} страниц, sitemap.xml и robots.txt готовы (${ORIGIN}${base})`);
