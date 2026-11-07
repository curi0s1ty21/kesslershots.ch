// Offertenkonfigurator (offerte.html). All prices and rules are in OFFER below.

const OFFER = {
  // Driving costs. The distance is estimated offline from assets/plz.json:
  // straight line between two places, times roadFactor. No map service is involved,
  // so the visitor's location stays in the browser until they send the form.
  travel: {
    fromName: 'Altenrhein',
    from: [47.5158, 9.5473],
    chfPerKm: 0.75,
    roundTrip: true,
    roadFactor: 1.3,
    // Cantons where driving is free, e.g. ['SG', 'AR', 'AI', 'TG'] for "Anfahrt in der
    // Ostschweiz inklusive". Empty: driving costs are charged everywhere.
    includedCantons: [],
  },
  kinds: {
    hochzeit: {
      tab: 'Hochzeit',
      name: 'Hochzeit',
      packages: {
        // Every wedding is photographed by two photographers; package prices include both.
        // Ladder: Mini 700/h, Bestseller 600/h, Rundum-Sorglos 400/h; extra hours 300/h.
        // moreHours is capped so that Mini + hours stays below Bestseller, and Bestseller below Rundum-Sorglos.
        // hours: shown as "ca. Nh". moreHours: how many additional hours can be booked.
        mini: {
          name: 'Mini-Paket',
          price: 1400,
          hours: [2, 2],
          moreHours: 1,
          text: 'Für kleine standesamtliche Hochzeiten, Trauungen im Zivilstandsamt und intime Zeremonien in der Ostschweiz. Das Wesentliche, kompakt und stilvoll.',
          includes: ['2h fotografische Begleitung', 'Immer zu zweit: zwei Fotografen', 'Persönliche Beratung & Planungshilfe', 'Professionell bearbeitete Bilder', 'Online-Galerie zur Ansicht & Download'],
        },
        bestseller: {
          name: 'Bestseller',
          price: 2400,
          hours: [4, 4],
          moreHours: 4,
          badge: 'Beliebtestes Paket',
          text: 'Eure Hochzeitsreportage für die emotionalsten Stunden des Tages. Von der Trauung über die Gruppenfotos bis zum Apéro: authentisch, herzlich und detailverliebt.',
          includes: ['Bis zu 4h fotografische Begleitung', 'Immer zu zweit: zwei Fotografen', 'Professionell bearbeitete Bilder', 'Online-Galerie zur Ansicht & Download', 'Ausgewählte Prints eurer Hochzeit'],
        },
        rundum: {
          name: 'Rundum-Sorglos',
          price: 4800,
          text: 'Die ganztägige Hochzeitsreportage: euer Tag in seiner ganzen Schönheit – vom Getting Ready bis zum letzten Tanz.',
          includes: ['Ganztägige Begleitung, bis zu 12h', 'Immer zu zweit: zwei Fotografen', 'Professionell bearbeitete Bilder', 'Kennenlernshooting inklusive', 'Online-Galerie zur Ansicht & Download', 'Ausgewählte Prints eurer Hochzeit'],
        },
      },
      defaultPackage: 'bestseller',
      extraHour: { label: 'Zusatzstunden', hint: 'Verlängert die Reportage um je eine Stunde.', price: 300 },
      // PRICE PROPOSALS: the website names these extras without a price.
      extras: [
        // id stays 'couple' so that saved offer links keep working.
        { id: 'couple', name: 'Kennenlernshooting', text: 'Ca. 1 Stunde vor der Hochzeit: Ihr lernt uns und unsere Arbeitsweise kennen und steht am grossen Tag entspannter vor der Kamera.', price: 300, includedIn: ['rundum'] },
        { id: 'afterwedding', name: 'After-Wedding-Shooting', text: 'Ca. 1 Stunde nur für euch zwei nach der Hochzeit, nochmals im Hochzeitsoutfit und ganz ohne Zeitdruck.', price: 300 },
        // Videos are not offered for now. To bring them back, uncomment:
        // { id: 'reel', name: 'Kurzvideo als Reel', text: '30–60 Sekunden, perfekt zum Teilen.', price: 350 },
        // { id: 'highlight', name: 'Highlight-Video', text: 'Euer Tag in ca. 2–3 Minuten.', price: 1200 },
        { id: 'album', name: 'Premium-Hochzeitsalbum', text: 'Inklusive Design.', price: 750 },
        { id: 'elternalbum', name: 'Weitere Alben', text: 'Zum Beispiel für eure Eltern. Gleiches Design wie euer Album.', price: 220, max: 4, requires: 'album' },
        // PRICE PROPOSAL: the wedding box.
        { id: 'hochzeitsbox', name: 'Hochzeitsbox mit ausgewählten Prints', text: 'Eine edle Box mit euren schönsten Bildern als hochwertige Prints – zum Durchblättern und Verschenken.', price: 290 },
        { id: 'express', name: 'Express-Bearbeitung', text: 'Die komplette Galerie innert 1 Woche statt ca. 6 Wochen.', price: 250 },
      ],
      details: [
        { id: 'datum', type: 'date', label: 'Datum' },
        { id: 'trauung', type: 'select', label: 'Art der Trauung', options: ['Standesamtlich', 'Kirchlich', 'Freie Trauung', 'Noch offen'] },
        { id: 'gaeste', type: 'number', label: 'Anzahl Gäste (ca.)' },
        { id: 'location', type: 'text', label: 'Location', placeholder: 'z. B. Schloss, Restaurant …' },
      ],
      moments: { label: 'Diese Momente sind uns besonders wichtig', options: ['Getting Ready', 'Trauung', 'Gruppenfotos', 'Apéro', 'Paarfotos', 'Dinner & Reden', 'Eröffnungstanz', 'Party'] },
    },
    couple: {
      tab: 'Couple',
      name: 'Couple Shooting',
      packages: {
        couple: {
          name: 'Couple Shooting',
          price: 250,
          text: 'Authentische Paarfotos in natürlichem Licht. Locker, herzlich & modern.',
          includes: ['60–90 Min Shooting', 'Location- & Outfit-Guidance', 'Golden Hour & Outfitwechsel auf Wunsch', 'Online-Galerie zur Ansicht & Download'],
        },
      },
      defaultPackage: 'couple',
      moreTime: { id: 'zeit', name: 'Mehr Zeit', text: 'Verlängert das Shooting um je 30 Minuten.', price: 80, max: 4 },
      // PRICE PROPOSALS: the website names these options without a price.
      extras: [
        { id: 'location2', name: 'Zweite Location', text: 'Oder ein kurzer Locationwechsel.', price: 80 },
        { id: 'requisiten', name: 'Feine Requisiten', text: 'Decke, Blumen, Prosecco …', price: 60 },
        { id: 'prints', name: 'Fine-Art-Prints', text: 'Eure Lieblingsbilder auf hochwertigem Papier.', price: 90 },
        { id: 'express', name: 'Express-Bearbeitung', text: 'Die Galerie innert 3 Tagen.', price: 70 },
      ],
      details: [
        { id: 'datum', type: 'date', label: 'Wunschtermin' },
        { id: 'stimmung', type: 'select', label: 'Stimmung', options: ['City-Vibes', 'Bodensee', 'Appenzeller Hügel', 'Noch offen'] },
      ],
    },
    family: {
      tab: 'Family',
      name: 'Family Shooting',
      packages: {
        family: {
          name: 'Family Shooting',
          price: 350,
          text: 'Lebendige Familienmomente: locker geführt, mit kleinen Spielen & Pausen. Echte Nähe statt steifer Posen.',
          includes: ['60–90 Min Shooting', 'Location- & Outfit-Guidance', 'Online-Galerie zur Ansicht & Download'],
        },
      },
      defaultPackage: 'family',
      // minutes: length of one step of moreTime (default 30).
      moreTime: { id: 'zeit', name: 'Zusatzstunden', text: 'Verlängert das Shooting um je eine Stunde.', price: 100, minutes: 60, max: 2 },
      extras: [
        { id: 'prints', name: 'Ausgewählte Prints', text: 'Eure Lieblingsbilder als hochwertige Prints zum Anfassen.', price: 100 },
        { id: 'accessoires', name: 'Fotoaccessoires & Picknick', text: 'Wir organisieren ein Picknick, eine Decke oder andere Gegenstände, die eure Geschichte erzählen.', price: 100 },
      ],
      details: [
        { id: 'datum', type: 'date', label: 'Wunschtermin' },
        { id: 'personen', type: 'number', label: 'Anzahl Personen' },
        { id: 'kinder', type: 'text', label: 'Alter der Kinder', placeholder: 'z. B. 2 und 5 Jahre' },
      ],
    },
    verlobung: {
      tab: 'Verlobung',
      name: 'Verlobungsshooting',
      packages: {
        antrag: {
          name: 'Verstecktes Verlobungsshooting',
          price: 300,
          text: 'Ihr plant den Heiratsantrag, wir halten ihn heimlich fest – gut versteckt, damit die Überraschung gelingt. Danach gibt es noch ein paar Paarfotos.',
          includes: ['Ca. 1h Shooting', 'Gemeinsame Planung von Ort & Zeitpunkt', 'Versteckte Begleitung beim Antrag', 'Paarfotos direkt danach', 'Online-Galerie zur Ansicht & Download'],
        },
      },
      defaultPackage: 'antrag',
      extras: [],
      details: [
        { id: 'datum', type: 'date', label: 'Geplantes Datum' },
        { id: 'idee', type: 'text', label: 'Eure Idee für den Antrag', placeholder: 'z. B. bei Sonnenuntergang am Bodensee' },
      ],
    },
  },
};

