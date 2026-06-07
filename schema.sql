--
-- PostgreSQL database dump
--

\restrict gidZtMwfEEuCI2y7FXXhml9y8JUW6fp5HVhIshrPhplpPLlkhkNXFJVSQ5RvNGw

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    slug character varying(100) NOT NULL,
    contact_email character varying(255) NOT NULL,
    contact_phone character varying(30),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    shift_start_minutes_before integer DEFAULT 30 NOT NULL
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: employee_job_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_job_roles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    company_id integer NOT NULL,
    job_role_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    hourly_rate_override numeric(10,2)
);


ALTER TABLE public.employee_job_roles OWNER TO postgres;

--
-- Name: employee_job_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_job_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_job_roles_id_seq OWNER TO postgres;

--
-- Name: employee_job_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_job_roles_id_seq OWNED BY public.employee_job_roles.id;


--
-- Name: employee_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    bio text,
    avatar_url character varying(500),
    average_rating numeric(3,2),
    total_events integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_avg_rating CHECK (((average_rating IS NULL) OR ((average_rating >= 1.00) AND (average_rating <= 5.00)))),
    CONSTRAINT chk_total_events CHECK ((total_events >= 0))
);


ALTER TABLE public.employee_profiles OWNER TO postgres;

--
-- Name: employee_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_profiles_id_seq OWNER TO postgres;

--
-- Name: employee_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_profiles_id_seq OWNED BY public.employee_profiles.id;


--
-- Name: event_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_assignments (
    id integer NOT NULL,
    event_id integer NOT NULL,
    user_id integer NOT NULL,
    company_id integer NOT NULL,
    job_role_id integer NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    assigned_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    event_job_role_id integer
);


ALTER TABLE public.event_assignments OWNER TO postgres;

--
-- Name: event_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_assignments_id_seq OWNER TO postgres;

--
-- Name: event_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.event_assignments_id_seq OWNED BY public.event_assignments.id;


