import { User } from '../models/User';

export async function ensureAdminUser(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'SOMS Admin';

  if (!email || !password) {
    console.log('⚠️ ADMIN_EMAIL and ADMIN_PASSWORD are not set; default admin user will not be created.');
    return;
  }

  const adminExists = await User.findOne({ role: 'admin' });
  if (adminExists) {
    console.log('✅ Admin user already exists.');
    return;
  }

  await User.create({
    name,
    email,
    password,
    role: 'admin',
  });

  console.log(`✅ Default admin user created: ${email}`);
}
