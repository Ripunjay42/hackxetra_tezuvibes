const pgp = require('pg-promise')({
    // Initialization options
  });
  
  const db = pgp({
    connectionString: 'postgresql://postgres.ldhkhkbqftxbowkvugvk:Aniketripunjay%4012@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: {
      rejectUnauthorized: false,
    },
  });
  
  module.exports = db;
  