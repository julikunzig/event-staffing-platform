-- ============================================================
-- EventsControl — Datos Demo para Presentación
-- Empresa: Elite Event Staffing (New York)
-- 30 empleados | 75 eventos | USA
-- ============================================================

BEGIN;

-- ============================================================
-- 1. COMPANY
-- ============================================================
INSERT INTO companies (id, name, slug, contact_email, contact_phone, is_active, shift_start_minutes_before)
VALUES (
  100,
  'Elite Event Staffing',
  'elite-event-staffing',
  'ops@eliteevents.com',
  '+12125550100',
  true,
  30
);

-- weekly hours config
INSERT INTO weekly_hours_config (company_id, weekly_hours_limit, week_start_day, week_end_day, min_shift_hours, horas_entre_eventos)
VALUES (100, 40, 'monday', 'sunday', 4, 8);

-- ============================================================
-- 2. JOB ROLES
-- ============================================================
INSERT INTO job_roles (id, company_id, name, hourly_rate, is_active) VALUES
  (201, 100, 'Bartender',        22.00, true),
  (202, 100, 'Server',           18.00, true),
  (203, 100, 'Cook / Chef',      24.00, true),
  (204, 100, 'Security Guard',   20.00, true),
  (205, 100, 'Event Coordinator',28.00, true),
  (206, 100, 'Barback',          15.00, true),
  (207, 100, 'Host / Hostess',   17.00, true),
  (208, 100, 'Valet Attendant',  16.00, true),
  (209, 100, 'Coat Check',       14.00, true),
  (210, 100, 'Dishwasher',       13.00, true);

-- ============================================================
-- 3. USERS (30 empleados + 3 admins/coordinadores)
-- ============================================================
-- password_hash corresponde a "Demo1234!" con bcrypt
-- Usamos un hash de ejemplo válido para todos
DO $$
DECLARE
  demo_hash TEXT := '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMBnDXkWlrVDFnO8C6K6W';
BEGIN

-- Admins / Coordinadores
INSERT INTO users (id, name, email, password_hash, phone, preferred_lang, is_active, must_change_password, city, state) VALUES
  (1001, 'Jennifer Walsh',    'jennifer.walsh@eliteevents.com',    demo_hash, '+12125550201', 'en', true, false, 'New York',     'NY'),
  (1002, 'Marcus Thompson',   'marcus.thompson@eliteevents.com',   demo_hash, '+12125550202', 'en', true, false, 'Brooklyn',     'NY'),
  (1003, 'Sofia Ramirez',     'sofia.ramirez@eliteevents.com',     demo_hash, '+12125550203', 'en', true, false, 'Manhattan',    'NY');

-- Empleados
INSERT INTO users (id, name, email, password_hash, phone, preferred_lang, is_active, must_change_password, city, state) VALUES
  (1010, 'James Carter',      'james.carter@gmail.com',            demo_hash, '+12125550210', 'en', true, false, 'Queens',       'NY'),
  (1011, 'Ashley Rodriguez',  'ashley.rodriguez@gmail.com',        demo_hash, '+12125550211', 'en', true, false, 'Bronx',        'NY'),
  (1012, 'Tyler Brooks',      'tyler.brooks@gmail.com',            demo_hash, '+12125550212', 'en', true, false, 'Hoboken',      'NJ'),
  (1013, 'Natalie Chen',      'natalie.chen@gmail.com',            demo_hash, '+12125550213', 'en', true, false, 'Jersey City',  'NJ'),
  (1014, 'Devon Williams',    'devon.williams@gmail.com',          demo_hash, '+12125550214', 'en', true, false, 'New York',     'NY'),
  (1015, 'Priya Patel',       'priya.patel@gmail.com',             demo_hash, '+12125550215', 'en', true, false, 'Manhattan',    'NY'),
  (1016, 'Carlos Mendez',     'carlos.mendez@gmail.com',           demo_hash, '+12125550216', 'es', true, false, 'Brooklyn',     'NY'),
  (1017, 'Hannah Foster',     'hannah.foster@gmail.com',           demo_hash, '+12125550217', 'en', true, false, 'Staten Island','NY'),
  (1018, 'Kevin Park',        'kevin.park@gmail.com',              demo_hash, '+12125550218', 'en', true, false, 'Flushing',     'NY'),
  (1019, 'Brianna Scott',     'brianna.scott@gmail.com',           demo_hash, '+12125550219', 'en', true, false, 'Harlem',       'NY'),
  (1020, 'Luis Morales',      'luis.morales@gmail.com',            demo_hash, '+17185550220', 'es', true, false, 'Queens',       'NY'),
  (1021, 'Megan Torres',      'megan.torres@gmail.com',            demo_hash, '+17185550221', 'en', true, false, 'New York',     'NY'),
  (1022, 'Daniel Kim',        'daniel.kim@gmail.com',              demo_hash, '+19175550222', 'en', true, false, 'Fort Lee',     'NJ'),
  (1023, 'Rachel Green',      'rachel.green@gmail.com',            demo_hash, '+16465550223', 'en', true, false, 'Manhattan',    'NY'),
  (1024, 'Omar Hassan',       'omar.hassan@gmail.com',             demo_hash, '+12015550224', 'en', true, false, 'Newark',       'NJ'),
  (1025, 'Stephanie Lee',     'stephanie.lee@gmail.com',           demo_hash, '+12015550225', 'en', true, false, 'Edgewater',    'NJ'),
  (1026, 'Marcus Johnson',    'marcus.j@gmail.com',                demo_hash, '+19295550226', 'en', true, false, 'Brooklyn',     'NY'),
  (1027, 'Amber Davis',       'amber.davis@gmail.com',             demo_hash, '+18452550227', 'en', true, false, 'Yonkers',      'NY'),
  (1028, 'Chris Nguyen',      'chris.nguyen@gmail.com',            demo_hash, '+15165550228', 'en', true, false, 'Long Island',  'NY'),
  (1029, 'Isabella Cruz',     'isabella.cruz@gmail.com',           demo_hash, '+15162550229', 'es', true, false, 'Queens',       'NY'),
  (1030, 'Noah Mitchell',     'noah.mitchell@gmail.com',           demo_hash, '+12125550230', 'en', true, false, 'Manhattan',    'NY'),
  (1031, 'Zoe Campbell',      'zoe.campbell@gmail.com',            demo_hash, '+17185550231', 'en', true, false, 'Astoria',      'NY'),
  (1032, 'Elijah Turner',     'elijah.turner@gmail.com',           demo_hash, '+17182550232', 'en', true, false, 'Bronx',        'NY'),
  (1033, 'Grace Wilson',      'grace.wilson@gmail.com',            demo_hash, '+16466550233', 'en', true, false, 'Upper East Side','NY'),
  (1034, 'Ryan Adams',        'ryan.adams@gmail.com',              demo_hash, '+19173550234', 'en', true, false, 'Williamsburg', 'NY'),
  (1035, 'Destiny Brown',     'destiny.brown@gmail.com',           demo_hash, '+13473550235', 'en', true, false, 'East Harlem',  'NY'),
  (1036, 'Jason Rivera',      'jason.rivera@gmail.com',            demo_hash, '+13472550236', 'es', true, false, 'Washington Heights','NY'),
  (1037, 'Samantha Hall',     'samantha.hall@gmail.com',           demo_hash, '+12124550237', 'en', true, false, 'Chelsea',      'NY'),
  (1038, 'Brandon Moore',     'brandon.moore@gmail.com',           demo_hash, '+12123550238', 'en', true, false, 'SoHo',         'NY'),
  (1039, 'Alicia Martinez',   'alicia.martinez@gmail.com',         demo_hash, '+17189550239', 'es', true, false, 'Jackson Heights','NY'),
  (1040, 'Patrick O''Brien',  'patrick.obrien@gmail.com',          demo_hash, '+16464550240', 'en', true, false, 'Midtown',      'NY');

END $$;

