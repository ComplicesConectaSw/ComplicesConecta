import React from 'react';
import { ProfileThemeShowcase } from '@/profiles/shared/ProfileThemeShowcase';
import { ProfileType, Gender } from '@/features/profile/useProfileTheme';

interface ProfileThemeDemoProps {
  profileType?: ProfileType;
  gender?: Gender;
}

export const ProfileThemeDemo: React.FC<ProfileThemeDemoProps> = ({
  profileType: _profileType = 'single',
  gender: _gender = 'male'
}) => {
  return (
    <div className="min-h-screen p-4">
      <ProfileThemeShowcase />
    </div>
  );
};

export default ProfileThemeDemo;