const $ = (id) => document.getElementById(id);
const chf = (n) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+$)/g, "'")} CHF`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const germanDate = (iso) => iso.split('-').reverse().join('.');

// What the visitor chose, per kind, so switching tabs keeps their choices.
const state = { kind: 'hochzeit', byKind: {} };
for (const [key, kind] of Object.entries(OFFER.kinds)) {
  state.byKind[key] = { package: kind.defaultPackage, hours: 0, extras: {}, details: {}, moments: [], place: '' };
}
const kind = () => OFFER.kinds[state.kind];
const chosen = () => state.byKind[state.kind];

// --- Driving costs ---------------------------------------------------------

let places = []; // [plz, name, canton, lat, lon]
let placesLoaded = false;

// Zürich = Zuerich = Zurich, Sankt Gallen = St. Gallen.
const normalize = (s) => s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/([aou])e/g, '$1').replace(/^sankt\s+/, 'st. ').replace(/\s+/g, ' ');
const placeLabel = (p) => `${p[0]} ${p[1]}`;

function findPlace(text) {
  const q = normalize(text);
  if (!q) return null;
  return places.find((p) => normalize(placeLabel(p)) === q)
    || places.find((p) => p[0] === q)
    || places.find((p) => normalize(p[1]) === q)
    // "9000 Sankt Gallen" and other spellings: the postal code decides.
    || (/^\d{4}\s/.test(q) && places.find((p) => p[0] === q.slice(0, 4)))
    || null;
}

function suggestPlaces(text) {
  const q = normalize(text);
  if (q.length < 2) return [];
  return places.filter((p) => p[0].startsWith(q) || normalize(p[1]).startsWith(q)).slice(0, 8);
}

function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad;
  const dLon = (b[1] - a[1]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// status: 'empty' (no place yet), 'unknown' (not in the list), 'included' or 'charged'.
// 90 -> "90 Min", 120 -> "2 h".
function duration(minutes) {
  return minutes % 60 === 0 ? `${minutes / 60} h` : `${minutes} Min`;
}

function travelCost(text) {
  const t = OFFER.travel;
  if (!text.trim()) return { status: 'empty', price: 0 };
  const place = findPlace(text);
  if (!place) return { status: 'unknown', price: 0 };
  const km = Math.round(distanceKm(t.from, [place[3], place[4]]) * t.roadFactor);
  const billedKm = t.roundTrip ? km * 2 : km;
  const base = { place, km, billedKm };
  if (t.includedCantons.includes(place[2])) return { ...base, status: 'included', price: 0 };
  return { ...base, status: 'charged', price: Math.round(billedKm * t.chfPerKm) };
}

function travelExplanation(cost) {
  const t = OFFER.travel;
  switch (cost.status) {
    case 'included':
      return `✔ ${placeLabel(cost.place)}: Anfahrt in der Ostschweiz inklusive.`;
    case 'charged':
      return `${t.fromName} – ${placeLabel(cost.place)}: ca. ${cost.km} km, ${t.roundTrip ? `hin und zurück ${cost.billedKm} km, ` : ''}à ${t.chfPerKm.toFixed(2)} CHF = ${chf(cost.price)}`;
    case 'unknown':
      return placesLoaded
        ? 'Diesen Ort finde ich nicht in der Schweiz oder in Liechtenstein. Liegt er im Ausland? Dann rechne ich die Fahrspesen gerne im Erstgespräch aus.'
        : 'Die Fahrspesen rechne ich gerne im Erstgespräch aus.';
    default:
      return `${t.includedCantons.length ? 'In der Ostschweiz ist die Anfahrt inklusive, sonst ' : 'Fahrspesen: '}${t.chfPerKm.toFixed(2)} CHF pro Kilometer ab ${t.fromName}, hin und zurück.`;
  }
}

// --- Price -----------------------------------------------------------------

function isIncluded(extra, packageId) {
  return (extra.includedIn || []).includes(packageId);
}

function qtyOf(extra, sel) {
  if (extra.requires && !sel.extras[extra.requires]) return 0;
  return sel.extras[extra.id] || 0;
}

// Line items of the current choice. packageId can differ, to compare packages.
function lineItems(packageId) {
  const k = kind();
  const sel = chosen();
  const pkg = k.packages[packageId];
  const items = [{ name: pkg.name, price: pkg.price, base: true }];

  if (k.extraHour && pkg.hours) {
    const hours = Math.min(sel.hours, pkg.moreHours);
    if (hours) items.push({ name: `${k.extraHour.label} (${hours} h)`, price: hours * k.extraHour.price });
  }
  if (k.moreTime && sel.extras[k.moreTime.id]) {
    const n = sel.extras[k.moreTime.id];
    items.push({ name: `${k.moreTime.name} (${duration(n * (k.moreTime.minutes || 30))})`, price: n * k.moreTime.price });
  }
  for (const extra of k.extras) {
    const qty = qtyOf(extra, sel);
    if (!qty) continue;
    if (isIncluded(extra, packageId)) continue;
    items.push({ name: qty > 1 ? `${extra.name} (${qty}×)` : extra.name, price: qty * extra.price });
  }
  return items;
}

const sum = (items) => items.reduce((total, item) => total + item.price, 0);

// A larger package that costs no more than this selection does now.
function betterPackage() {
  const ids = Object.keys(kind().packages);
  const current = chosen().package;
  const total = sum(lineItems(current));
  for (const id of ids.slice(ids.indexOf(current) + 1).reverse()) {
    if (sum(lineItems(id)) <= total) return id;
  }
  return null;
}

// --- Page ------------------------------------------------------------------

function optionRow(extra, sel, packageId) {
  if (extra.requires && !sel.extras[extra.requires]) return '';
  const included = isIncluded(extra, packageId);
  const qty = sel.extras[extra.id] || 0;
  const active = included || qty > 0;
  const price = included ? 'inbegriffen' : `+ ${chf(extra.price)}${extra.max ? ' / Stück' : ''}`;
  const control = extra.max && !included
    ? stepper(`extra:${extra.id}`, qty, extra.max, extra.name)
    : `<input type="checkbox" id="extra-${extra.id}" data-extra="${extra.id}" class="choice-input" ${active ? 'checked' : ''} ${included ? 'disabled' : ''}>`;
  const tag = extra.max && !included ? 'div' : 'label';
  return `<${tag} class="option ${active ? 'is-selected' : ''} ${included ? 'is-included' : ''}" ${tag === 'label' ? `for="extra-${extra.id}"` : ''}>
    <span class="flex-1 min-w-0">
      <span class="block font-semibold text-gray-800">${esc(extra.name)}</span>
      <span class="block text-sm text-gray-600">${esc(extra.text)}</span>
    </span>
    <span class="text-sm font-semibold text-gray-700 whitespace-nowrap">${price}</span>
    ${control}
  </${tag}>`;
}

function stepper(key, value, max, label) {
  return `<span class="stepper">
    <button type="button" id="step-down-${key}" data-step="${key}" data-delta="-1" aria-label="${esc(label)}: weniger" ${value <= 0 ? 'disabled' : ''}>−</button>
    <output aria-live="polite">${value}</output>
    <button type="button" id="step-up-${key}" data-step="${key}" data-delta="1" aria-label="${esc(label)}: mehr" ${value >= max ? 'disabled' : ''}>+</button>
  </span>`;
}

function renderPackages() {
  const k = kind();
  const sel = chosen();
  const entries = Object.entries(k.packages);
  const cards = entries.map(([id, pkg]) => {
    const list = pkg.includes.map((line) => `✔ ${esc(line)}`).join('<br>');
    const selected = id === sel.package;
    return `<label class="package ${selected ? 'is-selected' : ''}" for="package-${id}">
      <input type="radio" id="package-${id}" name="pkg" value="${id}" class="sr-only" ${selected ? 'checked' : ''}>
      ${pkg.badge ? `<span class="package-badge">${esc(pkg.badge)}</span>` : ''}
      <span class="block text-xl font-semibold text-gray-800">${esc(pkg.name)}</span>
      <span class="block text-gray-600 text-sm mt-2">${esc(pkg.text)}</span>
      <span class="block border-t border-gray-300 my-3"></span>
      <span class="block text-sm text-gray-700 leading-relaxed">${list}${OFFER.travel.includedCantons.length ? '<br>✔ Anfahrt in der Ostschweiz inklusive' : ''}</span>
      <span class="block text-2xl font-bold text-gray-800 mt-4">ab ${chf(pkg.price)}</span>
    </label>`;
  }).join('');
  $('packages').className = `grid grid-cols-1 gap-4 ${entries.length > 1 ? 'xl:grid-cols-3' : ''}`;
  $('packages').innerHTML = cards;
  $('package-title').textContent = entries.length > 1 ? 'Wählt euer Paket' : 'Euer Shooting';
}

function renderOptions() {
  const k = kind();
  const sel = chosen();
  const pkg = k.packages[sel.package];
  let time = '';
  if (k.extraHour && pkg.hours) {
    sel.hours = Math.min(sel.hours, pkg.moreHours);
    const [low, high] = pkg.hours.map((h) => h + sel.hours);
    const total = low === high ? `ca. ${low}h` : `${low}–${high}h`;
    time = `<div class="option ${sel.hours ? 'is-selected' : ''}">
      <span class="flex-1 min-w-0">
        <span class="block font-semibold text-gray-800">${esc(k.extraHour.label)}</span>
        <span class="block text-sm text-gray-600">${esc(k.extraHour.hint)} Begleitung total: <strong>${total}</strong></span>
      </span>
      <span class="text-sm font-semibold text-gray-700 whitespace-nowrap">+ ${chf(k.extraHour.price)} / h</span>
      ${stepper('hours', sel.hours, pkg.moreHours, k.extraHour.label)}
    </div>`;
  } else if (k.moreTime) {
    const m = k.moreTime;
    const qty = sel.extras[m.id] || 0;
    time = `<div class="option ${qty ? 'is-selected' : ''}">
      <span class="flex-1 min-w-0">
        <span class="block font-semibold text-gray-800">${esc(m.name)}</span>
        <span class="block text-sm text-gray-600">${esc(m.text)}</span>
      </span>
      <span class="text-sm font-semibold text-gray-700 whitespace-nowrap">+ ${chf(m.price)} / ${(m.minutes || 30) === 60 ? 'h' : `${m.minutes || 30} Min`}</span>
      ${stepper(`extra:${m.id}`, qty, m.max, m.name)}
    </div>`;
  }
  $('options').innerHTML = time + k.extras.map((extra) => optionRow(extra, sel, sel.package)).join('');
}

function renderDetails() {
  const k = kind();
  const sel = chosen();
  const fields = k.details.map((field) => {
    const id = `detail-${field.id}`;
    const value = esc(sel.details[field.id] || '');
    const common = `id="${id}" data-detail="${field.id}" class="field"`;
    let input;
    if (field.type === 'select') {
      const options = field.options.map((o) => `<option ${sel.details[field.id] === o ? 'selected' : ''}>${esc(o)}</option>`).join('');
      input = `<select ${common}><option value="">Bitte wählen …</option>${options}</select>`;
    } else if (field.type === 'number') {
      input = `<input type="number" min="1" max="1000" inputmode="numeric" value="${value}" ${common}>`;
    } else if (field.type === 'date') {
      input = `<input type="date" min="${new Date().toISOString().slice(0, 10)}" value="${value}" ${common}>`;
    } else {
      input = `<input type="text" maxlength="200" value="${value}" placeholder="${esc(field.placeholder || '')}" ${common}>`;
    }
    return `<div><label class="label" for="${id}">${esc(field.label)}</label>${input}</div>`;
  }).join('');
  $('details').innerHTML = fields;

  const moments = k.moments;
  $('moments').innerHTML = moments
    ? `<p class="label">${esc(moments.label)}</p><div class="flex flex-wrap gap-2">${moments.options.map((m, i) => `
        <label class="chip ${sel.moments.includes(m) ? 'is-selected' : ''}" for="moment-${i}">
          <input type="checkbox" id="moment-${i}" data-moment="${esc(m)}" class="sr-only" ${sel.moments.includes(m) ? 'checked' : ''}>${esc(m)}
        </label>`).join('')}</div>`
    : '';
  $('place').value = sel.place;
}

function detailLines() {
  const k = kind();
  const sel = chosen();
  const lines = [];
  for (const field of k.details) {
    const value = sel.details[field.id];
    if (value) lines.push([field.label, field.type === 'date' ? germanDate(value) : value]);
  }
  if (sel.place.trim()) lines.push(['Ort', sel.place.trim()]);
  if (sel.moments.length) lines.push(['Wichtige Momente', sel.moments.join(', ')]);
  return lines;
}

function renderSummary() {
  const k = kind();
  const sel = chosen();
  const pkg = k.packages[sel.package];
  const items = lineItems(sel.package);
  const travel = travelCost(sel.place);
  const total = sum(items) + travel.price;

  const row = (name, price, cls = '') => `<li class="flex justify-between gap-4 ${cls}"><span>${esc(name)}</span><span class="font-semibold whitespace-nowrap">${esc(price)}</span></li>`;
  let rows = items.map((item) => row(item.name, item.base ? `ab ${chf(item.price)}` : chf(item.price), item.base ? 'font-semibold text-gray-800' : '')).join('');
  const travelPrice = { included: 'inklusive', charged: `ca. ${chf(travel.price)}`, unknown: 'nach Absprache', empty: 'offen' }[travel.status];
  rows += row(travel.status === 'charged' ? `Fahrspesen (${travel.billedKm} km)` : 'Fahrspesen', travelPrice);
  $('summary-items').innerHTML = rows;
  $('summary-includes').innerHTML = pkg.includes.map((line) => `<li>✔ ${esc(line)}</li>`).join('');
  $('summary-kind').textContent = k.name;

  const open = travel.status === 'empty' || travel.status === 'unknown';
  const text = `ab ${chf(total)}`;
  $('summary-total').textContent = text;
  $('summary-open').textContent = open ? 'zzgl. Fahrspesen' : '';
  $('mobile-total').textContent = text + (open ? ' + Fahrspesen' : '');

  const details = detailLines();
  $('summary-details').innerHTML = details.map(([label, value]) => `<li><span class="text-gray-500">${esc(label)}:</span> ${esc(value)}</li>`).join('');
  $('summary-details-wrap').classList.toggle('hidden', !details.length);

  $('place-result').textContent = travelExplanation(travel);

  const better = betterPackage();
  if (better) {
    const target = k.packages[better];
    $('upgrade').classList.remove('hidden');
    $('upgrade-text').textContent = `Tipp: Mit ${target.name} kommt ihr bei dieser Auswahl auf ab ${chf(sum(lineItems(better)) + travel.price)} und habt mehr inklusive.`;
    $('upgrade-button').textContent = `Zu ${target.name} wechseln`;
    $('upgrade-button').dataset.package = better;
  } else {
    $('upgrade').classList.add('hidden');
  }
  writeHash();
}

function renderAll() {
  document.querySelectorAll('.seg-btn').forEach((button) => {
    const active = button.dataset.kind === state.kind;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });
  renderPackages();
  renderOptions();
  renderDetails();
  renderSummary();
  renderPartner();
}

// Partner fields only for kinds with a couple. Hidden fields are disabled, so they are not sent.
const PARTNER_KINDS = ['hochzeit', 'couple'];
function renderPartner() {
  const show = PARTNER_KINDS.includes(state.kind);
  $('partner-fields').hidden = !show;
  for (const input of $('partner-fields').querySelectorAll('input')) input.disabled = !show;
}

// Re-render without losing the keyboard position, so + and − can be pressed repeatedly.
function keepingFocus(render) {
  const id = document.activeElement && document.activeElement.id;
  render();
  const element = id && $(id);
  if (!element) return;
  if (element.disabled) {
    const other = id.startsWith('step-up-') ? id.replace('step-up-', 'step-down-') : id.replace('step-down-', 'step-up-');
    const fallback = $(other);
    if (fallback) fallback.focus();
    return;
  }
  element.focus();
}

// --- Link to share ---------------------------------------------------------
// The choice lives in the address after #, which browsers do not send to the server.
// Names and contact details are never part of it.

function writeHash() {
  const sel = chosen();
  const params = new URLSearchParams({ a: state.kind, p: sel.package });
  if (sel.hours) params.set('h', sel.hours);
  const extras = Object.entries(sel.extras).filter(([, q]) => q).map(([id, q]) => `${id}:${q}`).join(',');
  if (extras) params.set('x', extras);
  if (sel.place.trim()) params.set('ort', sel.place.trim());
  for (const [id, value] of Object.entries(sel.details)) if (value) params.set(`d_${id}`, value);
  if (sel.moments.length) params.set('m', sel.moments.join('|'));
  history.replaceState(null, '', `#${params}`);
}

function readHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  if (!OFFER.kinds[params.get('a')]) return;
  state.kind = params.get('a');
  const k = kind();
  const sel = chosen();
  if (k.packages[params.get('p')]) sel.package = params.get('p');
  const hours = parseInt(params.get('h'), 10);
  const pkg = k.packages[sel.package];
  if (hours > 0 && pkg.hours) sel.hours = Math.min(hours, pkg.moreHours);
  for (const pair of (params.get('x') || '').split(',')) {
    const [id, value] = pair.split(':');
    const extra = k.extras.find((e) => e.id === id) || (k.moreTime && k.moreTime.id === id ? k.moreTime : null);
    const qty = parseInt(value, 10);
    if (extra && qty > 0) sel.extras[id] = Math.min(qty, extra.max || 1);
  }
  sel.place = (params.get('ort') || '').slice(0, 100);
  for (const field of k.details) {
    const value = params.get(`d_${field.id}`);
    if (!value) continue;
    if (field.type !== 'select' || field.options.includes(value)) sel.details[field.id] = value.slice(0, 200);
  }
  if (k.moments) sel.moments = (params.get('m') || '').split('|').filter((m) => k.moments.options.includes(m));
}

// --- Sending ---------------------------------------------------------------

function offerText() {
  const k = kind();
  const sel = chosen();
  const items = lineItems(sel.package);
  const travel = travelCost(sel.place);
  const total = sum(items) + travel.price;
  const lines = [`Offertenkonfigurator: ${k.name}`, ''];
  for (const item of items) lines.push(`${item.name}: ${item.base ? 'ab ' : ''}${chf(item.price)}`);
  if (travel.status === 'charged') lines.push(`Fahrspesen (${travel.billedKm} km, ${placeLabel(travel.place)}): ca. ${chf(travel.price)}`);
  else if (travel.status === 'included') lines.push(`Fahrspesen (${placeLabel(travel.place)}): inklusive`);
  else lines.push('Fahrspesen: noch offen');
  lines.push('', `Richtpreis: ab ${chf(total)}`);
  const details = detailLines();
  if (details.length) lines.push('', ...details.map(([label, value]) => `${label}: ${value}`));
  const note = $('note').value.trim();
  if (note) lines.push('', 'Nachricht:', note);
  return lines.join('\n');
}

