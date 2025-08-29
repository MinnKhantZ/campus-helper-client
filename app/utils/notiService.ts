import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EventItem } from '../types';

const SCHEDULED_EVENTS_KEY = 'SCHEDULED_EVENTS';

export async function scheduleEventNotification(event: EventItem) {
  try {
    const scheduledRaw = await AsyncStorage.getItem(SCHEDULED_EVENTS_KEY);
    const scheduled: number[] = scheduledRaw ? JSON.parse(scheduledRaw) : [];
    if (scheduled.includes(Number(event.id))) return;

    const eventDate = new Date(event.date);
    const notificationTime = new Date(eventDate.getTime() - 15 * 60 * 1000);

    if (notificationTime <= new Date()) return;

    const seconds = Math.max(1, Math.floor((notificationTime.getTime() - Date.now()) / 1000));
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Upcoming Event: ${event.title}`,
        body: event.description || 'You have an event scheduled soon!',
        data: { eventId: event.id },
      },
  trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false },
    });

    scheduled.push(Number(event.id));
    await AsyncStorage.setItem(SCHEDULED_EVENTS_KEY, JSON.stringify(scheduled));
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
}
