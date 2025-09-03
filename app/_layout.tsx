import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { CallProvider } from '@/contexts/CallContext';
import { IncomingCallModal } from '@/components/IncomingCallModal';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  useFrameworkReady();

  return (
      <AuthProvider>
        <ChatProvider>
          <CallProvider>
            <SafeAreaView style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="chat" />
                <Stack.Screen name="+not-found" />
              </Stack>
            </SafeAreaView>
            <StatusBar style="auto" />
            <IncomingCallModal />
          </CallProvider>
        </ChatProvider>
      </AuthProvider>
  );
}