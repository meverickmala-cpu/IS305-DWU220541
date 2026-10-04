'use strict';

const fs = require('fs/promises');
const path = require('path');

/**
 * UserFileRepository
 * Separates file-reading and file-writing operations for users.json from
 * the domain classes and the console menu (Distinction: File Repository
 * Classes). Works with plain JSON-serialisable data, not class instances.
 */
class UserFileRepository {
  #filePath;

  constructor(filePath = path.join(__dirname, '..', '..', 'data', 'users.json')) {
    this.#filePath = filePath;
  }

  /**
   * Loads all records. Returns an empty array if the file does not exist
   * yet, rather than throwing.
   */
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

  async findById(userId) {
    const records = await this.loadAll();
    return records.find((r) => r.userId === userId) || null;
  }

  async update(userId, changes) {
    const records = await this.loadAll();
    const index = records.findIndex((r) => r.userId === userId);
    if (index === -1) {
      throw new Error(`No user found with ID "${userId}" in the repository.`);
    }
    records[index] = { ...records[index], ...changes };
    await this.saveAll(records);
    return records[index];
  }
}

module.exports = UserFileRepository;
