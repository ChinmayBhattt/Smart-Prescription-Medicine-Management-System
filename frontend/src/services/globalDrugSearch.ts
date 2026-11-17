import { Medicine, DosageForm, TimingRelation } from '../types';

// In-memory cache for instant responses
const queryCache = new Map<string, Medicine[]>();

function parseForm(str: string): DosageForm {
  const lower = str.toLowerCase();
  if (lower.includes('tablet') || lower.includes('tab') || lower.includes('caplet') || lower.includes('pill')) return 'Tablet';
  if (lower.includes('capsule') || lower.includes('cap')) return 'Capsule';
  if (lower.includes('syrup') || lower.includes('suspension') || lower.includes('liquid') || lower.includes('solution') || lower.includes('elixir')) return 'Syrup';
  if (lower.includes('inhaler') || lower.includes('inhal') || lower.includes('puff') || lower.includes('aerosol') || lower.includes('respir')) return 'Inhaler';
  if (lower.includes('inject') || lower.includes('vial') || lower.includes('ampule') || lower.includes('infusion')) return 'Injection';
  if (lower.includes('ointment') || lower.includes('cream') || lower.includes('gel')) return 'Ointment';
  if (lower.includes('drop') || lower.includes('ophthalmic') || lower.includes('otic')) return 'Drops';
  return 'Tablet';
}

function parseStrength(name: string): string {
  const match = name.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|%|iu|units?)(?:\s*(?:\/|\+)\s*\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g)?)?)/i);
  return match ? match[0].trim() : 'Standard';
}

function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('paracetamol') || lower.includes('acetaminophen') || lower.includes('ibuprofen') || lower.includes('aspirin') || lower.includes('naproxen') || lower.includes('mefenamic') || lower.includes('tramadol') || lower.includes('combiflam') || lower.includes('dolo')) {
    return 'Antipyretic & Analgesic';
  }
  if (lower.includes('amoxicillin') || lower.includes('cillin') || lower.includes('azithromycin') || lower.includes('ciprofloxacin') || lower.includes('cefixime') || lower.includes('doxycycline') || lower.includes('mycin') || lower.includes('oxacin') || lower.includes('clavulanic') || lower.includes('augmentin') || lower.includes('taxim')) {
    return 'Antibacterial / Antibiotic';
  }
  if (lower.includes('pantoprazole') || lower.includes('omeprazole') || lower.includes('rabeprazole') || lower.includes('ranitidine') || lower.includes('domperidone') || lower.includes('famotidine') || lower.includes('esomeprazole') || lower.includes('pan-d') || lower.includes('rantac') || lower.includes('omez')) {
    return 'Gastroprokinetic & Antacid';
  }
  if (lower.includes('metformin') || lower.includes('glimepiride') || lower.includes('vildagliptin') || lower.includes('sitagliptin') || lower.includes('dapagliflozin') || lower.includes('empagliflozin') || lower.includes('insulin') || lower.includes('semaglutide') || lower.includes('ozempic') || lower.includes('glycomet') || lower.includes('janumet')) {
    return 'Anti-Diabetic';
  }
  if (lower.includes('telmisartan') || lower.includes('amlodipine') || lower.includes('losartan') || lower.includes('atenolol') || lower.includes('metoprolol') || lower.includes('lisinopril') || lower.includes('ramipril') || lower.includes('telma') || lower.includes('amlopres')) {
    return 'Antihypertensive';
  }
  if (lower.includes('cetirizine') || lower.includes('levocetirizine') || lower.includes('montelukast') || lower.includes('fexofenadine') || lower.includes('loratadine') || lower.includes('allegra') || lower.includes('montair')) {
    return 'Antiallergic & Anti-asthmatic';
  }
  if (lower.includes('salbutamol') || lower.includes('albuterol') || lower.includes('budesonide') || lower.includes('formoterol') || lower.includes('ambroxol') || lower.includes('guaifenesin') || lower.includes('ascoril') || lower.includes('asthalin') || lower.includes('alex')) {
    return 'Cough & Respiratory';
  }
  if (lower.includes('calcium') || lower.includes('vitamin') || lower.includes('zinc') || lower.includes('iron') || lower.includes('b-complex') || lower.includes('shelcal') || lower.includes('becosules') || lower.includes('neurobion')) {
    return 'Nutritional Supplement';
  }
  return 'General Medicine';
}

function parseContraindications(text: string): string[] {
  const lower = text.toLowerCase();
  const list: string[] = [];
  if (lower.includes('paracetamol') || lower.includes('acetaminophen')) list.push('Severe Hepatic Impairment');
  if (lower.includes('amoxicillin') || lower.includes('penicillin')) list.push('Penicillin Allergy');
  if (lower.includes('metformin')) list.push('Severe Renal Impairment');
  if (lower.includes('aspirin') || lower.includes('ibuprofen')) list.push('Active Peptic Ulcer');
  if (lower.includes('ciprofloxacin')) list.push('Tendon rupture history');
  return list;
}