-- ============================================================
-- 4. MEMBERSHIPS (user ↔ company ↔ profile)
-- ============================================================
-- profile IDs: super_admin=1, admin=2, coordinator=3, employee=4
INSERT INTO user_company_memberships (user_id, company_id, profile_id, is_active) VALUES
  (1001, 100, 2, true),  -- Jennifer: admin
  (1002, 100, 3, true),  -- Marcus T: coordinator
  (1003, 100, 3, true),  -- Sofia: coordinator
  (1010, 100, 4, true),
  (1011, 100, 4, true),
  (1012, 100, 4, true),
  (1013, 100, 4, true),
  (1014, 100, 4, true),
  (1015, 100, 4, true),
  (1016, 100, 4, true),
  (1017, 100, 4, true),
  (1018, 100, 4, true),
  (1019, 100, 4, true),
  (1020, 100, 4, true),
  (1021, 100, 4, true),
  (1022, 100, 4, true),
  (1023, 100, 4, true),
  (1024, 100, 4, true),
  (1025, 100, 4, true),
  (1026, 100, 4, true),
  (1027, 100, 4, true),
  (1028, 100, 4, true),
  (1029, 100, 4, true),
  (1030, 100, 4, true),
  (1031, 100, 4, true),
  (1032, 100, 4, true),
  (1033, 100, 4, true),
  (1034, 100, 4, true),
  (1035, 100, 4, true),
  (1036, 100, 4, true),
  (1037, 100, 4, true),
  (1038, 100, 4, true),
  (1039, 100, 4, true),
  (1040, 100, 4, true);

-- ============================================================
-- 5. EMPLOYEE JOB ROLES (qué rol hace cada empleado)
-- ============================================================
INSERT INTO employee_job_roles (user_id, company_id, job_role_id) VALUES
  -- Bartenders
  (1010, 100, 201), (1011, 100, 201), (1022, 100, 201), (1030, 100, 201),
  (1034, 100, 201), (1037, 100, 201),
  -- Servers
  (1012, 100, 202), (1013, 100, 202), (1019, 100, 202), (1021, 100, 202),
  (1025, 100, 202), (1031, 100, 202), (1033, 100, 202), (1039, 100, 202),
  -- Cooks
  (1014, 100, 203), (1016, 100, 203), (1028, 100, 203),
  -- Security
  (1015, 100, 204), (1024, 100, 204), (1026, 100, 204), (1032, 100, 204),
  (1040, 100, 204),
  -- Coordinators / Hosts
  (1002, 100, 205), (1003, 100, 205),
  (1017, 100, 207), (1023, 100, 207), (1035, 100, 207),
  -- Barbacks
  (1018, 100, 206), (1029, 100, 206), (1038, 100, 206),
  -- Valet
  (1020, 100, 208), (1036, 100, 208),
  -- Coat Check
  (1027, 100, 209),
  -- Dishwasher
  -- dual roles
  (1010, 100, 206), -- bartender también hace barback
  (1014, 100, 202), -- cook también puede servir
  (1015, 100, 207); -- security también host

-- ============================================================
-- 6. EMPLOYEE PROFILES
-- ============================================================
INSERT INTO employee_profiles (user_id, bio, average_rating, total_events) VALUES
  (1010, 'Experienced bartender with 5+ years at high-end NYC venues. Specialty in craft cocktails.',      4.9, 42),
  (1011, 'Certified mixologist. Worked at several Michelin-starred events in Manhattan.',                  4.8, 38),
  (1012, 'Professional server with fine dining background. Bilingual English/Spanish.',                    4.7, 55),
  (1013, 'Server specialized in large-scale corporate events and galas.',                                  4.6, 33),
  (1014, 'Executive chef background. Experienced in buffet and plated dinner setups.',                     4.9, 28),
  (1015, 'Former NYPD. Experienced in crowd management and VIP security.',                                 4.8, 61),
  (1016, 'Bilingual cook. Experience in Latino cuisine, BBQ, and catering.',                               4.5, 19),
  (1017, 'Event host with theater background. Excellent public speaking.',                                 4.7, 31),
  (1018, 'Fast and reliable barback. Knows every major bar setup.',                                        4.6, 47),
  (1019, 'Attentive server. Experienced in wedding receptions and private dinners.',                       4.8, 52),
  (1020, 'Valet attendant. Licensed CDL. Handles high-end luxury vehicles.',                               4.7, 24),
  (1021, 'Server. Great communication skills. Previous hotel banquet experience.',                         4.5, 29),
  (1022, 'Craft beer and cocktail expert. Previously at The NoMad Hotel.',                                 4.9, 35),
  (1023, 'Host with event production background. Detail-oriented.',                                        4.6, 22),
  (1024, 'Security specialist. Trained in de-escalation and first aid.',                                   4.8, 44),
  (1025, 'Server and bartender. Available weekends. Reliable and punctual.',                               4.4, 18),
  (1026, 'Security. Experienced in concert venues and nightclub environments.',                            4.7, 37),
  (1027, 'Coat check specialist. Organized and fast. Multiple New Year''s events.',                        4.5, 15),
  (1028, 'Line cook. Strong background in catering and outdoor events.',                                   4.6, 21),
  (1029, 'Barback. Currently studying hospitality management at CUNY.',                                    4.3, 12),
  (1030, 'Senior bartender. Expert in whiskey and gin-based cocktails.',                                   4.9, 48),
  (1031, 'Server. Experienced in tray service, food runner, and expo.',                                    4.7, 30),
  (1032, 'Security. Background in military police. Bilingual EN/AR.',                                     4.8, 41),
  (1033, 'Host/Hostess. Elegant presence. Works fashion and luxury brand events.',                         4.8, 26),
  (1034, 'Bartender. Flair bartending skills. Great for high-energy events.',                              4.6, 23),
  (1035, 'Event hostess. Strong guest relations. Trilingual EN/ES/FR.',                                   4.7, 17),
  (1036, 'Valet. Familiar with all Manhattan and Brooklyn venues.',                                        4.5, 14),
  (1037, 'Senior bartender. 8 years experience. Worked MSG and Lincoln Center.',                           5.0, 60),
  (1038, 'Barback. Efficient setup and breakdown. Available nights and weekends.',                         4.4, 10),
  (1039, 'Server. Formal training from CIA (Culinary Institute of America).',                              4.8, 34),
  (1040, 'Security. Experienced in corporate events and stadium shows.',                                   4.7, 29);

-- ============================================================
-- 7. EVENTS (75 eventos en USA, 2024-2026)
-- ============================================================
INSERT INTO events (id, company_id, name, event_date, start_time, end_time, address, city, state, zip_code, latitude, longitude, dress_code, status, notes, is_public, created_by) VALUES

-- 2024 EVENTS (completados)
(301, 100, 'Goldman Sachs Annual Gala',
  '2024-02-10', '18:00', '23:00',
  '200 West St', 'New York', 'NY', '10282', 40.7142, -74.0149,
  'Black Tie', 'finished',
  'Formal dinner for 400 guests. 5-course plated meal.', false, 1001),

(302, 100, 'Brooklyn Museum Spring Benefit',
  '2024-03-15', '19:00', '23:30',
  '200 Eastern Pkwy', 'Brooklyn', 'NY', '11238', 40.6713, -73.9636,
  'Cocktail Attire', 'finished',
  'Fundraising gala. Live art installations. 350 guests.', false, 1001),

(303, 100, 'NYU Graduation Reception',
  '2024-05-18', '14:00', '18:00',
  '70 Washington Square S', 'New York', 'NY', '10012', 40.7291, -73.9973,
  'Business Casual', 'finished',
  'Outdoor reception. Tents provided. 600+ guests.', false, 1002),

(304, 100, 'Hamptons Polo Club Brunch',
  '2024-06-08', '11:00', '15:00',
  '500 Hayground Rd', 'Bridgehampton', 'NY', '11932', 40.9337, -72.3040,
  'Smart Casual', 'finished',
  'Outdoor summer brunch. 200 guests. Lawn setup.', false, 1001),

(305, 100, 'JPMorgan Chase Summer Rooftop',
  '2024-07-19', '17:00', '22:00',
  '383 Madison Ave', 'New York', 'NY', '10017', 40.7539, -73.9780,
  'Business Casual', 'finished',
  'Rooftop cocktail party. Skyline views. 300 guests.', false, 1002),

(306, 100, 'Fashion Week After-Party – Cipriani',
  '2024-09-09', '21:00', '03:00',
  '55 Wall St', 'New York', 'NY', '10005', 40.7074, -74.0113,
  'Cocktail Attire', 'finished',
  'High-energy event. Fashion industry crowd. 500 guests.', false, 1001),

(307, 100, 'Central Park Conservancy Dinner',
  '2024-09-21', '18:30', '22:30',
  'Rumsey Playfield, Central Park', 'New York', 'NY', '10021', 40.7735, -73.9688,
  'Black Tie Optional', 'finished',
  'Outdoor dinner in Central Park. 280 guests.', false, 1003),

(308, 100, 'MetLife Stadium Corporate Suite',
  '2024-10-05', '16:00', '23:00',
  '1 MetLife Stadium Dr', 'East Rutherford', 'NJ', '07073', 40.8135, -74.0744,
  'Casual', 'finished',
  'NFL game day. Corporate suites. 150 guests total.', false, 1002),

