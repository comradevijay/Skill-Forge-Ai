import React, { useEffect, useRef } from 'react';

// Generic modal — supports text input, confirm-only, or info-only modes
// Usage:
//   <Modal
//     isOpen={true}
//     title="Create Section"
//     message="Enter a title for the new section"
//     inputPlaceholder="e.g. Getting Started"
//     confirmLabel="Create"
//     onConfirm={(value) => handleCreate(value)}
//     onCancel={() => setModal(null)}
//   />
const Modal = ({
  isOpen,
  title,
  message,
  inputPlaceholder,
  defaultValue = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputPlaceholder && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, inputPlaceholder]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (inputPlaceholder) {
      onConfirm(inputRef.current?.value?.trim() || '');
    } else {
      onConfirm();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirm();
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {message && <p className="modal-message">{message}</p>}

        {inputPlaceholder && (
          <input
            ref={inputRef}
            className="modal-input"
            placeholder={inputPlaceholder}
            defaultValue={defaultValue}
            onKeyDown={handleKeyDown}
          />
        )}

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`modal-confirm-btn ${danger ? 'danger' : ''}`}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;