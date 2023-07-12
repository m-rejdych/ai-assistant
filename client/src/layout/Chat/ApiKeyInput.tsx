import { type HTMLProps, useState, forwardRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

import { useAddNotification } from '../../hooks/useAddNotification';
import { NotificationType } from '../../types/notifications';

interface Props extends HTMLProps<HTMLInputElement> {
  onSave: (isValid: boolean) => void | Promise<void>;
  onLoading: (isLoading: boolean) => void;
}

export const ApiKeyInput = forwardRef<HTMLInputElement, Props>(
  ({ onSave, onLoading, className, ...rest }, ref) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState(false);
    const addNotification = useAddNotification();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (error) setError(false);
      setValue(e.target.value);
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>): Promise<void> => {
      if (e.key !== 'Enter' || !value) return;
      e.preventDefault();

      try {
        onLoading(true);
        await invoke('save_api_key', { key: value });
        await onSave(await invoke<boolean>('has_api_key'));
        addNotification({ text: 'API key successfully saved', type: NotificationType.Success });
        if (error) setError(false);
      } catch (error) {
        console.log(error);
        setError(true);
      } finally {
        onLoading(false);
      }
    };

    return (
      <div className="form-control border-t border-t-accent w-[calc(100%-0.5rem)] pt-4 mt-2 mb-1 ml-1 mr-1">
        {error && (
          <label className="label">
            <span className="label-text text-error">Invalid API key</span>
          </label>
        )}
        <input
          ref={ref}
          autoFocus
          type="text"
          placeholder="Enter API key"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          {...rest}
          className={`input input-bordered ${error ? 'input-error' : 'input-primary'} w-full${
            className ? ` ${className}` : ''
          }`}
        />
      </div>
    );
  },
);
