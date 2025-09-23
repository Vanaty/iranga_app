import { ModernButton } from '@/components/ModernButton';
import { ModernCard } from '@/components/ModernCard';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff, LogIn } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('tiavina');
  const [password, setPassword] = useState('test@user');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    const success = await login(username.trim(), password);
    
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Erreur', 'Nom d\'utilisateur ou mot de passe incorrect');
    }
    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.background}
      >
        <View style={styles.content}>
          {/* Header avec design moderne */}
          <View style={styles.header}>
            <ModernCard variant="glass" padding="large" borderRadius="xl" style={styles.iconContainer}>
              <LogIn size={48} color={Colors.primary.main} />
            </ModernCard>
            <Text style={styles.title}>Bienvenue</Text>
            <Text style={styles.subtitle}>Connectez-vous pour accéder à vos discussions</Text>
          </View>

          {/* Formulaire dans une carte moderne */}
          <ModernCard variant="elevated" padding="large" borderRadius="xl" style={styles.formCard}>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nom d'utilisateur</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Entrez votre nom d'utilisateur"
                    placeholderTextColor={Colors.text.muted}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Entrez votre mot de passe"
                    placeholderTextColor={Colors.text.muted}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={Colors.text.muted} />
                    ) : (
                      <Eye size={20} color={Colors.text.muted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <ModernButton
                title={isLoading ? 'Connexion...' : 'Se connecter'}
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                size="large"
                style={styles.loginButton}
                icon={<LogIn size={20} color={Colors.text.white} style={{ marginRight: 8 }} />}
              />
            </View>
          </ModernCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Pas encore de compte ?{' '}
              <Link href="/(auth)/register" style={styles.link}>
                S'inscrire
              </Link>
            </Text>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formCard: {
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: Colors.background.input,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  link: {
    color: Colors.primary.main,
    fontWeight: '700',
  },
});