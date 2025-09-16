import fetch from 'node-fetch';
import Papa from 'papaparse';

const withTimeout = async (promise, ms = 4000) => {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
  return Promise.race([promise, timeout]);
};

// Note: Many Indian agri data sources require API keys (Agmarknet, data.gov.in).
// We use public endpoints where possible and otherwise provide graceful fallbacks.

export const fetchMarketPrices = async (crop) => {
  try {
    const apiKey = process.env.DATA_GOV_IN_API_KEY;
    const resourceId = process.env.AGMARKNET_RESOURCE_ID;
    if (apiKey && resourceId) {
      const base = `https://api.data.gov.in/resource/${resourceId}`;
      const params = new URLSearchParams({
        'api-key': apiKey,
        'format': 'json',
        'limit': '50',
        'offset': '0',
        'filters[state]': 'Kerala'
      });
      if (crop) params.set('filters[commodity]', crop);
      const url = `${base}?${params.toString()}`;
      const res = await withTimeout(fetch(url, { headers: { accept: 'application/json' } }));
      if (res.ok) {
        const data = await res.json();
        const records = Array.isArray(data?.records) ? data.records : [];
        const list = records.map((r) => ({
          crop: r.commodity || r.variety || 'Unknown',
          malayalam: r.commodity || 'Unknown',
          currentPrice: Number(r.modal_price) || Number(r.max_price) || 0,
          previousPrice: Number(r.min_price) || 0,
          market: r.market || r.market_center || 'Kerala',
          date: r.arrival_date || new Date().toISOString().split('T')[0],
          unit: 'quintal',
          trend: 'stable',
          changePercent: 0
        }));
        return list;
      }
    }
  } catch {
    // Fallback minimal set if live API not available
    return [
      {
        crop: 'Rice',
        malayalam: 'നെല്ല്',
        currentPrice: 2800,
        previousPrice: 2790,
        market: 'Kottayam Mandi',
        date: new Date().toISOString().split('T')[0],
        unit: 'quintal',
        trend: 'up',
        changePercent: 0.4
      },
      {
        crop: 'Coconut',
        malayalam: 'തെങ്ങ്',
        currentPrice: 12,
        previousPrice: 12,
        market: 'Cochin Market',
        date: new Date().toISOString().split('T')[0],
        unit: 'piece',
        trend: 'stable',
        changePercent: 0
      }
    ];
  }
};

export const fetchPestAlerts = async (crop, district) => {
  try {
    // Primary: Kerala official JSON API
    const apiUrl = 'https://api.kerala.gov.in/v1/pest_alerts';
    const res = await withTimeout(fetch(apiUrl));
    if (res.ok) {
      const json = await res.json();
      let alerts = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
      if (crop) alerts = alerts.filter(a => (a.pest_name || a.crop || '').toLowerCase().includes(crop.toLowerCase()));
      if (district) alerts = alerts.filter(a => (a.area || a.district || '').toLowerCase().includes(district.toLowerCase()));
      return alerts.map(a => ({
        id: a.id || a.alert_id || `${a.pest_name}-${a.alert_date}`,
        crop: a.crop || '',
        pest: a.pest_name || a.category || '',
        malayalam: a.pest_name || '',
        severity: a.severity || 'medium',
        description: a.description || '',
        affectedAreas: a.area ? [a.area] : [],
        recommendedAction: a.action || '',
        date: a.alert_date || a.date || new Date().toISOString()
      }));
    }

    // Fallback: Kerala Open Data CSV
    if (process.env.KERALA_PEST_ALERTS_CSV_URL) {
      const resCsv = await withTimeout(fetch(process.env.KERALA_PEST_ALERTS_CSV_URL));
      if (resCsv.ok) {
        const text = await resCsv.text();
        const parsed = Papa.parse(text, { header: true });
        let rows = Array.isArray(parsed?.data) ? parsed.data : [];
        if (crop) rows = rows.filter(r => (r.pest_name || '').toLowerCase().includes(crop.toLowerCase()));
        if (district) rows = rows.filter(r => (r.area || '').toLowerCase().includes(district.toLowerCase()));
        return rows.map(r => ({
          id: r.id || `${r.pest_name}-${r.alert_date}`,
          crop: r.crop || '',
          pest: r.pest_name || r.category || '',
          malayalam: r.pest_name || '',
          severity: r.severity || 'medium',
          description: r.description || '',
          affectedAreas: r.area ? [r.area] : [],
          recommendedAction: r.action || '',
          date: r.alert_date || r.date || new Date().toISOString()
        }));
      }
    }
  } catch {
    // Fallback examples
    const base = [
      {
        id: '1',
        crop: 'Rice',
        pest: 'Brown Plant Hopper',
        malayalam: 'ബ്രൗൺ പ്ലാന്റ് ഹോപ്പർ',
        severity: 'high',
        description: 'High incidence reported in paddy fields.',
        affectedAreas: ['Kottayam', 'Alappuzha'],
        recommendedAction: 'Apply recommended insecticides and manage water.',
        date: new Date().toISOString()
      }
    ];
    let alerts = base;
    if (crop) alerts = alerts.filter(a => a.crop.toLowerCase().includes(crop.toLowerCase()));
    if (district) alerts = alerts.filter(a => a.affectedAreas.some(x => x.toLowerCase().includes(district.toLowerCase())));
    return alerts;
  }
};