/**
 * Searches the NIH RxNorm Global Medicine Registry
 * Works for virtually every single pharmaceutical formulation, brand name, and combination in the world.
 */
export async function searchRxNormGlobal(query: string): Promise<Medicine[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  const results: Medicine[] = [];
  const seen = new Set<string>();

  try {
    // 1. Direct drug query
    const res = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(q)}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      const groups = data.drugGroup?.conceptGroup || [];

      for (const group of groups) {
        if (!group.conceptProperties) continue;
        for (const prop of group.conceptProperties) {
          const rawName: string = prop.name || '';
          if (!rawName) continue;

          // Extract brand name if present inside [Brackets]
          const brandMatch = rawName.match(/\[(.*?)\]/);
          let brandName = brandMatch ? brandMatch[1].trim() : '';
          let genericName = brandMatch ? rawName.replace(/\[.*?\]/, '').trim() : rawName;

          if (!brandName) {
            // Use synonym or first two words as brand
            brandName = prop.synonym ? prop.synonym.split(' ')[0] : rawName.split(' ')[0];
          }

          // Clean up brand name
          brandName = brandName.replace(/Oral|Tablet|Capsule|Extended Release|Solution/gi, '').trim();
          if (!brandName) brandName = rawName.slice(0, 30);

          const form = parseForm(rawName);
          const strength = parseStrength(rawName);
          const key = `${brandName.toLowerCase()}-${strength.toLowerCase()}-${form.toLowerCase()}`;

          if (seen.has(key)) continue;
          seen.add(key);

          const cat = inferCategory(`${brandName} ${genericName}`);

          results.push({
            id: `rxnorm-${prop.rxcui || Math.random().toString(36).substr(2, 6)}`,
            brand_name: brandName,
            generic_name: genericName,
            category: cat,
            form,
            strength,
            composition: genericName,
            standard_unit: form.toLowerCase(),
            common_indications: [cat, 'Global RxNorm Formulary'],
            default_timing: 'AFTER_FOOD',
            contraindications: parseContraindications(genericName),
            source: 'rxnorm'
          });

          if (results.length >= 25) break;
        }
        if (results.length >= 25) break;
      }
    }
  } catch (err) {
    console.warn('RxNorm drugs.json search error:', err);
  }

  // 2. If fewer than 5 results, query RxNorm Approximate Term (matches spelling variants / partial words)
  if (results.length < 5) {
    try {
      const approxRes = await fetch(`https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(q)}&maxEntries=15`, {
        headers: { 'Accept': 'application/json' }
      });

      if (approxRes.ok) {
        const approxData = await approxRes.json();
        const candidates = approxData.approximateGroup?.candidate || [];

        for (const cand of candidates) {
          const candName: string = cand.name || '';
          if (!candName) continue;

          const brandMatch = candName.match(/\[(.*?)\]/);
          let brandName = brandMatch ? brandMatch[1].trim() : candName.split(' ')[0];
          brandName = brandName.replace(/Oral|Tablet|Capsule|Injectable/gi, '').trim();
          if (!brandName) brandName = candName.slice(0, 25);

          const form = parseForm(candName);
          const strength = parseStrength(candName);
          const key = `${brandName.toLowerCase()}-${strength.toLowerCase()}-${form.toLowerCase()}`;

          if (seen.has(key)) continue;
          seen.add(key);

          const cat = inferCategory(candName);

          results.push({
            id: `rxnorm-${cand.rxcui || Math.random().toString(36).substr(2, 6)}`,
            brand_name: brandName,
            generic_name: candName.replace(/\[.*?\]/, '').trim(),
            category: cat,
            form,
            strength,
            composition: candName,
            standard_unit: form.toLowerCase(),
            common_indications: [cat, 'Global RxNorm Registry'],
            default_timing: 'AFTER_FOOD',
            contraindications: parseContraindications(candName),
            source: 'rxnorm'
          });

          if (results.length >= 25) break;
        }
      }
    } catch (err) {
      console.warn('RxNorm approximateTerm search error:', err);
    }
  }

  return results;
}

/**
 * Searches the US OpenFDA NDC Database for commercial pharmaceutical products
 */
