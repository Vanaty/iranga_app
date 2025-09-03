import { router, Tabs, useRouter } from 'expo-router';
import { MessageCircle, Users, User, FileText } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { unreadMessages } = useChat();
  
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
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discussions',
          tabBarIcon: ({ size, color }) => (
            <View style={{ position: 'relative' }}>
              <MessageCircle size={size} color={color} />
              {unreadMessages > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  backgroundColor: Colors.status.error,
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    color: Colors.text.white,
                    fontSize: 10,
                    fontWeight: '700',
                  }}>
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="publications"
        options={{
          title: 'Publications',
          tabBarIcon: ({ size, color }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Utilisateurs',
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}