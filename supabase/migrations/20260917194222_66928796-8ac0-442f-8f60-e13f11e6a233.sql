CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.order_status AS ENUM ('received', 'confirmed', 'preparing', 'ready', 'on_the_way', 'completed', 'cancelled');
CREATE TYPE public.fulfilment_type AS ENUM ('pickup', 'delivery');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers manage own profile" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_categories TO authenticated;
GRANT ALL ON public.menu_categories TO service_role;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone browses menu categories" ON public.menu_categories FOR SELECT TO anon, authenticated USING (is_available OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners manage menu categories" ON public.menu_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_key TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  allergens TEXT[] NOT NULL DEFAULT '{}',
  dietary TEXT[] NOT NULL DEFAULT '{}',
  add_ons JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone browses available dishes" ON public.menu_items FOR SELECT TO anon, authenticated USING (is_available OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners manage dishes" ON public.menu_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  fulfilment public.fulfilment_type NOT NULL,
  address TEXT,
  instructions TEXT,
  requested_time TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  status public.order_status NOT NULL DEFAULT 'received',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guests create orders" ON public.orders FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "Customers create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  selected_add_ons JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_items TO anon, authenticated;
GRANT UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guests add order items" ON public.order_items FOR INSERT TO anon WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id IS NULL));
CREATE POLICY "Customers add own order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.user_id IS NULL)));
CREATE POLICY "Customers view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Owners manage order items" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code TEXT NOT NULL UNIQUE,
  user_id UUID,
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 12),
  notes TEXT,
  status public.reservation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.reservations TO anon;
GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guests request reservations" ON public.reservations FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "Customers request own reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Customers view own reservations" ON public.reservations FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners manage reservations" ON public.reservations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_type TEXT NOT NULL CHECK (enquiry_type IN ('private_dining', 'contact')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_date DATE,
  guests INTEGER,
  occasion TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.enquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors submit enquiries" ON public.enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Owners manage enquiries" ON public.enquiries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER menu_categories_updated_at BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER enquiries_updated_at BEFORE UPDATE ON public.enquiries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.menu_categories (slug, name, description, sort_order) VALUES
('starters','Starters','Small plates to begin.',1),('signatures','Signatures','The dishes that define Zayqa.',2),('mains','Mains','Considered plates for the table.',3),('grills','Grills','From charcoal and flame.',4),('desserts','Desserts','A quiet finish.',5),('drinks','Drinks','House pours and alcohol-free serves.',6);

INSERT INTO public.menu_items (category_id, slug, name, description, price, image_key, ingredients, allergens, dietary, add_ons, is_featured)
SELECT id, 'truffle-saffron-arancini', 'Truffle Saffron Arancini', 'Crisp risotto, Kashmiri saffron, black truffle and smoked tomato.', 18, 'dessert', ARRAY['risotto','saffron','truffle','smoked tomato'], ARRAY['milk','gluten'], ARRAY['vegetarian'], '[{"name":"Extra truffle","price":4}]', true FROM public.menu_categories WHERE slug='starters';
INSERT INTO public.menu_items (category_id, slug, name, description, price, image_key, ingredients, allergens, dietary, add_ons, is_featured)
SELECT id, 'signature-clay-pot-biryani', 'Signature Clay-Pot Biryani', 'Aged basmati, slow-cooked lamb, saffron, roasted nuts and mint raita.', 28, 'biryani', ARRAY['lamb','basmati','saffron','cashew','mint'], ARRAY['nuts','milk'], ARRAY['halal'], '[{"name":"Extra lamb","price":8},{"name":"Cucumber raita","price":3}]', true FROM public.menu_categories WHERE slug='signatures';
INSERT INTO public.menu_items (category_id, slug, name, description, price, image_key, ingredients, allergens, dietary, add_ons, is_featured)
SELECT id, 'pan-seared-sea-bass', 'Pan-Seared Sea Bass', 'Lemongrass curry, wilted greens, ginger and charred lime.', 36, 'seabass', ARRAY['sea bass','lemongrass','ginger','greens'], ARRAY['fish'], ARRAY['gluten-free'], '[{"name":"Saffron rice","price":5}]', true FROM public.menu_categories WHERE slug='mains';
INSERT INTO public.menu_items (category_id, slug, name, description, price, image_key, ingredients, allergens, dietary, add_ons, is_featured)
SELECT id, 'smoke-infused-lamb-chops', 'Smoke-Infused Lamb Chops', 'Charcoal grilled, mint yogurt, charred lemon and soft herbs.', 32, 'lamb', ARRAY['lamb','mint','yogurt','lemon'], ARRAY['milk'], ARRAY['halal','gluten-free'], '[{"name":"Extra chop","price":9}]', true FROM public.menu_categories WHERE slug='grills';
INSERT INTO public.menu_items (category_id, slug, name, description, price, image_key, ingredients, allergens, dietary, add_ons, is_featured)
SELECT id, 'pistachio-rose-tart', 'Pistachio Rose Tart', 'Buttery pastry, pistachio ganache, cardamom and dried rose.', 16, 'dessert', ARRAY['pistachio','rose','cardamom','pastry'], ARRAY['nuts','milk','gluten'], ARRAY['vegetarian'], '[{"name":"Cardamom ice cream","price":4}]', true FROM public.menu_categories WHERE slug='desserts';
INSERT INTO public.menu_items (category_id, slug, name, description, price, image_key, ingredients, allergens, dietary, add_ons, is_featured)
SELECT id, 'royal-saffron-chai', 'Royal Saffron Chai', 'Black tea, warm spice, saffron and steamed milk.', 9, 'table', ARRAY['black tea','saffron','milk','spice'], ARRAY['milk'], ARRAY['vegetarian'], '[{"name":"Oat milk","price":1}]', false FROM public.menu_categories WHERE slug='drinks';