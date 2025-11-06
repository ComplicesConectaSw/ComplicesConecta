// src/debug/EnvDebug.tsx
import React from 'react';

const EnvDebug = () => {
  console.log('🔥 SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('🔥 ANON KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
  console.log('🔥 MODO:', import.meta.env.VITE_APP_MODE);
  console.log('🔥 ENTORNO:', import.meta.env.VITE_APP_ENV);
  console.log('🔥 OPENAI KEY:', import.meta.env.VITE_OPENAI_API_KEY ? '✅ Cargada' : '❌ Faltante');

  return (
    <div style={{ padding: 20, background: '#000', color: '#0f0', fontFamily: 'monospace' }}>
      <h2>Variables de Entorno (Debug)</h2>
      <pre>
        {JSON.stringify(
          {
            VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
            VITE_APP_MODE: import.meta.env.VITE_APP_MODE,
            VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
            VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY ? 'loaded' : 'missing',
          },
          null,
          2
        )}
      </pre>
    </div>
  );
};

export default EnvDebug;