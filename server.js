/**
 * Hostinger hPanel Node.js Entry Point
 * 
 * In Hostinger hPanel Node.js Application Manager:
 * - Application Root: blog
 * - Application Startup File: server.js
 * - Node.js version: 18.x or 20.x
 */

const path = require('path');
const fs = require('fs');

// Zero-dependency .env loader for Hostinger standalone runtime
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
      console.log(`[XSPEED Hostinger] Loaded environment from ${path.basename(filePath)}`);
    } catch (e) {
      console.error(`[XSPEED Hostinger] Failed to load ${path.basename(filePath)}:`, e.message);
    }
  }
}

// 1. Load production environment variables
loadEnvFile(path.join(__dirname, '.env.production'));
loadEnvFile(path.join(__dirname, '.env'));

// 2. Ensure critical NextAuth defaults
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'https://exspeeds.com';
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'xspeed_nextauth_secret_key_2026_express';
}

const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standaloneServer)) {
  console.log('[XSPEED Hostinger] Starting standalone server from .next/standalone/server.js');
  require(standaloneServer);
} else {
  console.log('[XSPEED Hostinger] Standalone build not found. Starting Next.js CLI directly...');
  require('next/dist/bin/next');
}

