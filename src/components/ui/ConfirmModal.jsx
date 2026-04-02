import React from 'react'
import { C } from '../../utils/constants'
import { Modal } from './Modal'
import { Btn } from './Btn'

export const ConfirmModal = ({
  open,
  title = 'Please confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onCancel,
  onConfirm,
  confirmVariant = 'danger',
  busy = false,
  maxWidth = 460,
}) => {
  if (!open) return null

  return (
    <Modal title={title} onClose={busy ? () => {} : onCancel} maxWidth={maxWidth}>
      <div style={{ fontSize: 13, color: C.textDark, lineHeight: 1.5, marginBottom: 16 }}>
        {message}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Btn variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Btn>
        <Btn variant={confirmVariant} onClick={onConfirm} disabled={busy}>
          {busy ? 'Working...' : confirmLabel}
        </Btn>
      </div>
    </Modal>
  )
}
