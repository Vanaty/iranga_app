import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { CallProvider } from '@/contexts/CallContext';
import { IncomingCallModal } from '@/components/IncomingCallModal';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
// import { SafeAreaView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ChatProvider>
          <CallProvider>
            <SafeAreaView style={{ flex: 1 }}>
              <Stack 
                screenOptions={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="+not-found" />
              </Stack>
            </SafeAreaView>
            <StatusBar style="auto" />
            <IncomingCallModal />
          </CallProvider>
        </ChatProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}