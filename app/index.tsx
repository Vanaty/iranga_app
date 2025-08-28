import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    console.log('=== État d\'authentification ===');
    console.log('isLoading:', isLoading);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user ? `${user.firstName} ${user.lastName}` : 'null');
    console.log('hasNavigated:', hasNavigated);
    
    if (!isLoading && !hasNavigated) {
      console.log('Chargement terminé, redirection...');
      setHasNavigated(true);
      
      if (isAuthenticated && user) {
        console.log('Utilisateur authentifié, redirection vers les tabs');
        router.replace('/(tabs)');
      } else {
        console.log('Utilisateur non authentifié, redirection vers login');
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router, hasNavigated]);

  // Reset hasNavigated quand l'état d'authentification change
  useEffect(() => {
    setHasNavigated(false);
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.text}>
        {isLoading ? 'Vérification de la session...' : 'Redirection...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});