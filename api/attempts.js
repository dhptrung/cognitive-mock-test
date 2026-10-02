// Lưu lịch sử làm bài trên Vercel Blob. Mỗi lần làm là 2 file:
//   attempts/<id>.json  — đầy đủ đề, đáp án, thời gian (kèm hash của mã thiết bị đã gửi)
//   summaries/<id>.json — bản tóm tắt nhỏ để trang Lịch sử tải nhanh
// GET    /api/attempts         → danh sách tóm tắt của mọi người
// GET    /api/attempts?id=...  → chi tiết một lần làm
// POST   /api/attempts         → lưu một lần làm (header x-device-key)
// DELETE /api/attempts?id=...  → xóa, chỉ thiết bị đã gửi mới xóa được
import { put, list, del, get } from '@vercel/blob';
import { createHash } from 'node:crypto';

const ACCESS = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';
const MAX_BYTES = 1_000_000;
const SECTION_KEYS = new Set(['num', 'verb', 'abs', 'crit']);
const LEVELS = new Set(['easy', 'medium', 'hard', 'mixed']);

const hash = s => createHash('sha256').update(String(s)).digest('hex');
const okId = id => typeof id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(id);
const num = x => Number.isFinite(x);

function validate(a) {
  return a && typeof a === 'object' && okId(a.id) && num(a.t) &&
    typeof a.name === 'string' && a.name.trim() && a.name.length <= 40 &&
    typeof a.label === 'string' && a.label.length <= 120 && LEVELS.has(a.level) &&
    Array.isArray(a.sections) && a.sections.length >= 1 && a.sections.length <= 4 &&
    a.sections.every(s => s && SECTION_KEYS.has(s.key) && num(s.secs) && num(s.used) &&
      Array.isArray(s.qs) && s.qs.length >= 1 && s.qs.length <= 60 &&
      Array.isArray(s.answers) && s.answers.length === s.qs.length &&
      Array.isArray(s.times) && s.times.length === s.qs.length &&
      s.qs.every(q => q && typeof q === 'object' && Number.isInteger(q.ans)));
}

const summarize = a => ({
  id: a.id, t: a.t, name: a.name.trim(), label: a.label, level: a.level,
  kind: a.kind === 'review' ? 'review' : 'test', early: !!a.early,
  secs: a.sections.map(s => ({
    key: s.key, n: s.qs.length, used: s.used, secs: s.secs,
    c: s.qs.filter((q, i) => s.answers[i] === q.ans).length,
  })),
});

async function readJSON(pathname) {
  const r = await get(pathname, { access: ACCESS, useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return JSON.parse(await new Response(r.stream).text());
}

async function listAll(prefix) {
  const out = [];
  let cursor;
  do {
    const r = await list({ prefix, cursor, limit: 1000 });
    out.push(...r.blobs);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out;
}

async function mapLimit(items, limit, fn) {
  const res = new Array(items.length);
  let next = 0;
  const worker = async () => { while (next < items.length) { const k = next++; res[k] = await fn(items[k]); } };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return res;
}

const exists = async pathname => (await list({ prefix: pathname, limit: 1 })).blobs.find(b => b.pathname === pathname);
const writeJSON = (pathname, data) => put(pathname, JSON.stringify(data), {
  access: ACCESS, addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json',
});

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const id = req.query?.id;

    if (req.method === 'GET' && id) {
      if (!okId(id)) return res.status(400).json({ error: 'id không hợp lệ' });
      const a = await readJSON(`attempts/${id}.json`);
      if (!a) return res.status(404).json({ error: 'không tìm thấy' });
      delete a.owner;
      return res.status(200).json(a);
    }

    if (req.method === 'GET') {
      const blobs = await listAll('summaries/');
      const items = (await mapLimit(blobs, 16, b => readJSON(b.pathname).catch(() => null)))
        .filter(Boolean).sort((x, y) => y.t - x.t);
      return res.status(200).json({ items });
    }

    const key = req.headers['x-device-key'];
    if (typeof key !== 'string' || key.length < 16 || key.length > 100) {
      return res.status(400).json({ error: 'thiếu mã thiết bị' });
    }

    if (req.method === 'POST') {
      const a = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (JSON.stringify(a ?? null).length > MAX_BYTES) return res.status(413).json({ error: 'dữ liệu quá lớn' });
      if (!validate(a)) return res.status(400).json({ error: 'dữ liệu không đúng định dạng' });
      const path = `attempts/${a.id}.json`;
      if (await exists(path)) {
        const old = await readJSON(path);
        return old?.owner === hash(key)
          ? res.status(200).json({ ok: true, existed: true })
          : res.status(409).json({ error: 'id đã được thiết bị khác dùng' });
      }
      await writeJSON(path, { ...a, owner: hash(key) });
      await writeJSON(`summaries/${a.id}.json`, summarize(a));
      return res.status(201).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      if (!okId(id)) return res.status(400).json({ error: 'id không hợp lệ' });
      const old = await readJSON(`attempts/${id}.json`);
      if (!old) return res.status(404).json({ error: 'không tìm thấy' });
      if (old.owner !== hash(key)) return res.status(403).json({ error: 'chỉ thiết bị đã gửi mới xóa được' });
      await del([`attempts/${id}.json`, `summaries/${id}.json`]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'method không hỗ trợ' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'lỗi server' });
  }
}
