const { PrismaClient } = require('@prisma/client');
console.log('PrismaClient loaded');
const p = new PrismaClient({
  datasources: { db: { url: 'file:./dev.db' } }
});
p.$connect()
  .then(() => {
    console.log('connected OK');
    return p.$disconnect();
  })
  .catch(e => console.log('connect error:', e.message));
