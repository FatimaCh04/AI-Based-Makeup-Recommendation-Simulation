import React from 'react';
import { Sparkles, Cpu, Heart, CheckCheck, Bell } from 'lucide-react';
import { mockNotifications } from '../../data/mockNotifications';

export default function NotificationDropdown({ isOpen, onClose }) {
  if (!isOpen) return null;

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className="w-3.5 h-3.5 text-berry-600" />;
      case 'cpu':
        return <Cpu className="w-3.5 h-3.5 text-lavender-500" />;
      case 'heart':
        return <Heart className="w-3.5 h-3.5 text-coral-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-berry-600" />;
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-soft-lg border border-blush-200 py-3 z-50 animate-fadeIn overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-ivory-200">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Notifications</h4>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-berry-100 text-berry-700">
            2 New
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[11px] font-medium text-berry-600 hover:text-berry-700 flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Notification List */}
      <div className="divide-y divide-ivory-100 max-h-80 overflow-y-auto">
        {mockNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 hover:bg-ivory-100/60 transition-colors flex items-start gap-3 cursor-pointer ${
              notif.unread ? 'bg-blush-50/40' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-ivory-200 flex-shrink-0 flex items-center justify-center shadow-xs">
              {getIcon(notif.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-xs font-semibold text-charcoal-900 truncate">{notif.title}</span>
                <span className="text-[10px] text-charcoal-400 whitespace-nowrap">{notif.time}</span>
              </div>
              <p className="text-[11px] text-charcoal-600 leading-relaxed line-clamp-2">
                {notif.subtitle}
              </p>
            </div>
            {notif.unread && (
              <span className="w-2 h-2 rounded-full bg-berry-500 flex-shrink-0 mt-1.5" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-ivory-200 bg-ivory-50 text-center">
        <button
          onClick={onClose}
          className="text-xs font-semibold text-charcoal-600 hover:text-berry-600 transition-colors"
        >
          View all activity history
        </button>
      </div>
    </div>
  );
}
