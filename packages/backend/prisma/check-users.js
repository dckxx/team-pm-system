const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'file:./prisma/dev.db' } } });
p.user.findMany({ take: 5 }).then(users => {
  users.forEach(u => console.log(u.name, u.email, u.role, u.isActive, u.password.substring(0,30)));
  return p.$disconnect();
}).catch(e => { console.error(e); process.exit(1); });