export async function searchOpenFDAGlobal(query: string): Promise<Medicine[]> {
  const q = query.trim();
  if (!q || q.length < 3) return [];

  const results: Medicine[] = [];
  const seen = new Set<string>();

  try {
    const url = `https://api.fda.gov/drug/ndc.json?search=(brand_name:"${encodeURIComponent(q)}"+OR+generic_name:"${encodeURIComponent(q)}")&limit=12`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const items = data.results || [];

    for (const item of items) {
      const brand = (item.brand_name || item.brand_name_base || '').trim();
      const generic = (item.generic_name || '').trim();
      if (!brand && !generic) continue;

      const form = parseForm(item.dosage_form || 'Tablet');
      let strength = 'Standard';
      if (item.active_ingredients && item.active_ingredients.length > 0) {
        strength = item.active_ingredients.map((a: any) => `${a.name} ${a.strength}`).join(' + ');
      }

      const key = `${(brand || generic).toLowerCase()}-${form}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const cat = inferCategory(`${brand} ${generic}`);

      results.push({
        id: `fda-${item.product_ndc || Math.random().toString(36).substr(2, 6)}`,
        brand_name: brand || generic,
        generic_name: generic || brand,
        category: cat,
        form,
        strength: strength.length > 40 ? strength.slice(0, 40) + '...' : strength,
        composition: strength,
        standard_unit: form.toLowerCase(),
        common_indications: [cat, item.labeler_name ? `Mfr: ${item.labeler_name}` : 'FDA Listed'],
        default_timing: 'AFTER_FOOD',
        contraindications: parseContraindications(generic),
        source: 'openfda'
      });
    }
  } catch (err) {
    // OpenFDA may return 404 for unindexed brands, which is normal
  }

  return results;
}

/**
 * Unified Realtime Search:
 * Queries local Indian Clinic database + Go Backend + NIH RxNorm Global + OpenFDA
 */
export async function searchAllMedicinesRealtime(
  query: string,
  category = 'All',
  form = 'All',
  localClinicCatalog: Medicine[] = []
): Promise<Medicine[]> {
  const q = query.trim().toLowerCase();

  // If search is empty, filter local pre-curated catalog
  if (!q) {
    return localClinicCatalog.filter(med => {
      const matchCat = category === 'All' || med.category.toLowerCase() === category.toLowerCase();
      const matchForm = form === 'All' || med.form.toLowerCase() === form.toLowerCase();
      return matchCat && matchForm;
    });
  }

  // Check cache
  const cacheKey = `${q}__${category}__${form}`;
  if (queryCache.has(cacheKey)) {
    return queryCache.get(cacheKey)!;
  }

  // 1. Instant local matches (fastest)
  const localMatches = localClinicCatalog.filter(med => {
    const matchQ = 
      med.brand_name.toLowerCase().includes(q) ||
      med.generic_name.toLowerCase().includes(q) ||
      med.composition.toLowerCase().includes(q) ||
      (med.hindi_name && med.hindi_name.toLowerCase().includes(q)) ||
      med.common_indications.some(ind => ind.toLowerCase().includes(q));

    const matchCat = category === 'All' || med.category.toLowerCase() === category.toLowerCase();
    const matchForm = form === 'All' || med.form.toLowerCase() === form.toLowerCase();
    return matchQ && matchCat && matchForm;
  });

  // 2. Concurrently fetch Global RxNorm and OpenFDA in parallel
  const [rxnormResults, fdaResults] = await Promise.all([
    searchRxNormGlobal(query),
    q.length >= 3 ? searchOpenFDAGlobal(query) : Promise.resolve([])
  ]);

  // 3. Merge results with priority & deduplication
  const combined: Medicine[] = [];
  const seenBrands = new Set<string>();

  // Prioritize local matches first
  for (const m of localMatches) {
    const norm = m.brand_name.toLowerCase().trim();
    seenBrands.add(norm);
    combined.push(m);
  }

  // Then add RxNorm global results
  for (const m of rxnormResults) {
    const norm = m.brand_name.toLowerCase().trim();
    if (!seenBrands.has(norm)) {
      if (category !== 'All' && m.category.toLowerCase() !== category.toLowerCase()) continue;
      if (form !== 'All' && m.form.toLowerCase() !== form.toLowerCase()) continue;
      seenBrands.add(norm);
      combined.push(m);
    }
  }

  // Then add OpenFDA results
  for (const m of fdaResults) {
    const norm = m.brand_name.toLowerCase().trim();
    if (!seenBrands.has(norm)) {
      if (category !== 'All' && m.category.toLowerCase() !== category.toLowerCase()) continue;
      if (form !== 'All' && m.form.toLowerCase() !== form.toLowerCase()) continue;
      seenBrands.add(norm);
      combined.push(m);
    }
  }

  // Cache for 2 minutes
  queryCache.set(cacheKey, combined);
  setTimeout(() => queryCache.delete(cacheKey), 2 * 60 * 1000);

  return combined;
}
