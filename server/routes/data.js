import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { fetchMarketPrices, fetchPestAlerts, fetchGovernmentAdvisories } from '../utils/data.js';
import { cache } from '../utils/cache.js';

const router = express.Router();

router.get('/market-prices', authenticateToken, async (req, res) => {
  try {
    const { crop, page = 1, limit = 20 } = req.query;
    const key = `market:${crop || 'all'}`;
    const cached = cache.get(key);
    if (cached) {
      const etag = cached.etag;
      if (req.headers['if-none-match'] === etag) return res.status(304).end();
      const start = (page - 1) * limit;
      const paged = cached.value.slice(start, start + Number(limit));
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.json({ success: true, data: paged, total: cached.value.length, page: Number(page) });
    }
    const data = await fetchMarketPrices(crop);
    const etag = cache.set(key, data, 300000);
    const start = (page - 1) * limit;
    const paged = data.slice(start, start + Number(limit));
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: paged, total: data.length, page: Number(page) });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch market prices' });
  }
});

router.get('/pest-alerts', authenticateToken, async (req, res) => {
  try {
    const { crop, district, date, pest_name, page = 1, limit = 20 } = req.query;
    const key = `pest:${crop || pest_name || 'all'}:${district || 'all'}:${date || 'all'}`;
    const cached = cache.get(key);
    if (cached) {
      const etag = cached.etag;
      if (req.headers['if-none-match'] === etag) return res.status(304).end();
      const start = (page - 1) * limit;
      const paged = cached.value.slice(start, start + Number(limit));
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.json({ success: true, data: paged, total: cached.value.length, page: Number(page) });
    }
    let data = await fetchPestAlerts(crop || pest_name, district);
    if (date) {
      const d = String(date).toLowerCase();
      data = data.filter(a => String(a.date || '').toLowerCase().includes(d));
    }
    const etag = cache.set(key, data, 300000);
    const start = (page - 1) * limit;
    const paged = data.slice(start, start + Number(limit));
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: paged, total: data.length, page: Number(page) });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch pest alerts' });
  }
});

router.get('/government-advisories', authenticateToken, async (req, res) => {
  try {
    const { scheme_type, crop, page = 1, limit = 20 } = req.query;
    const key = `schemes:${scheme_type || 'all'}:${crop || 'all'}`;
    const cached = cache.get(key);
    if (cached) {
      const etag = cached.etag;
      if (req.headers['if-none-match'] === etag) return res.status(304).end();
      let data = cached.value;
      const start = (page - 1) * limit;
      const paged = data.slice(start, start + Number(limit));
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.json({ success: true, data: paged, total: data.length, page: Number(page) });
    }
    let data = await fetchGovernmentAdvisories();
    if (scheme_type) data = data.filter(s => String(s.type || '').toLowerCase().includes(String(scheme_type).toLowerCase()));
    if (crop) data = data.filter(s => String(s.description || '').toLowerCase().includes(String(crop).toLowerCase()));
    const etag = cache.set(key, data, 300000);
    const start = (page - 1) * limit;
    const paged = data.slice(start, start + Number(limit));
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: paged, total: data.length, page: Number(page) });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch advisories' });
  }
});

export default router;


