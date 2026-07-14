import { SignJWT } from 'jose';
import { Client } from 'pg';

const JWT_SECRET = '82K7LEJpdsFUL6R8I15ihfn4FKmamzou0EBzFE1tnzM=';
const secret = new TextEncoder().encode(JWT_SECRET);

const pg = new Client({ connectionString: 'postgresql://neondb_owner:npg_37IXtZpWDwKT@ep-snowy-brook-atav4kxq.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require' });
await pg.connect();
const r = await pg.query("SELECT id, email, plan, stripe_id FROM users WHERE email ILIKE '18571729942%' LIMIT 3");
console.log('users found:', JSON.stringify(r.rows));
await pg.end();

if (r.rows.length === 0) process.exit(1);

const u = r.rows[0];
const token = await new SignJWT({
  email: u.email,
  plan: u.plan,
  stripeId: u.stripe_id ?? null
}).setProtectedHeader({ alg: 'HS256' })
  .setSubject(u.id)
  .setIssuedAt()
  .setExpirationTime('24h')
  .sign(secret);

console.log('TOKEN=' + token);
