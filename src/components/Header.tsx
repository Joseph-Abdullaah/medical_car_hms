import React from "react";
import { User, Menu } from "lucide-react";
import { User as UserType } from "../services/bridge";

interface HeaderProps {
  user: UserType;
  title: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, title, onMenuClick }) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm flex justify-between items-center px-4 md:px-6 sticky top-0 z-20 w-full">
      {/* Page Title Context */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            id="mobile-menu-toggle"
            onClick={onMenuClick}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            aria-label="Open Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="font-semibold text-lg text-slate-900 dark:text-white capitalize">
          {title}
        </h2>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-6">
        {/* Search Input Widget */}
        {/* <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search records, visits..."
            className="w-64 bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
          />
        </div> */}

        {/* Dynamic Buttons */}
        {/* <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
          </button>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div> */}

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

        {/* User Account Capsule */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
              {user.fullName}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mt-1">
              {user.role}
            </p>
          </div>

          <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
