import HeaderNav from "@/components/HeaderNav";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  ArrowLeft,
  Lock,
  Globe,
  Shield,
  Users,
  Heart,
  Zap,
  Eye,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-black text-zinc-100">
      <HeaderNav />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-24">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-sm text-zinc-200 hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="rounded-[32px] border border-white/10 bg-black/60 p-8 backdrop-blur-2xl shadow-2xl shadow-purple-900/40">
          <div className="text-center mb-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-900/40">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Chat Privado y Seguro
            </h1>
            <p className="mt-4 text-base text-zinc-300">
              La red de mensajera cifrada del lifestyle. Privacidad total, moderacin humana 24/7 y
              control absoluto de tus conexiones.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Lock className="h-6 w-6 text-purple-300" />
                  Chats Privados
                  <Badge className="bg-purple-600/20 text-purple-200 border-purple-500/40">
                    E2E
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-200">
                <p>
                  Conversaciones ntimas con verificado KYC, encriptadas punto a punto y con filtros
                  de privacidad dinámicos.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" /> Encriptacin militar AES-256
                  </li>
                  <li className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-400" /> Solo conexiones aprobadas
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-400" /> Control de capturas y reenvos
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Globe className="h-6 w-6 text-cyan-300" />
                  Salas Pblicas
                  <Badge className="bg-cyan-500/20 text-cyan-100 border-cyan-400/30">24/7</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-200">
                <p>
                  Temticas regionales, filtros por ciudad y moderacin humana para mantener la
                  experiencia segura.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-300" /> Comunidad activa 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-400" /> Moderadores verificados
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-300" /> Cultura respetuosa y protegida
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8 border-white/10 bg-black/40 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Zap className="h-6 w-6 text-amber-300" />
                Salas destacadas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Sala General Lifestyle", tone: "from-orange-500 to-red-500" },
                { label: "Parejas CDMX", tone: "from-purple-500 to-fuchsia-500" },
                { label: "Singles Lifestyle", tone: "from-emerald-500 to-teal-500" },
                { label: "Eventos Privados", tone: "from-amber-500 to-orange-500" },
              ].map((room) => (
                <div
                  key={room.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r ${room.tone} text-white font-semibold`}
                    >
                      ✦
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{room.label}</p>
                      <p className="text-xs text-zinc-300">
                        Acceso seguro con filtros regionales
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mb-10 border-white/10 bg-black/40 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Shield className="h-6 w-6 text-emerald-300" /> Seguridad integral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3 text-center text-sm text-zinc-200">
                <div>
                  <Lock className="mx-auto mb-2 h-8 w-8 text-purple-300" />
                  Encriptacin E2E
                </div>
                <div>
                  <UserCheck className="mx-auto mb-2 h-8 w-8 text-blue-300" />
                  KYC obligatorio
                </div>
                <div>
                  <Eye className="mx-auto mb-2 h-8 w-8 text-emerald-300" />
                  Control de reportes en un toque
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-purple-900/70 via-indigo-900/60 to-purple-900/70 p-8 text-center shadow-2xl shadow-purple-900/30">
            <h2 className="text-2xl font-semibold text-white">
              ¿Listo para enviar tu primer mensaje seguro?
            </h2>
            <p className="mt-3 text-sm text-zinc-300">
              Crea tu perfil, verifica tu identidad y desbloquea las salas privadas y matchmaking en
              tiempo real.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-white shadow-xl hover:from-purple-500 hover:to-indigo-500"
            >
              <MessageCircle className="mr-2 h-5 w-5" /> Quiero registrarme ahora
            </Button>
            <p className="mt-3 text-xs text-zinc-400">
              Protección Ley Olimpia • Moderación humana • Anti-Screenshot activo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInfo;
