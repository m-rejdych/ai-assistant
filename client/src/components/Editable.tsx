import { type FC, type HTMLProps, useState, useEffect } from 'react';
import { MdEdit, MdRemoveRedEye, MdClose, MdCheck } from 'react-icons/md';

interface Props extends HTMLProps<HTMLDivElement> {
  value: string;
  onAccept: (value: string) => void;
  showButton?: boolean;
  inputProps?: HTMLProps<HTMLInputElement>;
}

const KEY_PLACEHOLDER = '**********' as const;

export const Editable: FC<Props> = ({ value, onAccept, showButton, inputProps, ...rest }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [show, setShow] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleAccept = (): void => {
    onAccept(value);
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setTempValue(value);
    setIsEditing(false);
  };

  return (
    <div
      {...rest}
      className={`flex overflow-hidden items-center${rest?.className ? ` ${rest.className}` : ''}`}
    >
      {isEditing ? (
        <input
          {...inputProps}
          className={`input input-bordered input-primary input-sm flex-1 overflow-hidden max-w-xs${
            inputProps?.className ? ` ${inputProps.className}` : ''
          }`}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
        />
      ) : (
        <p className="text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {show || !showButton ? value : KEY_PLACEHOLDER}
        </p>
      )}
      <div className="join ml-4">
        {(showButton || isEditing) && (
          <button
            className="btn btn-sm btn-square join-item"
            onClick={() => (isEditing ? handleCancel() : setShow((prev) => !prev))}
          >
            {isEditing ? <MdClose /> : <MdRemoveRedEye />}
          </button>
        )}
        <button
          className="btn btn-sm btn-square join-item"
          onClick={() => (isEditing ? handleAccept() : setIsEditing(true))}
        >
          {isEditing ? <MdCheck /> : <MdEdit />}
        </button>
      </div>
    </div>
  );
};
