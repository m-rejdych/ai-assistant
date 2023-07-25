import { type FC, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

import { Theme } from '../../types/style';
import { Config } from '../../types/config';
import { NotificationType } from '../../types/notifications';
import { useAddNotification } from '../../hooks/useAddNotification';

interface Props {
  theme: Theme;
  onChangeTheme: (theme: Theme) => void;
}

const parseBool = (str: string): boolean => {
  switch (str) {
    case 'true':
      return true;
    case 'false':
    default:
      return false;
  }
};

export const GeneralSettings: FC<Props> = ({ theme, onChangeTheme }) => {
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const addNotification = useAddNotification();

  useEffect(() => {
    (async () => {
      try {
        setAlwaysOnTop(
          parseBool(await invoke('get_public_config', { config: Config.AlwaysOnTop })),
        );
      } catch (error) {
        addNotification({ text: 'Something went wrong', type: NotificationType.Error });
        console.log(error);
      }
    })();
  }, []);

  const handleChangeTheme = async (theme: Theme): Promise<void> => {
    try {
      await invoke('change_theme', { theme });
      document.querySelector('html')?.setAttribute('data-theme', theme.toLowerCase());
      onChangeTheme(theme);
    } catch (error) {
      addNotification({ text: 'Something went wrong', type: NotificationType.Error });
      console.log(error);
    }
  };

  const toggleAlwaysOnTop = async (): Promise<void> => {
    setAlwaysOnTop((prev) => !prev);

    try {
      await invoke('toggle_always_on_top');
      setAlwaysOnTop(parseBool(await invoke('get_public_config', { config: Config.AlwaysOnTop })));
    } catch (error) {
      addNotification({ text: 'Something went wrong', type: NotificationType.Error });
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-sm">Theme</p>
        <div className="dropdown dropdown-right">
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
      <div className="flex justify-between items-center">
        <p className="text-sm">Always on top</p>
        <input
          type="checkbox"
          className="toggle toggle-primary mr-4"
          checked={alwaysOnTop}
          onChange={toggleAlwaysOnTop}
        />
      </div>
    </>
  );
};
