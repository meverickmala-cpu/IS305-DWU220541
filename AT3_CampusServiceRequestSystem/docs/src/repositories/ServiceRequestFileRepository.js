'use strict';

const fs = require('fs/promises');
const path = require('path');

/**
 * ServiceRequestFileRepository
 * Separates file-reading and file-writing operations for
 * serviceRequests.json (and its companion requestHistory.json) from the
 * domain classes and the console menu (Distinction: File Repository
 * Classes). Works with plain JSON-serialisable data, not class instances.
 */
class ServiceRequestFileRepository {
  #requestsFilePath;
  #historyFilePath;

  constructor(
    requestsFilePath = path.join(__dirname, '..', '..', 'data', 'serviceRequests.json'),
    historyFilePath = path.join(__dirname, '..', '..', 'data', 'requestHistory.json')
  ) {
    this.#requestsFilePath = requestsFilePath;
    this.#historyFilePath = historyFilePath;
  }

  async #readJsonArray(filePath) {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      if (!raw.trim()) return [];
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw new Error(`Failed to read ${filePath}: ${err.message}`);
    }
  }

  async #writeJsonArray(filePath, records) {
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err) {
      throw new Error(`Failed to write ${filePath}: ${err.message}`);
    }
  }

  // --- serviceRequests.json ---

  async loadAll() {
    return this.#readJsonArray(this.#requestsFilePath);
  }

  async saveAll(records) {
    return this.#writeJsonArray(this.#requestsFilePath, records);
  }

  async create(record) {
    const records = await this.loadAll();
    records.push(record);
    await this.saveAll(records);
    return record;
  }

  async findById(requestId) {
    const records = await this.loadAll();
    return records.find((r) => r.requestId === requestId) || null;
  }

  async findByRequester(userId) {
    const records = await this.loadAll();
    return records.filter((r) => r.requesterId === userId);
  }

  async findByTechnician(technicianId) {
    const records = await this.loadAll();
    return records.filter((r) => r.assignedTechnicianId === technicianId);
  }

  async update(requestId, changes) {
    const records = await this.loadAll();
    const index = records.findIndex((r) => r.requestId === requestId);
    if (index === -1) {
      throw new Error(`No request found with ID "${requestId}" in the repository.`);
    }
    records[index] = { ...records[index], ...changes };
    await this.saveAll(records);
    return records[index];
  }

  // --- requestHistory.json ---

  async loadHistory() {
    return this.#readJsonArray(this.#historyFilePath);
  }

  async saveHistory(historyRecords) {
    return this.#writeJsonArray(this.#historyFilePath, historyRecords);
  }
}

module.exports = ServiceRequestFileRepository;