(309, 100, 'Citigroup Holiday Party',
  '2024-12-06', '18:00', '23:00',
  '388 Greenwich St', 'New York', 'NY', '10013', 40.7207, -74.0116,
  'Cocktail Attire', 'finished',
  'Holiday celebration. 700 employees + guests.', false, 1001),

(310, 100, 'New Year''s Eve Gala – The Plaza',
  '2024-12-31', '20:00', '02:00',
  '768 5th Ave', 'New York', 'NY', '10019', 40.7645, -73.9748,
  'Black Tie', 'finished',
  'Iconic NYE event. Champagne toast at midnight. 400 guests.', false, 1001),

(311, 100, 'Boston Consulting Group Dinner',
  '2024-01-25', '19:00', '22:30',
  '200 State St', 'Boston', 'MA', '02109', 42.3601, -71.0549,
  'Business Formal', 'finished',
  'Client dinner. 120 guests. Private dining room.', false, 1002),

(312, 100, 'Miami Art Basel VIP Opening',
  '2024-12-04', '17:00', '22:00',
  '1 Herald Plaza', 'Miami Beach', 'FL', '33132', 25.7751, -80.1887,
  'Cocktail Attire', 'finished',
  'Art Basel VIP preview. International guests. 350 attendees.', false, 1001),

(313, 100, 'Chicago Marriott Wedding Reception',
  '2024-04-27', '16:00', '23:30',
  '540 N Michigan Ave', 'Chicago', 'IL', '60611', 41.8932, -87.6249,
  'Formal', 'finished',
  'Wedding for 280 guests. 5-course dinner.', false, 1003),

(314, 100, 'Los Angeles Grammy Pre-Party',
  '2024-02-03', '19:00', '02:00',
  '6801 Hollywood Blvd', 'Los Angeles', 'CA', '90028', 34.1016, -118.3379,
  'Glamour', 'finished',
  'Entertainment industry. 600 VIP guests.', false, 1001),

(315, 100, 'San Francisco Tech Summit Dinner',
  '2024-03-20', '18:00', '22:00',
  '747 Howard St', 'San Francisco', 'CA', '94103', 37.7837, -122.4013,
  'Business Casual', 'finished',
  'Silicon Valley executives. 200 guests.', false, 1002),

(316, 100, 'Washington DC Congressional Reception',
  '2024-05-02', '17:00', '21:00',
  '120 Maryland Ave NE', 'Washington', 'DC', '20002', 38.8892, -77.0050,
  'Business Formal', 'finished',
  'Policy summit reception. 300 guests.', false, 1001),

(317, 100, 'Nashville CMA Music Fest VIP',
  '2024-06-13', '15:00', '23:00',
  '501 Broadway', 'Nashville', 'TN', '37203', 36.1620, -86.7784,
  'Country Chic', 'finished',
  'Music festival VIP tent. 250 guests.', false, 1003),

(318, 100, 'Dallas Cowboys Owner Suite',
  '2024-10-13', '14:00', '22:00',
  '1 AT&T Way', 'Arlington', 'TX', '76011', 32.7480, -97.0929,
  'Smart Casual', 'finished',
  'NFL game. Owner suite. 80 guests.', false, 1002),

(319, 100, 'Seattle Amazon HQ Holiday Party',
  '2024-12-14', '17:00', '22:00',
  '410 Terry Ave N', 'Seattle', 'WA', '98109', 47.6221, -122.3360,
  'Smart Casual', 'finished',
  'Tech company holiday. 900 employees.', false, 1001),

(320, 100, 'Las Vegas MGM Grand Boxing Night',
  '2024-11-16', '18:00', '01:00',
  '3799 S Las Vegas Blvd', 'Las Vegas', 'NV', '89109', 36.1026, -115.1711,
  'Black Tie Optional', 'finished',
  'Championship fight night. VIP tables. 400 guests.', false, 1001),

-- 2025 EVENTS
(321, 100, 'Morgan Stanley Investor Day Lunch',
  '2025-01-16', '12:00', '15:00',
  '1585 Broadway', 'New York', 'NY', '10036', 40.7587, -73.9858,
  'Business Formal', 'finished',
  'Investor relations. 250 guests. Seated lunch.', false, 1001),

(322, 100, 'Brooklyn Navy Yard Tech Gala',
  '2025-01-30', '18:00', '23:00',
  '63 Flushing Ave', 'Brooklyn', 'NY', '11205', 40.6980, -73.9755,
  'Smart Casual', 'finished',
  'Innovation awards. 400 tech professionals.', false, 1002),

(323, 100, 'Super Bowl LIX Watch Party – NYC',
  '2025-02-09', '17:00', '23:30',
  '20 Hudson Yards', 'New York', 'NY', '10001', 40.7538, -74.0013,
  'Casual', 'finished',
  'Corporate watch party. 3 floors. 600 guests.', false, 1001),

(324, 100, 'Sotheby''s Spring Auction Preview',
  '2025-03-12', '18:30', '22:00',
  '1334 York Ave', 'New York', 'NY', '10021', 40.7627, -73.9565,
  'Cocktail Attire', 'finished',
  'Exclusive preview. 200 collectors.', false, 1001),

(325, 100, 'St. Patrick''s Day Corporate Brunch',
  '2025-03-17', '10:00', '14:00',
  '30 Hudson Yards', 'New York', 'NY', '10001', 40.7534, -74.0004,
  'Smart Casual', 'finished',
  'Annual tradition. 350 guests.', false, 1003),

(326, 100, 'Tribeca Film Festival Premiere',
  '2025-04-24', '19:00', '23:00',
  '199 Chambers St', 'New York', 'NY', '10007', 40.7155, -74.0090,
  'Cocktail Attire', 'finished',
  'Opening night premiere. 500 guests. Press event.', false, 1001),

(327, 100, 'Bloomberg Philanthropies Garden Party',
  '2025-05-08', '16:00', '20:00',
  '731 Lexington Ave', 'New York', 'NY', '10022', 40.7625, -73.9678,
  'Garden Party', 'finished',
  'Outdoor summer event. 300 guests.', false, 1002),

(328, 100, 'Memorial Day Rooftop – 1 Hotel Brooklyn',
  '2025-05-26', '13:00', '19:00',
  '60 Furman St', 'Brooklyn', 'NY', '11201', 40.6981, -74.0028,
  'Casual Chic', 'finished',
  'Pool rooftop party. 250 guests.', false, 1001),

(329, 100, 'US Open VIP Hospitality – Arthur Ashe',
  '2025-08-25', '12:00', '22:00',
  'USTA Billie Jean King National Tennis Center', 'Flushing', 'NY', '11368', 40.7501, -73.8464,
  'Smart Casual', 'finished',
  'Corporate VIP tent. 180 guests. Full service.', false, 1001),

(330, 100, 'NYC Restaurant Week Opening Gala',
  '2025-07-14', '18:00', '22:00',
  '20 W 53rd St', 'New York', 'NY', '10019', 40.7615, -73.9776,
  'Smart Casual', 'finished',
  'MoMA venue. Chefs showcase. 450 guests.', false, 1003),

(331, 100, 'Hamptons Film Festival Dinner',
  '2025-07-25', '18:30', '23:00',
  'Main St', 'East Hampton', 'NY', '11937', 40.9632, -72.1857,
  'Summer Formal', 'finished',
  'Beach dinner. Film celebrities. 200 guests.', false, 1001),

(332, 100, 'Wall Street Bull Run Charity Gala',
  '2025-09-18', '18:00', '23:30',
  '11 Wall St', 'New York', 'NY', '10005', 40.7074, -74.0113,
  'Black Tie', 'finished',
  'NYSE floor event. Charity auction. 300 guests.', false, 1001),

(333, 100, 'UN General Assembly Diplomatic Dinner',
  '2025-09-22', '19:00', '23:00',
  '405 E 42nd St', 'New York', 'NY', '10017', 40.7489, -73.9680,
  'Black Tie', 'finished',
  'Diplomatic reception. International guests. 400 attendees.', false, 1001),

(334, 100, 'Barclays Center VIP Suite – Concert',
  '2025-10-03', '17:00', '23:30',
  '620 Atlantic Ave', 'Brooklyn', 'NY', '11217', 40.6826, -73.9754,
  'Smart Casual', 'finished',
  'Arena concert. VIP suites. 200 guests.', false, 1002),

(335, 100, 'Columbia University President''s Gala',
  '2025-10-17', '18:30', '22:30',
  '116th St & Broadway', 'New York', 'NY', '10027', 40.8075, -73.9626,
  'Formal', 'finished',
  'Academic gala. Alumni and donors. 350 guests.', false, 1003),

