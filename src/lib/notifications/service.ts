import prisma from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/mail";
import { NotificationType, NotificationPriority } from "@prisma/client";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
  sendEmail?: boolean;
}

export async function createNotification(params: CreateNotificationParams) {
  const {
    userId,
    type,
    priority = "MEDIUM",
    title,
    message,
    link,
    metadata,
    sendEmail = false,
  } = params;

  try {
    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        priority,
        title,
        message,
        link,
        metadata,
        emailSent: sendEmail,
      },
    });

    // Send email if requested and user has email notifications enabled
    if (sendEmail) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, emailNotifications: true },
      });

      if (user?.emailNotifications) {
        await sendNotificationEmail(user.email!, title, message, link).catch(
          (error) => {
            console.error("Failed to send notification email:", error);
          }
        );
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.update({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      read: true,
    },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
}

export async function deleteNotification(
  notificationId: string,
  userId: string
) {
  return prisma.notification.delete({
    where: {
      id: notificationId,
      userId,
    },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
}
