import React, { useState, useEffect } from 'react';
import { Modal, Button, ButtonToolbar, Placeholder } from 'rsuite';
import SubscribeToNewsletter from './SubscribeToNewsletter';
import SubscribeToNewsletterPopUp from './SubscriveToNewsletterPopUp';
import news1 from '../images/news1.png'

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
    <>
      <Modal open={open} onClose={handleClose}>
        <Modal.Header>
        </Modal.Header>
        <Modal.Body>
            <div className='flex flex-col items-center'>
                <img src={news1} alt="Newsletter image" className='w-[120px] h-[120px]' />
                <div className='text-center font-semibold text-[26px] mb-3'>Subscribe to newsletter</div>
                <div className='text-center '>Enter your email to get the update on Posh Choice Store's hottest deals, exclusive offers, early access to sales and more.<br />Don't miss out</div>
                <div className='w-full'>
                    <SubscribeToNewsletterPopUp />
                </div>
            </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose}>
            <div className='bg-orange-700 text-white py-2 px-6 rounded-md'>Close</div>
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
