declare module 'react-toggle-dark-mode' {
  import * as React from 'react';

  export interface DarkModeSwitchProps
    extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'onChange' | 'children'
    > {
    onChange: (checked: boolean) => void;
    checked: boolean;
    style?: React.CSSProperties;
    size?: number | string;
    animationProperties?: unknown;
    moonColor?: string;
    sunColor?: string;
  }

  export const DarkModeSwitch: React.FC<DarkModeSwitchProps>;
  export const defaultProperties: unknown;
}
