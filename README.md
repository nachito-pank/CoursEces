# CoursEces Project

Ce dépôt contient une application React créée avec Vite. L’accès aux données est géré
via une base de données et les paramètres de connexion sont fournis par des
variables d’environnement. Ci‑dessous se trouvent les étapes à suivre pour installer
et lancer le projet sur votre machine locale.

## Prérequis

- Node.js (version 14 ou supérieure)
- npm 

## Installation locale

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/<votre‑organisation>/<nom‑du‑repo>.git
   cd project
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration locale**
   - Créez un fichier `.env` à la racine du projet

   - Le fichier `.env` doit contenir les paramètres de connexion à la base de données :
     ```text
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dWRycHpnaWFtcmR3cmVxbXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDg5MjgsImV4cCI6MjA3Njk4NDkyOH0.Z30RejoPxb94O3-_Or7Sz5mKaVxLYAvu6k2ZZZQAMuI

     VITE_SUPABASE_URL=https://ryudrpzgiamrdwreqmrn.supabase.co
     ```
   

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   Le site sera disponible sur `http://localhost:5173` par défaut.

## Exécution supplémentaire

- Pour compiler en production : `npm run build`
- Pour mettre à jour les dépendances : `npm install`

## Structure du projet

Le répertoire `src/` contient les composants React (`components/`), les contextes
(`contexts/`), la configuration Supabase (`lib/supabase.ts`) et les pages
(`pages/`). Les fichiers de configuration typique de Vite, Tailwind et ESLint sont
déjà en place.

----

N’hésitez pas à contacter le mainteneur (Nachito)  si vous rencontrez des problèmes ou avez des
questions.