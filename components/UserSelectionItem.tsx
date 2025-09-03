import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { User } from '@/types/chat';
import { Colors } from '@/constants/Colors';

interface UserSelectionItemProps {
  user: User;
  selected: boolean;
  onToggle: () => void;
}

export function UserSelectionItem({ user, selected, onToggle }: UserSelectionItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onToggle}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.firstName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.username}>@{user.username}</Text>
          {user.role && (
            <Text style={styles.role}>{user.role.libelle}</Text>
          )}
        </View>
      </View>
      
      <View style={[
        styles.checkbox,
        selected ? styles.checkboxSelected : styles.checkboxUnselected
      ]}>
        {selected && <Check size={16} color={Colors.text.white} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background.card,
    borderRadius: 15,
    marginBottom: 8,
    elevation: 1,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.white,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  role: {
    fontSize: 12,
    color: Colors.text.muted,
    fontStyle: 'italic',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary.main,
  },
  checkboxUnselected: {
    backgroundColor: Colors.background.input,
    borderWidth: 2,
    borderColor: Colors.ui.border,
  },
});
