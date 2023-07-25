import { createPortal } from 'react-dom';
import type { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const Portal: FC<Props> = ({ children }) => createPortal(children, document.body);