(336, 100, 'Rockefeller Center Tree Lighting VIP',
  '2025-12-03', '16:00', '22:00',
  '45 Rockefeller Plaza', 'New York', 'NY', '10111', 40.7587, -73.9787,
  'Winter Elegant', 'finished',
  'NBC event. VIP viewing area. 500 guests.', false, 1001),

(337, 100, 'Madison Square Garden Holiday Show',
  '2025-12-18', '18:00', '23:00',
  '4 Pennsylvania Plaza', 'New York', 'NY', '10001', 40.7505, -73.9934,
  'Smart Casual', 'finished',
  'Annual holiday spectacular. 2000+ capacity.', false, 1001),

(338, 100, 'Miami New Year''s Eve Beach Gala',
  '2025-12-31', '19:00', '02:00',
  '100 Collins Ave', 'Miami Beach', 'FL', '33139', 25.7617, -80.1300,
  'Beach Formal', 'finished',
  'Oceanfront celebration. 600 guests.', false, 1001),

(339, 100, 'Boston Marathon Corporate Viewing',
  '2025-04-21', '09:00', '15:00',
  '755 Boylston St', 'Boston', 'MA', '02116', 42.3504, -71.0787,
  'Casual', 'finished',
  'Finish line VIP tent. 200 guests.', false, 1002),

(340, 100, 'Chicago Architectural Foundation Gala',
  '2025-05-15', '18:00', '22:30',
  '111 E Wacker Dr', 'Chicago', 'IL', '60601', 41.8864, -87.6227,
  'Cocktail Attire', 'finished',
  'River North. Architecture awards. 300 guests.', false, 1003),

(341, 100, 'LA Lakers Championship Celebration',
  '2025-06-22', '17:00', '23:00',
  '1111 S Figueroa St', 'Los Angeles', 'CA', '90015', 34.0430, -118.2673,
  'Casual', 'finished',
  'Crypto.com Arena. Championship party. 1000 guests.', false, 1001),

(342, 100, 'Austin SXSW Closing Party',
  '2025-03-16', '20:00', '02:00',
  '201 E 2nd St', 'Austin', 'TX', '78701', 30.2672, -97.7431,
  'Creative', 'finished',
  'Festival closing. Music and tech crowd. 800 guests.', false, 1002),

(343, 100, 'New Orleans Jazz Fest VIP Tent',
  '2025-04-25', '12:00', '21:00',
  '1 Palm Dr', 'New Orleans', 'LA', '70119', 29.9825, -90.0750,
  'Festive', 'finished',
  'Jazz Fest. Corporate VIP. 150 guests.', false, 1003),

(344, 100, 'Denver Broncos Luxury Suite',
  '2025-10-19', '13:00', '21:00',
  '1701 Mile High Stadium Cir', 'Denver', 'CO', '80204', 39.7439, -105.0201,
  'Smart Casual', 'finished',
  'NFL game. Luxury box. 60 guests.', false, 1002),

(345, 100, 'Portland Oregon Food & Wine Festival',
  '2025-08-09', '14:00', '20:00',
  'Tom McCall Waterfront Park', 'Portland', 'OR', '97201', 45.5152, -122.6784,
  'Casual', 'finished',
  'VIP lounge. 400 guests. Multiple food stations.', false, 1003),

-- 2026 EVENTS (completed, in progress, upcoming)
(346, 100, 'Davos NYC Economic Forum Dinner',
  '2026-01-22', '19:00', '23:00',
  '535 Madison Ave', 'New York', 'NY', '10022', 40.7613, -73.9714,
  'Business Formal', 'finished',
  'Global economic leaders. 200 guests.', false, 1001),

(347, 100, 'Super Bowl LX Watch Party',
  '2026-02-08', '16:00', '23:30',
  '3 World Trade Center', 'New York', 'NY', '10007', 40.7128, -74.0134,
  'Casual', 'finished',
  'Corporate event. 5 floors. 800 guests.', false, 1001),

(348, 100, 'Whitney Museum Benefit Dinner',
  '2026-02-26', '18:30', '22:30',
  '99 Gansevoort St', 'New York', 'NY', '10014', 40.7396, -74.0083,
  'Cocktail Attire', 'finished',
  'Art world VIP. 300 guests.', false, 1001),

(349, 100, 'St. Patrick''s Day Rooftop Party',
  '2026-03-17', '12:00', '18:00',
  '432 Park Ave', 'New York', 'NY', '10022', 40.7616, -73.9718,
  'Casual', 'finished',
  'Luxury rooftop. 200 guests.', false, 1003),

(350, 100, 'NYC Marathon VIP Experience',
  '2026-11-01', '07:00', '15:00',
  'Tavern on the Green, Central Park', 'New York', 'NY', '10023', 40.7725, -73.9814,
  'Smart Casual', 'published',
  'Finish line VIP. 350 guests.', false, 1001),

(351, 100, 'Private Yacht Gala – Hudson River',
  '2026-06-20', '17:00', '22:00',
  'Pier 81, W 41st St & 12th Ave', 'New York', 'NY', '10036', 40.7599, -74.0031,
  'Nautical Formal', 'published',
  'Luxury charter. 100 guests.', false, 1001),

(352, 100, 'Museum of Natural History Spring Gala',
  '2026-04-16', '18:00', '23:00',
  '200 Central Park West', 'New York', 'NY', '10024', 40.7813, -73.9740,
  'Black Tie', 'finished',
  'Under the whale. 500 donors.', false, 1001),

(353, 100, 'Coachella VIP Hospitality – NYC Viewing',
  '2026-04-11', '16:00', '02:00',
  '85 10th Ave', 'New York', 'NY', '10011', 40.7428, -74.0060,
  'Festival Chic', 'finished',
  'Private viewing party. Live stream + DJ. 300 guests.', false, 1002),

(354, 100, 'Goldman Sachs Annual Conference Lunch',
  '2026-05-07', '12:00', '15:00',
  '200 West St', 'New York', 'NY', '10282', 40.7142, -74.0149,
  'Business Formal', 'finished',
  '500 financial executives.', false, 1001),

(355, 100, 'Chelsea Market Food Festival VIP',
  '2026-05-14', '13:00', '19:00',
  '75 9th Ave', 'New York', 'NY', '10011', 40.7425, -74.0048,
  'Casual', 'finished',
  'Food event. Local chefs. 400 guests.', false, 1003),

(356, 100, 'Tribeca Film Festival Opening Night',
  '2026-04-22', '19:00', '23:30',
  '199 Chambers St', 'New York', 'NY', '10007', 40.7155, -74.0090,
  'Cocktail Attire', 'finished',
  'Star-studded opening. 600 guests.', false, 1001),

(357, 100, 'Memorial Day Hamptons Bash',
  '2026-05-24', '14:00', '21:00',
  '2 Main St', 'Southampton', 'NY', '11968', 40.8840, -72.3890,
  'Casual Chic', 'finished',
  'Beach house party. 150 VIP guests.', false, 1001),

(358, 100, 'Private Corporate Dinner – 230 Fifth',
  '2026-05-29', '19:00', '23:00',
  '230 5th Ave', 'New York', 'NY', '10001', 40.7448, -73.9895,
  'Cocktail Attire', 'started',
  'Rooftop dinner. Skyline views. 120 guests.', false, 1001),

(359, 100, 'Luxury Wedding – The Glasshouses',
  '2026-06-06', '15:00', '00:00',
  '660 12th Ave', 'New York', 'NY', '10036', 40.7616, -74.0028,
  'Black Tie', 'published',
  'Wedding for 300 guests. 7-course tasting menu.', false, 1001),

(360, 100, 'Brooklyn Bridge Park Summer Concert',
  '2026-06-13', '17:00', '22:00',
  '334 Furman St', 'Brooklyn', 'NY', '11201', 40.6980, -73.9988,
  'Casual', 'published',
  'Outdoor concert. Sunset views. 500 guests.', false, 1002),

(361, 100, 'Rooftop Cocktail Hour – One Vanderbilt',
  '2026-06-18', '17:30', '21:00',
  '1 Vanderbilt Ave', 'New York', 'NY', '10017', 40.7527, -73.9772,
  'Business Casual', 'published',
  'Summit dinner pre-event. 150 VIP.', false, 1001),

(362, 100, 'Pride Month Celebration – Stonewall Inn',
  '2026-06-27', '15:00', '23:00',
  '53 Christopher St', 'New York', 'NY', '10014', 40.7334, -74.0023,
  'Festive', 'published',
  'Pride month event. 400 guests.', false, 1003),

