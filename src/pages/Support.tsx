import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ContactPage = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para manejar el envío del formulario
    alert("Formulario enviado (simulación)");
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Contacto y Soporte</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            ¿Tienes alguna pregunta, sugerencia o necesitas ayuda? Completa el formulario y nuestro equipo se pondrá en contacto contigo lo antes posible.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Nombre</label>
              <Input id="name" placeholder="Tu nombre" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Correo Electrónico</label>
              <Input id="email" type="email" placeholder="tu@email.com" required />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">Asunto</label>
              <Input id="subject" placeholder="Motivo de tu consulta" required />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">Mensaje</label>
              <Textarea id="message" placeholder="Escribe tu mensaje aquí..." required rows={6} />
            </div>
            <Button type="submit" className="w-full">Enviar Mensaje</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactPage;

