-- ============================================================
-- SEED DATA: Empresa "Elite Catering Miami" con 30 empleados y 100 eventos
-- Password para TODOS: 123456
-- Hash bcrypt de "123456": $2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi
-- ============================================================

-- 1. Crear empresa
INSERT INTO companies (id, name, slug, contact_email, contact_phone, is_active, shift_start_minutes_before, created_at, updated_at)
VALUES (10, 'Elite Catering Miami', 'elite-catering', 'admin@elitecatering.com', '+13055551000', true, 30, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Crear admin
INSERT INTO users (id, name, email, username, password_hash, phone, preferred_lang, must_change_password, is_active, created_at, updated_at)
VALUES (100, 'CARLOS ADMIN', 'carlos@elitecatering.com', 'carlosadmin', '$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi', '+13055551001', 'es', false, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Perfil admin membership
INSERT INTO user_company_memberships (user_id, company_id, profile_id, is_active, created_at)
VALUES (100, 10, (SELECT id FROM profiles WHERE code='admin'), true, NOW())
ON CONFLICT DO NOTHING;

-- 4. Configuración semanal
INSERT INTO weekly_hours_config (company_id, weekly_hours_limit, week_start_day, week_end_day, min_shift_hours, horas_entre_eventos, admin_can_clock_in_all, days_to_reject_event, geolocation_enabled, overtime_multiplier, updated_at)
VALUES (10, 40.00, 'monday', 'sunday', 0, 2, true, 3, false, 1.50, NOW())
ON CONFLICT ON CONSTRAINT uq_whc_company DO UPDATE SET weekly_hours_limit=40, overtime_multiplier=1.50, week_start_day='monday', week_end_day='sunday';

-- 5. Crear 5 roles
INSERT INTO job_roles (id, company_id, name, hourly_rate, is_active, created_at, updated_at) VALUES
(50, 10, 'BARTENDER', 25.00, true, NOW(), NOW()),
(51, 10, 'SERVER', 20.00, true, NOW(), NOW()),
(52, 10, 'CHEF', 35.00, true, NOW(), NOW()),
(53, 10, 'HOST', 18.00, true, NOW(), NOW()),
(54, 10, 'BUSSER', 15.00, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Crear 30 empleados (IDs 101-130)
INSERT INTO users (id, name, email, username, password_hash, phone, preferred_lang, must_change_password, is_active, created_at, updated_at) VALUES
(101,'MARIA GONZALEZ','maria.g@elite.com','mariag','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552001','es',false,true,NOW(),NOW()),
(102,'JUAN PEREZ','juan.p@elite.com','juanp','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552002','es',false,true,NOW(),NOW()),
(103,'ANA MARTINEZ','ana.m@elite.com','anam','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552003','es',false,true,NOW(),NOW()),
(104,'PEDRO LOPEZ','pedro.l@elite.com','pedrol','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552004','es',false,true,NOW(),NOW()),
(105,'SOFIA RODRIGUEZ','sofia.r@elite.com','sofiar','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552005','es',false,true,NOW(),NOW()),
(106,'DIEGO HERNANDEZ','diego.h@elite.com','diegoh','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552006','es',false,true,NOW(),NOW()),
(107,'LAURA GARCIA','laura.g@elite.com','laurag','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552007','es',false,true,NOW(),NOW()),
(108,'CARLOS SANCHEZ','carlos.s@elite.com','carloss','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552008','es',false,true,NOW(),NOW()),
(109,'VALENTINA TORRES','valentina.t@elite.com','valentinat','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552009','es',false,true,NOW(),NOW()),
(110,'MIGUEL RAMIREZ','miguel.r@elite.com','miguelr','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552010','es',false,true,NOW(),NOW()),
(111,'CAMILA FLORES','camila.f@elite.com','camilaf','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552011','es',false,true,NOW(),NOW()),
(112,'ANDRES MORALES','andres.m@elite.com','andresm','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552012','es',false,true,NOW(),NOW()),
(113,'ISABELLA DIAZ','isabella.d@elite.com','isabellad','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552013','es',false,true,NOW(),NOW()),
(114,'SEBASTIAN RUIZ','sebastian.r@elite.com','sebastianr','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552014','es',false,true,NOW(),NOW()),
(115,'DANIELA VARGAS','daniela.v@elite.com','danielav','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552015','es',false,true,NOW(),NOW()),
(116,'NICOLAS CASTRO','nicolas.c@elite.com','nicolasc','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552016','es',false,true,NOW(),NOW()),
(117,'PAULA MENDOZA','paula.m@elite.com','paulam','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552017','es',false,true,NOW(),NOW()),
(118,'ALEJANDRO ORTIZ','alejandro.o@elite.com','alejandroo','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552018','es',false,true,NOW(),NOW()),
(119,'NATALIA REYES','natalia.r@elite.com','nataliar','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552019','es',false,true,NOW(),NOW()),
(120,'FERNANDO SILVA','fernando.s@elite.com','fernandos','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552020','es',false,true,NOW(),NOW()),
(121,'MARIANA CRUZ','mariana.c@elite.com','marianac','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552021','es',false,true,NOW(),NOW()),
(122,'RICARDO PENA','ricardo.p@elite.com','ricardop','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552022','es',false,true,NOW(),NOW()),
(123,'CAROLINA ROJAS','carolina.r@elite.com','carolinar','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552023','es',false,true,NOW(),NOW()),
(124,'GABRIEL HERRERA','gabriel.h@elite.com','gabrielh','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552024','es',false,true,NOW(),NOW()),
(125,'ANDREA MOLINA','andrea.m@elite.com','andream','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552025','es',false,true,NOW(),NOW()),
(126,'LUIS JIMENEZ','luis.j@elite.com','luisj','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552026','es',false,true,NOW(),NOW()),
(127,'VICTORIA LEON','victoria.l@elite.com','victorial','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552027','es',false,true,NOW(),NOW()),
(128,'DAVID ROMERO','david.r@elite.com','davidr','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552028','es',false,true,NOW(),NOW()),
(129,'ELENA NAVARRO','elena.n@elite.com','elenan','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552029','es',false,true,NOW(),NOW()),
(130,'OSCAR DELGADO','oscar.d@elite.com','oscard','$2b$12$LQv3c1yqBo9SkvXS7QTJPOoGz3JCJx7.FhHklCJ3GR8ICKaVf5mDi','+13055552030','es',false,true,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. Memberships (todos como empleados)
INSERT INTO user_company_memberships (user_id, company_id, profile_id, is_active, created_at)
SELECT u.id, 10, (SELECT id FROM profiles WHERE code='employee'), true, NOW()
FROM users u WHERE u.id BETWEEN 101 AND 130
ON CONFLICT DO NOTHING;

-- 8. Asignar roles a empleados
-- Bartenders: 101-108
INSERT INTO employee_job_roles (user_id, company_id, job_role_id, created_at) VALUES
(101,10,50,NOW()),(102,10,50,NOW()),(103,10,50,NOW()),(104,10,50,NOW()),
(105,10,50,NOW()),(106,10,50,NOW()),(107,10,50,NOW()),(108,10,50,NOW())
ON CONFLICT DO NOTHING;
-- Servers: 105-116
INSERT INTO employee_job_roles (user_id, company_id, job_role_id, created_at) VALUES
(105,10,51,NOW()),(106,10,51,NOW()),(107,10,51,NOW()),(108,10,51,NOW()),
(109,10,51,NOW()),(110,10,51,NOW()),(111,10,51,NOW()),(112,10,51,NOW()),
(113,10,51,NOW()),(114,10,51,NOW()),(115,10,51,NOW()),(116,10,51,NOW())
ON CONFLICT DO NOTHING;
-- Chefs: 117-122
INSERT INTO employee_job_roles (user_id, company_id, job_role_id, created_at) VALUES
(117,10,52,NOW()),(118,10,52,NOW()),(119,10,52,NOW()),(120,10,52,NOW()),
(121,10,52,NOW()),(122,10,52,NOW())
ON CONFLICT DO NOTHING;
-- Hosts: 123-126
INSERT INTO employee_job_roles (user_id, company_id, job_role_id, created_at) VALUES
(123,10,53,NOW()),(124,10,53,NOW()),(125,10,53,NOW()),(126,10,53,NOW())
ON CONFLICT DO NOTHING;
-- Bussers: 127-130
INSERT INTO employee_job_roles (user_id, company_id, job_role_id, created_at) VALUES
(127,10,54,NOW()),(128,10,54,NOW()),(129,10,54,NOW()),(130,10,54,NOW())
ON CONFLICT DO NOTHING;

-- 9. Crear 100 eventos (IDs 200-299), todos en estado 'finished'
-- Distribuidos entre Jan 1 y Jun 7, 2026
DO $$
DECLARE
  i INT;
  ev_date DATE;
  ev_name TEXT;
  ev_names TEXT[] := ARRAY['Boda Smith','Cumpleaños Johnson','Gala Corporativa','Cena Privada','Coctel VIP','Fiesta Graduación','Evento Caridad','Lanzamiento Producto','Aniversario Empresa','Brunch Ejecutivo','Conferencia Tech','Festival Gastronomico','Noche de Casino','Boda Garcia','Reunion Familiar','Fiesta Navideña','Año Nuevo Privado','Super Bowl Party','Valentine Dinner','St Patrick Gala','Easter Brunch','Cinco de Mayo','Memorial Day BBQ','Pool Party VIP'];
  addresses TEXT[] := ARRAY['123 Collins Ave','456 Ocean Dr','789 Brickell Ave','321 NW 2nd Ave','555 Lincoln Rd','900 Washington Ave','1200 Alton Rd','1500 Bay Rd','200 SE 1st St','800 NE 1st Ave'];
  dress_codes TEXT[] := ARRAY['BLACK TIE','FORMAL','SEMI-FORMAL','CASUAL ELEGANT','ALL BLACK','WHITE'];
BEGIN
  FOR i IN 0..99 LOOP
    ev_date := '2026-01-01'::date + (i * 1.57)::int; -- spread across ~157 days
    IF ev_date > '2026-06-07'::date THEN ev_date := '2026-06-07'::date - (99-i); END IF;
    ev_name := ev_names[1 + (i % array_length(ev_names,1))] || ' #' || (i+1);
    
    INSERT INTO events (id, company_id, name, event_date, start_time, end_time, address, city, state, zip_code, dress_code, status, created_by, created_at, updated_at)
    VALUES (
      200+i, 10, ev_name, ev_date,
      (ARRAY['10:00','11:00','12:00','14:00','16:00','18:00','19:00','20:00'])[1 + (i % 8)]::time,
      (ARRAY['14:00','15:00','16:00','18:00','20:00','22:00','23:00','00:00'])[1 + (i % 8)]::time,
      addresses[1 + (i % array_length(addresses,1))],
      'Miami', 'FL', '33139',
      dress_codes[1 + (i % array_length(dress_codes,1))],
      'finished', 100, NOW(), NOW()
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- 10. Crear event_job_roles para cada evento (2-4 roles por evento)
DO $$
DECLARE
  ev_id INT;
  role_ids INT[] := ARRAY[50,51,52,53,54];
  r INT;
  slots INT;
  rate_override NUMERIC;
BEGIN
  FOR ev_id IN 200..299 LOOP
    -- Always bartender + server
    INSERT INTO event_job_roles (event_id, job_role_id, slots_required, slots_filled, start_time, hourly_rate_override, created_at, updated_at)
    VALUES (ev_id, 50, 2, 2, (SELECT start_time FROM events WHERE id=ev_id), 
            CASE WHEN ev_id % 5 = 0 THEN 28.00 ELSE NULL END, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    INSERT INTO event_job_roles (event_id, job_role_id, slots_required, slots_filled, start_time, hourly_rate_override, created_at, updated_at)
    VALUES (ev_id, 51, 3, 3, (SELECT start_time FROM events WHERE id=ev_id),
            CASE WHEN ev_id % 7 = 0 THEN 22.00 ELSE NULL END, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Chef for 60% of events
    IF ev_id % 5 < 3 THEN
      INSERT INTO event_job_roles (event_id, job_role_id, slots_required, slots_filled, start_time, created_at, updated_at)
      VALUES (ev_id, 52, 1, 1, (SELECT start_time FROM events WHERE id=ev_id), NOW(), NOW())
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Host for 40% of events
    IF ev_id % 5 < 2 THEN
      INSERT INTO event_job_roles (event_id, job_role_id, slots_required, slots_filled, start_time, created_at, updated_at)
      VALUES (ev_id, 53, 1, 1, (SELECT start_time FROM events WHERE id=ev_id), NOW(), NOW())
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- 11. Create assignments and shifts for each event
-- This creates realistic work patterns where some weeks employees work >40h
DO $$
DECLARE
  ev_id INT;
  ev_rec RECORD;
  emp_id INT;
  assign_id INT;
  shift_hours NUMERIC;
  start_ts TIMESTAMP;
  end_ts TIMESTAMP;
  rate NUMERIC;
  bartenders INT[] := ARRAY[101,102,103,104,105,106,107,108];
  servers INT[] := ARRAY[105,106,107,108,109,110,111,112,113,114,115,116];
  chefs INT[] := ARRAY[117,118,119,120,121,122];
  hosts INT[] := ARRAY[123,124,125,126];
  idx INT;
BEGIN
  FOR ev_id IN 200..299 LOOP
    SELECT * INTO ev_rec FROM events WHERE id = ev_id;
    
    -- Assign 2 bartenders
    FOR idx IN 1..2 LOOP
      emp_id := bartenders[1 + ((ev_id + idx) % array_length(bartenders,1))];
      shift_hours := 4.0 + (((ev_id * idx) % 5)::numeric * 1.5); -- 4-10 hours
      rate := COALESCE((SELECT hourly_rate_override FROM event_job_roles WHERE event_id=ev_id AND job_role_id=50 LIMIT 1), 25.00);
      start_ts := ev_rec.event_date + ev_rec.start_time;
      end_ts := start_ts + (shift_hours || ' hours')::interval;
      
      INSERT INTO event_assignments (event_id, user_id, company_id, job_role_id, status, assigned_by, created_at, updated_at)
      VALUES (ev_id, emp_id, 10, 50, 'approved', 100, NOW(), NOW())
      RETURNING id INTO assign_id;
      
      INSERT INTO shifts (assignment_id, clock_in, clock_out, clock_in_lat, clock_in_lng, hourly_rate_snapshot, hours_worked, regular_pay, overtime_pay, total_pay, is_paused, total_pause_minutes, created_at, updated_at)
      VALUES (assign_id, start_ts, end_ts, 25.7617, -80.1918, rate, shift_hours, shift_hours*rate, 0, shift_hours*rate, false, 0, NOW(), NOW());
    END LOOP;
    
    -- Assign 3 servers
    FOR idx IN 1..3 LOOP
      emp_id := servers[1 + ((ev_id + idx*2) % array_length(servers,1))];
      shift_hours := 3.5 + (((ev_id * idx) % 6)::numeric * 1.25); -- 3.5-10 hours
      rate := COALESCE((SELECT hourly_rate_override FROM event_job_roles WHERE event_id=ev_id AND job_role_id=51 LIMIT 1), 20.00);
      start_ts := ev_rec.event_date + ev_rec.start_time;
      end_ts := start_ts + (shift_hours || ' hours')::interval;
      
      INSERT INTO event_assignments (event_id, user_id, company_id, job_role_id, status, assigned_by, created_at, updated_at)
      VALUES (ev_id, emp_id, 10, 51, 'approved', 100, NOW(), NOW())
      RETURNING id INTO assign_id;
      
      INSERT INTO shifts (assignment_id, clock_in, clock_out, clock_in_lat, clock_in_lng, hourly_rate_snapshot, hours_worked, regular_pay, overtime_pay, total_pay, is_paused, total_pause_minutes, created_at, updated_at)
      VALUES (assign_id, start_ts, end_ts, 25.7617, -80.1918, rate, shift_hours, shift_hours*rate, 0, shift_hours*rate, false, 0, NOW(), NOW());
    END LOOP;
    
    -- Assign 1 chef (60% of events)
    IF ev_id % 5 < 3 THEN
      emp_id := chefs[1 + (ev_id % array_length(chefs,1))];
      shift_hours := 5.0 + (((ev_id) % 4)::numeric * 2.0); -- 5-11 hours
      rate := 35.00;
      start_ts := ev_rec.event_date + ev_rec.start_time;
      end_ts := start_ts + (shift_hours || ' hours')::interval;
      
      INSERT INTO event_assignments (event_id, user_id, company_id, job_role_id, status, assigned_by, created_at, updated_at)
      VALUES (ev_id, emp_id, 10, 52, 'approved', 100, NOW(), NOW())
      RETURNING id INTO assign_id;
      
      INSERT INTO shifts (assignment_id, clock_in, clock_out, clock_in_lat, clock_in_lng, hourly_rate_snapshot, hours_worked, regular_pay, overtime_pay, total_pay, is_paused, total_pause_minutes, created_at, updated_at)
      VALUES (assign_id, start_ts, end_ts, 25.7617, -80.1918, rate, shift_hours, shift_hours*rate, 0, shift_hours*rate, false, 0, NOW(), NOW());
    END IF;
    
    -- Assign 1 host (40% of events)
    IF ev_id % 5 < 2 THEN
      emp_id := hosts[1 + (ev_id % array_length(hosts,1))];
      shift_hours := 4.0 + ((ev_id % 3)::numeric * 2.0); -- 4-8 hours
      rate := 18.00;
      start_ts := ev_rec.event_date + ev_rec.start_time;
      end_ts := start_ts + (shift_hours || ' hours')::interval;
      
      INSERT INTO event_assignments (event_id, user_id, company_id, job_role_id, status, assigned_by, created_at, updated_at)
      VALUES (ev_id, emp_id, 10, 53, 'approved', 100, NOW(), NOW())
      RETURNING id INTO assign_id;
      
      INSERT INTO shifts (assignment_id, clock_in, clock_out, clock_in_lat, clock_in_lng, hourly_rate_snapshot, hours_worked, regular_pay, overtime_pay, total_pay, is_paused, total_pause_minutes, created_at, updated_at)
      VALUES (assign_id, start_ts, end_ts, 25.7617, -80.1918, rate, shift_hours, shift_hours*rate, 0, shift_hours*rate, false, 0, NOW(), NOW());
    END IF;
  END LOOP;
END $$;
