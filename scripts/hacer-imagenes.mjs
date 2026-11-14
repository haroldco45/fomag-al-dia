// FOMAG al Día — crea con foto real: foto.jpg (portada), og.jpg (vista previa del enlace),
// flyer.jpg (post) y flyer-historia.jpg (estados). La foto sale de la imagen principal de
// las noticias reales del caso. Uso: node scripts/hacer-imagenes.mjs [foto-local.jpg]
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const URL_APP = 'fomag-al-dia.netlify.app';
const UA = 'Mozilla/5.0 (compatible; FomagAlDia/1.0; Vibras Positivas HM)';
const PAGINAS = [
  'https://www.portafolio.co/economia/gobierno/las-razones-por-las-que-el-gobierno-decidio-terminar-el-contrato-de-36-anos-con-fiduprevisora-en-el-fomag-505530',
  'https://www.portafolio.co/economia/gobierno/que-pasara-con-la-salud-de-los-maestros-claves-de-la-transicion-del-fomag-tras-la-salida-de-fiduprevisora-505505',
  'https://www.elpais.com.co/colombia/borrador-de-reforma-al-fomag-estas-entidades-asumirian-los-servicios-de-salud-pensiones-y-cesantias-de-los-profesores-0356.html',
  'https://www.infobae.com/colombia/2026/11/03/gobierno-de-abelardo-de-la-espriella-pretenderia-eliminar-el-fomag-con-un-proyecto-de-ley-en-el-congreso-segun-fecode/',
  'https://consultorsalud.com/fomag-no-prorroga-contrato-fiduprevisora-2026/',
  'https://www.mineducacion.gov.co/1780/w3-article-431558.html'
];

async function bajar(u) {
  const r = await fetch(u, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(r.status);
  return r;
}
async function foto() {
  if (process.argv[2]) return readFile(process.argv[2]);
  for (const p of PAGINAS) {
    try {
      const html = await (await bajar(p)).text();
      const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image/i);
      if (!m) continue;
      const buf = Buffer.from(await (await bajar(new URL(m[1].replace(/&amp;/g, '&'), p).href)).arrayBuffer());
      const meta = await sharp(buf).metadata();
      if (meta.width >= 700) { console.log('Foto de', p); return buf; }
    } catch (e) { console.log('No sirvió', p, e.message); }
  }
  throw new Error('No se pudo bajar ninguna foto real');
}

const F = `font-family="DejaVu Sans, Arial, sans-serif"`;
const fila = (x, y, w, color, tit, txt, s) => `
  <rect x="${x}" y="${y}" width="${w}" height="${s * 2.6}" rx="${s * 0.5}" fill="#08262b" fill-opacity="0.9" stroke="#1d4a50"/>
  <rect x="${x}" y="${y + s * 0.5}" width="${s * 0.28}" height="${s * 1.6}" rx="${s * 0.14}" fill="${color}"/>
  <text x="${x + s * 0.9}" y="${y + s * 1.15}" ${F} font-size="${s * 0.62}" font-weight="700" fill="${color}" letter-spacing="1">${tit}</text>
  <text x="${x + s * 0.9}" y="${y + s * 2.0}" ${F} font-size="${s * 0.68}" fill="#eafcf8">${txt}</text>`;

