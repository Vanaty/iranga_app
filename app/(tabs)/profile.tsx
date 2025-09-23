import React, { use, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, LogOut, Settings, Edit3, Bell, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            console.info('Début de la déconnexion...');
            await logout();
            
            // Exiter l'application ou naviguer vers l'écran de connexion
            router.replace('/(auth)/login');
            console.info('Déconnexion terminée');
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
    }
  }, [user]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Chargement du profil...</Text>
      </View>
    );
  }

  const { width } = Dimensions.get('window');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header avec dégradé */}
      <LinearGradient
        colors={Colors.primary.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <ModernCard variant="glass" padding="large" borderRadius="xl" style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </Text>
          </ModernCard>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.username}>@{user.username}</Text>
          <ModernButton
            title="Modifier le profil"
            onPress={() => {}}
            variant="ghost"
            size="small"
            icon={<Edit3 size={16} color={Colors.text.white} style={{ marginRight: 8 }} />}
            style={styles.editButton}
          />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Informations personnelles */}
        <ModernCard variant="elevated" padding="large" borderRadius="xl" style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Mail size={20} color={Colors.primary.main} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          {user.phoneNumber && (
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Phone size={20} color={Colors.primary.main} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{user.phoneNumber}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <User size={20} color={Colors.primary.main} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Rôle</Text>
              <Text style={styles.infoValue}>{user.role?.libelle || 'Non défini'}</Text>
            </View>
          </View>
        </ModernCard>

        {/* Actions */}
        <ModernCard variant="elevated" padding="large" borderRadius="xl" style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Settings size={20} color={Colors.primary.main} />
            </View>
            <Text style={styles.actionText}>Paramètres</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Bell size={20} color={Colors.primary.main} />
            </View>
            <Text style={styles.actionText}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Shield size={20} color={Colors.primary.main} />
            </View>
            <Text style={styles.actionText}>Confidentialité</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={[styles.actionItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={[styles.actionIcon, styles.logoutIcon]}>
              <LogOut size={20} color={Colors.status.error} />
            </View>
            <Text style={[styles.actionText, styles.logoutText]}>Déconnexion</Text>
          </TouchableOpacity>
        </ModernCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarText: {
    color: Colors.primary.main,
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  username: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: {
    color: Colors.status.error,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.ui.divider,
    marginVertical: 8,
  },
});