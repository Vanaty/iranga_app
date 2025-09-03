# IrangaMg - Application de Chat et Publications

Une application mobile React Native construite avec Expo pour la messagerie instantanée et le partage de publications avec une interface moderne et chaleureuse.

## 🎨 Design System Moderne

### Palette de Couleurs Chaleureuse
- **Vert principal**: #25D366 (vert WhatsApp moderne)
- **Vert foncé**: #128C7E (headers avec élégance)
- **Fond primaire**: #F7F3F0 (beige chaleureux)
- **Fond chat**: #E8DDD4 (conversation cosy)
- **Messages envoyés**: #D4EDDA (vert très doux)
- **Messages reçus**: #FFFFFF (blanc pur)
- **Texte principal**: #2D3748 (gris foncé lisible)

### Interface Moderne
- **Bordures arrondies** : 20-30px pour un look moderne
- **Élévations subtiles** : Ombres douces et naturelles
- **Espacement généreux** : Layout aéré et confortable
- **Typographie soignée** : Poids et espacements optimisés
- **Animations fluides** : Transitions naturelles
- **Couleurs fonctionnelles** : Statuts visuellement clairs

### Composants Repensés
- **Headers arrondis** : Coins inférieurs courbes élégants
- **Cartes modernes** : Bordures gauche colorées
- **Bulles messages** : Queues arrondies naturelles
- **Boutons flottants** : Élévations et ombres subtiles
- **Avatars enhancés** : Ombres et bordures élégantes
- **Modaux premium** : Animations et espacement soignés

## 🚀 Fonctionnalités

### Authentification
- Connexion avec nom d'utilisateur/mot de passe
- Inscription de nouveaux utilisateurs
- Persistance de session automatique
- Déconnexion sécurisée avec redirection

### Messagerie
- Chat privé entre utilisateurs
- Chat de groupe
- Messages en temps réel via WebSocket
- **Stockage intelligent** : Seuls les messages WebSocket sont mis en cache
- Interface similaire à WhatsApp avec composants spécialisés :
  - **TextMessage** : Messages texte avec bulles et queues
  - **ImageMessage** : Images avec miniatures cliquables et modal plein écran
  - **FileMessage** : Fichiers avec icônes selon le type et téléchargement
- Indicateurs de frappe en temps réel
- Messages lus/non lus avec double coche
- Cache local optimisé pour les messages reçus uniquement
- Horodatage intelligent des messages

### Gestion des Messages
- **Messages locaux** : Affichage immédiat des messages envoyés
- **Messages WebSocket** : Stockage et synchronisation automatique
- **Optimisation réseau** : Évite la duplication des données
- **Mode hors ligne** : Cache intelligent des conversations

### Types de Messages
- **Messages texte** : Bulles colorées avec queues directionnelles
- **Messages image** : Miniatures 200x200px avec agrandissement modal
- **Messages fichier** : Icônes différenciées par type (doc, image, vidéo, audio)
- **Statuts de lecture** : Simple coche (envoyé), double coche (livré/lu)

### Publications
- Création de publications avec titre et contenu
- Système de likes avec compteur
- Interface moderne avec cartes
- Actualisation en temps réel

### Utilisateurs
- Liste des utilisateurs connectés
- Statut en ligne/hors ligne avec indicateur visuel
- Création rapide de chat privé d'un clic

### Interface
- Navigation avec composants Link d'Expo Router
- Design WhatsApp-like avec couleurs authentiques
- Animations fluides et transitions naturelles
- Gestion d'erreurs gracieuse

### Gestion des Fichiers
- **Upload d'images** : Appareil photo et galerie avec compression
- **Upload de documents** : Tous types de fichiers avec prévisualisation
- **Indicateurs de progression** : Barres de progression en temps réel
- **Gestion d'erreurs** : Retry automatique et annulation d'upload
- **Cache intelligent** : Stockage local des fichiers fréquents

### Chat de Groupe
- **Création de groupes** : Interface dédiée avec sélection d'utilisateurs
- **Gestion des participants** : Ajout/suppression avec permissions
- **Administration** : Rôles admin et participants standard
- **Personnalisation** : Nom de groupe et paramètres avancés
- **Interface intuitive** : Sélection multiple avec preview des participants

## 🛠️ Technologies utilisées

- **React Native** - Framework mobile cross-platform
- **Expo** - Plateforme de développement avec hot reload
- **TypeScript** - Typage statique pour la robustesse
- **Expo Router** - Navigation avec composants Link optimisés
- **Axios** - Client HTTP avec intercepteurs
- **AsyncStorage** - Stockage local persistant
- **Lucide React Native** - Icônes SVG légères
- **WebSocket/STOMP** - Temps réel bidirectionnel

