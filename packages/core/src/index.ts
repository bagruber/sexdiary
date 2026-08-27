/**
 * @sexdiary/core — platform-free domain logic shared by the web and
 * mobile apps: domain model, STI data, risk engine, import/export
 * schemas, storage envelope (versioning + migrations), i18n, and small
 * utilities. No DOM, no React Native, no I/O — hosts plug in their own
 * byte stores and UI. This package is the audit surface for the health
 * logic; keep it dependency-free and unit-tested.
 */
export * from "./domain.js";
export * from "./stis.js";
export * from "./risk.js";
export * from "./reducer.js";
export * from "./schema.js";
export * from "./seed.js";
export * from "./storage.js";
export * from "./date.js";
export * from "./id.js";
export * from "./i18n/index.js";
export * from "./tokens.js";
