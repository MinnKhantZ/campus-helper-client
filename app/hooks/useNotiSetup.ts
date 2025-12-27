import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

export default function useNotiSetup() {
  useEffect(() => {
    async function setupNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;
      if (status !== "granted") {
        const { status: askStatus } = await Notifications.requestPermissionsAsync();
        finalStatus = askStatus;
      }
      if (finalStatus !== "granted") {
        Alert.alert("Permission required", "Please enable notifications in settings to receive event reminders.");
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }

    setupNotifications();
  }, []);
}