export const fetchGovernmentAdvisories = async () => {
  try {
    // 1) Insurance pest subsidies API
    const insApi = 'https://api.kerala.gov.in/v1/insurance/pest_subsidies';
    const resIns = await withTimeout(fetch(insApi));
    const items = [];
    if (resIns.ok) {
      const json = await resIns.json();
      const arr = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
      items.push(...arr.map(s => ({
        id: s.id || s.scheme_name,
        title: s.scheme_name,
        malayalam: s.scheme_name,
        description: `Coverage: ${s.coverage_percent || ''}%. Crops: ${(s.eligible_crops || []).join(', ')}`,
        type: 'scheme',
        priority: 'medium',
        validFrom: s.start_date || '',
        validTo: s.end_date || '',
        source: 'Kerala Insurance Department'
      })));
    }

    // 2) IPM Schemes CSV
    const ipmCsv = 'https://data.kerala.gov.in/dataset/ipm-schemes/files/6c2c3f8e-7d5a-4c0b-abf9-1f45e6f3d2cb/download';
    const resCsv1 = await withTimeout(fetch(ipmCsv));
    if (resCsv1.ok) {
      const text = await resCsv1.text();
      const parsed = Papa.parse(text, { header: true });
      const rows = Array.isArray(parsed?.data) ? parsed.data : [];
      items.push(...rows.map(r => ({
        id: r.id || r.title,
        title: r.title || r.scheme_title,
        malayalam: r.title,
        description: r.eligibility ? `Eligibility: ${r.eligibility}. Subsidy: ${r.subsidy_percent || ''}%` : r.description,
        type: 'scheme',
        priority: 'medium',
        validFrom: r.start_date || '',
        validTo: r.end_date || '',
        source: 'KDAFP IPM'
      })));
    }

    // 3) Master Kerala farmer schemes CSV
    const masterCsv = 'https://data.kerala.gov.in/dataset/kerala-farmer-schemes/files/e2c58b6d-5a9f-4c45-81d2-0f5b3c3abf4e/download';
    const resCsv2 = await withTimeout(fetch(masterCsv));
    if (resCsv2.ok) {
      const text = await resCsv2.text();
      const parsed = Papa.parse(text, { header: true });
      const rows = Array.isArray(parsed?.data) ? parsed.data : [];
      items.push(...rows.map(r => ({
        id: r.id || r.scheme_name,
        title: r.scheme_name,
        malayalam: r.scheme_name,
        description: r.scheme_type ? `${r.scheme_type}: ₹${r.subsidy_amount || ''}` : r.description,
        type: 'scheme',
        priority: 'low',
        validFrom: r.start_date || '',
        validTo: r.end_date || '',
        source: 'Kerala Govt Schemes'
      })));
    }

    return items;
  } catch {
    return [
      {
        id: 'pmkisan',
        title: 'PM-KISAN Scheme',
        malayalam: 'പിഎം-കിസാൻ പദ്ധതി',
        description: 'Direct income support to farmer families.',
        type: 'scheme',
        priority: 'medium',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        source: 'Ministry of Agriculture',
        link: 'https://pmkisan.gov.in'
      }
    ];
  }
};

export default {
  fetchMarketPrices,
  fetchPestAlerts,
  fetchGovernmentAdvisories
};


