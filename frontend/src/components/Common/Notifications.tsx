import { Bell } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  isRead: boolean
}

export function Notifications() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Internship Offer",
      description: "A new Web Development internship has been posted.",
      time: "2m ago",
      isRead: false,
    },
    {
      id: "2",
      title: "Application Status",
      description: "Your application for 'Software Engineer' was reviewed.",
      time: "1h ago",
      isRead: false,
    },
    {
      id: "3",
      title: "New Message",
      description: "You have a new message from the administrator.",
      time: "5h ago",
      isRead: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const navigate = useNavigate()

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(notifications.map((n) => 
      n.id === notification.id ? { ...n, isRead: true } : n
    ))

    // Navigation logic
    const content = (notification.title + " " + notification.description).toLowerCase()
    if (content.includes("application") || content.includes("reviewed") || content.includes("convention")) {
      navigate({ to: "/convention" })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-red-500" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel>{t("notifications")}</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto p-1"
              onClick={markAllAsRead}
            >
              {t("mark_all_read")}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t("no_notifications")}
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 focus:bg-accent cursor-pointer",
                  !notification.isRead && "bg-accent/50",
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-semibold text-sm">
                    {notification.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {notification.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.description}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
