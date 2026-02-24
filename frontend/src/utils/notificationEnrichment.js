import { getUserById } from "../api/userService";

const userPromiseCache = new Map();

export function extractActorIdFromMessage(message) {
  if (!message || typeof message !== "string") return null;
  const match = message.match(/\bUser\s+([^\s]+)\b/i);
  if (match?.[1]) return String(match[1]);

  // Other common backend formats:
  // - "<id> started following you"
  // - "<id> commented on your post"
  // - "<id> replied to your comment"
  const trimmed = message.trim();
  const leading = trimmed.match(/^([^\s]+)\s+(started following you|commented on your|replied to your|liked your)/i);
  return leading?.[1] ? String(leading[1]) : null;
}

export function extractActorIdFromNotification(notification) {
  if (!notification) return null;

  const direct =
    notification.actorId ||
    notification.senderId ||
    notification.fromUserId ||
    notification.createdBy ||
    notification.userActorId;

  if (direct) return String(direct);

  return extractActorIdFromMessage(notification.message);
}

export function stripActorPrefix(message, actorId) {
  if (!message || typeof message !== "string") return "";
  const trimmed = message.trim();
  if (!trimmed) return "";

  // Common backend format: "User <id> ..."
  if (actorId) {
    const escaped = String(actorId).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`^User\\s+${escaped}\\s+`, "i");
    return trimmed.replace(re, "").trim();
  }

  return trimmed;
}

export function getUserDisplayName(apiUser) {
  if (!apiUser) return null;
  return (
    apiUser.fullName ||
    apiUser.displayName ||
    apiUser.userDisplayName ||
    apiUser.userName ||
    apiUser.username ||
    apiUser.email ||
    null
  );
}

export function getUserAvatarUrl(apiUser) {
  if (!apiUser) return null;
  return apiUser.avatarUrl || apiUser.avatar || apiUser.profileImageUrl || null;
}

export async function getUserByIdCached(userId) {
  if (!userId) return null;
  const key = String(userId);

  if (userPromiseCache.has(key)) {
    return userPromiseCache.get(key);
  }

  const promise = getUserById(key).catch(() => null);
  userPromiseCache.set(key, promise);
  return promise;
}
