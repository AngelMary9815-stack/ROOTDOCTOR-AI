import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AgroLogoMark } from '@/src/components/AgroLogo';
import { Button } from '@/src/components/ui/button';
import type { PageId } from '@/src/types/agro';

interface NavbarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'root-zone', label: 'Root Zone' },
  { id: 'hardware', label: 'Hardware' },
  { id: 'reports', label: 'Reports' },
];

export function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (page: PageId) => {
    onNavigate(page);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#DCE6DF] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] rounded-md"
        >
          <AgroLogoMark className="h-7 w-7 shrink-0" />
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            AgroRoot AI
          </span>
        </button>

        {/* Zone 2: Clean single-line text links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] rounded-sm ${
                  isActive
                    ? 'text-[#14532D] font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[1px] h-0.5 bg-[#14532D]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={activePage === 'settings' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => handleSelect('settings')}
            className="hidden sm:inline-flex"
          >
            Settings
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-[#DCE6DF] text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#DCE6DF] bg-white px-4 py-3">
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#EEF5F0] text-[#14532D] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleSelect('settings')}
              className={`mt-1 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-colors cursor-pointer ${
                activePage === 'settings'
                  ? 'bg-[#14532D] text-white font-semibold'
                  : 'border border-[#DCE6DF] text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>Settings</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
