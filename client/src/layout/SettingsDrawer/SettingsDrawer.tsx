import type { FC } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

import { Theme } from '../../types/style';

interface Props {
  theme: Theme;
  onChangeTheme: (theme: Theme) => void;
}

export const SettingsDrawer: FC<Props> = ({ theme, onChangeTheme }) => {
  const handleChangeTheme = async (theme: Theme): Promise<void> => {
    try {
      await invoke('change_theme', { theme });
      document.querySelector('html')?.setAttribute('data-theme', theme.toLowerCase());
      onChangeTheme(theme);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="drawer fixed">
      <input id="settings" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side">
        <label htmlFor="settings" className="drawer-overlay" />
        <div className="p-4 w-80 h-full bg-base-200 text-base-content">
          <h3 className="text-lg menu-title text-center">Settings</h3>
          <div className="flex justify-between items-center">
            <p className="text-sm">Theme</p>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-sm m-1">
                {theme}
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li onClick={() => handleChangeTheme(Theme.Coffee)}>
                  <p className={theme === Theme.Coffee ? 'active' : undefined}>Coffee</p>
                </li>
                <li onClick={() => handleChangeTheme(Theme.Night)}>
                  <p className={theme === Theme.Night ? 'active' : undefined}>Night</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
