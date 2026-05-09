require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

async function seed() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPwd = await bcrypt.hash('Admin@123', 10);
  const adminId = uuidv4();
  db.query(
    `INSERT OR IGNORE INTO users (id,email,password_hash,first_name,last_name,role,is_active,is_verified)
     VALUES (?,?,?,?,?,'admin',1,1)`,
    [adminId, 'admin@zentropay.local', adminPwd, 'Admin', 'User']
  );
  db.query(`INSERT OR IGNORE INTO wallets (id,user_id,balance,currency) VALUES (?,?,10000.00,'USD')`, [uuidv4(), adminId]);

  // Regular users
  const users = [
    { fn: 'Alice', ln: 'Johnson', email: 'alice@example.com', bal: 2500 },
    { fn: 'Bob', ln: 'Smith', email: 'bob@example.com', bal: 1800 },
    { fn: 'Carol', ln: 'Williams', email: 'carol@example.com', bal: 3200 },
    { fn: 'David', ln: 'Brown', email: 'david@example.com', bal: 900 },
    { fn: 'Eve', ln: 'Davis', email: 'eve@example.com', bal: 5100 },
  ];

  const userPwd = await bcrypt.hash('User@123', 10);
  const userIds = [];
  for (const u of users) {
    const uid = uuidv4();
    db.query(
      `INSERT OR IGNORE INTO users (id,email,password_hash,first_name,last_name,role,is_active,is_verified)
       VALUES (?,?,?,?,?,'user',1,1)`,
      [uid, u.email, userPwd, u.fn, u.ln]
    );
    db.query(`INSERT OR IGNORE INTO wallets (id,user_id,balance,currency) VALUES (?,?,?,'USD')`, [uuidv4(), uid, u.bal]);
    userIds.push({ uid, ...u });
  }

  // Sample transactions
  const methods = ['card', 'bank_transfer', 'wallet', 'stripe'];
  const statuses = ['completed', 'completed', 'completed', 'pending', 'failed'];
  const descriptions = ['Product purchase', 'Service payment', 'Subscription renewal', 'Invoice payment', 'Refund', 'Wallet top-up'];

  const allIds = [{ uid: adminId }, ...userIds];
  for (let i = 0; i < 40; i++) {
    const user = allIds[i % allIds.length];
    const amount = parseFloat((Math.random() * 500 + 10).toFixed(2));
    const daysAgo = Math.floor(Math.random() * 60);
    const ref = `ZTP-${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;
    db.query(
      `INSERT OR IGNORE INTO transactions (id,user_id,amount,currency,status,description,payment_method,transaction_reference,created_at,completed_at)
       VALUES (?,?,?,'USD',?,?,?,?,datetime('now',?||' days'),datetime('now',?||' days'))`,
      [
        uuidv4(), user.uid, amount,
        statuses[i % statuses.length],
        descriptions[i % descriptions.length],
        methods[i % methods.length],
        ref,
        `-${daysAgo}`, `-${daysAgo}`
      ]
    );
  }

  console.log('✅ Database seeded successfully!');
  console.log('   Admin: admin@zentropay.local / Admin@123');
  console.log('   User:  alice@example.com / User@123');
}

seed().catch(console.error);
