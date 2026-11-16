/**
 * db.js — Single source of truth for all database operations.
 * Uses NeDB (file-backed, pure JS) so the app works without MongoDB.
 * Data is stored in backend/data/*.db files and persists across restarts.
 */
const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function ds(name) {
  return Datastore.create({ filename: path.join(DATA_DIR, `${name}.db`), autoload: true });
}

const db = {
  users:          ds('users'),
  emailAccounts:  ds('emailAccounts'),
  conversations:  ds('conversations'),
  messages:       ds('messages'),
  aiAnalysis:     ds('aiAnalysis'),
  replyDrafts:    ds('replyDrafts'),
  notifications:  ds('notifications'),
};

function newId() { return crypto.randomBytes(12).toString('hex'); }

function now() { return new Date(); }

// Build NeDB-compatible query from filter object (handle $or, $in, null checks)
function q(filter = {}) {
  const out = {};
  for (const [k, v] of Object.entries(filter)) {
    if (k === '$or')  { out.$or  = v.map(q); continue; }
    if (k === '$and') { out.$and = v.map(q); continue; }
    if (v === null || v === undefined) {
      out[k] = { $in: [null, undefined] }; continue;
    }
    if (typeof v === 'object' && !Array.isArray(v)) {
      // pass through $in, $ne, $exists, $gt, $lt etc.
      out[k] = v; continue;
    }
    out[k] = v;
  }
  return out;
}

// Helpers
async function findById(store, id) {
  if (!id) return null;
  return store.findOne({ _id: String(id) });
}

async function findOne(store, filter) {
  return store.findOne(q(filter));
}

async function findMany(store, filter = {}, { sort = {}, skip = 0, limit = 0 } = {}) {
  let cursor = store.find(q(filter));
  if (Object.keys(sort).length) cursor = cursor.sort(sort);
  if (skip)  cursor = cursor.skip(skip);
  if (limit) cursor = cursor.limit(limit);
  return cursor;
}

async function create(store, data) {
  const doc = { _id: newId(), createdAt: now(), updatedAt: now(), ...data };
  await store.insert(doc);
  return doc;
}

async function updateById(store, id, patch) {
  const update = { ...patch, updatedAt: now() };
  await store.update({ _id: String(id) }, { $set: update }, {});
  return store.findOne({ _id: String(id) });
}

async function upsertOne(store, filter, patch) {
  const existing = await findOne(store, filter);
  if (existing) {
    const update = { ...patch, updatedAt: now() };
    await store.update(q(filter), { $set: update }, {});
    return store.findOne(q(filter));
  } else {
    return create(store, { ...patch });
  }
}

async function count(store, filter = {}) {
  return store.count(q(filter));
}

async function remove(store, filter) {
  return store.remove(q(filter), { multi: true });
}

async function updateMany(store, filter, patch) {
  return store.update(q(filter), { $set: { ...patch, updatedAt: now() } }, { multi: true });
}

module.exports = { db, newId, now, q, findById, findOne, findMany, create, updateById, upsertOne, count, remove, updateMany };
