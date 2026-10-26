import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface A11yState {
  highContrast: boolean;
  colorblind: boolean;
  dyslexiaFont: boolean;
  toggle: (key: 'highContrast' | 'colorblind' | 'dyslexiaFont') => void;
  voiceInput: (onText: (text: string) => void) => { supported: boolean; start: () => void };
}

const Ctx = createContext<A11yState | null>(null);

export function A11yProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [colorblind, setColorblind] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('hc', highContrast);
    root.classList.toggle('cb', colorblind);
    root.classList.toggle('dys', dyslexiaFont);
  }, [highContrast, colorblind, dyslexiaFont]);

  const value = useMemo<A11yState>(
    () => ({
      highContrast,
      colorblind,
      dyslexiaFont,
      toggle: (key) =>
        key === 'highContrast'
          ? setHighContrast((v) => !v)
          : key === 'colorblind'
            ? setColorblind((v) => !v)
            : setDyslexiaFont((v) => !v),
      voiceInput: (onText) => {
        const SR =
          (window as unknown as { SpeechRecognition?: new () => SpeechRec }).SpeechRecognition ??
          (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition;
        if (!SR) return { supported: false, start: () => alert('Voice input is not supported in this browser. Дуу оруулга энэ хөтчид дэмжигдэхгүй.') };
        let started = false;
        return {
          supported: true,
          start: () => {
            if (started) return;
            started = true;
            const rec = new SR();
            rec.lang = 'mn-MN';
            rec.onresult = (e) => onText(e.results[0][0].transcript);
            rec.onend = () => { started = false; };
            rec.onerror = () => { started = false; };
            rec.start();
          },
        };
      },
    }),
    [highContrast, colorblind, dyslexiaFont],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

interface SpeechRec extends EventTarget {
  lang: string;
  onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
}

export function useA11y(): A11yState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useA11y must be used within A11yProvider');
  return ctx;
}
