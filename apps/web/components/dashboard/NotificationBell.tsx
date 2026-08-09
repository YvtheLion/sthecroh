'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { notificationsApi, NotificationDto } from '../../lib/api';

export function NotificationBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const load = () => {
    if (!token) return;
    notificationsApi.mine(token).then(setNotifications).catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleOpen = (n: NotificationDto) => {
    if (!token) return;
    if (!n.readAt) {
      notificationsApi.markRead(token, n.id).then(load);
    }
  };

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button className="notif-bell" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          {notifications.length === 0 ? (
            <div className="notif-item">
              <div className="body">Aucune notification.</div>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className={`notif-item${!n.readAt ? ' unread' : ''}`} onClick={() => handleOpen(n)}>
                <div className="title">{n.title}</div>
                {n.body && <div className="body">{n.body}</div>}
                <span className="time">
                  {new Date(n.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
