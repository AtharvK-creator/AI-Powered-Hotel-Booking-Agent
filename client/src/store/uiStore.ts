import { create } from 'zustand';

interface UiState {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const savedMode = localStorage.getItem('darkMode');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialDark = savedMode !== null ? savedMode === 'true' : prefersDark;

export const useUiStore = create<UiState>((set, get) => ({
  darkMode: initialDark,
  toggleDarkMode: () => {
    const next = !get().darkMode;
    localStorage.setItem('darkMode', String(next));
    set({ darkMode: next });
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  },
}));

// Apply initial theme
document.documentElement.setAttribute('data-theme', initialDark ? 'dark' : 'light');
