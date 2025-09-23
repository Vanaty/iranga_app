export const Colors = {
  // Palette principale moderne avec dégradés
  primary: {
    main: '#6366F1',      // Indigo moderne
    dark: '#4F46E5',      // Indigo foncé
    light: '#A5B4FC',     // Indigo clair
    accent: '#8B5CF6',    // Violet accent
    gradient: ['#6366F1', '#8B5CF6'], // Dégradé principal
  },
  
  // Couleurs de fond modernes avec glassmorphism
  background: {
    primary: '#FAFAFA',   // Blanc cassé moderne
    secondary: '#F8FAFC', // Gris très clair
    card: '#FFFFFF',      // Blanc pur pour les cartes
    chat: '#F1F5F9',      // Fond chat moderne
    input: '#F8FAFC',     // Fond zone de saisie
    glass: 'rgba(255, 255, 255, 0.25)', // Glassmorphism
    glassDark: 'rgba(0, 0, 0, 0.1)', // Glassmorphism sombre
  },
  
  // Textes avec hiérarchie moderne
  text: {
    primary: '#0F172A',   // Slate très foncé
    secondary: '#475569', // Slate moyen
    tertiary: '#64748B',  // Slate clair
    white: '#FFFFFF',     // Blanc pur
    muted: '#94A3B8',     // Slate très clair
    accent: '#6366F1',    // Couleur d'accent
  },
  
  // Couleurs fonctionnelles modernes
  status: {
    online: '#10B981',    // Émeraude pour en ligne
    offline: '#6B7280',   // Gris pour hors ligne
    typing: '#F59E0B',    // Ambre pour frappe
    typingBg: '#FEF3C7',  // Fond ambre clair
    typingDot: '#D97706', // Points de frappe
    error: '#EF4444',     // Rouge moderne
    warning: '#F59E0B',   // Ambre pour avertissements
    success: '#10B981',   // Émeraude pour succès
    info: '#3B82F6',      // Bleu pour info
  },
  
  // Messages avec design moderne
  message: {
    sent: '#E0E7FF',      // Indigo très clair pour messages envoyés
    received: '#FFFFFF',  // Blanc pour messages reçus
    border: '#E2E8F0',    // Bordure subtile
    shadow: 'rgba(99, 102, 241, 0.1)', // Ombre colorée
    gradient: ['#E0E7FF', '#F3F4F6'], // Dégradé message
  },
  
  // Éléments d'interface modernes
  ui: {
    border: '#E2E8F0',    // Bordures subtiles
    shadow: 'rgba(15, 23, 42, 0.08)', // Ombres douces
    overlay: 'rgba(0, 0, 0, 0.4)', // Overlay moderne
    divider: '#F1F5F9',   // Lignes de séparation
    glass: 'rgba(255, 255, 255, 0.1)', // Glassmorphism
  },
  
  // Thème sombre
  dark: {
    primary: '#818CF8',   // Indigo clair pour le sombre
    background: '#0F172A', // Slate très foncé
    card: '#1E293B',      // Slate foncé
    text: '#F8FAFC',      // Blanc cassé
    textSecondary: '#CBD5E1', // Gris clair
    border: '#334155',    // Bordure sombre
  }
};
