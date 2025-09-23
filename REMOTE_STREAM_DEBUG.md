# Guide de débogage - Flux distant WebRTC

## Problème : L'appelant ne reçoit pas le flux vidéo distant

### Corrections apportées

#### 1. **Amélioration des logs de débogage** ✅
- Ajout de logs détaillés pour chaque étape de la signalisation
- Logs pour les événements `track`, `icecandidate`, et `iceconnectionstatechange`
- Vérification des receivers et tracks disponibles

#### 2. **Méthode de vérification du flux distant** ✅
- Nouvelle méthode `checkRemoteStream()` pour forcer la vérification
- Vérification périodique toutes les 3 secondes
- Création manuelle de flux à partir des receivers

#### 3. **Composant de débogage** ✅
- `WebRTCDebug.tsx` pour surveiller l'état des flux
- Affichage en temps réel des informations de débogage
- Bouton pour vérifier manuellement le flux distant

### Comment utiliser le débogage

#### 1. Ajouter le composant de débogage
```tsx
import { WebRTCDebug } from '@/components/WebRTCDebug';

// Dans votre écran de test
<WebRTCDebug />
```

#### 2. Vérifier les logs dans la console
Recherchez ces messages :
- "Handling call answer in context"
- "Handling call answer: [object]"
- "Remote description set successfully"
- "ICE connection established successfully"
- "Remote track received: [object]"
- "Remote stream set: [object]"

#### 3. Utiliser le bouton "Check Remote Stream"
Si le flux distant n'apparaît pas automatiquement, utilisez ce bouton pour forcer la vérification.

### Problèmes courants et solutions

#### 1. **Pas d'événement `track`**
**Symptômes** : Aucun log "Remote track received"
**Solutions** :
- Vérifier que les deux appareils sont sur le même réseau
- Vérifier que les candidats ICE sont échangés
- Tester avec des serveurs STUN différents

#### 2. **Événement `track` sans flux**
**Symptômes** : "Remote track received" mais "No streams in track event"
**Solutions** :
- Vérifier la configuration des contraintes vidéo
- S'assurer que l'appelé a bien activé sa caméra
- Vérifier les permissions de caméra

#### 3. **Connexion ICE échouée**
**Symptômes** : "ICE connection failed"
**Solutions** :
- Vérifier la connectivité réseau
- Tester avec différents réseaux (WiFi vs mobile)
- Vérifier les paramètres de pare-feu

#### 4. **Flux local mais pas distant**
**Symptômes** : "Local stream: 2 tracks" mais "No remote stream"
**Solutions** :
- Utiliser le bouton "Check Remote Stream"
- Vérifier que l'appelé a accepté l'appel
- Vérifier les logs de signalisation WebSocket

### Commandes de débogage

#### Android
```bash
# Logs WebRTC spécifiques
adb logcat | grep -E "(WebRTC|track|stream|ICE)"

# Logs de l'application
adb logcat | grep -i iranga
```

#### iOS
```bash
# Logs de l'application
xcrun simctl spawn booted log stream --predicate 'process == "IrangaMg"'
```

### Tests recommandés

#### 1. Test de base
1. Démarrer un appel vidéo
2. Vérifier que le flux local apparaît
3. Accepter l'appel sur l'autre appareil
4. Vérifier que le flux distant apparaît

#### 2. Test de débogage
1. Ouvrir le composant `WebRTCDebug`
2. Démarrer un appel
3. Surveiller les logs en temps réel
4. Utiliser "Check Remote Stream" si nécessaire

#### 3. Test de réseau
1. Tester sur le même réseau WiFi
2. Tester sur des réseaux différents
3. Tester avec des données mobiles

### Prochaines étapes

1. **Tester les corrections** sur différents appareils
2. **Implémenter des serveurs TURN** pour une meilleure connectivité
3. **Ajouter des métriques de qualité** de connexion
4. **Implémenter la reconnexion automatique** en cas d'échec
5. **Ajouter des tests unitaires** pour WebRTC

### Notes importantes

- Les tests doivent être effectués sur des **appareils physiques**
- Les **émulateurs** peuvent avoir des limitations WebRTC
- La **qualité du réseau** affecte la connectivité WebRTC
- Les **permissions de caméra/microphone** doivent être accordées
