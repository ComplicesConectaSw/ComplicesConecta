import { useMemo } from "react"

type Phase = "beta" | "premium" | "vip"

export function useFeatures() {
  // Detectar fase desde variable de entorno
  const phase = (import.meta.env.VITE_APP_PHASE as Phase) || "beta"

  return useMemo(() => {
    return {
      phase,
      isBeta: phase === "beta",
      isPremium: phase === "premium" || phase === "vip",
      isVIP: phase === "vip",

      // Funciones avanzadas
      features: {
        requests: true,              // Solicitudes habilitadas siempre
        chatPublic: true,            // Chat público habilitado
        chatPrivate: true,           // Chat privado habilitado
        profileVisibility: true,     // Control de visibilidad habilitado
        galleryPublicPrivate: true,  // Galerías habilitadas
        messagingPrivacy: true,      // Restricción de mensajes

        // 🚀 Funciones premium (pre-implementadas)
        eventsVIP: phase !== "beta",       // Solo visible en premium/vip
        ghostMode: phase !== "beta",
        virtualGifts: phase !== "beta",
        superLikes: phase !== "beta",
        stories: phase !== "beta",
      },
    }
  }, [phase])
}

export default useFeatures