function prepareForm() {
  const k = kind();
  const sel = chosen();
  const travel = travelCost(sel.place);
  $('form-package').value = k.packages[sel.package].name;
  $('form-subject').value = `Offerte ${k.name}: ab ${chf(sum(lineItems(sel.package)) + travel.price)}`;
  $('form-message').value = offerText();
}

// --- Events ----------------------------------------------------------------

document.addEventListener('click', (event) => {
  const tab = event.target.closest('.seg-btn');
  if (tab) {
    state.kind = tab.dataset.kind;
    renderAll();
    return;
  }
  const step = event.target.closest('[data-step]');
  if (step) {
    const sel = chosen();
    const delta = Number(step.dataset.delta);
    if (step.dataset.step === 'hours') {
      sel.hours = Math.max(0, sel.hours + delta);
    } else {
      const id = step.dataset.step.replace('extra:', '');
      sel.extras[id] = Math.max(0, (sel.extras[id] || 0) + delta);
    }
    keepingFocus(() => { renderOptions(); renderSummary(); });
    return;
  }
  if (event.target.id === 'upgrade-button') {
    chosen().package = event.target.dataset.package;
    renderPackages();
    renderOptions();
    renderSummary();
    return;
  }
  if (event.target.id === 'print-button') {
    window.print();
    return;
  }
  if (event.target.id === 'share-button') {
    const done = (text) => {
      event.target.textContent = text;
      setTimeout(() => { event.target.textContent = 'Link kopieren'; }, 2000);
    };
    navigator.clipboard.writeText(location.href).then(() => done('Link kopiert ✔'), () => done('Bitte Adresse kopieren'));
  }
});