(363, 100, 'Fourth of July Rooftop Party',
  '2026-07-04', '17:00', '23:30',
  '20 Broad St', 'New York', 'NY', '10005', 40.7064, -74.0114,
  'American Casual', 'published',
  'Fireworks viewing. 300 guests.', false, 1001),

(364, 100, 'US Open 2026 Corporate Suite',
  '2026-08-31', '12:00', '22:00',
  'USTA National Tennis Center', 'Flushing', 'NY', '11368', 40.7501, -73.8464,
  'Smart Casual', 'published',
  'Opening week. 180 guests.', false, 1001),

(365, 100, 'Lincoln Center Midsummer Night Swing',
  '2026-07-23', '18:00', '23:00',
  '10 Lincoln Center Plaza', 'New York', 'NY', '10023', 40.7725, -73.9830,
  'Garden Party', 'published',
  'Dance festival VIP. 250 guests.', false, 1001),

(366, 100, 'UN Climate Summit Dinner',
  '2026-09-20', '19:00', '23:00',
  '405 E 42nd St', 'New York', 'NY', '10017', 40.7489, -73.9680,
  'Business Formal', 'published',
  'World leaders dinner. 300 guests.', false, 1001),

(367, 100, 'NYC Fashion Week After-Party',
  '2026-09-11', '21:00', '03:00',
  '50 W 34th St', 'New York', 'NY', '10001', 40.7505, -73.9965,
  'Fashion Forward', 'published',
  'Industry celebration. 700 guests.', false, 1001),

(368, 100, 'New Year''s Eve 2027 – Empire State',
  '2026-12-31', '20:00', '02:00',
  '20 W 34th St', 'New York', 'NY', '10001', 40.7484, -73.9967,
  'Black Tie', 'published',
  'Top floor private event. Countdown party. 200 guests.', false, 1001),

(369, 100, 'Halloween Corporate Party – Javits Center',
  '2026-10-31', '18:00', '01:00',
  '429 11th Ave', 'New York', 'NY', '10001', 40.7570, -74.0023,
  'Costume / Cocktail', 'published',
  'Halloween gala. 1000 guests.', false, 1001),

(370, 100, 'Thanksgiving VIP Macy''s Parade Brunch',
  '2026-11-26', '08:00', '13:00',
  '151 W 34th St', 'New York', 'NY', '10001', 40.7508, -73.9888,
  'Smart Casual', 'published',
  'Parade viewing brunch. Hotel rooftop. 150 guests.', false, 1002),

(371, 100, 'Miami Art Week Collector''s Dinner',
  '2026-12-02', '19:00', '23:00',
  '601 NE 27th St', 'Miami', 'FL', '33137', 25.8079, -80.1926,
  'Black Tie Optional', 'published',
  'Art Basel week. 200 collectors.', false, 1001),

(372, 100, 'Aspen Winter Gala',
  '2026-12-19', '18:30', '23:00',
  '10 E Dean St', 'Aspen', 'CO', '81611', 39.1911, -106.8175,
  'Mountain Formal', 'published',
  'Ski season opener. 150 VIP guests.', false, 1001),

(373, 100, 'Private Corporate Retreat Dinner – Hudson Valley',
  '2026-08-14', '18:00', '22:00',
  '1000 Valley Rd', 'Rhinebeck', 'NY', '12572', 41.9268, -73.9129,
  'Rustic Elegant', 'published',
  'Outdoor dinner. Estate grounds. 100 guests.', false, 1003),

(374, 100, 'NASDAQ Listing Celebration',
  '2026-07-15', '16:00', '20:00',
  '151 W 42nd St', 'New York', 'NY', '10036', 40.7553, -73.9876,
  'Business Casual', 'published',
  'IPO celebration. 250 investors.', false, 1001),

(375, 100, 'Brooklyn Summer Block Party',
  '2026-08-01', '14:00', '22:00',
  'Prospect Park', 'Brooklyn', 'NY', '11215', 40.6602, -73.9690,
  'Casual', 'published',
  'Community + corporate sponsor event. 1000+ guests.', false, 1002);


-- ============================================================
-- 8. EVENT JOB ROLES (roles requeridos por evento)
-- ============================================================
-- Macro helper: major gala
INSERT INTO event_job_roles (event_id, job_role_id, slots_required, slots_filled, hourly_rate_override) VALUES
-- Goldman Sachs Gala (301)
(301, 201, 4, 4, 25.00), (301, 202, 8, 8, 20.00), (301, 203, 2, 2, 28.00),
(301, 204, 2, 2, NULL),  (301, 205, 1, 1, NULL),   (301, 207, 2, 2, NULL),

-- Brooklyn Museum (302)
(302, 201, 3, 3, NULL),  (302, 202, 6, 6, NULL),   (302, 204, 2, 2, NULL),
(302, 207, 2, 2, NULL),

-- NYU Graduation (303)
(303, 202, 8, 8, NULL),  (303, 203, 2, 2, NULL),   (303, 207, 3, 3, NULL),
(303, 209, 2, 2, NULL),

-- Hamptons Polo (304)
(304, 201, 3, 3, NULL),  (304, 202, 5, 5, NULL),   (304, 203, 1, 1, NULL),

-- JPMorgan Rooftop (305)
(305, 201, 4, 4, NULL),  (305, 202, 6, 6, NULL),   (305, 204, 2, 2, NULL),
(305, 206, 2, 2, NULL),

-- Fashion Week (306)
(306, 201, 6, 6, 28.00), (306, 202, 8, 8, 22.00),  (306, 204, 4, 4, NULL),
(306, 207, 3, 3, NULL),  (306, 208, 2, 2, NULL),

-- Central Park (307)
(307, 201, 3, 3, NULL),  (307, 202, 6, 6, NULL),   (307, 203, 2, 2, NULL),
(307, 204, 2, 2, NULL),  (307, 207, 2, 2, NULL),

-- MetLife Stadium (308)
(308, 201, 3, 3, NULL),  (308, 202, 4, 4, NULL),   (308, 204, 2, 2, NULL),
(308, 208, 2, 2, NULL),

-- Citigroup Holiday (309)
(309, 201, 6, 6, NULL),  (309, 202, 10, 10, NULL), (309, 203, 3, 3, NULL),
(309, 204, 4, 4, NULL),  (309, 205, 1, 1, NULL),   (309, 207, 3, 3, NULL),
(309, 209, 2, 2, NULL),

-- NYE Plaza (310)
(310, 201, 6, 6, 30.00), (310, 202, 10, 10, 25.00),(310, 203, 3, 3, NULL),
(310, 204, 4, 4, NULL),  (310, 205, 1, 1, NULL),   (310, 207, 2, 2, NULL),
(310, 208, 3, 3, NULL),  (310, 209, 2, 2, NULL),

-- Remaining older events (abbreviated)
(311, 201, 2, 2, NULL),  (311, 202, 4, 4, NULL),   (311, 204, 1, 1, NULL),
(312, 201, 4, 4, 26.00), (312, 202, 6, 6, NULL),   (312, 204, 3, 3, NULL), (312, 207, 2, 2, NULL),
(313, 201, 3, 3, NULL),  (313, 202, 8, 8, NULL),   (313, 203, 2, 2, NULL), (313, 204, 2, 2, NULL), (313, 207, 2, 2, NULL),
(314, 201, 5, 5, NULL),  (314, 202, 8, 8, NULL),   (314, 204, 5, 5, NULL), (314, 207, 3, 3, NULL),
(315, 201, 2, 2, NULL),  (315, 202, 4, 4, NULL),   (315, 204, 1, 1, NULL),
(316, 201, 2, 2, NULL),  (316, 202, 5, 5, NULL),   (316, 204, 2, 2, NULL), (316, 207, 2, 2, NULL),
(317, 201, 4, 4, NULL),  (317, 202, 4, 4, NULL),   (317, 204, 2, 2, NULL),
(318, 201, 2, 2, NULL),  (318, 202, 3, 3, NULL),   (318, 204, 2, 2, NULL),
(319, 201, 5, 5, NULL),  (319, 202, 10, 10, NULL), (319, 203, 2, 2, NULL), (319, 204, 3, 3, NULL), (319, 207, 2, 2, NULL),
(320, 201, 4, 4, NULL),  (320, 202, 6, 6, NULL),   (320, 204, 5, 5, NULL), (320, 207, 2, 2, NULL), (320, 208, 3, 3, NULL),

