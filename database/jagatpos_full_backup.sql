--
-- PostgreSQL database dump
--

\restrict GqztqVOp42gpeIAmjI6dO6Q7qeXHJFxh4sruAWySw5iKRNoyPU75BdM9uEGXX8w

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.unit_conversions DROP CONSTRAINT IF EXISTS unit_conversions_to_unit_id_fkey;
ALTER TABLE IF EXISTS ONLY public.unit_conversions DROP CONSTRAINT IF EXISTS unit_conversions_from_unit_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_table_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_discount_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_menu_id_fkey;
ALTER TABLE IF EXISTS ONLY public.menus DROP CONSTRAINT IF EXISTS menus_unit_id_fkey;
ALTER TABLE IF EXISTS ONLY public.menus DROP CONSTRAINT IF EXISTS menus_menu_type_id_fkey;
DROP INDEX IF EXISTS public.idx_tables_status_active;
DROP INDEX IF EXISTS public.idx_orders_table_id;
DROP INDEX IF EXISTS public.idx_orders_status_date;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_menus_type_active;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.units DROP CONSTRAINT IF EXISTS units_pkey;
ALTER TABLE IF EXISTS ONLY public.unit_conversions DROP CONSTRAINT IF EXISTS unit_conversions_pkey;
ALTER TABLE IF EXISTS ONLY public.unit_conversions DROP CONSTRAINT IF EXISTS unique_conversion;
ALTER TABLE IF EXISTS ONLY public.tables DROP CONSTRAINT IF EXISTS tables_table_number_key;
ALTER TABLE IF EXISTS ONLY public.tables DROP CONSTRAINT IF EXISTS tables_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_key_key;
ALTER TABLE IF EXISTS ONLY public.payment_methods DROP CONSTRAINT IF EXISTS payment_methods_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_order_number_key;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.menus DROP CONSTRAINT IF EXISTS menus_pkey;
ALTER TABLE IF EXISTS ONLY public.menus DROP CONSTRAINT IF EXISTS menus_code_key;
ALTER TABLE IF EXISTS ONLY public.menu_types DROP CONSTRAINT IF EXISTS menu_types_pkey;
ALTER TABLE IF EXISTS ONLY public.discounts DROP CONSTRAINT IF EXISTS discounts_pkey;
ALTER TABLE IF EXISTS ONLY public.discounts DROP CONSTRAINT IF EXISTS discounts_code_key;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.units ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.unit_conversions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tables ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payment_methods ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.menus ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.menu_types ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.discounts ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.units_id_seq;
DROP TABLE IF EXISTS public.units;
DROP SEQUENCE IF EXISTS public.unit_conversions_id_seq;
DROP TABLE IF EXISTS public.unit_conversions;
DROP SEQUENCE IF EXISTS public.tables_id_seq;
DROP TABLE IF EXISTS public.tables;
DROP SEQUENCE IF EXISTS public.settings_id_seq;
DROP TABLE IF EXISTS public.settings;
DROP SEQUENCE IF EXISTS public.payment_methods_id_seq;
DROP TABLE IF EXISTS public.payment_methods;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.menus_id_seq;
DROP TABLE IF EXISTS public.menus;
DROP SEQUENCE IF EXISTS public.menu_types_id_seq;
DROP TABLE IF EXISTS public.menu_types;
DROP SEQUENCE IF EXISTS public.discounts_id_seq;
DROP TABLE IF EXISTS public.discounts;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: discounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discounts (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(20) NOT NULL,
    value numeric(15,2) NOT NULL,
    min_order numeric(15,2) DEFAULT 0,
    max_discount numeric(15,2),
    start_date date,
    end_date date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.discounts OWNER TO postgres;

--
-- Name: discounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.discounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discounts_id_seq OWNER TO postgres;

--
-- Name: discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.discounts_id_seq OWNED BY public.discounts.id;


--
-- Name: menu_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    color character varying(20),
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menu_types OWNER TO postgres;

--
-- Name: menu_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_types_id_seq OWNER TO postgres;

--
-- Name: menu_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_types_id_seq OWNED BY public.menu_types.id;


--
-- Name: menus; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menus (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    image_url text,
    menu_type_id integer,
    price numeric(15,2) DEFAULT 0 NOT NULL,
    is_available boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    unit_id integer,
    is_promo boolean DEFAULT false,
    promo_price numeric(15,2) DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0
);


ALTER TABLE public.menus OWNER TO postgres;

--
-- Name: menus_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menus_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menus_id_seq OWNER TO postgres;

--
-- Name: menus_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menus_id_seq OWNED BY public.menus.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    menu_id integer,
    menu_name character varying(100) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    subtotal numeric(15,2) NOT NULL,
    notes text,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number character varying(30) NOT NULL,
    table_id integer,
    user_id integer,
    customer_name character varying(100),
    order_type character varying(20) DEFAULT 'dine_in'::character varying,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    subtotal numeric(15,2) DEFAULT 0,
    discount_id integer,
    discount_amount numeric(15,2) DEFAULT 0,
    tax_rate numeric(5,2) DEFAULT 11.00,
    tax_amount numeric(15,2) DEFAULT 0,
    service_charge_rate numeric(5,2) DEFAULT 0,
    service_charge numeric(15,2) DEFAULT 0,
    grand_total numeric(15,2) DEFAULT 0,
    payment_method_id integer,
    payment_amount numeric(15,2) DEFAULT 0,
    change_amount numeric(15,2) DEFAULT 0,
    status character varying(20) DEFAULT 'open'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_methods (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0
);


ALTER TABLE public.payment_methods OWNER TO postgres;

--
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_methods_id_seq OWNER TO postgres;

--
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key character varying(50) NOT NULL,
    value text,
    description text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: tables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tables (
    id integer NOT NULL,
    table_number character varying(20) NOT NULL,
    capacity integer DEFAULT 4,
    status character varying(20) DEFAULT 'available'::character varying,
    location character varying(50),
    position_x integer DEFAULT 0,
    position_y integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    floor integer DEFAULT 1
);


ALTER TABLE public.tables OWNER TO postgres;

--
-- Name: tables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tables_id_seq OWNER TO postgres;

--
-- Name: tables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tables_id_seq OWNED BY public.tables.id;


--
-- Name: unit_conversions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unit_conversions (
    id integer NOT NULL,
    from_unit_id integer,
    to_unit_id integer,
    factor numeric(15,4) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.unit_conversions OWNER TO postgres;

--
-- Name: unit_conversions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.unit_conversions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.unit_conversions_id_seq OWNER TO postgres;

--
-- Name: unit_conversions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.unit_conversions_id_seq OWNED BY public.unit_conversions.id;


--
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.units (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    symbol character varying(20) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.units OWNER TO postgres;

--
-- Name: units_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.units_id_seq OWNER TO postgres;

--
-- Name: units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(100),
    role character varying(20) DEFAULT 'cashier'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- Name: discounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts ALTER COLUMN id SET DEFAULT nextval('public.discounts_id_seq'::regclass);


--
-- Name: menu_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_types ALTER COLUMN id SET DEFAULT nextval('public.menu_types_id_seq'::regclass);


--
-- Name: menus id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus ALTER COLUMN id SET DEFAULT nextval('public.menus_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: tables id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables ALTER COLUMN id SET DEFAULT nextval('public.tables_id_seq'::regclass);


--
-- Name: unit_conversions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_conversions ALTER COLUMN id SET DEFAULT nextval('public.unit_conversions_id_seq'::regclass);


--
-- Name: units id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discounts (id, code, name, type, value, min_order, max_discount, start_date, end_date, is_active, created_at) FROM stdin;
1	WELCOME10	Welcome Discount 10%	percentage	10.00	50000.00	\N	\N	\N	t	2026-02-02 22:13:54.384858
2	HEMAT20K	Diskon Rp 20.000	fixed	20000.00	100000.00	\N	\N	\N	t	2026-02-02 22:13:54.384858
3	MEMBER15	Member Discount 15%	percentage	15.00	0.00	\N	\N	\N	t	2026-02-02 22:13:54.384858
\.


--
-- Data for Name: menu_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_types (id, name, description, icon, color, is_active, sort_order, created_at) FROM stdin;
1	Makanan Utama	Menu makanan utama	🍽️	#FF6B6B	t	1	2026-02-02 22:13:54.356133
2	Minuman	Aneka minuman segar	🥤	#4ECDC4	t	2	2026-02-02 22:13:54.356133
3	Appetizer	Menu pembuka	🥗	#45B7D1	t	3	2026-02-02 22:13:54.356133
4	Dessert	Makanan penutup dan kue	🍰	#96CEB4	t	4	2026-02-02 22:13:54.356133
5	Snack	Makanan ringan	🍟	#FFEAA7	t	5	2026-02-02 22:13:54.356133
\.


--
-- Data for Name: menus; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menus (id, code, name, description, image_url, menu_type_id, price, is_available, is_active, created_at, updated_at, unit_id, is_promo, promo_price, discount_percent) FROM stdin;
3	MKN003	Ayam Bakar Madu	Ayam bakar dengan saus madu spesial	/uploads/1770046323750-563286856.jpeg	1	45000.00	t	f	2026-02-02 22:13:54.36259	2026-02-02 22:32:03.796189	\N	f	0.00	0.00
4	MKN004	Ikan Bakar Bumbu Bali	Ikan bakar dengan bumbu khas Bali	\N	1	55000.00	t	f	2026-02-02 22:13:54.36259	2026-02-02 22:13:54.36259	\N	f	0.00	0.00
20	MNM006	Es Cincau	Cincau Hitam	/uploads/1771037362760-38164503.jpg	2	30000.00	t	t	2026-02-14 09:49:23.724354	2026-02-14 10:02:56.886383	4	f	0.00	0.00
22	MKN006	Kerang Kepa	Kerang	/uploads/1771038264033-612872080.jpg	1	45000.00	t	t	2026-02-14 10:04:25.881011	2026-02-14 10:04:25.881011	3	f	0.00	0.00
11	APT001	Bakwan Jagung	Bakwan Jagung	/uploads/1771036896753-26277036.jpg	3	20000.00	t	t	2026-02-02 22:13:54.36259	2026-02-14 10:08:40.306191	3	f	0.00	10.00
7	MNM002	Es Jeruk	Jeruk peras segar	/uploads/1770975908281-945788831.jpg	2	12000.00	t	f	2026-02-02 22:13:54.36259	2026-02-13 16:45:08.421849	\N	f	0.00	0.00
10	MNM005	Teh Tarik	Teh tarik khas Malaysia	\N	2	15000.00	t	f	2026-02-02 22:13:54.36259	2026-02-02 22:13:54.36259	\N	f	0.00	0.00
8	MNM003	Jus Alpukat	Jus alpukat segar	\N	2	18000.00	t	f	2026-02-02 22:13:54.36259	2026-02-02 22:13:54.36259	\N	f	0.00	0.00
9	MNM004	Kopi Susu	Kopi dengan susu segar	\N	2	15000.00	t	f	2026-02-02 22:13:54.36259	2026-02-02 22:13:54.36259	\N	f	0.00	0.00
16	SNK002	Onion Ring	Bawang goreng crispy	\N	5	18000.00	t	f	2026-02-02 22:13:54.36259	2026-02-02 22:13:54.36259	\N	f	0.00	0.00
15	SNK001	Cireng	Cireng Goreng	/uploads/1771036927519-124331778.jpg	5	20000.00	t	t	2026-02-02 22:13:54.36259	2026-02-14 09:42:08.13225	3	f	0.00	0.00
6	MNM001	Es Cendol	Cendol	/uploads/1771036952950-134884147.jpg	2	38000.00	t	t	2026-02-02 22:13:54.36259	2026-02-14 09:42:33.78463	4	f	0.00	0.00
14	NMN002	Es Jeruk Nipis	Jeruk nipis plus	/uploads/1771036965800-853939641.jpg	2	25000.00	t	t	2026-02-02 22:13:54.36259	2026-02-14 09:42:46.561472	4	f	0.00	0.00
13	DST001	Es PIsang Ijo	Es Pisang ijo	/uploads/1771036978365-565065671.jpg	4	35000.00	t	t	2026-02-02 22:13:54.36259	2026-02-14 09:42:59.536262	4	f	0.00	0.00
5	MKN005	Mie Titi	Mie Khas Makassar	/uploads/1771037028933-972804512.jpg	1	40000.00	t	t	2026-02-02 22:13:54.36259	2026-02-14 09:43:49.789871	4	f	0.00	0.00
2	MKN002	Sukang Bakar	Mie goreng dengan udang dan cumi	/uploads/1771037068549-529889689.jpg	1	140000.00	t	t	2026-02-02 22:13:54.36259	2026-02-14 09:44:29.218119	2	f	0.00	0.00
17	MKN03	Ayam Tempong	Ayam khas 	/uploads/1771037178895-301048200.jpg	1	40000.00	t	t	2026-02-14 09:46:19.99287	2026-02-14 09:46:19.99287	4	f	0.00	0.00
18	APT03	Pisang Goreng Kripsi	Pisang dengan sambal nikmat	/uploads/1771037278212-419137196.jpg	3	30000.00	t	t	2026-02-14 09:47:59.500642	2026-02-14 09:47:59.500642	3	f	0.00	0.00
19	MKN04	Kangkung Balacan	Kangkung	/uploads/1771037326431-436061774.jpg	1	35000.00	t	t	2026-02-14 09:48:47.328615	2026-02-14 09:48:47.328615	3	f	0.00	0.00
12	APT002	Singkong Cripsy	Singkong	/uploads/1771037048295-615396468.jpg	3	30000.00	t	t	2026-02-02 22:13:54.36259	2026-02-14 09:55:00.617317	4	t	12000.00	0.00
1	MKN001	Kepiting Soka	Kepiting di bumbukan saos Padang	/uploads/1771037000274-874263237.jpg	4	350000.00	t	t	2026-02-02 22:13:54.36259	2026-02-14 09:55:35.724753	2	t	275000.00	0.00
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, menu_id, menu_name, quantity, unit_price, subtotal, notes, status, created_at) FROM stdin;
30	6	5	Mie Titi	1	40000.00	40000.00	\N	pending	2026-02-14 08:58:29.814737
31	6	6	Es Cendol	1	38000.00	38000.00	\N	pending	2026-02-14 08:58:29.814737
32	6	11	Bakwan Jagung	1	20000.00	20000.00	\N	pending	2026-02-14 08:58:29.814737
33	7	13	Es PIsang Ijo	1	35000.00	35000.00	\N	pending	2026-02-14 10:10:58.367903
34	7	12	Singkong Cripsy	1	12000.00	12000.00	\N	pending	2026-02-14 10:10:58.367903
35	7	18	Pisang Goreng Kripsi	1	30000.00	30000.00	\N	pending	2026-02-14 10:10:58.367903
36	8	18	Pisang Goreng Kripsi	1	30000.00	30000.00	\N	pending	2026-02-14 10:11:16.765745
37	8	5	Mie Titi	1	40000.00	40000.00	\N	pending	2026-02-14 10:11:16.765745
38	8	22	Kerang Kepa	1	45000.00	45000.00	\N	pending	2026-02-14 10:11:16.765745
39	9	13	Es PIsang Ijo	1	35000.00	35000.00	\N	pending	2026-02-14 10:11:39.894443
40	9	6	Es Cendol	1	38000.00	38000.00	\N	pending	2026-02-14 10:11:39.894443
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, table_id, user_id, customer_name, order_type, order_date, subtotal, discount_id, discount_amount, tax_rate, tax_amount, service_charge_rate, service_charge, grand_total, payment_method_id, payment_amount, change_amount, status, notes, created_at, updated_at) FROM stdin;
6	ORD202602140001	3	1		dine_in	2026-02-14 08:58:29.814737	98000.00	\N	0.00	11.00	10780.00	0.00	0.00	108780.00	1	108780.00	0.00	paid	\N	2026-02-14 08:58:29.814737	2026-02-14 08:58:36.552325
7	ORD202602140002	10	1		dine_in	2026-02-14 10:10:58.367903	77000.00	\N	0.00	11.00	8470.00	0.00	0.00	85470.00	2	85470.00	0.00	paid	\N	2026-02-14 10:10:58.367903	2026-02-14 10:11:03.106867
8	ORD202602140003	11	1		dine_in	2026-02-14 10:11:16.765745	115000.00	2	20000.00	11.00	10450.00	0.00	0.00	105450.00	6	105450.00	0.00	paid	\N	2026-02-14 10:11:16.765745	2026-02-14 10:11:28.746627
9	ORD202602140004	3	1		dine_in	2026-02-14 10:11:39.894443	73000.00	\N	0.00	11.00	8030.00	0.00	0.00	81030.00	1	81030.00	0.00	paid	\N	2026-02-14 10:11:39.894443	2026-02-14 10:11:45.966607
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_methods (id, name, is_active, sort_order) FROM stdin;
1	Cash	t	1
2	Debit Card	t	2
3	Credit Card	t	3
4	QRIS	t	4
5	GoPay	t	5
6	OVO	t	6
7	Dana	t	7
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, description, updated_at) FROM stdin;
41	restaurant_name_header	JAGAT RAYA RESTORAN	\N	2026-02-14 11:29:10.85174
51	restaurant_name_header_font_size	28	\N	2026-02-14 11:29:10.892531
52	restaurant_name_font_size	20	\N	2026-02-14 11:29:10.894059
1	restaurant_name		Nama restoran	2026-02-14 11:29:10.895534
2	tax_rate	11	Persentase PB1 (Pajak Restoran)	2026-02-14 11:29:10.897112
3	service_charge_rate	5	Persentase service charge	2026-02-14 11:29:10.898202
4	enable_service_charge	false	Aktifkan service charge	2026-02-14 11:29:10.901069
5	currency	Rp	Simbol mata uang	2026-02-14 11:29:10.90239
6	receipt_footer	Terima kasih atas kunjungan Anda!	Footer struk	2026-02-14 11:29:10.903583
7	auto_print_receipt	true	Auto print struk setelah pembayaran	2026-02-14 11:29:10.904826
8	restaurant_logo	/uploads/1770970985976-547876435.png	\N	2026-02-14 11:29:10.905883
\.


--
-- Data for Name: tables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tables (id, table_number, capacity, status, location, position_x, position_y, is_active, created_at, floor) FROM stdin;
2	T02	4	available	Indoor	732	470	t	2026-02-02 22:13:54.372605	1
5	T05	6	available	Indoor	732	259	t	2026-02-02 22:13:54.372605	1
6	T06	2	available	Outdoor	904	247	t	2026-02-02 22:13:54.372605	1
7	T07	2	available	Outdoor	100	400	t	2026-02-02 22:13:54.372605	1
12	W01	4	available	Indoor	50	50	t	2026-02-04 19:43:19.53901	2
1	T01	4	available	Indoor	1113	474	t	2026-02-02 22:13:54.372605	1
9	T09	4	available	Indoor	462	571	t	2026-02-02 22:13:54.372605	1
8	T08	8	available	VIP	312	332	t	2026-02-02 22:13:54.372605	1
4	T04	6	available	Indoor	100	250	t	2026-02-02 22:13:54.372605	1
10	T10	4	available	Indoor	1089	249	t	2026-02-02 22:13:54.372605	1
11	T11	4	available	Indoor	923	484	t	2026-02-02 22:49:49.757416	1
3	T03	4	available	Indoor	311	111	t	2026-02-02 22:13:54.372605	1
\.


--
-- Data for Name: unit_conversions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unit_conversions (id, from_unit_id, to_unit_id, factor, created_at) FROM stdin;
1	1	2	10.0000	2026-02-14 09:05:29.272982
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (id, name, symbol, description, created_at) FROM stdin;
1	Kilogram	KG		2026-02-14 09:04:54.509589
2	Ons	Ons		2026-02-14 09:05:05.601078
3	Porsi	Prs		2026-02-14 09:06:07.879896
4	Pieces	Pcs		2026-02-14 09:06:18.878408
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, full_name, role, is_active, created_at) FROM stdin;
1	admin	$2b$10$T/05/pW1DzyaXNQr0wyn.uQ7dcVmS1sFCewTl9FTtPYgy8QG3u/Bu	Administrator	admin	t	2026-02-02 22:13:54.270338
2	kasir1	$2b$10$.yI1pbiYFy5rBvQkfS0NFuiFoC8My9K3szObdc6Ayx8EWo.HDSUXu	Kasir 1	cashier	t	2026-02-02 22:13:54.339144
\.


