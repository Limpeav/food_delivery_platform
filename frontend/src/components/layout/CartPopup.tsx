'use client';

import React from 'react';
import { CartDrawer } from './CartDrawer';

// Re-export CartDrawer as CartPopup for backwards compatibility
export const CartPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = (props) => {
  return <CartDrawer {...props} />;
};

export default CartPopup;
