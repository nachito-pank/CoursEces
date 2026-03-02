# Configuration du Système de Gestion de Cours

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :
- Un compte Supabase actif
- Accès au dashboard Supabase de votre projet

## 🗄️ Configuration de la Base de Données

### Étape 1: Exécuter le Script SQL

1. Ouvrez votre dashboard Supabase
2. Allez dans **SQL Editor** (dans le menu de gauche)
3. Cliquez sur **New Query**
4. Copiez tout le contenu du fichier `supabase-setup.sql`
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Run** pour exécuter le script

Le script va créer :
- ✅ 3 tables (fields, teachers, courses)
- ✅ Les indices pour optimiser les performances
- ✅ Les politiques de sécurité (RLS)
- ✅ Des données de test (filières et enseignants)

### Étape 2: Créer le Bucket de Stockage

1. Dans votre dashboard Supabase, allez dans **Storage** (menu de gauche)
2. Cliquez sur **New bucket**
3. Nommez le bucket : `courses`
4. Configurez-le comme **Public** (pour permettre le téléchargement des fichiers)
5. Cliquez sur **Create bucket**

### Étape 3: Configurer les Politiques du Bucket

1. Cliquez sur le bucket `courses` que vous venez de créer
2. Allez dans l'onglet **Policies**
3. Ajoutez les politiques suivantes :

**Pour la lecture (download) :**
```sql
CREATE POLICY "Public can download files"
ON storage.objects FOR SELECT
USING (bucket_id = 'courses');
```

**Pour l'upload :**
```sql
CREATE POLICY "Authenticated can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'courses');
```

**Pour la suppression :**
```sql
CREATE POLICY "Authenticated can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'courses');
```

## 👥 Comptes de Test

Le script SQL crée automatiquement 3 enseignants de test :

### Enseignant 1
- **Nom :** Dr. Jean Dupont
- **Email :** jean.dupont@ecole.com
- **Téléphone :** +243 900 000 001
- **Mot de passe :** password123

### Enseignant 2
- **Nom :** Prof. Marie Martin
- **Email :** marie.martin@ecole.com
- **Téléphone :** +243 900 000 002
- **Mot de passe :** password123

### Enseignant 3
- **Nom :** Dr. Paul Bernard
- **Email :** paul.bernard@ecole.com
- **Téléphone :** +243 900 000 003
- **Mot de passe :** password123

## 🔐 Accès Administrateur

Pour accéder à l'interface d'administration :
1. Cliquez sur l'icône ⚙️ (Settings) dans la barre de navigation
2. Entrez la clé admin : **admin2025**

## 📚 Filières Créées

Le script crée automatiquement 10 filières :
- Informatique
- Mathématiques
- Physique
- Chimie
- Biologie
- Économie
- Gestion
- Droit
- Lettres
- Langues

## 🚀 Utilisation

### Pour les Étudiants
1. Accédez à la page "Cours"
2. Parcourez ou recherchez des cours
3. Téléchargez librement sans connexion

### Pour les Enseignants
1. Cliquez sur "Espace Enseignant"
2. Connectez-vous avec vos identifiants
3. Ajoutez, modifiez ou supprimez vos cours

### Pour les Administrateurs
1. Accédez à l'admin via l'icône ⚙️
2. Entrez la clé : admin2025
3. Gérez les enseignants et les filières

## ⚠️ Notes Importantes

1. **Sécurité des Mots de Passe**
   - Les mots de passe sont hashés en SHA-256
   - Ne partagez jamais la clé admin

2. **Formats de Fichiers Acceptés**
   - PDF (.pdf)
   - Word (.doc, .docx)
   - PowerPoint (.ppt, .pptx)
   - Excel (.xls, .xlsx)

3. **Taille des Fichiers**
   - Par défaut, Supabase limite les uploads à 50MB
   - Vous pouvez ajuster cette limite dans les paramètres du bucket

## 🔧 Dépannage

### Erreur "Cannot read from table"
- Vérifiez que les politiques RLS sont bien activées
- Assurez-vous que le script SQL s'est exécuté complètement

### Erreur lors de l'upload de fichiers
- Vérifiez que le bucket "courses" existe
- Vérifiez que le bucket est configuré comme PUBLIC
- Vérifiez les politiques du bucket

### Les cours n'apparaissent pas
- Vérifiez votre connexion internet
- Vérifiez les variables d'environnement dans le fichier .env
- Ouvrez la console du navigateur pour voir les erreurs

## 📞 Support

En cas de problème :
1. Vérifiez que toutes les étapes ont été suivies
2. Consultez les logs dans la console du navigateur
3. Vérifiez les logs Supabase dans le dashboard
