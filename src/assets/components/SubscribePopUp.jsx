import React, { useState, useEffect } from 'react';
import { Modal } from 'rsuite';
import SubscribeToNewsletterPopUp from './SubscriveToNewsletterPopUp';

export const SubscribePopUp = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show for first time visitors
    const hasSeenPopup = localStorage.getItem('adesolaNewsletterPopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setOpen(true);
        localStorage.setItem('adesolaNewsletterPopup', 'true');
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => setOpen(false);
  return (
    <Modal open={open} onClose={handleClose} size="sm">
      <Modal.Header />
      <Modal.Body className="!overflow-visible">
        <div className="flex flex-col items-center text-center px-2 sm:px-6 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-3">Posh Choice newsletter</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink leading-tight mb-3">
            Get first access to new arrivals and offers
          </h2>
          <p className="text-sm text-ink-soft mb-6 max-w-md">
            Join our list for exclusive deals, early access to sales and gift ideas. Unsubscribe any time.
          </p>
          <SubscribeToNewsletterPopUp />
          <button type="button" onClick={handleClose} className="mt-4 text-sm text-ink-soft hover:text-ink underline-offset-4 hover:underline">
            No thanks
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};
