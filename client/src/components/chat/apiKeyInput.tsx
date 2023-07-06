import { type HTMLProps, useState, forwardRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

interface Props extends HTMLProps<HTMLInputElement> {
  onSave: (isValid: boolean) => void;
}

export const ApiKeyInput = forwardRef<HTMLInputElement, Props>(
  ({ onSave, className, ...rest }, ref) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (error) setError(false);
      setValue(e.target.value);
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>): Promise<void> => {
      if (e.key !== 'Enter' || !value) return;
      e.preventDefault();

      try {
        await invoke('save_api_key', { key: value });
        onSave(await invoke<boolean>('has_api_key'));
        if (error) setError(false);
      } catch {
        setError(true);
      }
    };

    return (
      <div className="form-control border-t border-t-accent w-[calc(100%-0.5rem)] pt-4 mt-2 ml-1 mr-1">
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
          className={`input input-bordered ${error ? 'input-error' : 'input-primary'} w-full${className ? ` ${className}` : ''
            }`}
        />
      </div>
    );
  },
);
