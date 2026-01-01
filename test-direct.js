const { Client } = require('pg');

// Test avec les mêmes paramètres que Prisma
const client = new Client({
  host: 'db.aebfwrtctwbvgnccfdbs.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'EstinBiblio',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000
});

console.log('Testing connection to Supabase...');
console.log(`Host: db.aebfwrtctwbvgnccfdbs.supabase.co:5432`);
console.log(`User: postgres`);

client.connect()
  .then(() => {
    console.log('✅ Successfully connected!');
    return client.query('SELECT version()');
  })
  .then(result => {
    console.log('PostgreSQL Version:', result.rows[0].version);
    client.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    console.error('Full error:', err);
    client.end();
    process.exit(1);
  });