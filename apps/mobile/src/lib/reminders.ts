/**
 * Local reminders for closing diagnostic windows.
 *
 * Local in the strict sense: `expo-notifications` is used only for
 * device-scheduled notifications. No push token is ever requested, so
 * no notification service is involved and nothing leaves the phone
 * (ADR-0003).
 *
 * The wording is the security-relevant part. A notification is rendered
 * on the lock screen, in front of whoever is standing next to the
 * phone — the exact attacker this product is shaped around (ADR-0001).
 * So the text names no infection, no count and no date: it says that
 * there is something to look at, and the rest is behind the lock.
 *
 * Known gap: the sender name is the app's own, and the OS shows it. In
 * disguise mode the app's *display* name is still "Sexdiary" until the
 * alternate-icon work lands, so a disguised install still leaks the app
 * name on the lock screen. Recorded in OFFENE-PUNKTE.
 */
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { calcRisk, reminderSchedule, toDate, type AppData } from "@sexdiary/core";

const CHANNEL = "reminders";

/** Late morning: early enough to act on, past the time people wake up. */
const HOUR = 10;

export interface ReminderText {
  title: string;
  body: string;
}

/**
 * Ask for permission. Returns whether reminders may actually be shown —
 * the caller is expected to leave the setting off when this is false,
 * rather than promising reminders the OS will not deliver.
 */
export async function requestReminderPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  const granted =
    current.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (granted && Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: "Erinnerungen",
      importance: Notifications.AndroidImportance.DEFAULT,
      // The channel description and name are visible in system settings,
      // so both stay neutral.
      showBadge: false,
    });
  }
  return granted;
}

/**
 * Bring the scheduled notifications in line with the data.
 *
 * Cancel-then-reschedule rather than diffing: the schedule is derived
 * entirely from the data, it is at most a handful of entries, and a
 * diff would be a second source of truth about what is pending.
 */
export async function syncReminders(
  data: AppData,
  text: ReminderText,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!data.prefs.notifs) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;

  const report = calcRisk(
    data.intercourse,
    data.tests,
    data.vaccinations,
    data.prefs.country,
    data.profile.conditions,
  );

  for (const reminder of reminderSchedule(report)) {
    const when = toDate(reminder.date);
    when.setHours(HOUR, 0, 0, 0);
    if (when.getTime() <= Date.now()) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: text.title, body: text.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        ...(Platform.OS === "android" ? { channelId: CHANNEL } : {}),
      },
    });
  }
}

export async function cancelReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
