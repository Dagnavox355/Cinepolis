import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const baseUrl = process.env.NEON_AUTH_BASE_URL;
if (!baseUrl) throw new Error('NEON_AUTH_BASE_URL no está configurada.');
const response = await fetch(`${baseUrl.replace(/\/$/, '')}/get-session`, {
  headers: { accept: 'application/json' },
});
if (!response.ok) {
  throw new Error(`Neon Auth respondió HTTP ${response.status} al consultar sesión anónima.`);
}
const result = await response.json();
console.log(`Neon Auth OK: endpoint de sesión anónima respondió HTTP ${response.status} (${result?.session ? 'sesión presente' : 'sin sesión'}).`);
