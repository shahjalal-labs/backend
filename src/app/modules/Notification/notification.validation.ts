import { z } from "zod";

const markAllAsReadOrUnreadSchema = z
  .object({
    isRead: z.boolean(),
  })
  .strict();

export const NotificationValidation = {
  markAllAsReadOrUnreadSchema,
};
