/**
 * Application-wide constants.
 *
 * API_BASE_URL  — uses a relative /api path so all HTTP requests go through
 *                 Vercel's reverse proxy (vercel.json rewrites /api/* to Render).
 *                 This makes the cookie first-party on gec-chat.vercel.app,
 *                 which is required for HttpOnly SameSite=Lax cookies to work.
 *
 * SOCKET_URL    — direct Render URL for Socket.IO. Vercel's serverless runtime
 *                 does not support WebSocket proxying, so the socket must connect
 *                 to Render directly. Set VITE_SOCKET_URL in the Vercel dashboard.
 */
export const API_BASE_URL = "/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
