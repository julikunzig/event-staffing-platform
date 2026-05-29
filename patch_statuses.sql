-- ============================================================
-- EventsControl — Patch: eventos para cubrir todos los estados
-- created, filled_pending, filled, cancelled
-- ============================================================

BEGIN;

-- ============================================================
-- CREATED (borrador, recién creado, sin publicar)
-- ============================================================
INSERT INTO events (id, company_id, name, event_date, start_time, end_time, address, city, state, zip_code, latitude, longitude, dress_code, status, notes, is_public, created_by) VALUES
(376, 100, 'Google NYC Holiday Party 2026',
  '2026-12-12', '18:00', '23:00',
  '111 8th Ave', 'New York', 'NY', '10011', 40.7424, -74.0055,
  'Smart Casual', 'created',
  'Draft — pending final headcount confirmation from client.', false, 1001),

(377, 100, 'Private Wedding Rehearsal Dinner — Tribeca',
  '2026-11-13', '19:00', '22:00',
  '2 Desbrosses St', 'New York', 'NY', '10013', 40.7215, -74.0094,
  'Cocktail Attire', 'created',
  'Draft — venue deposit pending.', false, 1002);

-- ============================================================
-- FILLED_PENDING (todos los slots cubiertos, pendiente aprobación)
-- ============================================================
INSERT INTO events (id, company_id, name, event_date, start_time, end_time, address, city, state, zip_code, latitude, longitude, dress_code, status, notes, is_public, created_by) VALUES
(378, 100, 'JPMorgan Fall Investor Dinner',
  '2026-10-08', '18:30', '22:30',
  '383 Madison Ave', 'New York', 'NY', '10017', 40.7539, -73.9780,
  'Business Formal', 'filled_pending',
  'All slots filled. Awaiting final client approval.', false, 1001),

(379, 100, 'Sotheby''s Fall Auction Gala',
  '2026-10-14', '18:00', '22:00',
  '1334 York Ave', 'New York', 'NY', '10021', 40.7627, -73.9565,
  'Black Tie Optional', 'filled_pending',
  'Staff confirmed. Pending client sign-off.', false, 1001);

-- ============================================================
-- FILLED (aprobado y completo, listo para ejecutar)
-- ============================================================
INSERT INTO events (id, company_id, name, event_date, start_time, end_time, address, city, state, zip_code, latitude, longitude, dress_code, status, notes, is_public, created_by) VALUES
(380, 100, 'Citigroup Q3 Results Dinner',
  '2026-07-30', '19:00', '22:30',
  '388 Greenwich St', 'New York', 'NY', '10013', 40.7207, -74.0116,
  'Business Formal', 'filled',
  'Fully staffed and approved. Ready to go.', false, 1001),

(381, 100, 'Hamptons End of Summer Gala',
  '2026-09-05', '17:00', '22:00',
  '1 Ocean Rd', 'Bridgehampton', 'NY', '11932', 40.9337, -72.3040,
  'Summer Formal', 'filled',
  'All positions confirmed. Transport arranged for staff.', false, 1001);

-- ============================================================
-- CANCELLED
-- ============================================================
INSERT INTO events (id, company_id, name, event_date, start_time, end_time, address, city, state, zip_code, latitude, longitude, dress_code, status, notes, is_public, created_by) VALUES
(382, 100, 'Morgan Stanley Rooftop Summer Party',
  '2026-06-25', '17:00', '21:00',
  '1585 Broadway', 'New York', 'NY', '10036', 40.7587, -73.9858,
  'Smart Casual', 'cancelled',
  'Cancelled — venue unavailable due to building maintenance.', false, 1001),

(383, 100, 'Private Gala — The Ned NYC',
  '2026-05-15', '19:00', '23:00',
  '1170 Broadway', 'New York', 'NY', '10001', 40.7459, -73.9893,
  'Black Tie', 'cancelled',
  'Cancelled — client budget cut.', false, 1002);

