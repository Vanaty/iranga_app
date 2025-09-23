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

### Appels Audio/Vidéo
- **WebRTC natif** : Intégration React Native WebRTC pour appels P2P
- **Configuration STUN/TURN** : Serveurs ICE automatiques du backend
- **Signaling WebSocket** : Négociation SDP et candidats ICE temps réel
- **Interface d'appel** : Contrôles audio/vidéo avec overlay moderne
- **Gestion d'état** : Context dédié pour la session d'appel
- **Notifications d'appel** : Alertes entrantes et sortantes avec accept/reject
- **Prévisualisation vidéo** : Affichage du flux local pendant l'attente de réponse
- **Contrôles en temps réel** : Mute/unmute et caméra on/off pendant l'appel

## 🛠️ Technologies utilisées

- **React Native** - Framework mobile cross-platform
- **Expo** - Plateforme de développement avec hot reload
- **TypeScript** - Typage statique pour la robustesse
- **Expo Router** - Navigation avec composants Link optimisés
- **Axios** - Client HTTP avec intercepteurs
- **AsyncStorage** - Stockage local persistant
- **Lucide React Native** - Icônes SVG légères
- **WebSocket/STOMP** - Temps réel bidirectionnel
- **React Native WebRTC** - Communication P2P audio/vidéo

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
├── PublicationCard.tsx      # Cartes de publications
├── IncomingCallModal.tsx    # Modal d'appel entrant
└── OutgoingCallModal.tsx    # Modal d'appel sortant avec prévisualisation
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
├── call/
│   └── index.tsx         # Interface d'appel en cours
└── index.tsx             # Point d'entrée avec redirection auto
```

## 🛠️ Build
Here's the list with the additional points:

1. Ensure that you have OpenJDK 17, Android Studio, and its associated tools and NDK (Native Development Kit) installed on your system.

2. Initialize a new Expo project by executing the following command in your terminal: `pnpm create expo-app@latest`. This command will prompt you to provide some details about your project, such as the project name and configuration options.

3. Before building the Android app, you need to prebuild the `android` directory. Run the command `pnpm expo prebuild` to generate the necessary files. Additionally, you should provide your app's package name during this step. For example, if your app's package name is `com.example.app`.

4. Generate a keystore file. Use an administrator shell to create the keystore. Run the following command: `keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000` and enter your password (store it safely somewhere) and details.

5. Add this keystore file in your `android/app` folder.

6. Add the following details in your `android/gradle.properties` file:
```
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

7. Now, go to the `android/app/build.gradle` file and make the changes for the release:
```
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
}
buildTypes {
    release {
        ...
        signingConfig signingConfigs.release
    }
}
```
8. Create `local.properties` dans `android`
```bash
sdk.dir=C:\Android\Sdk
```
9.  Build the APK:
    Navigate to the `android` directory and run the Gradle command to build the release APK.
    ```bash
    cd android
    ./gradlew assembleRelease
    # On Windows, use:
    # gradlew.bat assembleRelease
    ```
    The signed APK will be located at `android/app/build/outputs/apk/release/app-release.apk`.


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

### WebRTC & Appels
- `GET /webrtc/config` - Configuration STUN/TURN servers avec credentials
- WebSocket `/ws` - Signaling pour négociation SDP et ICE candidates

## 📞 Architecture WebRTC Backend

### Configuration WebRTC
Le backend fournit une configuration WebRTC dynamique via `GET /webrtc/config` :

```json
{
  "iceServers": [
    {
      "urls": ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
      "username": null,
      "credential": null
    },
    {
      "urls": ["turn:your-turn-server.com:3478"],
      "username": "generated-username",
      "credential": "generated-password",
      "credentialType": "password"
    }
  ],
  "timestamp": 1703123456789,
  "ttl": 3600
}
```

**Fonctionnalités de Configuration :**
- **STUN Servers** : Google STUN publics pour NAT traversal
- **TURN Servers** : Serveurs relais privés avec credentials temporaires
- **TTL dynamique** : Credentials régénérés automatiquement
- **Load balancing** : Rotation automatique des serveurs disponibles
- **Fallback** : Configuration par défaut si serveurs indisponibles

### Signaling WebSocket

Le backend gère le signaling WebRTC via WebSocket avec les actions suivantes :

#### Actions WebSocket pour Appels

