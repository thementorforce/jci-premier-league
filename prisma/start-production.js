const { spawn } = require('node:child_process');

function databaseUrlFromEnvironment(env) {
  let url = env.DATABASE_URL;

  // If DB_HOST is explicitly provided, construct URL from DB_* vars
  if (env.DB_HOST && env.DB_HOST.trim() !== '') {
    const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missing = required.filter((name) => !env[name] || env[name].trim() === '');
    if (!missing.length) {
      const dbUrl = new URL('postgresql://localhost');
      dbUrl.hostname = env.DB_HOST;
      dbUrl.port = env.DB_PORT || '5432';
      dbUrl.username = env.DB_USER;
      dbUrl.password = env.DB_PASSWORD;
      dbUrl.pathname = `/${env.DB_NAME}`;

      if (env.DB_SSL === 'true') dbUrl.searchParams.set('sslmode', 'require');
      url = dbUrl.toString();
    }
  }

  // Sanitize empty host (@/) for Cloud SQL socket URLs
  if (url && url.includes('@/')) {
    url = url.replace('@/', '@localhost/');
  }

  return url;
}

const databaseUrl = databaseUrlFromEnvironment(process.env);
const environment = { ...process.env };
if (databaseUrl) {
  environment.DATABASE_URL = databaseUrl;
}

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
  if (!databaseUrl) {
    console.warn('DATABASE_URL is not configured. Skipping database initialization.');
    return;
  }
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

// Serve requests while schema sync retries in the background, allowing Cloud Run to pass port health checks
initializeDatabase().catch((err) => console.error('Database initialization background error:', err));
const server = spawn(process.execPath, ['server.js'], { env: environment, stdio: 'inherit' });
server.once('exit', (code) => process.exit(code ?? 0));

