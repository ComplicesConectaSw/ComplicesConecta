import React from 'react';
import HeaderNav from '@/components/HeaderNav';
import VirtualGifts from '@/components/premium/VirtualGifts';

const VirtualGiftsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 relative overflow-hidden">
      <HeaderNav />
      <VirtualGifts />
    </div>
  );
};

export default VirtualGiftsPage;