**1. Initier un Appel**
```javascript
// Client → Serveur
{
  "action": "CALL_OFFER",
  "payload": {
    "callId": "call_1703123456_abc123",
    "receiverId": 123,
    "callerId": 321,
    "type": "video", // ou "audio"
    "offer": {
      "sdp": "v=0\r\no=...",
      "type": "offer"
    }
  }
}

// Serveur → Récepteur
{
  "type": "CALL_INCOMING",
  "payload": {
    "callId": "call_1703123456_abc123",
    "callerId": 456,
    "callerName": "John Doe",
    "type": "video",
    "offer": { ... }
  }
}
```

**2. Accepter un Appel**
```javascript
// Récepteur → Serveur
{
  "action": "CALL_ANSWER",
  "payload": {
    "callId": "call_1703123456_abc123",
    "answer": {
      "sdp": "v=0\r\no=...",
      "type": "answer"
    }
  }
}

// Serveur → Appelant
{
  "type": "CALL_ANSWERED",
  "payload": {
    "callId": "call_1703123456_abc123",
    "answer": { ... }
  }
}
```

**3. Échange ICE Candidates**
```javascript
// Bidirectionnel
{
  "action": "ICE_CANDIDATE",
  "payload": {
    "callId": "call_1703123456_abc123",
    "userId": 123,
    "candidate": {
      "candidate": "candidate:1 1 UDP 2130706431 192.168.1.100 54400 typ host",
      "sdpMLineIndex": 0,
      "sdpMid": "0"
    }
  }
}
```

**4. Terminer un Appel**
```javascript
// N'importe quel participant → Serveur
{
  "action": "CALL_END",
  "payload": {
    "callId": "call_1703123456_abc123",
    "reason": "user_hangup" // ou "network_error", "timeout"
  }
}

// Serveur → Autres participants
{
  "type": "CALL_ENDED",
  "payload": {
    "callId": "call_1703123456_abc123",
    "reason": "user_hangup",
    "endedBy": 456
  }
}
```

**5. Rejeter un Appel**
```javascript
// Récepteur → Serveur
{
  "action": "CALL_REJECT",
  "payload": {
    "callId": "call_1703123456_abc123",
    "reason": "busy" // ou "declined"
  }
}

// Serveur → Appelant
{
  "type": "CALL_REJECTED",
  "payload": {
    "callId": "call_1703123456_abc123",
    "reason": "busy"
  }
}
```

### Gestion des Sessions d'Appel

**Backend Call Management :**
- **Session tracking** : Stockage temporaire des appels actifs en mémoire
- **Timeout handling** : Auto-terminaison après 60s sans réponse
- **Cleanup automatique** : Suppression des sessions terminées
- **Rate limiting** : Maximum 1 appel simultané par utilisateur
- **Statut utilisateur** : Mise à jour "in_call" pendant l'appel

**Exemple de Session Backend :**
```java
@Entity
public class CallSession {
    private String callId;
    private Long callerId;
    private Long receiverId;
    private CallType type; // AUDIO, VIDEO
    private CallStatus status; // INITIATING, RINGING, CONNECTED, ENDED
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String endReason;
}
```

### Architecture de Signaling

**Flow Complet d'un Appel :**

1. **Initiation (Client A)**
   - `GET /webrtc/config` → Récupère configuration ICE
   - `WebRTCService.initializeCall()` → Configure PeerConnection
   - `WebSocket: CALL_OFFER` → Envoie offer au serveur

2. **Routage (Backend)**
   - Valide l'existence du récepteur
   - Vérifie la disponibilité (pas déjà en appel)
   - Crée session d'appel temporaire
   - Route `CALL_INCOMING` vers Client B

3. **Réponse (Client B)**
   - Reçoit notification d'appel entrant
   - `WebRTCService.acceptCall()` → Configure PeerConnection
   - `WebSocket: CALL_ANSWER` → Envoie answer au serveur

4. **Établissement (Backend)**
   - Route `CALL_ANSWERED` vers Client A
   - Commence l'échange ICE candidates
   - Met à jour statut session → CONNECTED

5. **Communication (P2P)**
   - Flux audio/vidéo direct entre clients
   - ICE candidates via signaling server
   - Heartbeat pour détection déconnexion

6. **Terminaison**
   - `WebSocket: CALL_END` par n'importe quel client
   - Backend broadcast `CALL_ENDED`
   - Cleanup session et ressources

### Optimisations Backend

**Performance :**
- **Connection pooling** : Réutilisation des connexions TURN
- **Credentials caching** : Cache Redis des tokens TURN
- **Geographic routing** : Sélection serveur TURN le plus proche
- **Load balancing** : Distribution des appels sur plusieurs serveurs

