# La REF — Radio Étudiante de France 

Site web officiel de La REF, la radio étudiante de France. Construit avec Next.js 14 (App Router) et Tailwind CSS. Salut ! Reteste

## Fonctionnalités

- **Page d'accueil** — Hero animé avec badge "On Air", section À propos, grille d'émissions, footer
- **Lecteur audio** — Lecteur HTML5 personnalisé avec animation waveform, contrôles de lecture et volume
- **Panel admin** (`/admin`) — Ajout / suppression d'émissions, upload de fichiers MP3
- **API REST** — Routes Next.js pour la gestion des épisodes et l'authentification
- **Responsive** — Mobile-first, adapté à tous les écrans

## Stack

- [Next.js 14](https://nextjs.org/) — App Router, Server Components
- [Tailwind CSS](https://tailwindcss.com/) — Styles utilitaires
- [TypeScript](https://www.typescriptlang.org/)
- Persistance locale : `data/episodes.json` + fichiers audio dans `public/audio/`

## Installation

```bash
# 1. Cloner le projet
git clone <repo-url>
cd la-ref

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
# URL du flux radio (bouton "Écouter en direct")
NEXT_PUBLIC_STREAM_URL=https://stream.laref.fr/live

# Mot de passe admin (panel /admin)
ADMIN_PASSWORD=votre_mot_de_passe_securise
```

## Structure du projet

```
la-ref/
├── app/
│   ├── layout.tsx          # Layout global
│   ├── page.tsx            # Page d'accueil
│   ├── globals.css         # Styles globaux + animations
│   ├── admin/
│   │   └── page.tsx        # Panel d'administration
│   └── api/
│       ├── auth/route.ts   # POST /api/auth (login) | DELETE (logout)
│       └── episodes/
│           ├── route.ts           # GET /api/episodes | POST (add)
│           └── [id]/route.ts      # DELETE /api/episodes/:id
├── components/
│   ├── Hero.tsx            # Section hero animée
│   ├── About.tsx           # Section à propos
│   ├── Episodes.tsx        # Grille d'émissions (server component)
│   ├── EpisodeCard.tsx     # Carte épisode
│   ├── AudioPlayer.tsx     # Lecteur audio personnalisé
│   ├── WaveformAnimation.tsx # Animation barres waveform
│   └── Footer.tsx          # Pied de page
├── data/
│   └── episodes.json       # Métadonnées des épisodes
├── public/
│   └── audio/              # Fichiers MP3 uploadés
├── .env.example
└── middleware.ts
```

## Panel admin

Accéder à `/admin` et entrer le mot de passe défini dans `ADMIN_PASSWORD`.

- **Ajouter une émission** : remplir le formulaire (titre, description, date, durée) et optionnellement uploader un MP3
- **Supprimer** : bouton poubelle sur chaque émission de la liste

## Build de production

```bash
npm run build
npm start
```

## Déploiement

Compatible avec [Vercel](https://vercel.com/). Penser à configurer les variables d'environnement dans le dashboard Vercel.

> **Note** : En production, les fichiers uploadés dans `public/audio/` sont éphémères sur Vercel. Pour une persistance durable, utiliser un stockage objet (S3, Cloudflare R2, etc.).
