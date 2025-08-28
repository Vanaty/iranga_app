import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

interface MessageStatusProps {
  sent: boolean;
  delivered: boolean;
  read: boolean;
}

export function MessageStatus({ sent, delivered, read }: MessageStatusProps) {
  const getColor = () => {
    if (read) return '#25D366'; // Vert WhatsApp pour lu
    if (delivered) return '#666666'; // Gris pour livré
    return '#999999'; // Gris clair pour envoyé
  };

  return (
    <View style={styles.container}>
      {/* Première coche (envoyé) */}
      <Check 
        size={12} 
        color={getColor()} 
        strokeWidth={2}
        style={delivered ? styles.firstCheck : styles.singleCheck}
      />
      
      {/* Deuxième coche (livré/lu) */}
      {delivered && (
        <Check 
          size={12} 
          color={getColor()} 
          strokeWidth={2}
          style={styles.secondCheck}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  singleCheck: {
    // Position pour une seule coche
  },
  firstCheck: {
    marginRight: -6, // Chevauchement des coches
  },
  secondCheck: {
    // Position pour la deuxième coche
  },
});
