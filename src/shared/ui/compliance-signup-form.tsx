import * as React from "react";
import { motion } from "framer-motion";
import { Github, Twitter, Chrome } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/Button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";

interface ComplianceSignupFormProps {
  className?: string;
}

export const ComplianceSignupForm: React.FC<ComplianceSignupFormProps> = ({ className }) => {
  const { toast } = useToast();
  const [alias, setAlias] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword || !alias.trim()) {
      toast({
        title: 'Datos incompletos',
        description: 'Alias, email y contraseña son obligatorios.',
        variant: 'destructive',
      });
      return;
    }

    if (!supabase) {
      toast({
        title: 'Error de conexión',
        description: 'Supabase no está disponible en este momento.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          data: {
            nickname: alias.trim(),
          },
        },
      });

      if (error) {
        toast({
          title: 'No se pudo crear tu cuenta',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Perfil creado',
        description: 'Revisa tu correo para confirmar la cuenta y completar tu perfil.',
      });

      setAlias('');
      setEmail('');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("relative max-w-md w-full", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-black/70 border border-purple-500/30 shadow-2xl backdrop-blur-xl p-6 sm:p-8"
      >
        <div className="mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Únete a la Comunidad
          </h2>
          <p className="mt-2 text-sm text-zinc-300">
            Crea un perfil anónimo y protegido. Tu identidad real nunca se muestra sin tu consentimiento.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="alias">Alias</Label>
            <Input
              id="alias"
              name="alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Tu nombre en la comunidad"
              className="bg-zinc-900/70 border-zinc-700 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@seguro.com"
              className="bg-zinc-900/70 border-zinc-700 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="bg-zinc-900/70 border-zinc-700 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold disabled:opacity-60"
          >
            {loading ? 'Creando perfil…' : 'Crear Perfil Anónimo'}
          </Button>
        </form>

        <div className="mt-6">
          <p className="text-xs text-zinc-400 text-center mb-3">
            Métodos rápidos con control total sobre tus datos. Sin publicaciones automáticas ni invitaciones públicas.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2 text-xs">
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Github</span>
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2 text-xs">
              <Twitter className="w-4 h-4" />
              <span className="hidden sm:inline">Twitter</span>
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2 text-xs">
              <Chrome className="w-4 h-4" />
              <span className="hidden sm:inline">Google</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