## 📁 Architecture des Composants

```
components/
├── messages/
│   ├── TextMessage.tsx      # Messages texte avec bulles
│   ├── ImageMessage.tsx     # Images avec modal plein écran
│   └── FileMessage.tsx      # Fichiers avec icônes types
├── MessageBubble.tsx        # Router principal de messages
├── ChatInput.tsx            # Zone de saisie adaptative
├── MessageStatus.tsx        # Statuts de lecture (coches)
└── PublicationCard.tsx      # Cartes de publications
```

## 📱 Structure de l'application

```
app/
├── (auth)/                 # Écrans d'authentification
│   ├── login.tsx          # Connexion avec validation
│   └── register.tsx       # Inscription multi-étapes
├── (tabs)/                # Navigation principale
│   ├── index.tsx          # Liste des discussions avec aperçus
│   ├── publications.tsx   # Feed de publications
│   ├── users.tsx          # Annuaire avec statuts
│   └── profile.tsx        # Profil utilisateur et déconnexion
├── chat/
│   └── [id].tsx          # Interface de chat complète
└── index.tsx             # Point d'entrée avec redirection auto
```

## 🌐 API Backend

L'application se connecte à une API REST à `http://localhost:8080/api` :

### Authentification
- `POST /auth/login` - Connexion avec JWT
- `POST /auth/register` - Inscription avec validation
- `POST /auth/logout` - Déconnexion sécurisée

### Utilisateurs
- `GET /users/info` - Profil utilisateur actuel
- `GET /users` - Liste complète des utilisateurs
- `GET /users/online` - Utilisateurs connectés en temps réel

### Chats
- `GET /chats` - Discussions de l'utilisateur avec derniers messages
- `GET /chats/{id}/messages` - Historique complet d'une discussion
- `POST /chats/private` - Créer chat privé entre deux utilisateurs
- `POST /chats/group` - Créer chat de groupe avec participants

### Publications
- `GET /publications` - Feed paginé des publications
- `POST /publications` - Créer nouvelle publication
- `PUT /publications/{id}` - Modifier publication (propriétaire uniquement)
- `DELETE /publications/{id}` - Supprimer publication
- `POST /publications/{id}/like` - Aimer une publication
- `DELETE /publications/{id}/unlike` - Retirer le like

## 📦 Services

### AuthContext
- Gestion globale de l'état d'authentification
- Persistance automatique des sessions
- Redirection intelligente selon l'état utilisateur

### ChatContext
- Gestion des discussions et publications
- Intégration WebSocket pour le temps réel
- **Cache sélectif** : Stockage uniquement des messages WebSocket
- Synchronisation bidirectionnelle optimisée

### StorageService
- Persistance locale avec AsyncStorage
- **Stockage conditionnel** : Uniquement pour les messages reçus
- Gestion des tokens d'authentification
- Cache optimisé pour réduire l'espace disque

### NotificationService
- Notifications locales pour nouveaux messages
- Configuration des canaux Android
- Gestion des permissions utilisateur

### WebSocketService
- Connexion temps réel avec STOMP
- **Déclenchement automatique** du stockage local
- Gestion des indicateurs de frappe
- Synchronisation des statuts de lecture

### FileUploadService
- Upload progressif avec indicateurs visuels
- Gestion des types MIME automatique
- Compression d'images et optimisation
- Cache et stockage local des uploads

## 🔒 Sécurité

- **Tokens JWT** pour l'authentification avec refresh automatique
- **Stockage sécurisé** des tokens avec AsyncStorage
- **Validation côté client** avec feedback utilisateur
- **Nettoyage automatique** en cas de token invalide ou expiré
- **Gestion d'erreurs** gracieuse avec fallbacks locaux

## 📱 Compatibilité

- **iOS** 13+ avec support natif
- **Android** 6.0+ (API 23) avec Material Design
- **Expo Go** pour développement rapide
- **Development Build** pour fonctionnalités natives complètes

## 🚧 Roadmap

### Version 1.1
- [x] Interface moderne et chaleureuse
- [x] Palette de couleurs harmonieuse
- [x] Élévations et ombres subtiles
- [x] Typographie optimisée

### Version 1.2
- [ ] Animations de transition avancées
- [ ] Thème sombre élégant
- [ ] Personnalisation des couleurs

### Version 1.3
- [ ] Interface adaptive selon l'appareil
- [ ] Micro-interactions raffinées
- [ ] Thèmes saisonniers

## 👥 Contribution

Développé dans le cadre d'un stage de développement mobile React Native.

### Guidelines
- Code TypeScript strict avec interfaces
- Composants fonctionnels avec hooks
- Navigation via Link pour les performances
- Gestion d'erreurs systematique
- Tests unitaires pour la logique métier