-- 2025 events (abbreviated)
(321, 201, 3, 3, NULL),  (321, 202, 5, 5, NULL),   (321, 204, 1, 1, NULL),
(322, 201, 4, 4, NULL),  (322, 202, 6, 6, NULL),   (322, 204, 2, 2, NULL), (322, 207, 2, 2, NULL),
(323, 201, 6, 6, NULL),  (323, 202, 10, 10, NULL), (323, 203, 2, 2, NULL), (323, 204, 4, 4, NULL),
(324, 201, 3, 3, NULL),  (324, 202, 4, 4, NULL),   (324, 207, 2, 2, NULL),
(325, 201, 3, 3, NULL),  (325, 202, 6, 6, NULL),   (325, 203, 1, 1, NULL),
(326, 201, 3, 3, NULL),  (326, 202, 6, 6, NULL),   (326, 204, 3, 3, NULL), (326, 207, 2, 2, NULL),
(327, 201, 2, 2, NULL),  (327, 202, 5, 5, NULL),   (327, 204, 2, 2, NULL),
(328, 201, 3, 3, NULL),  (328, 202, 4, 4, NULL),   (328, 204, 2, 2, NULL),
(329, 201, 3, 3, NULL),  (329, 202, 5, 5, NULL),   (329, 204, 2, 2, NULL), (329, 207, 2, 2, NULL),
(330, 201, 4, 4, NULL),  (330, 202, 6, 6, NULL),   (330, 203, 3, 3, NULL), (330, 204, 2, 2, NULL),
(331, 201, 3, 3, NULL),  (331, 202, 4, 4, NULL),   (331, 204, 1, 1, NULL),
(332, 201, 4, 4, NULL),  (332, 202, 6, 6, NULL),   (332, 204, 3, 3, NULL), (332, 207, 2, 2, NULL),
(333, 201, 3, 3, NULL),  (333, 202, 6, 6, NULL),   (333, 204, 3, 3, NULL), (333, 207, 2, 2, NULL),
(334, 201, 3, 3, NULL),  (334, 202, 4, 4, NULL),   (334, 204, 3, 3, NULL),
(335, 201, 3, 3, NULL),  (335, 202, 6, 6, NULL),   (335, 204, 2, 2, NULL), (335, 207, 2, 2, NULL),
(336, 201, 4, 4, NULL),  (336, 202, 8, 8, NULL),   (336, 204, 4, 4, NULL), (336, 207, 2, 2, NULL),
(337, 201, 5, 5, NULL),  (337, 202, 10, 10, NULL), (337, 203, 2, 2, NULL), (337, 204, 5, 5, NULL),
(338, 201, 5, 5, NULL),  (338, 202, 8, 8, NULL),   (338, 203, 2, 2, NULL), (338, 204, 4, 4, NULL), (338, 208, 3, 3, NULL),
(339, 201, 2, 2, NULL),  (339, 202, 4, 4, NULL),   (339, 204, 1, 1, NULL),
(340, 201, 3, 3, NULL),  (340, 202, 5, 5, NULL),   (340, 204, 2, 2, NULL), (340, 207, 2, 2, NULL),
(341, 201, 4, 4, NULL),  (341, 202, 8, 8, NULL),   (341, 203, 2, 2, NULL), (341, 204, 4, 4, NULL),
(342, 201, 6, 6, NULL),  (342, 202, 6, 6, NULL),   (342, 204, 4, 4, NULL),
(343, 201, 3, 3, NULL),  (343, 202, 4, 4, NULL),   (343, 204, 2, 2, NULL),
(344, 201, 2, 2, NULL),  (344, 202, 3, 3, NULL),   (344, 204, 1, 1, NULL),
(345, 201, 3, 3, NULL),  (345, 202, 5, 5, NULL),   (345, 204, 2, 2, NULL), (345, 203, 2, 2, NULL),

-- 2026 events
(346, 201, 3, 3, NULL),  (346, 202, 4, 4, NULL),   (346, 204, 2, 2, NULL),
(347, 201, 6, 6, NULL),  (347, 202, 10, 10, NULL), (347, 203, 2, 2, NULL), (347, 204, 4, 4, NULL),
(348, 201, 3, 3, NULL),  (348, 202, 5, 5, NULL),   (348, 204, 2, 2, NULL), (348, 207, 2, 2, NULL),
(349, 201, 4, 4, NULL),  (349, 202, 5, 5, NULL),   (349, 204, 2, 2, NULL),
(350, 201, 3, 0, NULL),  (350, 202, 6, 0, NULL),   (350, 204, 2, 0, NULL),
(351, 201, 2, 0, NULL),  (351, 202, 4, 0, NULL),   (351, 204, 1, 0, NULL),
(352, 201, 4, 4, NULL),  (352, 202, 8, 8, NULL),   (352, 203, 2, 2, NULL), (352, 204, 3, 3, NULL), (352, 207, 2, 2, NULL),
(353, 201, 3, 3, NULL),  (353, 202, 5, 5, NULL),   (353, 204, 2, 2, NULL),
(354, 201, 4, 4, NULL),  (354, 202, 8, 8, NULL),   (354, 203, 2, 2, NULL), (354, 204, 2, 2, NULL),
(355, 201, 3, 3, NULL),  (355, 202, 5, 5, NULL),   (355, 203, 3, 3, NULL), (355, 204, 2, 2, NULL),
(356, 201, 3, 3, NULL),  (356, 202, 6, 6, NULL),   (356, 204, 3, 3, NULL), (356, 207, 2, 2, NULL),
(357, 201, 3, 3, NULL),  (357, 202, 4, 4, NULL),   (357, 204, 2, 2, NULL),
(358, 201, 3, 3, NULL),  (358, 202, 5, 5, NULL),   (358, 204, 2, 2, NULL), (358, 207, 1, 1, NULL),
(359, 201, 4, 4, NULL),  (359, 202, 8, 8, NULL),   (359, 203, 2, 2, NULL), (359, 204, 3, 3, NULL), (359, 205, 1, 1, NULL), (359, 207, 2, 2, NULL), (359, 208, 2, 2, NULL),
(360, 201, 3, 3, NULL),  (360, 202, 6, 6, NULL),   (360, 204, 3, 3, NULL),
(361, 201, 2, 2, NULL),  (361, 202, 4, 4, NULL),   (361, 204, 1, 1, NULL),
(362, 201, 4, 4, NULL),  (362, 202, 6, 6, NULL),   (362, 204, 4, 4, NULL), (362, 207, 2, 2, NULL),
(363, 201, 4, 4, NULL),  (363, 202, 6, 6, NULL),   (363, 204, 3, 3, NULL), (363, 207, 2, 2, NULL),
(364, 201, 3, 0, NULL),  (364, 202, 5, 0, NULL),   (364, 204, 2, 0, NULL),
(365, 201, 2, 0, NULL),  (365, 202, 4, 0, NULL),   (365, 204, 2, 0, NULL),
(366, 201, 3, 0, NULL),  (366, 202, 5, 0, NULL),   (366, 204, 3, 0, NULL), (366, 207, 2, 0, NULL),
(367, 201, 5, 0, NULL),  (367, 202, 8, 0, NULL),   (367, 204, 4, 0, NULL), (367, 207, 2, 0, NULL),
(368, 201, 4, 0, NULL),  (368, 202, 6, 0, NULL),   (368, 204, 4, 0, NULL), (368, 205, 1, 0, NULL),
(369, 201, 6, 0, NULL),  (369, 202, 10, 0, NULL),  (369, 203, 2, 0, NULL), (369, 204, 6, 0, NULL), (369, 207, 3, 0, NULL),
(370, 201, 2, 0, NULL),  (370, 202, 4, 0, NULL),   (370, 204, 1, 0, NULL),
(371, 201, 3, 0, NULL),  (371, 202, 4, 0, NULL),   (371, 204, 2, 0, NULL), (371, 207, 2, 0, NULL),
(372, 201, 2, 0, NULL),  (372, 202, 4, 0, NULL),   (372, 204, 1, 0, NULL),
(373, 201, 1, 0, NULL),  (373, 202, 3, 0, NULL),   (373, 203, 1, 0, NULL),
(374, 201, 2, 0, NULL),  (374, 202, 4, 0, NULL),   (374, 204, 1, 0, NULL),
(375, 201, 3, 0, NULL),  (375, 202, 8, 0, NULL),   (375, 203, 2, 0, NULL), (375, 204, 4, 0, NULL);

