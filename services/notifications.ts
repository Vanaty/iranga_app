import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token;

    // Vérifier si nous sommes dans Expo Go
    if (__DEV__ && !Device.isDevice) {
      console.log('Push notifications not available in Expo Go simulator');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Permission de notification refusée');
        return;
      }
      try {
        // Pour Expo Go, on ne peut pas obtenir de vrai token push
        if (__DEV__) {
          console.log('Push notifications limitées dans Expo Go');
          return 'expo-go-token';
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } catch (error) {
        console.error('Error getting push token:', error);
        return 'dev-token';
      }
    } else {
      console.log('Push notifications nécessitent un appareil physique');
    }

    return token;
  }

  static async scheduleLocalNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  static async addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  static async addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}