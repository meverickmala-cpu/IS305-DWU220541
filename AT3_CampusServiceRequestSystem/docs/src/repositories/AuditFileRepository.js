'use strict';

const fs = require('fs/promises');
const path = require('path');

/**
 * AuditFileRepository
 * Separates file-reading and file-writing operations for auditLog.json
 * from the domain classes and the console menu (Distinction: File
 * Repository Classes). Works with plain JSON-serialisable data, not class
 * instances.
 */
class AuditFileRepository {
  #filePath;

  constructor(filePath = path.join(__dirname, '..', '..', 'data', 'auditLog.json')) {
    this.#filePath = filePath;
  }

  async loadAll() {
    try {
      const raw = await fs.readFile(this.#filePath, 'utf-8');
      if (!raw.trim()) return [];
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw new Error(`Failed to read ${this.#filePath}: ${err.message}`);
    }
  }

  async saveAll(records) {
    try {
      await fs.mkdir(path.dirname(this.#filePath), { recursive: true });
      await fs.writeFile(this.#filePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err) {
      throw new Error(`Failed to write ${this.#filePath}: ${err.message}`);
    }
  }

  async create(record) {
    const records = await this.loadAll();
    records.push(record);
    await this.saveAll(records);
    return record;
  }

  async findById(auditId) {
    const records = await this.loadAll();
    return records.find((r) => r.auditId === auditId) || null;
  }
}

module.exports = AuditFileRepository;
