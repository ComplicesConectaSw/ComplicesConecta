import { lazy } from 'react';

// Lazy loading with chunk names for better debugging
export const LazyPages = {
  // Admin components - separate chunk
  Admin: lazy(() => import(/* webpackChunkName: "admin" */ "@/app/(admin)/Admin")),
  AdminProduction: lazy(() => import(/* webpackChunkName: "admin" */ "@/app/(admin)/AdminProduction")),
  AdminCareerApplications: lazy(() => import(/* webpackChunkName: "admin" */ "@/app/(admin)/AdminCareerApplications")),
  AdminModerators: lazy(() => import(/* webpackChunkName: "admin" */ "@/app/(admin)/AdminModerators")),
  ModeratorDashboard: lazy(() => import(/* webpackChunkName: "admin" */ "@/pages/ModeratorDashboard")),
  
  // Token system - separate chunk
  Tokens: lazy(() => import(/* webpackChunkName: "tokens" */ "@/pages/Tokens")),
  TokensInfo: lazy(() => import(/* webpackChunkName: "tokens" */ "@/pages/TokensInfo")),
  TokensPrivacy: lazy(() => import(/* webpackChunkName: "tokens" */ "@/pages/TokensPrivacy")),
  TokensTerms: lazy(() => import(/* webpackChunkName: "tokens" */ "@/pages/TokensTerms")),
  TokensLegal: lazy(() => import(/* webpackChunkName: "tokens" */ "@/pages/TokensLegal")),
  
  // Profile system - separate chunk
  Profiles: lazy(() => import(/* webpackChunkName: "profiles" */ "@/profiles/shared/Profiles")),
  ProfileDetail: lazy(() => import(/* webpackChunkName: "profiles" */ "@/profiles/shared/ProfileDetail")),
  ProfileSingle: lazy(() => import(/* webpackChunkName: "profiles" */ "@/profiles/single/ProfileSingle")),
  ProfileCouple: lazy(() => import(/* webpackChunkName: "profiles" */ "@/profiles/couple/ProfileCouple")),
  EditProfileSingle: lazy(() => import(/* webpackChunkName: "profiles" */ "@/profiles/single/EditProfileSingle")),
  EditProfileCouple: lazy(() => import(/* webpackChunkName: "profiles" */ "@/profiles/couple/EditProfileCouple")),
  
  // Chat system - separate chunk
  Chat: lazy(() => import(/* webpackChunkName: "chat" */ "@/pages/Chat")),
  ChatInfo: lazy(() => import(/* webpackChunkName: "chat" */ "@/pages/ChatInfo")),
  ChatAuthenticated: lazy(() => import(/* webpackChunkName: "chat" */ "@/pages/ChatAuthenticated")),
  
  // Stories and content - separate chunk
  Stories: lazy(() => import(/* webpackChunkName: "content" */ "@/pages/Stories")),
  StoriesInfo: lazy(() => import(/* webpackChunkName: "content" */ "@/pages/StoriesInfo")),
  Feed: lazy(() => import(/* webpackChunkName: "content" */ "@/pages/Feed")),
  Blog: lazy(() => import(/* webpackChunkName: "content" */ "@/pages/Blog")),
  
  // Info/Legal pages - separate chunk
  FAQ: lazy(() => import(/* webpackChunkName: "info" */ "@/pages/FAQ")),
  Terms: lazy(() => import(/* webpackChunkName: "info" */ "@/pages/Terms")),
  Privacy: lazy(() => import(/* webpackChunkName: "info" */ "@/pages/Privacy")),
  Support: lazy(() => import(/* webpackChunkName: "info" */ "@/pages/Support")),
  Security: lazy(() => import(/* webpackChunkName: "info" */ "@/pages/Security")),
  Guidelines: lazy(() => import(/* webpackChunkName: "info" */ "@/pages/Guidelines")),
  Legal: lazy(() => import(/* webpackChunkName: "info" */ "@/pages/Legal")),
  About: lazy(() => import(/* webpackChunkName: "info" */ "@/pages/About")),
  ProjectInfo: lazy(() => import(/* webpackChunkName: "info" */ "@/pages/ProjectInfo")),
  
  // Core features - separate chunk
  Matches: lazy(() => import(/* webpackChunkName: "core" */ "@/pages/Matches")),
  Requests: lazy(() => import(/* webpackChunkName: "core" */ "@/pages/Requests")),
  Settings: lazy(() => import(/* webpackChunkName: "core" */ "@/pages/Settings")),
  Discover: lazy(() => import(/* webpackChunkName: "core" */ "@/app/(discover)/Discover")),
  Premium: lazy(() => import(/* webpackChunkName: "core" */ "@/pages/Premium")),
  Dashboard: lazy(() => import(/* webpackChunkName: "core" */ "@/pages/Dashboard")),
  
  // Other pages
  Careers: lazy(() => import(/* webpackChunkName: "misc" */ "@/pages/Careers")),
  ModeratorRequest: lazy(() => import(/* webpackChunkName: "misc" */ "@/pages/ModeratorRequest")),
  Donations: lazy(() => import(/* webpackChunkName: "misc" */ "@/pages/Donations")),
  TemplateDemo: lazy(() => import(/* webpackChunkName: "misc" */ "@/pages/TemplateDemo")),
};