**Sécurité :**
- **JWT validation** : Vérification token pour chaque action WebSocket
- **Rate limiting** : Protection contre spam d'appels
- **Credentials rotation** : Renouvellement automatique des accès TURN
- **Encryption** : TLS pour signaling, DTLS pour media streams

**Monitoring :**
- **Call analytics** : Durée, qualité, échecs d'appels
- **Resource monitoring** : Utilisation serveurs TURN
- **Error tracking** : Logs détaillés des échecs de connexion
- **Performance metrics** : Latence, packet loss, bandwidth

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

### CallContext
- **Gestion des appels** : État global des sessions d'appel
- **WebRTC Service** : Intégration native React Native WebRTC
- **Flux vidéo** : Gestion des streams locaux et distants
- **Contrôles temps réel** : Audio/vidéo toggle et basculement caméra
- **Signaling** : Coordination WebSocket pour négociation SDP/ICE
- **Modals d'appel** : Interface entrante et sortante avec prévisualisation

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

# IrangaMg - React Native App

## Description
IrangaMg est une application mobile développée avec React Native et Expo, intégrant des fonctionnalités de communication et de gestion d'appels.

## Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI
- Android Studio (pour le développement Android)
- Xcode (pour le développement iOS, sur macOS uniquement)

## Installation

1. Cloner le repository
```bash
git clone <repository-url>
cd iranga_app
```

2. Installer les dépendances
```bash
npm install
# ou
yarn install
```

## Configuration

### Fichiers de configuration requis
- `google-services.json` : Fichier de configuration Firebase pour Android
- Icônes dans `./assets/images/` :
  - `notification-icon.png`
  - `adaptive-icon.png`
  - `favicon.png`

### Permissions Android
L'application nécessite plusieurs permissions critiques :
- `CAMERA` : Pour la capture photo/vidéo
- `RECORD_AUDIO` : Pour l'enregistrement audio
- `READ_PHONE_STATE` : Pour la gestion des appels
- `BIND_TELECOM_CONNECTION_SERVICE` : Pour le service de connexion télécom

### Service VoiceConnectionService
Pour la gestion des appels VoIP, ajouter dans `android/app/src/main/AndroidManifest.xml` :

```xml
<uses-permission android:name="android.permission.BIND_TELECOM_CONNECTION_SERVICE" />

<application ... >
  <service android:name="io.wazo.callkeep.VoiceConnectionService"
           android:permission="android.permission.BIND_TELECOM_CONNECTION_SERVICE"
           android:foregroundServiceType="camera|microphone"
           android:exported="false">
    <intent-filter>
      <action android:name="android.telecom.ConnectionService"/>
    </intent-filter>
  </service>
</application>
```

## Build et Déploiement

### Développement
```bash
# Démarrer le serveur de développement
npx expo start

# Pour Android
npx expo run:android

# Pour iOS
npx expo run:ios
```

### Build de production

#### Avec EAS Build (recommandé)
```bash
# Installation d'EAS CLI
npm install -g @expo/eas-cli

# Login EAS
eas login

# Build Android
eas build --platform android

# Build iOS
eas build --platform ios

# Build pour les deux plateformes
eas build --platform all
```

#### Build local
```bash
# Build Android APK
npx expo build:android

# Build iOS
npx expo build:ios
```

### Configuration EAS
Le projet est configuré avec l'ID : `df61d192-6f4a-48d9-b5b5-7d074c9c7a4e`

## Structure du projet
```
iranga_app/
├── app/                    # Pages et routing (Expo Router)
├── assets/
│   └── images/            # Icônes et images
├── components/            # Composants réutilisables
├── constants/             # Constantes de l'app
├── hooks/                 # Custom hooks
├── app.json              # Configuration Expo
├── google-services.json  # Config Firebase Android
└── README.md
```

## Fonctionnalités principales
- Interface utilisateur adaptative (clair/sombre)
- Notifications push
- Gestion d'appels VoIP
- Support tablet iOS
- Architecture moderne avec New Architecture activée

## Bundle Identifiers
- **Android**: `mg.adiresiko.irangamg`
- **iOS**: `mg.adiresiko.irangamg`

## Déploiement
- **Scheme**: `irangamg`
- **Version**: 1.0.0

## Support
- Orientation : Portrait uniquement
- Plateformes : iOS, Android, Web
- TypeScript avec routes typées
