import React from 'react';
import { openDoc } from '../../../stores/docsStore';

interface DocTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  docId: string;
  children: React.ReactNode;
}

const DocTrigger: React.FC<DocTriggerProps> = ({ docId, children, onClick, ...props }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    openDoc(docId);
    onClick?.(e);
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
};

export default DocTrigger;
