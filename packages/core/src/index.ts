/**
 * @sexdiary/core — platform-free domain logic shared by the web and
 * mobile apps: domain model, STI data, risk engine, import/export
 * schemas, storage envelope (versioning + migrations), i18n, and small
 * utilities. No DOM, no React Native, no I/O — hosts plug in their own
 * byte stores and UI. This package is the audit surface for the health
 * logic; keep it dependency-free and unit-tested.
 */
export * from "./domain";
export * from "./stis";
export * from "./risk";
export * from "./reducer";
export * from "./schema";
export * from "./seed";
export * from "./storage";
export * from "./date";
export * from "./id";
export * from "./i18n";
