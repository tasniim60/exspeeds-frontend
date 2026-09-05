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

const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standaloneServer)) {
  console.log('[XSPEED Hostinger] Starting standalone server from .next/standalone/server.js');
  require(standaloneServer);
} else {
  console.log('[XSPEED Hostinger] Standalone build not found. Starting Next.js CLI directly...');
  require('next/dist/bin/next');
}