document.addEventListener('change', (event) => {
  const { target } = event;
  const sel = chosen();
  if (target.name === 'pkg') {
    sel.package = target.value;
    keepingFocus(() => { renderPackages(); renderOptions(); renderSummary(); });
  } else if (target.dataset.extra) {
    const extra = kind().extras.find((e) => e.id === target.dataset.extra);
    sel.extras[extra.id] = target.checked ? 1 : 0;
    keepingFocus(() => { renderOptions(); renderSummary(); });
  } else if (target.dataset.moment) {
    const moment = target.dataset.moment;
    sel.moments = target.checked ? [...sel.moments, moment] : sel.moments.filter((m) => m !== moment);
    target.closest('.chip').classList.toggle('is-selected', target.checked);
    renderSummary();
  }
});

document.addEventListener('input', (event) => {
  const { target } = event;
  const sel = chosen();
  if (target.dataset.detail) {
    sel.details[target.dataset.detail] = target.value;
    renderSummary();
  } else if (target.id === 'place') {
    sel.place = target.value;
    $('place-list').innerHTML = suggestPlaces(target.value)
      .map((p) => `<option value="${esc(placeLabel(p))}"></option>`).join('');
    renderSummary();
  }
});

$('offer-form').addEventListener('submit', prepareForm);

$('print-date').textContent = new Date().toLocaleDateString('de-CH');
readHash();
renderAll();

fetch('/assets/plz.json')
  .then((response) => (response.ok ? response.json() : Promise.reject()))
  .then((data) => { places = data; placesLoaded = true; })
  // Without the list the offer still works: the driving costs stay "nach Absprache".
  .catch(() => {})
  .finally(renderSummary);