-- ============================================================
-- EVENT JOB ROLES para los nuevos eventos
-- ============================================================
INSERT INTO event_job_roles (event_id, job_role_id, slots_required, slots_filled, hourly_rate_override) VALUES
-- created
(376, 201, 4, 0, NULL), (376, 202, 8, 0, NULL), (376, 203, 2, 0, NULL), (376, 204, 3, 0, NULL), (376, 207, 2, 0, NULL),
(377, 201, 2, 0, NULL), (377, 202, 4, 0, NULL), (377, 204, 1, 0, NULL),
-- filled_pending
(378, 201, 3, 3, NULL), (378, 202, 5, 5, NULL), (378, 204, 2, 2, NULL), (378, 207, 1, 1, NULL),
(379, 201, 3, 3, NULL), (379, 202, 5, 5, NULL), (379, 204, 2, 2, NULL), (379, 207, 2, 2, NULL),
-- filled
(380, 201, 3, 3, NULL), (380, 202, 5, 5, NULL), (380, 203, 1, 1, NULL), (380, 204, 2, 2, NULL),
(381, 201, 3, 3, NULL), (381, 202, 6, 6, NULL), (381, 204, 2, 2, NULL), (381, 207, 2, 2, NULL),
-- cancelled
(382, 201, 3, 0, NULL), (382, 202, 5, 0, NULL), (382, 204, 2, 0, NULL),
(383, 201, 4, 0, NULL), (383, 202, 6, 0, NULL), (383, 204, 3, 0, NULL), (383, 207, 2, 0, NULL);

-- ============================================================
-- ASSIGNMENTS para filled_pending y filled
-- ============================================================
INSERT INTO event_assignments (event_id, user_id, company_id, job_role_id, status, assigned_by) VALUES
-- filled_pending (378)
(378, 1037, 100, 201, 'confirmed', 1001),
(378, 1010, 100, 201, 'confirmed', 1001),
(378, 1022, 100, 201, 'confirmed', 1001),
(378, 1012, 100, 202, 'confirmed', 1001),
(378, 1019, 100, 202, 'confirmed', 1001),
(378, 1021, 100, 202, 'confirmed', 1001),
(378, 1031, 100, 202, 'confirmed', 1001),
(378, 1039, 100, 202, 'confirmed', 1001),
(378, 1015, 100, 204, 'confirmed', 1001),
(378, 1024, 100, 204, 'confirmed', 1001),
(378, 1033, 100, 207, 'confirmed', 1001),

-- filled_pending (379)
(379, 1030, 100, 201, 'confirmed', 1001),
(379, 1034, 100, 201, 'confirmed', 1001),
(379, 1011, 100, 201, 'confirmed', 1001),
(379, 1013, 100, 202, 'confirmed', 1001),
(379, 1025, 100, 202, 'confirmed', 1001),
(379, 1033, 100, 202, 'confirmed', 1001),
(379, 1035, 100, 202, 'confirmed', 1001),
(379, 1039, 100, 202, 'confirmed', 1001),
(379, 1026, 100, 204, 'confirmed', 1001),
(379, 1032, 100, 204, 'confirmed', 1001),
(379, 1017, 100, 207, 'confirmed', 1001),
(379, 1023, 100, 207, 'confirmed', 1001),

-- filled (380)
(380, 1037, 100, 201, 'confirmed', 1001),
(380, 1010, 100, 201, 'confirmed', 1001),
(380, 1022, 100, 201, 'confirmed', 1001),
(380, 1012, 100, 202, 'confirmed', 1001),
(380, 1019, 100, 202, 'confirmed', 1001),
(380, 1021, 100, 202, 'confirmed', 1001),
(380, 1031, 100, 202, 'confirmed', 1001),
(380, 1039, 100, 202, 'confirmed', 1001),
(380, 1014, 100, 203, 'confirmed', 1001),
(380, 1015, 100, 204, 'confirmed', 1001),
(380, 1024, 100, 204, 'confirmed', 1001),

-- filled (381)
(381, 1030, 100, 201, 'confirmed', 1001),
(381, 1034, 100, 201, 'confirmed', 1001),
(381, 1011, 100, 201, 'confirmed', 1001),
(381, 1013, 100, 202, 'confirmed', 1001),
(381, 1025, 100, 202, 'confirmed', 1001),
(381, 1031, 100, 202, 'confirmed', 1001),
(381, 1033, 100, 202, 'confirmed', 1001),
(381, 1035, 100, 202, 'confirmed', 1001),
(381, 1039, 100, 202, 'confirmed', 1001),
(381, 1026, 100, 204, 'confirmed', 1001),
(381, 1032, 100, 204, 'confirmed', 1001),
(381, 1017, 100, 207, 'confirmed', 1001),
(381, 1023, 100, 207, 'confirmed', 1001);

COMMIT;

-- Verificar
-- SELECT status, COUNT(*) FROM events WHERE company_id = 100 GROUP BY status ORDER BY status;