-- ============================================================
-- 9. EVENT ASSIGNMENTS (asignaciones para eventos completados)
-- Selección de eventos pasados representativos
-- ============================================================
INSERT INTO event_assignments (event_id, user_id, company_id, job_role_id, status, assigned_by) VALUES
-- Goldman Sachs Gala (301)
(301, 1010, 100, 201, 'finished', 1001),
(301, 1022, 100, 201, 'finished', 1001),
(301, 1030, 100, 201, 'finished', 1001),
(301, 1037, 100, 201, 'finished', 1001),
(301, 1012, 100, 202, 'finished', 1001),
(301, 1013, 100, 202, 'finished', 1001),
(301, 1019, 100, 202, 'finished', 1001),
(301, 1021, 100, 202, 'finished', 1001),
(301, 1025, 100, 202, 'finished', 1001),
(301, 1031, 100, 202, 'finished', 1001),
(301, 1033, 100, 202, 'finished', 1001),
(301, 1039, 100, 202, 'finished', 1001),
(301, 1014, 100, 203, 'finished', 1001),
(301, 1016, 100, 203, 'finished', 1001),
(301, 1015, 100, 204, 'finished', 1001),
(301, 1024, 100, 204, 'finished', 1001),
(301, 1002, 100, 205, 'finished', 1001),
(301, 1017, 100, 207, 'finished', 1001),
(301, 1023, 100, 207, 'finished', 1001),

-- NYE Plaza (310) - evento icónico
(310, 1037, 100, 201, 'finished', 1001),
(310, 1010, 100, 201, 'finished', 1001),
(310, 1022, 100, 201, 'finished', 1001),
(310, 1030, 100, 201, 'finished', 1001),
(310, 1011, 100, 201, 'finished', 1001),
(310, 1034, 100, 201, 'finished', 1001),
(310, 1012, 100, 202, 'finished', 1001),
(310, 1013, 100, 202, 'finished', 1001),
(310, 1019, 100, 202, 'finished', 1001),
(310, 1021, 100, 202, 'finished', 1001),
(310, 1025, 100, 202, 'finished', 1001),
(310, 1031, 100, 202, 'finished', 1001),
(310, 1033, 100, 202, 'finished', 1001),
(310, 1039, 100, 202, 'finished', 1001),
(310, 1014, 100, 203, 'finished', 1001),
(310, 1016, 100, 203, 'finished', 1001),
(310, 1028, 100, 203, 'finished', 1001),
(310, 1015, 100, 204, 'finished', 1001),
(310, 1024, 100, 204, 'finished', 1001),
(310, 1026, 100, 204, 'finished', 1001),
(310, 1032, 100, 204, 'finished', 1001),
(310, 1002, 100, 205, 'finished', 1001),
(310, 1017, 100, 207, 'finished', 1001),
(310, 1023, 100, 207, 'finished', 1001),
(310, 1020, 100, 208, 'finished', 1001),
(310, 1036, 100, 208, 'finished', 1001),
(310, 1027, 100, 209, 'finished', 1001),
(310, 1029, 100, 209, 'finished', 1001),

-- Citigroup Holiday (309)
(309, 1010, 100, 201, 'finished', 1001),
(309, 1011, 100, 201, 'finished', 1001),
(309, 1022, 100, 201, 'finished', 1001),
(309, 1030, 100, 201, 'finished', 1001),
(309, 1037, 100, 201, 'finished', 1001),
(309, 1034, 100, 201, 'finished', 1001),
(309, 1012, 100, 202, 'finished', 1001),
(309, 1013, 100, 202, 'finished', 1001),
(309, 1019, 100, 202, 'finished', 1001),
(309, 1021, 100, 202, 'finished', 1001),
(309, 1025, 100, 202, 'finished', 1001),
(309, 1031, 100, 202, 'finished', 1001),
(309, 1033, 100, 202, 'finished', 1001),
(309, 1039, 100, 202, 'finished', 1001),
(309, 1014, 100, 203, 'finished', 1001),
(309, 1016, 100, 203, 'finished', 1001),
(309, 1028, 100, 203, 'finished', 1001),
(309, 1015, 100, 204, 'finished', 1001),
(309, 1024, 100, 204, 'finished', 1001),
(309, 1026, 100, 204, 'finished', 1001),
(309, 1032, 100, 204, 'finished', 1001),
(309, 1002, 100, 205, 'finished', 1001),
(309, 1017, 100, 207, 'finished', 1001),
(309, 1023, 100, 207, 'finished', 1001),
(309, 1035, 100, 207, 'finished', 1001),
(309, 1027, 100, 209, 'finished', 1001),
(309, 1029, 100, 209, 'finished', 1001),

-- Fashion Week (306)
(306, 1010, 100, 201, 'finished', 1002),
(306, 1011, 100, 201, 'finished', 1002),
(306, 1022, 100, 201, 'finished', 1002),
(306, 1030, 100, 201, 'finished', 1002),
(306, 1037, 100, 201, 'finished', 1002),
(306, 1034, 100, 201, 'finished', 1002),
(306, 1012, 100, 202, 'finished', 1002),
(306, 1013, 100, 202, 'finished', 1002),
(306, 1019, 100, 202, 'finished', 1002),
(306, 1021, 100, 202, 'finished', 1002),
(306, 1025, 100, 202, 'finished', 1002),
(306, 1031, 100, 202, 'finished', 1002),
(306, 1033, 100, 202, 'finished', 1002),
(306, 1039, 100, 202, 'finished', 1002),
(306, 1015, 100, 204, 'finished', 1002),
(306, 1024, 100, 204, 'finished', 1002),
(306, 1026, 100, 204, 'finished', 1002),
(306, 1032, 100, 204, 'finished', 1002),
(306, 1017, 100, 207, 'finished', 1002),
(306, 1023, 100, 207, 'finished', 1002),
(306, 1035, 100, 207, 'finished', 1002),
(306, 1020, 100, 208, 'finished', 1002),
(306, 1036, 100, 208, 'finished', 1002),

-- Super Bowl Watch Party (323)
(323, 1010, 100, 201, 'finished', 1001),
(323, 1011, 100, 201, 'finished', 1001),
(323, 1022, 100, 201, 'finished', 1001),
(323, 1030, 100, 201, 'finished', 1001),
(323, 1037, 100, 201, 'finished', 1001),
(323, 1034, 100, 201, 'finished', 1001),
(323, 1012, 100, 202, 'finished', 1001),
(323, 1013, 100, 202, 'finished', 1001),
(323, 1019, 100, 202, 'finished', 1001),
(323, 1021, 100, 202, 'finished', 1001),
(323, 1025, 100, 202, 'finished', 1001),
(323, 1031, 100, 202, 'finished', 1001),
(323, 1033, 100, 202, 'finished', 1001),
(323, 1039, 100, 202, 'finished', 1001),
(323, 1014, 100, 203, 'finished', 1001),
(323, 1028, 100, 203, 'finished', 1001),
(323, 1015, 100, 204, 'finished', 1001),
(323, 1024, 100, 204, 'finished', 1001),
(323, 1026, 100, 204, 'finished', 1001),
(323, 1032, 100, 204, 'finished', 1001),

-- UN General Assembly (333)
(333, 1037, 100, 201, 'finished', 1001),
(333, 1010, 100, 201, 'finished', 1001),
(333, 1022, 100, 201, 'finished', 1001),
(333, 1012, 100, 202, 'finished', 1001),
(333, 1013, 100, 202, 'finished', 1001),
(333, 1019, 100, 202, 'finished', 1001),
(333, 1021, 100, 202, 'finished', 1001),
(333, 1025, 100, 202, 'finished', 1001),
(333, 1031, 100, 202, 'finished', 1001),
(333, 1015, 100, 204, 'finished', 1001),
(333, 1024, 100, 204, 'finished', 1001),
(333, 1032, 100, 204, 'finished', 1001),
(333, 1017, 100, 207, 'finished', 1001),
(333, 1023, 100, 207, 'finished', 1001),

-- Rockefeller Center (336)
(336, 1010, 100, 201, 'finished', 1001),
(336, 1011, 100, 201, 'finished', 1001),
(336, 1037, 100, 201, 'finished', 1001),
(336, 1034, 100, 201, 'finished', 1001),
(336, 1012, 100, 202, 'finished', 1001),
(336, 1013, 100, 202, 'finished', 1001),
(336, 1019, 100, 202, 'finished', 1001),
(336, 1021, 100, 202, 'finished', 1001),
(336, 1025, 100, 202, 'finished', 1001),
(336, 1031, 100, 202, 'finished', 1001),
(336, 1033, 100, 202, 'finished', 1001),
(336, 1039, 100, 202, 'finished', 1001),
(336, 1015, 100, 204, 'finished', 1001),
(336, 1024, 100, 204, 'finished', 1001),
(336, 1026, 100, 204, 'finished', 1001),
(336, 1032, 100, 204, 'finished', 1001),
(336, 1017, 100, 207, 'finished', 1001),
(336, 1023, 100, 207, 'finished', 1001),

