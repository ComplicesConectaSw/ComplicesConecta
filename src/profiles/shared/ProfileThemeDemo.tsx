import React from 'react';
import HeaderNav from "@/components/HeaderNav";
import ProfileThemeDemoComponent from '@/components/profile/ProfileThemeDemo';

const ProfileThemeDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeaderNav />
      <ProfileThemeDemoComponent 
        profileType="single"
        gender="masculine"
      />
    </div>
  );
};

export default ProfileThemeDemoPage;