function capa(w, h, tipo) {
  const deg = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#06181b" stop-opacity="0.2"/><stop offset="0.45" stop-color="#06181b" stop-opacity="0.72"/>
    <stop offset="1" stop-color="#06181b" stop-opacity="0.97"/></linearGradient>
    <linearGradient id="o" x1="0" x2="1"><stop offset="0" stop-color="#3ee6c1"/><stop offset="0.5" stop-color="#ffd166"/><stop offset="1" stop-color="#ff7a5c"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>`;
  const vivo = (x, y, s) => `<rect x="${x}" y="${y}" width="${s * 13.4}" height="${s * 1.7}" rx="${s * 0.85}" fill="#ff5a5f" fill-opacity="0.2" stroke="#ff5a5f"/>
    <circle cx="${x + s * 0.9}" cy="${y + s * 0.85}" r="${s * 0.32}" fill="#ff5a5f"/>
    <text x="${x + s * 1.6}" y="${y + s * 1.17}" ${F} font-size="${s * 0.85}" font-weight="700" fill="#ffd3d4">EN VIVO · CADA 30 MIN</text>`;

  if (tipo === 'og') return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${deg}
    ${vivo(60, 60, 26)}
    <text x="60" y="290" ${F} font-size="84" font-weight="900" fill="#fff">¿Se acaba el FOMAG?</text>
    <text x="60" y="370" ${F} font-size="46" font-weight="900" fill="url(#o)">Seguimiento día a día para los docentes</text>
    <text x="60" y="440" ${F} font-size="27" fill="#cdeee8">Salud · pensiones · cesantías · derecho de petición</text>
    <rect x="60" y="500" width="${w - 120}" height="76" rx="38" fill="#3ee6c1"/>
    <text x="${w / 2}" y="550" text-anchor="middle" ${F} font-size="38" font-weight="900" fill="#04211d">${URL_APP}</text>
    <text x="${w - 60}" y="${h - 22}" text-anchor="end" ${F} font-size="20" fill="#8fb8b2">Vibras Positivas HM · app ciudadana independiente</text></svg>`;

  const s = w / 26, alto = tipo === 'historia';
  const y = alto ? h * 0.30 : h * 0.20;
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${deg}
    ${vivo(s * 1.6, s * 1.8, s)}
    <text x="${s * 1.6}" y="${y}" ${F} font-size="${s * 2.4}" font-weight="900" fill="#fff">¿Se acaba</text>
    <text x="${s * 1.6}" y="${y + s * 2.6}" ${F} font-size="${s * 2.4}" font-weight="900" fill="#3ee6c1">el FOMAG?</text>
    <text x="${s * 1.6}" y="${y + s * 4.6}" ${F} font-size="${s * 1.4}" font-weight="900" fill="url(#o)">Todavía no. Siga el caso</text>
    <text x="${s * 1.6}" y="${y + s * 6.3}" ${F} font-size="${s * 1.4}" font-weight="900" fill="url(#o)">día a día, gratis.</text>
    ${[['#3ee6c1', 'SALUD', 'El borrador la pasaría a Nueva EPS'],
       ['#ffd166', 'PENSIONES', 'El borrador las pasaría a Colpensiones'],
       ['#ff7a5c', 'CESANTÍAS', 'El borrador las pasaría al FNA'],
       ['#9fb4ff', 'LO QUE PUEDE HACER', 'Derecho de petición a todas las entidades']]
      .map((r, i) => fila(s * 1.6, y + s * (7.6 + i * 3.0), w - s * 3.2, r[0], r[1], r[2], s)).join('')}
    <text x="${s * 1.6}" y="${y + s * 20.2}" ${F} font-size="${s * 0.8}" fill="#cdeee8">Noticias en vivo · Español / English · Gratis</text>
    <rect x="${s * 1.6}" y="${h - s * (alto ? 6.5 : 4.4)}" width="${w - s * 3.2}" height="${s * 2.3}" rx="${s * 1.15}" fill="#3ee6c1"/>
    <text x="${w / 2}" y="${h - s * (alto ? 5.0 : 2.9)}" text-anchor="middle" ${F} font-size="${s * 1.0}" font-weight="900" fill="#04211d">${URL_APP}</text>
    <text x="${w / 2}" y="${h - s * (alto ? 3.1 : 1.1)}" text-anchor="middle" ${F} font-size="${s * 0.6}" fill="#8fb8b2">Vibras Positivas HM · App ciudadana independiente, sin partido</text></svg>`;
}

const base = await foto();
await writeFile('foto.jpg', await sharp(base).resize(1600, 1000, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer());
for (const [arch, w, h, tipo] of [['og.jpg', 1200, 630, 'og'], ['flyer.jpg', 1080, 1350, 'post'], ['flyer-historia.jpg', 1080, 1920, 'historia']]) {
  const fondo = await sharp(base).resize(w, h, { fit: 'cover', position: 'center' }).modulate({ saturation: 1.1 }).toBuffer();
  await writeFile(arch, await sharp(fondo).composite([{ input: Buffer.from(capa(w, h, tipo)) }]).jpeg({ quality: 86 }).toBuffer());
  console.log('Listo', arch);
}
