/**
 * Haptics wrapper. Every call is fire-and-forget and silently ignored on
 * devices without a taptic engine, so callers never need to guard.
 */
import * as Haptics from "expo-haptics";

const ignore = () => {};

export const tapLight = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(ignore);

export const tapMedium = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(ignore);

export const notifySuccess = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    ignore,
  );

export const notifyError = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
    ignore,
  );
