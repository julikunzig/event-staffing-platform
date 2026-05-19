-- Insertar empresa platform
INSERT INTO companies (name, slug, contact_email, is_active, created_at, updated_at)
VALUES ('Platform Admin', 'platform', 'superadmin@platform.com', true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insertar usuario superadmin
-- Password: Admin1234! (bcrypt hash)
INSERT INTO users (name, email, password_hash, phone, preferred_lang, is_active, created_at, updated_at)
VALUES (
  'Super Administrador',
  'superadmin@platform.com',
  '$2b$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2',
  NULL,
  'es',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insertar membresía
INSERT INTO user_company_memberships (user_id, company_id, profile_id, is_active, created_at, updated_at)
SELECT u.id, c.id, p.id, true, NOW(), NOW()
FROM users u, companies c, profiles p
WHERE u.email = 'superadmin@platform.com'
AND c.slug = 'platform'
AND p.code = 'super_admin'
AND NOT EXISTS (
  SELECT 1 FROM user_company_memberships ucm
  WHERE ucm.user_id = u.id AND ucm.company_id = c.id
);
