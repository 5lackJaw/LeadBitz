-- AlterTable
ALTER TABLE "inbox_connections" ADD COLUMN     "daily_send_cap" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "ramp_up_per_day" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "send_window_end_hour" INTEGER NOT NULL DEFAULT 17,
ADD COLUMN     "send_window_start_hour" INTEGER NOT NULL DEFAULT 9;