--
-- Name: discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.discounts_id_seq', 3, true);


--
-- Name: menu_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_types_id_seq', 5, true);


--
-- Name: menus_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menus_id_seq', 22, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 40, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 9, true);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 7, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 118, true);


--
-- Name: tables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tables_id_seq', 12, true);


--
-- Name: unit_conversions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.unit_conversions_id_seq', 1, true);


--
-- Name: units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.units_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: discounts discounts_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_code_key UNIQUE (code);


--
-- Name: discounts discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_pkey PRIMARY KEY (id);


--
-- Name: menu_types menu_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_types
    ADD CONSTRAINT menu_types_pkey PRIMARY KEY (id);


--
-- Name: menus menus_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_code_key UNIQUE (code);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: tables tables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (id);


--
-- Name: tables tables_table_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_table_number_key UNIQUE (table_number);


--
-- Name: unit_conversions unique_conversion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_conversions
    ADD CONSTRAINT unique_conversion UNIQUE (from_unit_id, to_unit_id);


--
-- Name: unit_conversions unit_conversions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_conversions
    ADD CONSTRAINT unit_conversions_pkey PRIMARY KEY (id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_menus_type_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menus_type_active ON public.menus USING btree (menu_type_id, is_active);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_orders_status_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status_date ON public.orders USING btree (status, order_date);


--
-- Name: idx_orders_table_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_table_id ON public.orders USING btree (table_id);


--
-- Name: idx_tables_status_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tables_status_active ON public.tables USING btree (status, is_active);


--
-- Name: menus menus_menu_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_menu_type_id_fkey FOREIGN KEY (menu_type_id) REFERENCES public.menu_types(id);


--
-- Name: menus menus_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id);


--
-- Name: order_items order_items_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_discount_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_discount_id_fkey FOREIGN KEY (discount_id) REFERENCES public.discounts(id);


--
-- Name: orders orders_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);


--
-- Name: orders orders_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: unit_conversions unit_conversions_from_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_conversions
    ADD CONSTRAINT unit_conversions_from_unit_id_fkey FOREIGN KEY (from_unit_id) REFERENCES public.units(id) ON DELETE CASCADE;


--
-- Name: unit_conversions unit_conversions_to_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_conversions
    ADD CONSTRAINT unit_conversions_to_unit_id_fkey FOREIGN KEY (to_unit_id) REFERENCES public.units(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict GqztqVOp42gpeIAmjI6dO6Q7qeXHJFxh4sruAWySw5iKRNoyPU75BdM9uEGXX8w