-- Current active event (358 - tonight)
(358, 1037, 100, 201, 'confirmed', 1001),
(358, 1010, 100, 201, 'confirmed', 1001),
(358, 1030, 100, 201, 'confirmed', 1001),
(358, 1012, 100, 202, 'confirmed', 1001),
(358, 1019, 100, 202, 'confirmed', 1001),
(358, 1021, 100, 202, 'confirmed', 1001),
(358, 1031, 100, 202, 'confirmed', 1001),
(358, 1039, 100, 202, 'confirmed', 1001),
(358, 1015, 100, 204, 'confirmed', 1001),
(358, 1032, 100, 204, 'confirmed', 1001),
(358, 1033, 100, 207, 'confirmed', 1001),

-- Upcoming wedding (359)
(359, 1037, 100, 201, 'confirmed', 1001),
(359, 1010, 100, 201, 'confirmed', 1001),
(359, 1022, 100, 201, 'confirmed', 1001),
(359, 1030, 100, 201, 'confirmed', 1001),
(359, 1012, 100, 202, 'confirmed', 1001),
(359, 1013, 100, 202, 'confirmed', 1001),
(359, 1019, 100, 202, 'confirmed', 1001),
(359, 1021, 100, 202, 'confirmed', 1001),
(359, 1025, 100, 202, 'confirmed', 1001),
(359, 1031, 100, 202, 'confirmed', 1001),
(359, 1033, 100, 202, 'confirmed', 1001),
(359, 1039, 100, 202, 'confirmed', 1001),
(359, 1014, 100, 203, 'confirmed', 1001),
(359, 1028, 100, 203, 'confirmed', 1001),
(359, 1015, 100, 204, 'confirmed', 1001),
(359, 1024, 100, 204, 'confirmed', 1001),
(359, 1032, 100, 204, 'confirmed', 1001),
(359, 1003, 100, 205, 'confirmed', 1001),
(359, 1017, 100, 207, 'confirmed', 1001),
(359, 1023, 100, 207, 'confirmed', 1001),
(359, 1020, 100, 208, 'confirmed', 1001),
(359, 1036, 100, 208, 'confirmed', 1001);

-- ============================================================
-- 10. SHIFTS (turnos con clock-in/out para eventos completados)
-- ============================================================
INSERT INTO shifts (assignment_id, clock_in, clock_out, hours_worked, hourly_rate_snapshot, regular_pay, overtime_pay, total_pay, total_pause_minutes, is_paused)
SELECT
  ea.id,
  (e.event_date::timestamp + e.start_time::time) AT TIME ZONE 'America/New_York' - interval '5 minutes',
  CASE
    WHEN e.end_time::time < e.start_time::time
    THEN (e.event_date::timestamp + interval '1 day' + e.end_time::time) AT TIME ZONE 'America/New_York'
    ELSE (e.event_date::timestamp + e.end_time::time) AT TIME ZONE 'America/New_York'
  END,
  CASE
    WHEN e.end_time::time < e.start_time::time
    THEN EXTRACT(EPOCH FROM ((e.event_date::timestamp + interval '1 day' + e.end_time::time) - (e.event_date::timestamp + e.start_time::time))) / 3600
    ELSE EXTRACT(EPOCH FROM ((e.event_date::timestamp + e.end_time::time) - (e.event_date::timestamp + e.start_time::time))) / 3600
  END,
  jr.hourly_rate,
  jr.hourly_rate * CASE
    WHEN e.end_time::time < e.start_time::time
    THEN EXTRACT(EPOCH FROM ((e.event_date::timestamp + interval '1 day' + e.end_time::time) - (e.event_date::timestamp + e.start_time::time))) / 3600
    ELSE EXTRACT(EPOCH FROM ((e.event_date::timestamp + e.end_time::time) - (e.event_date::timestamp + e.start_time::time))) / 3600
  END,
  0,
  jr.hourly_rate * CASE
    WHEN e.end_time::time < e.start_time::time
    THEN EXTRACT(EPOCH FROM ((e.event_date::timestamp + interval '1 day' + e.end_time::time) - (e.event_date::timestamp + e.start_time::time))) / 3600
    ELSE EXTRACT(EPOCH FROM ((e.event_date::timestamp + e.end_time::time) - (e.event_date::timestamp + e.start_time::time))) / 3600
  END,
  30,
  false
FROM event_assignments ea
JOIN events e ON e.id = ea.event_id
JOIN job_roles jr ON jr.id = ea.job_role_id
WHERE ea.status = 'finished'
  AND e.status = 'finished';

-- ============================================================
-- 11. EVENT RATINGS
-- ============================================================
INSERT INTO event_ratings (event_id, user_id, company_id, rated_by, rating, comment)
SELECT 
  ea.event_id,
  ea.user_id,
  ea.company_id,
  1001,
  CASE 
    WHEN ea.user_id IN (1037, 1010, 1014, 1015, 1022, 1019) THEN 5
    WHEN ea.user_id IN (1011, 1012, 1024, 1030, 1032, 1033, 1039) THEN 5
    WHEN ea.user_id IN (1013, 1020, 1021, 1025, 1026, 1031) THEN 4
    ELSE 4
  END,
  CASE 
    WHEN ea.user_id IN (1037, 1010) THEN 'Outstanding performance. Guests loved the cocktail menu.'
    WHEN ea.user_id IN (1014) THEN 'Excellent food execution. Zero complaints from guests.'
    WHEN ea.user_id IN (1015, 1024) THEN 'Professional and discreet. Handled all situations perfectly.'
    WHEN ea.user_id IN (1012, 1019, 1039) THEN 'Attentive and polished. Great with guests.'
    WHEN ea.user_id IN (1033) THEN 'Elegant presence. Perfect for this caliber of event.'
    ELSE 'Reliable and punctual. Good team player.'
  END
FROM event_assignments ea
WHERE ea.status = 'finished'
  AND ea.event_id IN (301, 309, 310, 323, 333, 336);

-- ============================================================
-- 12. EVENT COORDINATORS
-- ============================================================
INSERT INTO event_coordinators (event_id, user_id, assigned_by) VALUES
(301, 1002, 1001), (309, 1002, 1001), (310, 1002, 1001),
(306, 1003, 1001), (307, 1003, 1001), (313, 1003, 1001),
(323, 1002, 1001), (333, 1001, 1001), (336, 1002, 1001),
(352, 1002, 1001), (354, 1001, 1001), (356, 1002, 1001),
(358, 1002, 1001), (359, 1003, 1001);

-- ============================================================
-- 13. SAMPLE NEWS
-- ============================================================
INSERT INTO news (company_id, title, content, author_id, publication_date, is_active)
VALUES
(100, 'Welcome to Elite Event Staffing!',
  'We are excited to launch our new scheduling platform. All staff can now view upcoming events, confirm assignments, and clock in/out directly from their phones.',
  1001, '2025-01-10', true),

(100, 'Dress Code Reminder — Black Tie Events',
  'A reminder that all Black Tie events require formal attire: tuxedos for men, evening gowns or cocktail dresses for women. Please arrive groomed and in proper uniform 30 minutes before start time.',
  1001, '2025-03-01', true),

(100, 'Record-Breaking 2025 Season!',
  'Thanks to the entire team for an incredible 2025. We staffed over 45 events, maintained a 4.8 average rating, and received multiple client commendations. Holiday bonuses have been processed.',
  1001, '2026-01-05', true),

(100, 'New: Clock-In Policy Update',
  'Starting February 2026, all staff must clock in via the mobile app. GPS verification is required. Late clock-ins (more than 15 minutes) must be reported to your coordinator immediately.',
  1001, '2026-02-01', true),

(100, 'Summer 2026 — Huge Event Season Ahead!',
  'We have over 20 events scheduled between June and September 2026 including the US Open, multiple galas, and a luxury yacht event. Make sure your profile and documents are up to date.',
  1001, '2026-05-01', true);

COMMIT;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- SELECT COUNT(*) FROM events WHERE company_id = 100;          -- 75
-- SELECT COUNT(*) FROM users WHERE id >= 1001;                 -- 33
-- SELECT COUNT(*) FROM event_assignments WHERE company_id = 100;
-- SELECT COUNT(*) FROM shifts;
-- SELECT name, total_events, average_rating FROM employee_profiles ORDER BY total_events DESC LIMIT 10;