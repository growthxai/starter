import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { setTheme } from '../lib/theme';
import { Button } from './ui/button';

const ThemeSwitcher = () => {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
    setIsDark(!isDark);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
      {isDark ? (
        <Sun className="h-5 w-5 transition-all" />
      ) : (
        <Moon className="absolute h-5 w-5 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeSwitcher;
