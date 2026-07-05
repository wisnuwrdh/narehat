-- ============================================================
-- Narehat — Seed Data
-- ============================================================

-- Seed product recommendations
INSERT INTO public.recommendations (name, brand, description, price, rating, reviews, affiliate_link, image_url, category) VALUES
('Low pH Good Morning Gel Cleanser', 'COSRX', 'Pembersih wajah pH rendah yang lembut, cocok untuk semua jenis kulit. Mengandung tea tree oil dan BHA alami.', 135000, 4.8, 12400, '', '', 'cleanser'),
('Centella Calming Gel Cream', 'Skin1004', 'Pelembap ringan dengan 75% centella asiatica extract, cocok untuk kulit berjerawat dan sensitif.', 165000, 4.7, 8900, '', '', 'moisturizer'),
('Aloe Soothing Sun Cream SPF50+', 'COSRX', 'Sunscreen ringan dengan aloe vera, tidak meninggalkan white cast, cocok untuk kulit berminyak.', 185000, 4.6, 6700, '', '', 'sunscreen'),
('Salicylic Acid 2% Solution', 'The Ordinary', 'Exfoliant BHA untuk membersihkan pori-pori dan mengurangi jerawat. Gunakan 2-3x seminggu.', 120000, 4.5, 15600, '', '', 'serum'),
('Mugwort Calming Clay Mask', 'I''m From', 'Masker tanah liat dengan mugwort untuk menenangkan kulit meradang dan mengontrol minyak berlebih.', 210000, 4.4, 4200, '', '', 'mask'),
('Niacinamide 10% + Zinc 1%', 'The Ordinary', 'Serum untuk mengurangi sebum, mengecilkan pori, dan mencerahkan bekas jerawat.', 110000, 4.6, 18000, '', '', 'serum'),
('Madagascar Centella Ampoule', 'Skin1004', 'Ampul dengan 100% centella asiatica untuk menenangkan kemerahan dan jerawat meradang.', 140000, 4.7, 7300, '', '', 'serum'),
('Acne Pimple Master Patch', 'COSRX', 'Patch jerawat hidrokoloid untuk menyerap cairan jerawat semalaman. 24 patch per pack.', 45000, 4.8, 22000, '', '', 'patch');

-- Seed sample dermatology journal snippet (placeholder for RAG)
INSERT INTO public.documents (title, content, source, embedding) VALUES
('Dietary Factors and Acne Vulgaris', 'High glycemic index diets and frequent dairy consumption are associated with increased acne prevalence. Studies show that low-glycemic-load diets can reduce acne lesion counts by 23-50% over 12 weeks.', 'Journal of the American Academy of Dermatology (2019)', NULL),
('Sleep Quality and Acne Severity', 'Poor sleep quality (<6 hours/night) is correlated with increased inflammatory acne in young adults. Sleep deprivation elevates cortisol levels, which triggers sebum production.', 'Journal of Investigative Dermatology (2020)', NULL),
('Skin Picking in Acne Patients', 'Chronic skin picking (acne excoriée) is prevalent in 38% of acne patients and is strongly correlated with anxiety and stress. Behavioral interventions show 60% reduction in picking after 8 weeks.', 'British Journal of Dermatology (2021)', NULL),
('Skincare Routine Adherence', 'Patients who maintain a consistent twice-daily skincare routine (cleanser + moisturizer + sunscreen) show 40% faster improvement compared to inconsistent application.', 'Clinical Dermatology Review (2022)', NULL);
