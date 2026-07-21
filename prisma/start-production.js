const { spawn } = require('node:child_process');

function databaseUrlFromEnvironment(env) {
  // Keep DATABASE_URL as an escape hatch for local development and existing
  // deployments. External PostgreSQL deployments should provide all four DB_*
  // values instead.
  if (!env.DB_HOST) return env.DATABASE_URL;

  const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missing = required.filter((name) => !env[name]);
  if (missing.length) {
    throw new Error(`Missing required database environment variable(s): ${missing.join(', ')}`);
  }

  const url = new URL('postgresql://localhost');
  url.hostname = env.DB_HOST;
  url.port = env.DB_PORT || '5432';
  url.username = env.DB_USER;
  url.password = env.DB_PASSWORD;
  url.pathname = `/${env.DB_NAME}`;

  // Set DB_SSL=true when the external PostgreSQL server requires TLS.
  if (env.DB_SSL === 'true') url.searchParams.set('sslmode', 'require');
  return url.toString();
}

const databaseUrl = databaseUrlFromEnvironment(process.env);
if (!databaseUrl) {
  throw new Error('Set DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD, or DATABASE_URL.');
}

const environment = { ...process.env, DATABASE_URL: databaseUrl };

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env: environment, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) => {
      code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function initializeDatabase() {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      console.log(`Database init attempt ${attempt}...`);
      await run(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--accept-data-loss']);
      await run(process.execPath, ['prisma/seed.js']);
      console.log('Database initialized successfully.');
      return;
    } catch (error) {
      console.error(`Database init attempt ${attempt} failed: ${error.message}`);
      if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// Preserve the existing behaviour: serve requests while schema sync retries in
// the background, which lets Cloud Run complete its health check promptly.
initializeDatabase();
const server = spawn(process.execPath, ['server.js'], { env: environment, stdio: 'inherit' });
server.once('exit', (code) => process.exit(code ?? 0));
