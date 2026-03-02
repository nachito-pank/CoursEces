-- =====================================================
-- SCRIPT DE CONFIGURATION SUPABASE
-- Système de Gestion de Cours en Ligne
-- =====================================================

-- 1. CRÉATION DES TABLES
-- =====================================================

-- Table des filières
CREATE TABLE IF NOT EXISTS fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des enseignants
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des cours
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'Licence 1',
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table de liaison cours-filières (relation many-to-many)
CREATE TABLE IF NOT EXISTS course_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(course_id, field_id)
);

-- Ajouter la colonne level si la table existe déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'level'
  ) THEN
    ALTER TABLE courses ADD COLUMN level text NOT NULL DEFAULT 'Licence 1';
  END IF;
END $$;

-- Supprimer l'ancienne colonne field_id si elle existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'field_id'
  ) THEN
    ALTER TABLE courses DROP COLUMN field_id;
  END IF;
END $$;

-- 2. CRÉATION DES INDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(title);
CREATE INDEX IF NOT EXISTS idx_course_fields_course_id ON course_fields(course_id);
CREATE INDEX IF NOT EXISTS idx_course_fields_field_id ON course_fields(field_id);

-- 3. ACTIVATION DE LA SÉCURITÉ (RLS)
-- =====================================================

ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_fields ENABLE ROW LEVEL SECURITY;

-- 4. POLITIQUES DE SÉCURITÉ
-- =====================================================

-- Politiques pour fields (lecture publique)
DROP POLICY IF EXISTS "Anyone can view fields" ON fields;
CREATE POLICY "Anyone can view fields"
  ON fields FOR SELECT
  USING (true);

-- Politiques pour teachers (lecture publique pour affichage)
DROP POLICY IF EXISTS "Anyone can view teachers" ON teachers;
CREATE POLICY "Anyone can view teachers"
  ON teachers FOR SELECT
  USING (true);

-- Politiques pour courses (lecture publique)
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  USING (true);

-- Politiques pour course_fields (lecture publique)
DROP POLICY IF EXISTS "Anyone can view course fields" ON course_fields;
CREATE POLICY "Anyone can view course fields"
  ON course_fields FOR SELECT
  USING (true);

-- 5. FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at sur courses
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. DONNÉES DE TEST
-- =====================================================

-- Insérer quelques filières
INSERT INTO fields (name) VALUES
  ('Informatique'),
  ('Mathématiques'),
  ('Physique'),
  ('Chimie'),
  ('Biologie'),
  ('Économie'),
  ('Gestion'),
  ('Droit'),
  ('Lettres'),
  ('Langues')
ON CONFLICT (name) DO NOTHING;

-- Insérer un enseignant de test
-- Mot de passe: password123 (hashé en SHA-256)
INSERT INTO teachers (name, email, phone, password_hash) VALUES
  ('Dr. Jean Dupont', 'jean.dupont@ecole.com', '+243 900 000 001', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'),
  ('Prof. Marie Martin', 'marie.martin@ecole.com', '+243 900 000 002', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'),
  ('Dr. Paul Bernard', 'paul.bernard@ecole.com', '+243 900 000 003', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- INSTRUCTIONS POUR LE STORAGE
-- =====================================================

-- Allez dans Storage dans le dashboard Supabase
-- Créez un nouveau bucket nommé "courses"
-- Configurez-le comme PUBLIC
-- Politique de sécurité recommandée:
--   - Lecture: Publique
--   - Upload: Authentifié uniquement (ou géré côté serveur)

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

-- 1. Pour vous connecter en tant qu'enseignant:
--    Email: jean.dupont@ecole.com
--    Mot de passe: password123

-- 2. Pour accéder à l'admin:
--    Clé: admin2025

-- 3. Les cours seront stockés dans le bucket "courses"
--    Créez-le manuellement dans Storage > New bucket > "courses"

-- 4. Pour permettre l'upload et modification des données:
--    Les opérations INSERT, UPDATE, DELETE sont gérées via
--    l'application avec les tokens Supabase
