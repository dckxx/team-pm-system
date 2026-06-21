require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({ take: 5 }).then(users => {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('Users found:', users.length);
  users.forEach(u => console.log(u.name, u.email, u.role, u.isActive));
  return p.$disconnect();
}).catch(e => { console.error('ERROR:', e.message); process.exit(1); });
