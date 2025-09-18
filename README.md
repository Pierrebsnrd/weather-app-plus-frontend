# WeatherApp+ Frontend 🌅

Interface utilisateur moderne pour WeatherApp+, une application météo complète développée avec Next.js et React.

## ✨ Fonctionnalités

### 🔐 Authentification
- **Mode invité** : Utilisation immédiate avec stockage localStorage
- **Inscription/Connexion** : Création de compte avec synchronisation cloud
- **Fusion automatique** : Migration des données locales vers le compte utilisateur

### 🌍 Recherche et météo
- **Recherche intuitive** : Trouvez n'importe quelle ville dans le monde
- **Données temps réel** : Informations météo actualisées via OpenWeatherMap
- **Affichage complet** : Température, ressenti, humidité, vent, pression, visibilité

### ⭐ Gestion des favoris
- **Ajout/suppression** : Gérez vos villes préférées d'un clic
- **Stockage intelligent** : localStorage pour les invités, MongoDB pour les utilisateurs
- **Synchronisation** : Vos données suivent votre compte sur tous vos appareils

### 🎨 Interface utilisateur
- **Design Sunset** : Thème chaleureux aux couleurs coucher de soleil
- **Responsive** : Interface adaptée mobile, tablette et desktop
- **Animations** : Effets visuels fluides et modernes
- **Accessibilité** : Navigation intuitive et tooltips explicatifs

## 🛠️ Technologies utilisées

- **Next.js 15** : Framework React avec App Router
- **React 19** : Interface utilisateur composants
- **Tailwind CSS v4** : Framework CSS utilitaire
- **Lucide React** : Bibliothèque d'icônes
- **Axios** : Client HTTP pour les appels API
- **CSS personnalisé** : Thème Sunset avec animations

## 📦 Installation

### Prérequis
- Node.js 18+
- Yarn ou npm

### Configuration

1. **Cloner le projet**
```bash
git clone <repository-url>
cd WeatherAppPlus/frontend
```

2. **Installer les dépendances**
```bash
yarn install
# ou
npm install
```

3. **Variables d'environnement** (optionnel)
Créez un fichier `.env.local` :
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## 🚀 Lancement

### Développement
```bash
yarn dev
# ou
npm run dev
```

L'application sera disponible sur [http://localhost:3001](http://localhost:3001)

### Production
```bash
yarn build && yarn start
# ou
npm run build && npm start
```

## 📁 Structure du projet

```
src/
├── app/                    # App Router de Next.js
│   ├── page.js            # Page d'accueil (dashboard)
│   ├── globals.css        # Styles globaux et thème Sunset
│   ├── layout.js          # Layout principal
│   └── auth/              # Pages d'authentification
│       ├── login/
│       └── register/
├── components/            # Composants réutilisables
│   ├── Header.js         # Navigation et authentification
│   ├── SearchBar.js      # Barre de recherche de villes
│   ├── SearchResults.js  # Résultats de recherche
│   └── WeatherCard.js    # Carte d'affichage météo
└── lib/                  # Utilitaires et configuration
    ├── api.js           # Client API et endpoints
    └── localStorage.js  # Gestion du stockage local
```

## 🎨 Thème Sunset

Le thème Sunset utilise une palette de couleurs chaudes :
- **Orange principal** : `#ea580c`
- **Orange vif** : `#fb923c`
- **Rouge coucher** : `#dc2626`
- **Rose sunset** : `#ec4899`
- **Jaune doré** : `#f59e0b`

### Effets visuels
- Dégradés multi-couches
- Animations de shimmer
- Effets glassmorphisme
- Hover avec transformation 3D

## 🔌 API Integration

### Endpoints utilisés
- `GET /api/weather/search/:city` - Recherche de villes
- `GET /api/weather/current/:lat/:lon` - Météo actuelle
- `GET /api/cities` - Villes favorites (connecté)
- `POST /api/cities` - Ajouter aux favoris (connecté)
- `DELETE /api/cities/:id` - Supprimer des favoris (connecté)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/merge-cities` - Fusion des données

### Gestion des erreurs
- Intercepteurs Axios pour la gestion automatique
- Fallback localStorage en cas d'échec API
- Messages d'erreur utilisateur friendly
- Retry automatique et gestion offline

## 🔧 Configuration avancée

### Personnalisation du thème
Modifiez les variables CSS dans `globals.css` :
```css
:root {
  --sunset-orange: #ea580c;
  --deep-orange: #c2410c;
  /* ... autres couleurs */
}
```

### Stockage local
- **Clé auth** : `weather-app-token`
- **Clé utilisateur** : `weather-app-user`
- **Clé villes** : `weather-app-cities`

## 📱 Support navigateurs

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

**WeatherApp+** - Suivez la météo avec style 🌅