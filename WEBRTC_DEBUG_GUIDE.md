# Guide de débogage WebRTC

## Problèmes identifiés et corrigés

### 1. Permissions Android manquantes ✅
**Problème** : Le fichier `AndroidManifest.xml` manquait des permissions essentielles pour WebRTC.

**Solution** : Ajout des permissions suivantes :
- `ACCESS_NETWORK_STATE`
- `ACCESS_WIFI_STATE`
- `CHANGE_NETWORK_STATE`
- `MODIFY_AUDIO_SETTINGS`
- `WAKE_LOCK`
- `FOREGROUND_SERVICE`

### 2. Configuration des serveurs ICE ✅
**Problème** : Dépendance sur un serveur de configuration qui peut ne pas être disponible.

**Solution** : Ajout d'une configuration de fallback avec des serveurs STUN publics :
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`
- `stun:stun2.l.google.com:19302`

### 3. Gestion des erreurs améliorée ✅
**Problème** : Manque de logs de débogage et gestion d'erreurs insuffisante.

**Solution** : 
- Ajout de logs détaillés pour chaque étape
- Amélioration des messages d'erreur
- Gestion des états de connexion ICE

### 4. Méthode switchCamera corrigée ✅
**Problème** : Utilisation d'une méthode non standard `_switchCamera()`.

**Solution** : Ajout de vérifications de compatibilité et gestion d'erreurs.

## Comment tester WebRTC

### 1. Utiliser le composant de test
```tsx
import { WebRTCTest } from '@/components/WebRTCTest';

// Dans votre écran de test
<WebRTCTest />
```

### 2. Vérifier les logs
Ouvrez la console de débogage et recherchez :
- "Initializing WebRTC call"
- "WebRTC config loaded"
- "Peer connection created"
- "User media obtained"
- "ICE candidate received"
- "Remote track received"

### 3. Tester les permissions
Assurez-vous que l'application a les permissions :
- Caméra
- Microphone
- Réseau

## Problèmes courants et solutions

### 1. "WebRTC is not available on this device"
- Vérifiez que `react-native-webrtc` est correctement installé
- Redémarrez l'application après installation

### 2. "Failed to initialize call"
- Vérifiez les permissions de caméra/microphone
- Testez sur un appareil physique (pas d'émulateur)
- Vérifiez la connexion réseau

### 3. "ICE connection failed"
- Vérifiez la connectivité réseau
- Testez avec différents réseaux (WiFi vs mobile)
- Vérifiez les paramètres de pare-feu

### 4. Pas de flux vidéo distant
- Vérifiez que les deux appareils sont sur le même réseau
- Vérifiez les logs WebSocket pour les messages de signalisation
- Testez avec des serveurs STUN différents

## Configuration recommandée

### Pour le développement
```typescript
const webrtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};
```

### Pour la production
Utilisez des serveurs TURN pour une meilleure connectivité :
```typescript
const webrtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    },
  ],
};
```

## Commandes de débogage

### Android
```bash
# Vérifier les permissions
adb shell dumpsys package mg.adiresiko.irangamg | grep permission

# Logs WebRTC
adb logcat | grep -i webrtc

# Logs de l'application
adb logcat | grep -i iranga
```

### iOS
```bash
# Logs de l'application
xcrun simctl spawn booted log stream --predicate 'process == "IrangaMg"'
```

## Prochaines étapes

1. Tester sur différents appareils
2. Implémenter des serveurs TURN pour la production
3. Ajouter des métriques de qualité de connexion
4. Implémenter la reconnexion automatique
5. Ajouter des tests unitaires pour WebRTC
