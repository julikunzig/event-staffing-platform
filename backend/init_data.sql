-- Create platform company
INSERT INTO companies (name, slug, contact_email, contact_phone, is_active, created_at, updated_at)
VALUES ('platform', 'platform', 'admin@platform.com', '+1234567890', true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Create super_admin profile if it doesn't exist
INSERT INTO profiles (code, name_es, name_en, is_active, created_at, updated_at)
VALUES ('super_admin', 'Super Administrador', 'Super Admin', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Create superadmin user with correct password hash for "Admin1234!"
INSERT INTO users (name, email, password_hash, phone, preferred_lang, is_active, created_at, updated_at)
VALUES (
  'Super Admin',
  'superadmin@platform.com',
  '$2b$12$qY9Kyb9XaGbOn.TCEd85Nu7VCAjkieWNy/FK.w/LyodKSSsa8D8a6',
  '+1234567890',
  'es',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create user membership for superadmin
INSERT INTO user_company_memberships (user_id, company_id, profile_id, is_active, created_at, updated_at)
SELECT u.id, c.id, p.id, true, NOW(), NOW()
FROM users u, companies c, profiles p
WHERE u.email = 'superadmin@platform.com' AND c.slug = 'platform' AND p.code = 'super_admin'
ON CONFLICT (user_id, company_id) DO NOTHING;
