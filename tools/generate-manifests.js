#!/usr/bin/env node
/**
 * generate-manifests.js
 * ----------------------------------------------------------------------
 * Static hosts (GitHub Pages / Vercel) cannot list a folder's contents
 * from client-side JavaScript — there is no directory index available
 * over HTTP. To let the viewer "automatically" pick up new files, this
 * script scans each assets/<dataset>/ folder at BUILD time and writes a
 * manifest.json describing what's inside. The browser then reads that
 * manifest instead of trying to list the folder itself.
 *
 * Run it locally after adding files:
 *    node tools/generate-manifests.js
 *
 * Or let the included GitHub Action run it automatically on every push,
 * so you never have to run it by hand (see .github/workflows).
 * ----------------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "assets");

const PHOTO_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
const VIDEO_EXT = [".mp4", ".webm", ".mov", ".m4v", ".ogg"];
const DOC_EXT = [".pdf", ".docx", ".txt", ".zip", ".csv", ".json", ".md"];

function listFiles(dir, extensions) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => extensions.includes(path.extname(name).toLowerCase()))
    .sort();
}

function fileMeta(dir, name) {
  const full = path.join(dir, name);
  const stat = fs.statSync(full);
  return {
    name,
    size: stat.size,
    modified: stat.mtime.toISOString()
  };
}

function buildManifest(datasetId) {
  const dsDir = path.join(ASSETS_DIR, datasetId);
  const photosDir = path.join(dsDir, "photos");
  const videosDir = path.join(dsDir, "videos");
  const docsDir = path.join(dsDir, "documents");

  const photos = listFiles(photosDir, PHOTO_EXT).map((n) => fileMeta(photosDir, n));
  const videos = listFiles(videosDir, VIDEO_EXT).map((n) => fileMeta(videosDir, n));
  const documents = listFiles(docsDir, DOC_EXT).map((n) => fileMeta(docsDir, n));

  const hasChats = fs.existsSync(path.join(dsDir, "chats.json"));
  const hasProfile = fs.existsSync(path.join(dsDir, "profile.json"));

  const allTimes = [...photos, ...videos, ...documents].map((f) => f.modified);
  const lastUpdated = allTimes.sort().slice(-1)[0] || new Date().toISOString();

  return {
    dataset: datasetId,
    generatedAt: new Date().toISOString(),
    lastUpdated,
    hasChats,
    hasProfile,
    counts: {
      photos: photos.length,
      videos: videos.length,
      documents: documents.length
    },
    photos,
    videos,
    documents
  };
}

function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error("No assets/ directory found at project root.");
    process.exit(1);
  }

  const datasetDirs = fs
    .readdirSync(ASSETS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  if (datasetDirs.length === 0) {
    console.warn("No dataset folders found inside assets/.");
    return;
  }

  datasetDirs.forEach((datasetId) => {
    const manifest = buildManifest(datasetId);
    const outPath = path.join(ASSETS_DIR, datasetId, "manifest.json");
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log(
      `manifest.json written for "${datasetId}" ` +
        `(${manifest.counts.photos} photos, ${manifest.counts.videos} videos, ${manifest.counts.documents} documents)`
    );
  });
}

main();
