import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useCallback, useRef } from 'react';

import type { SettingsState } from '../model/settingsState';

/** Clique curto sintetizado (WebAudio). O AudioContext só nasce no primeiro toque com som ligado. */
const useClick = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  return useCallback(() => {
    try {
      const Ctor = window.AudioContext;
      if (!Ctor) return;
      const ctx = (ctxRef.current ??= new Ctor());
      if (ctx.state === 'suspended') void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      /* sem som: não é crítico */
    }
  }, []);
};

/** Vibração leve + som curto ao marcar tentos, respeitando os Ajustes. Chamar só a partir de um toque. */
export const useFeedback = (settings: Pick<SettingsState, 'hapticsEnabled' | 'soundEnabled'>): (() => void) => {
  const click = useClick();
  const { hapticsEnabled, soundEnabled } = settings;
  return useCallback(() => {
    if (hapticsEnabled) Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
    if (soundEnabled) click();
  }, [hapticsEnabled, soundEnabled, click]);
};
