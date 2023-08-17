import { type FC } from 'react';

import { Theme } from '../../types/style';
import { GeneralSettings } from './GeneralSettings';
import { NotionSettings } from './NotionSettings';

interface Props {
  theme: Theme;
  onChangeTheme: (theme: Theme) => void;
}

export const SettingsDrawer: FC<Props> = ({ theme, onChangeTheme }) => {
  return (
    <div className="drawer fixed">
      <input id="settings" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side">
        <label htmlFor="settings" className="drawer-overlay" />
        <div className="p-4 w-80 h-full bg-base-200 text-base-content">
          <h3 className="text-lg menu-title text-center">Settings</h3>
          <div className="collapse collapse-arrow bg-base-300 overflow-visible">
            <input type="radio" name="settings-accordion" />
            <div className="collapse-title text-lg font-medium">General</div>
            <div className="collapse-content">
              <GeneralSettings theme={theme} onChangeTheme={onChangeTheme} />
            </div>
          </div>
          <div className="collapse collapse-arrow bg-base-300 mt-4">
            <input type="radio" name="settings-accordion" />
            <div className="collapse-title text-lg font-medium">Notion</div>
            <div className="collapse-content overflow-hidden">
              <NotionSettings />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