--
-- Name: event_coordinators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_coordinators (
    id integer NOT NULL,
    event_id integer NOT NULL,
    user_id integer NOT NULL,
    assigned_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.event_coordinators OWNER TO postgres;

--
-- Name: event_coordinators_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_coordinators_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_coordinators_id_seq OWNER TO postgres;

--
-- Name: event_coordinators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.event_coordinators_id_seq OWNED BY public.event_coordinators.id;


--
-- Name: event_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_documents (
    id integer NOT NULL,
    event_id integer NOT NULL,
    name character varying(200) NOT NULL,
    url character varying(1000) NOT NULL,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.event_documents OWNER TO postgres;

--
-- Name: event_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_documents_id_seq OWNER TO postgres;

--
-- Name: event_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.event_documents_id_seq OWNED BY public.event_documents.id;


--
-- Name: event_job_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_job_roles (
    id integer NOT NULL,
    event_id integer NOT NULL,
    job_role_id integer NOT NULL,
    slots_required integer NOT NULL,
    slots_filled integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    hourly_rate_override numeric(10,2),
    start_time time without time zone,
    CONSTRAINT chk_slots_filled CHECK ((slots_filled >= 0)),
    CONSTRAINT chk_slots_not_exceeded CHECK ((slots_filled <= slots_required)),
    CONSTRAINT chk_slots_required CHECK ((slots_required > 0))
);


ALTER TABLE public.event_job_roles OWNER TO postgres;

--
-- Name: event_job_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_job_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_job_roles_id_seq OWNER TO postgres;

--
-- Name: event_job_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.event_job_roles_id_seq OWNED BY public.event_job_roles.id;


--
-- Name: event_ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_ratings (
    id integer NOT NULL,
    event_id integer NOT NULL,
    user_id integer NOT NULL,
    company_id integer NOT NULL,
    rated_by integer NOT NULL,
    rating smallint NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_rating_value CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.event_ratings OWNER TO postgres;

--
-- Name: event_ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_ratings_id_seq OWNER TO postgres;

--
-- Name: event_ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.event_ratings_id_seq OWNED BY public.event_ratings.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying(200) NOT NULL,
    event_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone,
    address character varying(500) NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    dress_code character varying(200),
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    city character varying(100),
    state character varying(50),
    zip_code character varying(20),
    is_public boolean DEFAULT true NOT NULL,
    notes text
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: job_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_roles (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying(100) NOT NULL,
    hourly_rate numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_hourly_rate CHECK ((hourly_rate >= (0)::numeric))
);


ALTER TABLE public.job_roles OWNER TO postgres;

--
-- Name: job_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_roles_id_seq OWNER TO postgres;

--
-- Name: job_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_roles_id_seq OWNED BY public.job_roles.id;


--
-- Name: news; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.news (
    id integer NOT NULL,
    company_id integer NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    author_id integer NOT NULL,
    publication_date timestamp with time zone,
    expiration_date timestamp with time zone,
    published_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.news OWNER TO postgres;

--
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_id_seq OWNER TO postgres;

--
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.news_id_seq OWNED BY public.news.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    company_id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(100) NOT NULL,
    channel character varying(10) NOT NULL,
    subject character varying(255),
    body text NOT NULL,
    status character varying(10) DEFAULT 'pending'::character varying NOT NULL,
    attempts smallint DEFAULT '0'::smallint NOT NULL,
    error_message text,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(64) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_es character varying(100) NOT NULL,
    name_en character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profiles_id_seq OWNER TO postgres;

--
-- Name: profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profiles.id;


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.push_subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.push_subscriptions OWNER TO postgres;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.push_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.push_subscriptions_id_seq OWNER TO postgres;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.push_subscriptions_id_seq OWNED BY public.push_subscriptions.id;


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shifts (
    id integer NOT NULL,
    assignment_id integer NOT NULL,
    clock_in timestamp with time zone,
    clock_in_lat numeric(10,7),
    clock_in_lng numeric(10,7),
    clock_out timestamp with time zone,
    clock_out_lat numeric(10,7),
    clock_out_lng numeric(10,7),
    hours_worked numeric(6,2),
    hourly_rate_snapshot numeric(10,2) NOT NULL,
    regular_pay numeric(10,2),
    overtime_pay numeric(10,2) DEFAULT 0.00 NOT NULL,
    total_pay numeric(10,2),
    modified_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    pause_start timestamp without time zone,
    total_pause_minutes numeric(8,2) DEFAULT '0'::numeric,
    is_paused boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_clockout_after CHECK (((clock_out IS NULL) OR (clock_out > clock_in))),
    CONSTRAINT chk_shift_hours CHECK (((hours_worked IS NULL) OR (hours_worked >= (0)::numeric))),
    CONSTRAINT chk_shift_overtime CHECK ((overtime_pay >= (0)::numeric)),
    CONSTRAINT chk_shift_rate CHECK ((hourly_rate_snapshot >= (0)::numeric))
);


ALTER TABLE public.shifts OWNER TO postgres;

--
-- Name: shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shifts_id_seq OWNER TO postgres;

--
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- Name: user_company_memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_company_memberships (
    id integer NOT NULL,
    user_id integer NOT NULL,
    company_id integer NOT NULL,
    profile_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_company_memberships OWNER TO postgres;

--
-- Name: user_company_memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_company_memberships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_company_memberships_id_seq OWNER TO postgres;

--
-- Name: user_company_memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_company_memberships_id_seq OWNED BY public.user_company_memberships.id;


--
-- Name: user_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_documents (
    id integer NOT NULL,
    user_id integer NOT NULL,
    doc_type character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    url character varying(500) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_documents OWNER TO postgres;

--
-- Name: user_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_documents_id_seq OWNER TO postgres;

--
-- Name: user_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_documents_id_seq OWNED BY public.user_documents.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone character varying(30),
    preferred_lang character varying(5) DEFAULT 'es'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    must_change_password boolean DEFAULT false NOT NULL,
    address character varying(500),
    city character varying(100),
    state character varying(50),
    zip_code character varying(20),
    photo_url character varying(500),
    username character varying(100)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: weekly_hours_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weekly_hours_config (
    id integer NOT NULL,
    company_id integer NOT NULL,
    weekly_hours_limit numeric(5,2) DEFAULT 40.00 NOT NULL,
    week_start_day character varying(10) DEFAULT 'monday'::character varying NOT NULL,
    week_end_day character varying(10) DEFAULT 'sunday'::character varying NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by integer,
    min_shift_hours numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    horas_entre_eventos integer DEFAULT 0 NOT NULL,
    admin_can_clock_in_all boolean DEFAULT false NOT NULL,
    days_to_reject_event integer DEFAULT 0 NOT NULL,
    geolocation_enabled boolean DEFAULT true NOT NULL,
    overtime_multiplier numeric(4,2) DEFAULT 1.50 NOT NULL,
    CONSTRAINT chk_hours_limit CHECK ((weekly_hours_limit > (0)::numeric))
);


ALTER TABLE public.weekly_hours_config OWNER TO postgres;

--
-- Name: weekly_hours_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.weekly_hours_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weekly_hours_config_id_seq OWNER TO postgres;

--
-- Name: weekly_hours_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.weekly_hours_config_id_seq OWNED BY public.weekly_hours_config.id;


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: employee_job_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_job_roles ALTER COLUMN id SET DEFAULT nextval('public.employee_job_roles_id_seq'::regclass);


--
-- Name: employee_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_profiles ALTER COLUMN id SET DEFAULT nextval('public.employee_profiles_id_seq'::regclass);


--
-- Name: event_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_assignments ALTER COLUMN id SET DEFAULT nextval('public.event_assignments_id_seq'::regclass);


--
-- Name: event_coordinators id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_coordinators ALTER COLUMN id SET DEFAULT nextval('public.event_coordinators_id_seq'::regclass);


--
-- Name: event_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_documents ALTER COLUMN id SET DEFAULT nextval('public.event_documents_id_seq'::regclass);


--
-- Name: event_job_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_job_roles ALTER COLUMN id SET DEFAULT nextval('public.event_job_roles_id_seq'::regclass);


--
-- Name: event_ratings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_ratings ALTER COLUMN id SET DEFAULT nextval('public.event_ratings_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: job_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_roles ALTER COLUMN id SET DEFAULT nextval('public.job_roles_id_seq'::regclass);


--
-- Name: news id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news ALTER COLUMN id SET DEFAULT nextval('public.news_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);


--
-- Name: push_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.push_subscriptions_id_seq'::regclass);


--
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- Name: user_company_memberships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_company_memberships ALTER COLUMN id SET DEFAULT nextval('public.user_company_memberships_id_seq'::regclass);


--
-- Name: user_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents ALTER COLUMN id SET DEFAULT nextval('public.user_documents_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: weekly_hours_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_hours_config ALTER COLUMN id SET DEFAULT nextval('public.weekly_hours_config_id_seq'::regclass);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: companies companies_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_slug_key UNIQUE (slug);


--
-- Name: employee_job_roles employee_job_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_job_roles
    ADD CONSTRAINT employee_job_roles_pkey PRIMARY KEY (id);


--
-- Name: employee_profiles employee_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_pkey PRIMARY KEY (id);


--
-- Name: employee_profiles employee_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_user_id_key UNIQUE (user_id);


--
-- Name: event_assignments event_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_assignments
    ADD CONSTRAINT event_assignments_pkey PRIMARY KEY (id);


--
-- Name: event_coordinators event_coordinators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_coordinators
    ADD CONSTRAINT event_coordinators_pkey PRIMARY KEY (id);


--
-- Name: event_documents event_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_documents
    ADD CONSTRAINT event_documents_pkey PRIMARY KEY (id);


--
-- Name: event_job_roles event_job_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_job_roles
    ADD CONSTRAINT event_job_roles_pkey PRIMARY KEY (id);


--
-- Name: event_ratings event_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_ratings
    ADD CONSTRAINT event_ratings_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: job_roles job_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT job_roles_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- Name: profiles profiles_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_code_key UNIQUE (code);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: event_assignments uq_assignment; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_assignments
    ADD CONSTRAINT uq_assignment UNIQUE (event_id, user_id);


--
-- Name: employee_job_roles uq_employee_job_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_job_roles
    ADD CONSTRAINT uq_employee_job_role UNIQUE (user_id, company_id, job_role_id);


--
-- Name: event_coordinators uq_event_coordinator; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_coordinators
    ADD CONSTRAINT uq_event_coordinator UNIQUE (event_id, user_id);


--
-- Name: job_roles uq_job_role_company; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT uq_job_role_company UNIQUE (company_id, name);


--
-- Name: push_subscriptions uq_push_endpoint; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT uq_push_endpoint UNIQUE (endpoint);


--
-- Name: event_ratings uq_rating_event_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_ratings
    ADD CONSTRAINT uq_rating_event_user UNIQUE (event_id, user_id);


--
-- Name: shifts uq_shift_assignment; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT uq_shift_assignment UNIQUE (assignment_id);


--
-- Name: user_company_memberships uq_user_company; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_company_memberships
    ADD CONSTRAINT uq_user_company UNIQUE (user_id, company_id);


--
-- Name: users uq_users_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_username UNIQUE (username);


--
-- Name: weekly_hours_config uq_whc_company; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_hours_config
    ADD CONSTRAINT uq_whc_company UNIQUE (company_id);


--
-- Name: user_company_memberships user_company_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_company_memberships
    ADD CONSTRAINT user_company_memberships_pkey PRIMARY KEY (id);


--
-- Name: user_documents user_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: weekly_hours_config weekly_hours_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_hours_config
    ADD CONSTRAINT weekly_hours_config_pkey PRIMARY KEY (id);


--
-- Name: idx_ea_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ea_company ON public.event_assignments USING btree (company_id);


--
-- Name: idx_ea_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ea_event ON public.event_assignments USING btree (event_id);


--
-- Name: idx_ea_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ea_status ON public.event_assignments USING btree (event_id, status);


--
-- Name: idx_ea_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ea_user ON public.event_assignments USING btree (user_id, company_id);


--
-- Name: idx_ejr_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ejr_event ON public.event_job_roles USING btree (event_id);


--
-- Name: idx_ejr_user_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ejr_user_company ON public.employee_job_roles USING btree (user_id, company_id);


--
-- Name: idx_events_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_company ON public.events USING btree (company_id);


--
-- Name: idx_events_company_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_company_date ON public.events USING btree (company_id, event_date);


--
-- Name: idx_events_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_status ON public.events USING btree (company_id, status);


--
-- Name: idx_job_roles_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_roles_company ON public.job_roles USING btree (company_id);


--
-- Name: idx_notif_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notif_company ON public.notifications USING btree (company_id);


--
-- Name: idx_notif_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notif_status ON public.notifications USING btree (status);


--
-- Name: idx_notif_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notif_user ON public.notifications USING btree (user_id);


--
-- Name: idx_prt_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prt_token ON public.password_reset_tokens USING btree (token);


--
-- Name: idx_prt_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prt_user ON public.password_reset_tokens USING btree (user_id);


--
-- Name: idx_ratings_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ratings_company ON public.event_ratings USING btree (company_id);


--
-- Name: idx_ratings_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ratings_event ON public.event_ratings USING btree (event_id);


--
-- Name: idx_ratings_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ratings_user ON public.event_ratings USING btree (user_id);


--
-- Name: idx_shifts_assignment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shifts_assignment ON public.shifts USING btree (assignment_id);


--
-- Name: idx_ucm_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ucm_company ON public.user_company_memberships USING btree (company_id);


--
-- Name: idx_ucm_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ucm_user ON public.user_company_memberships USING btree (user_id);


--
-- Name: idx_user_docs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_docs_user ON public.user_documents USING btree (user_id);


--
-- Name: ix_ea_event_job_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ea_event_job_role ON public.event_assignments USING btree (event_job_role_id);


--
-- Name: ix_event_coordinators_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_event_coordinators_event_id ON public.event_coordinators USING btree (event_id);


--
-- Name: ix_event_coordinators_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_event_coordinators_user_id ON public.event_coordinators USING btree (user_id);


--
-- Name: ix_event_documents_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_event_documents_event_id ON public.event_documents USING btree (event_id);


--
-- Name: ix_news_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_news_company_id ON public.news USING btree (company_id);


--
-- Name: ix_news_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_news_published_at ON public.news USING btree (published_at);


--
-- Name: ix_push_subscriptions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_push_subscriptions_user_id ON public.push_subscriptions USING btree (user_id);


--
-- Name: employee_job_roles employee_job_roles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_job_roles
    ADD CONSTRAINT employee_job_roles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employee_job_roles employee_job_roles_job_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_job_roles
    ADD CONSTRAINT employee_job_roles_job_role_id_fkey FOREIGN KEY (job_role_id) REFERENCES public.job_roles(id) ON DELETE CASCADE;


--
-- Name: employee_job_roles employee_job_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_job_roles
    ADD CONSTRAINT employee_job_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_profiles employee_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: event_assignments event_assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_assignments
    ADD CONSTRAINT event_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: event_assignments event_assignments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_assignments
    ADD CONSTRAINT event_assignments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: event_assignments event_assignments_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_assignments
    ADD CONSTRAINT event_assignments_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_assignments event_assignments_event_job_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_assignments
    ADD CONSTRAINT event_assignments_event_job_role_id_fkey FOREIGN KEY (event_job_role_id) REFERENCES public.event_job_roles(id) ON DELETE SET NULL;


--
-- Name: event_assignments event_assignments_job_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_assignments
    ADD CONSTRAINT event_assignments_job_role_id_fkey FOREIGN KEY (job_role_id) REFERENCES public.job_roles(id) ON DELETE RESTRICT;


--
-- Name: event_assignments event_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_assignments
    ADD CONSTRAINT event_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: event_coordinators event_coordinators_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_coordinators
    ADD CONSTRAINT event_coordinators_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: event_coordinators event_coordinators_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_coordinators
    ADD CONSTRAINT event_coordinators_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_coordinators event_coordinators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_coordinators
    ADD CONSTRAINT event_coordinators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: event_documents event_documents_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_documents
    ADD CONSTRAINT event_documents_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_documents event_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_documents
    ADD CONSTRAINT event_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: event_job_roles event_job_roles_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_job_roles
    ADD CONSTRAINT event_job_roles_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_job_roles event_job_roles_job_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_job_roles
    ADD CONSTRAINT event_job_roles_job_role_id_fkey FOREIGN KEY (job_role_id) REFERENCES public.job_roles(id) ON DELETE RESTRICT;


--
-- Name: event_ratings event_ratings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_ratings
    ADD CONSTRAINT event_ratings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: event_ratings event_ratings_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_ratings
    ADD CONSTRAINT event_ratings_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_ratings event_ratings_rated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_ratings
    ADD CONSTRAINT event_ratings_rated_by_fkey FOREIGN KEY (rated_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: event_ratings event_ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_ratings
    ADD CONSTRAINT event_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: events events_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: job_roles job_roles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT job_roles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: news news_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: news news_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: push_subscriptions push_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shifts shifts_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.event_assignments(id) ON DELETE CASCADE;


--
-- Name: shifts shifts_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_company_memberships user_company_memberships_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_company_memberships
    ADD CONSTRAINT user_company_memberships_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_company_memberships user_company_memberships_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_company_memberships
    ADD CONSTRAINT user_company_memberships_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- Name: user_company_memberships user_company_memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_company_memberships
    ADD CONSTRAINT user_company_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_documents user_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: weekly_hours_config weekly_hours_config_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_hours_config
    ADD CONSTRAINT weekly_hours_config_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: weekly_hours_config weekly_hours_config_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_hours_config
    ADD CONSTRAINT weekly_hours_config_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict gidZtMwfEEuCI2y7FXXhml9y8JUW6fp5HVhIshrPhplpPLlkhkNXFJVSQ5RvNGw

