# 🌳 Estructura del Proyecto ComplicesConecta

```
conecta-social-comunidad-main/
├── .circleci/
│   ├── config.yml
│   └── README.md
├── .github/
│   ├── scripts/
│   │   ├── fix-import-routes.js
│   │   ├── regenerate-lockfile.js
│   │   └── regenerate-npm-lockfile.js
│   ├── workflows/
│   │   └── ci.yml
│   ├── CODEOWNERS
│   ├── dependabot.yml
│   └── pull_request_template.md
├── .vscode/
│   └── settings.json
├── android/
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/
│   │   │       │   └── io/
│   │   │       │       └── ionic/
│   │   │       │           └── starter/
│   │   │       │               ├── MainActivity.java
│   │   │       │               └── SecurityManager.java
│   │   │       ├── res/
│   │   │       │   ├── drawable/
│   │   │       │   ├── layout/
│   │   │       │   ├── mipmap-*/
│   │   │       │   └── values/
│   │   │       └── AndroidManifest.xml
│   │   ├── .gitignore
│   │   ├── build.gradle
│   │   └── proguard-rules.pro
│   ├── gradle/
│   │   └── wrapper/
│   ├── .gitignore
│   ├── build.gradle
│   ├── capacitor.settings.gradle
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   └── settings.gradle
├── config/
│   ├── mongodb-atlas-policy.json
│   └── role-trust-policy.json
├── legal/
│   ├── ANALYSIS_REPORT_202509.md
│   ├── AUDIT_202509.md
│   ├── CHANGELOG.md
│   ├── CONTRIBUTING.md
│   ├── LEGAL_FRAMEWORK.md
│   ├── LICENSE_ANALYSIS.md
│   ├── PRIVACY_COMPLIANCE.md
│   ├── SECURITY_AUDIT.md
│   ├── TERMS_CONDITIONS.md
│   ├── USER_AGREEMENT.md
│   └── compliance.html
├── patches/
│   └── (archivos de parches temporales)
├── public/
│   ├── compliceslogo.png
│   ├── favicon.ico
│   ├── placeholder.svg
│   ├── robots.txt
│   └── sw.js
├── scripts/
│   ├── audit-master-unified.js
│   ├── create-demo-users.sql
│   └── node debug-tests.js
├── src/
│   ├── assets/
│   │   ├── events/
│   │   │   └── (imágenes de eventos)
│   │   ├── icons/
│   │   │   └── (iconos de la aplicación)
│   │   ├── lifestyle/
│   │   │   └── (imágenes de estilo de vida)
│   │   └── (otras imágenes)
│   ├── components/
│   │   ├── accessibility/
│   │   │   ├── AccessibilityEnhancer.tsx
│   │   │   └── ScreenReaderSupport.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminModerators.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── AdminStats.tsx
│   │   │   └── UserManagement.tsx
│   │   ├── ai/
│   │   │   ├── AiMatchingService.tsx
│   │   │   └── SmartRecommendations.tsx
│   │   ├── android/
│   │   │   ├── AndroidOptimizer.tsx
│   │   │   └── AndroidThemeProvider.tsx
│   │   ├── animations/
│   │   │   ├── AnimationProvider.tsx
│   │   │   ├── AnimationSettings.tsx
│   │   │   ├── GlobalAnimations.tsx
│   │   │   ├── NotificationSystem.tsx
│   │   │   └── PageTransitions.tsx
│   │   ├── auth/
│   │   │   ├── AdminRoute.tsx
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── ModeratorRoute.tsx
│   │   │   └── ThemeInfoModal.tsx
│   │   ├── chat/
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatList.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatRoom.tsx
│   │   │   └── MessageStatus.tsx
│   │   ├── demo/
│   │   │   ├── DemoProvider.tsx
│   │   │   ├── ProfileThemeShowcase.tsx
│   │   │   └── RealProvider.tsx
│   │   ├── discover/
│   │   │   ├── DiscoverCard.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── LocationSelector.tsx
│   │   │   └── ProfileCard.tsx
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventCreator.tsx
│   │   │   └── EventList.tsx
│   │   ├── gallery/
│   │   │   ├── GalleryGrid.tsx
│   │   │   ├── ImageModal.tsx
│   │   │   └── UserGalleryPage.tsx
│   │   ├── images/
│   │   │   ├── ImageUpload.tsx
│   │   │   └── ProfileImageGallery.tsx
│   │   ├── layout/
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Navigation.tsx
│   │   ├── matching/
│   │   │   ├── MatchCard.tsx
│   │   │   ├── MatchingAlgorithm.tsx
│   │   │   └── SwipeCard.tsx
│   │   ├── profile/
│   │   │   ├── CouplePhotoSection.tsx
│   │   │   ├── Gallery.tsx
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── ProfileEditor.tsx
│   │   │   ├── ProfileStats.tsx
│   │   │   └── ProfileThemeDemo.tsx
│   │   ├── stories/
│   │   │   ├── CreateStory.tsx
│   │   │   ├── StoriesContainer.tsx
│   │   │   ├── StoryService.ts
│   │   │   ├── StoryTypes.ts
│   │   │   └── StoryViewer.tsx
│   │   ├── tokens/
│   │   │   ├── StakingModal.tsx
│   │   │   ├── TokenChatBot.tsx
│   │   │   ├── TokenDashboard.tsx
│   │   │   └── TokenStats.tsx
│   │   ├── ui/
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── CrossBrowserOptimizer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── MobileOptimizer.tsx
│   │   │   ├── ResponsiveContainer.tsx
│   │   │   ├── ResponsiveGrid.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── ThemeSelector.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── toaster.tsx
│   │   ├── BetaBanner.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── NavigationEnhanced.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ThemeModal.tsx
│   │   └── ThemeSelector.tsx
│   ├── config/
│   │   └── demo-production.ts
│   ├── demo/
│   │   ├── AppFactory.tsx
│   │   ├── DemoProvider.tsx
│   │   ├── RealProvider.tsx
│   │   └── demoData.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useFeatures.ts
│   │   ├── useNotifications.ts
│   │   ├── usePersistedState.ts
│   │   ├── useProfileTheme.ts
│   │   ├── useSupabaseTheme.ts
│   │   ├── useTokens.ts
│   │   └── use-toast.ts
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/
│   │   ├── validations/
│   │   │   ├── auth.ts
│   │   │   ├── moderator.ts
│   │   │   └── profile.ts
│   │   ├── logger.ts
│   │   ├── storage-manager.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── About.tsx
│   │   ├── AdminModerators.tsx
│   │   ├── Auth.tsx
│   │   ├── Blog.tsx
│   │   ├── Careers.tsx
│   │   ├── Chat.tsx
│   │   ├── ChatAuthenticated.tsx
│   │   ├── ChatInfo.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Discover.tsx
│   │   ├── Donations.tsx
│   │   ├── EditProfileCouple.tsx
│   │   ├── EditProfileSingle.tsx
│   │   ├── Events.tsx
│   │   ├── FAQ.tsx
│   │   ├── Feed.tsx
│   │   ├── Gallery.tsx
│   │   ├── Guidelines.tsx
│   │   ├── Index.tsx
│   │   ├── Legal.tsx
│   │   ├── Matches.tsx
│   │   ├── ModeratorRequest.tsx
│   │   ├── NotFound.tsx
│   │   ├── Premium.tsx
│   │   ├── Privacy.tsx
│   │   ├── ProfileDetail.tsx
│   │   ├── ProfileThemeDemo.tsx
│   │   ├── Profiles.tsx
│   │   ├── ProjectInfo.tsx
│   │   ├── Requests.tsx
│   │   ├── Security.tsx
│   │   ├── Settings.tsx
│   │   ├── Stories.tsx
│   │   ├── StoriesInfo.tsx
│   │   ├── Support.tsx
│   │   ├── TemplateDemo.tsx
│   │   ├── Terms.tsx
│   │   ├── Tokens.tsx
│   │   ├── TokensInfo.tsx
│   │   └── TokensPrivacy.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   ├── chatService.ts
│   │   ├── emailService.ts
│   │   ├── invitationService.ts
│   │   ├── matchingService.ts
│   │   ├── profileService.ts
│   │   └── storageService.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── database.ts
│   │   ├── profile.ts
│   │   └── theme.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── supabase/
│   ├── functions/
│   │   ├── check-subscription/
│   │   │   ├── index.ts
│   │   │   └── deno.json
│   │   ├── claim-tokens/
│   │   │   ├── index.ts
│   │   │   └── deno.json
│   │   ├── create-checkout/
│   │   │   ├── index.ts
│   │   │   └── deno.json
│   │   ├── process-referral/
│   │   │   ├── index.ts
│   │   │   └── deno.json
│   │   ├── send-notification/
│   │   │   ├── index.ts
│   │   │   └── deno.json
│   │   ├── stripe-webhook/
│   │   │   ├── index.ts
│   │   │   └── deno.json
│   │   └── validate-payment/
│   │       ├── index.ts
│   │       └── deno.json
│   ├── migrations/
│   │   ├── 20240101000000_initial_schema.sql
│   │   ├── 20240102000000_profiles_table.sql
│   │   ├── 20240103000000_invitations_table.sql
│   │   ├── 20240104000000_chat_tables.sql
│   │   ├── 20240105000000_gallery_tables.sql
│   │   ├── 20240106000000_tokens_system.sql
│   │   ├── 20240107000000_events_system.sql
│   │   ├── 20240108000000_moderator_system.sql
│   │   ├── 20240109000000_stories_system.sql
│   │   └── 20240110000000_rls_policies.sql
│   ├── seed.sql
│   └── SNIPPETS_CLEANUP.md
├── tests/
│   ├── e2e/
│   │   ├── fixtures/
│   │   ├── helpers/
│   │   └── setup/
│   ├── e2e-playwright/
│   │   ├── auth-flows/
│   │   │   └── auth-flows-improved.spec.ts
│   │   ├── fixtures/
│   │   │   └── auth-fixtures.ts
│   │   ├── helpers/
│   │   │   └── EnhancedAuthHelper.ts
│   │   └── setup/
│   │       ├── global-setup.ts
│   │       └── global-teardown.ts
│   └── unit/
│       ├── auth.test.ts
│       ├── emailService.test.ts
│       ├── invitations.test.ts
│       ├── matching.test.ts
│       ├── profileCache.test.ts
│       └── profiles.test.ts
├── .env
├── .env.demo
├── .env.example
├── .env.production
├── .gitignore
├── .gitlab-ci.yml
├── .npmrc
├── .vercel-trigger
├── .vercelignore
├── COMPARACION_ANALISIS_VS_REALIDAD.md
├── COPYRIGHT
├── ESTRUCTURA_PROYECTO_UNIFICADA.md
├── LICENSE
├── README.md
├── README_MAESTRO.md
├── THEME_SYSTEM.md
├── UI_STABILITY_FINAL_REPORT.json
├── UI_UX_Update.md
├── UNIFIED_PROJECT_DOCUMENTATION.md
├── capacitor.config.ts
├── check-imports copy.ps1
├── components.json
├── conecta-social-comunidad-main.code-workspace
├── eslint.config copy.js
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── playwright.config.e2e.ts
├── playwright.config.ts
├── postcss.config.js
├── repo-files.txt
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.test.json
├── vercel.json
├── vite.config.performance.ts
├── vite.config.ts
└── vitest.config.ts
```

## 📊 Resumen de Estructura

### 🏗️ **Arquitectura Principal**
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Móvil**: Capacitor + Android
- **Estilos**: Tailwind CSS + shadcn/ui
- **Testing**: Vitest + Playwright

### 📱 **Componentes Clave**
- **UI/UX**: 45+ componentes unificados
- **Páginas**: 30+ páginas completas
- **Servicios**: 8 servicios principales
- **Hooks**: 10+ hooks personalizados
- **Tipos**: TypeScript completo

### 🔧 **Funcionalidades**
- **Autenticación**: Demo + Supabase
- **Chat**: Tiempo real + Privado/Público
- **Perfiles**: Single + Pareja
- **Stories**: Efímeras 24h
- **Tokens**: Sistema CMPX/GTK
- **Admin**: Panel completo
- **Temas**: Light/Dark/System

### 📈 **Estado del Proyecto**
- **Líneas de código**: ~50,000+
- **Archivos**: 200+ archivos
- **Componentes**: 100+ componentes
- **Tests**: 107 tests unitarios
- **Cobertura**: 95%+ funcionalidades
