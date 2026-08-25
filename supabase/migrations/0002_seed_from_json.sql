-- Seeded from assets/data/menu.json and hours.json
-- Prices are empty in the source (real menu still pending), so they land as NULL,
-- which the site renders as a dash exactly as it does today.

insert into public.menu_categories (slug, name_el, name_en, position) values ('meze', 'Μεζέδες', 'Meze', 0);
insert into public.menu_categories (slug, name_el, name_en, position) values ('salad', 'Σαλάτες', 'Salads', 1);
insert into public.menu_categories (slug, name_el, name_en, position) values ('grill', 'Στη σχάρα', 'From the grill', 2);
insert into public.menu_categories (slug, name_el, name_en, position) values ('coffee', 'Καφές', 'Coffee', 3);
insert into public.menu_categories (slug, name_el, name_en, position) values ('cocktails', 'Cocktails', 'Cocktails', 4);
insert into public.menu_categories (slug, name_el, name_en, position) values ('drinks', 'Ποτά & κρασί', 'Spirits & wine', 5);

insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Τζατζίκι', 'Tzatziki', 'Στραγγιστό γιαούρτι, αγγούρι, σκόρδο', 'Strained yoghurt, cucumber, garlic', null, 0 from public.menu_categories where slug = 'meze';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Τυροκαυτερή', 'Tirokafteri', 'Φέτα, πιπεριά Φλωρίνης, καυτερή', 'Feta, Florina pepper, chilli', null, 1 from public.menu_categories where slug = 'meze';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Ταραμοσαλάτα', 'Taramosalata', null, null, null, 2 from public.menu_categories where slug = 'meze';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Κεφτεδάκια', 'Meatballs', null, null, null, 3 from public.menu_categories where slug = 'meze';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Λουκάνικο χωριάτικο', 'Village sausage', null, null, null, 4 from public.menu_categories where slug = 'meze';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Φέτα ψητή', 'Baked feta', 'Με μέλι και σουσάμι', 'With honey and sesame', null, 5 from public.menu_categories where slug = 'meze';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Χταπόδι ξιδάτο', 'Octopus in vinegar', null, null, null, 6 from public.menu_categories where slug = 'meze';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Τηγανιά χοιρινή', 'Pork tiganiá', null, null, null, 7 from public.menu_categories where slug = 'meze';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Χωριάτικη', 'Greek salad', null, null, null, 0 from public.menu_categories where slug = 'salad';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Ντάκος', 'Dakos', null, null, null, 1 from public.menu_categories where slug = 'salad';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Πράσινη σαλάτα', 'Green salad', null, null, null, 2 from public.menu_categories where slug = 'salad';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Μπιφτέκι', 'Beef patty', null, null, null, 0 from public.menu_categories where slug = 'grill';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Χοιρινή μπριζόλα', 'Pork chop', null, null, null, 1 from public.menu_categories where slug = 'grill';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Κοτόπουλο σχάρας', 'Grilled chicken', null, null, null, 2 from public.menu_categories where slug = 'grill';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Παϊδάκια', 'Lamb chops', null, null, null, 3 from public.menu_categories where slug = 'grill';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Espresso', 'Espresso', null, null, null, 0 from public.menu_categories where slug = 'coffee';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Freddo espresso', 'Freddo espresso', null, null, null, 1 from public.menu_categories where slug = 'coffee';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Freddo cappuccino', 'Freddo cappuccino', null, null, null, 2 from public.menu_categories where slug = 'coffee';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Ελληνικός', 'Greek coffee', null, null, null, 3 from public.menu_categories where slug = 'coffee';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Καφές φίλτρου', 'Filter coffee', null, null, null, 4 from public.menu_categories where slug = 'coffee';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Aperol Spritz', 'Aperol Spritz', null, null, null, 0 from public.menu_categories where slug = 'cocktails';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Negroni', 'Negroni', null, null, null, 1 from public.menu_categories where slug = 'cocktails';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Mojito', 'Mojito', null, null, null, 2 from public.menu_categories where slug = 'cocktails';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Espresso Martini', 'Espresso Martini', null, null, null, 3 from public.menu_categories where slug = 'cocktails';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Ούζο', 'Ouzo', null, null, null, 0 from public.menu_categories where slug = 'drinks';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Τσίπουρο', 'Tsipouro', null, null, null, 1 from public.menu_categories where slug = 'drinks';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Κρασί ποτήρι', 'Wine by the glass', null, null, null, 2 from public.menu_categories where slug = 'drinks';
insert into public.menu_items (category_id, name_el, name_en, desc_el, desc_en, price, position) select id, 'Μπύρα', 'Beer', null, null, null, 3 from public.menu_categories where slug = 'drinks';

insert into public.opening_hours (day_of_week, opens_at, closes_at, is_closed) values (0, '09:00', '02:00', false);
insert into public.opening_hours (day_of_week, opens_at, closes_at, is_closed) values (1, '08:00', '02:00', false);
insert into public.opening_hours (day_of_week, opens_at, closes_at, is_closed) values (2, '08:00', '02:00', false);
insert into public.opening_hours (day_of_week, opens_at, closes_at, is_closed) values (3, '08:00', '02:00', false);
insert into public.opening_hours (day_of_week, opens_at, closes_at, is_closed) values (4, '08:00', '02:00', false);
insert into public.opening_hours (day_of_week, opens_at, closes_at, is_closed) values (5, '08:00', '03:00', false);
insert into public.opening_hours (day_of_week, opens_at, closes_at, is_closed) values (6, '08:00', '03:00', false);
