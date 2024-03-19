import React from 'react';
import './Modal.css';

export default function Modal({
  children, className, onClick, style,
}) {
  return (
    <div className={className || 'modal-body'} style={style} onClick={onClick}>
      {children}
    </div>
  );
}
