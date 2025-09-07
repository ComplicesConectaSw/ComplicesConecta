import { ArrowLeft, HelpCircle, Shield, MessageCircle, Phone, Mail, Clock, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Support = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqCategories = [
    {
      title: "Cuenta y Perfil",
      icon: HelpCircle,
      questions: [
        {
          q: "¿Cómo creo una cuenta en ComplicesConecta?",
          a: "Para crear una cuenta, haz clic en 'Crear Cuenta Gratis' en la página principal. Necesitarás verificar tu email y completar tu perfil con información básica."
        },
        {
          q: "¿Puedo cambiar mi información de perfil después de registrarme?",
          a: "Sí, puedes editar tu perfil en cualquier momento desde la sección 'Configuración' en tu cuenta."
        },
        {
          q: "¿Cómo verifico mi perfil?",
          a: "La verificación se realiza mediante nuestro sistema KYC avanzado. Sube una foto de tu identificación oficial y una selfie para completar el proceso."
        }
      ]
    },
    {
      title: "Seguridad y Privacidad",
      icon: Shield,
      questions: [
        {
          q: "¿Qué medidas de seguridad tienen implementadas?",
          a: "Utilizamos verificación KYC, tecnología blockchain, cifrado end-to-end para mensajes y moderación 24/7 para garantizar un ambiente seguro."
        },
        {
          q: "¿Cómo reporto un perfil sospechoso?",
          a: "Puedes reportar cualquier perfil usando el botón 'Reportar' en su perfil. Nuestro equipo revisará el reporte en menos de 24 horas."
        },
        {
          q: "¿Mis datos personales están protegidos?",
          a: "Absolutamente. Cumplimos con todas las regulaciones de protección de datos y nunca compartimos información personal sin tu consentimiento."
        }
      ]
    },
    {
      title: "Tokens y Funciones Premium",
      icon: MessageCircle,
      questions: [
        {
          q: "¿Qué son los tokens CMPX/GTK?",
          a: "CMPX son tokens internos para funciones premium, mientras que GTK son tokens blockchain para el ecosistema completo. Ambos te dan acceso a funciones exclusivas."
        },
        {
          q: "¿Cómo puedo ganar tokens?",
          a: "Puedes ganar tokens completando tu perfil, invitando amigos, participando en eventos y siendo activo en la comunidad."
        },
        {
          q: "¿Qué funciones premium están disponibles?",
          a: "Con tokens premium puedes acceder a chat ilimitado, ver quién visitó tu perfil, acceso a eventos VIP y funciones de matching avanzadas."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "complicesconectasw@outlook.es",
      subtitle: "Respuesta en 24 horas"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Soporte WhatsApp",
      subtitle: "Respuesta inmediata"
    },
    {
      icon: Clock,
      title: "Horario de Atención",
      description: "Lun - Vie: 9:00 - 18:00",
      subtitle: "Hora de México"
    }
  ];

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Mensaje enviado correctamente. Te contactaremos pronto.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-pink-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-pink-600 hover:text-pink-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Centro de Ayuda
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-6">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ¿En qué podemos ayudarte?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Encuentra respuestas rápidas a las preguntas más frecuentes o contáctanos directamente
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar en preguntas frecuentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="bg-white/60 backdrop-blur-sm border-pink-200/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <method.icon className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-700 mb-1">{method.description}</p>
                <p className="text-sm text-gray-500">{method.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Preguntas Frecuentes
          </h3>
          
          {filteredFaqs.length > 0 ? (
            <div className="space-y-6">
              {filteredFaqs.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="bg-white/60 backdrop-blur-sm border-pink-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-gray-900">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <category.icon className="w-5 h-5 text-pink-600" />
                      </div>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.questions.map((faq, faqIndex) => {
                        const globalIndex = categoryIndex * 100 + faqIndex;
                        return (
                          <div key={faqIndex} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === globalIndex ? null : globalIndex)}
                              className="w-full text-left flex items-center justify-between py-2 hover:text-pink-600 transition-colors"
                            >
                              <span className="font-medium text-gray-900">{faq.q}</span>
                              {expandedFaq === globalIndex ? 
                                <ChevronUp className="w-5 h-5 text-pink-600" /> : 
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              }
                            </button>
                            {expandedFaq === globalIndex && (
                              <div className="mt-2 text-gray-700 leading-relaxed">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron preguntas que coincidan con tu búsqueda.</p>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <Card className="bg-white/60 backdrop-blur-sm border-pink-200/50">
          <CardHeader>
            <CardTitle className="text-center text-gray-900">¿No encontraste lo que buscabas?</CardTitle>
            <p className="text-center text-gray-600">Envíanos un mensaje y te ayudaremos personalmente</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <Input id="name" placeholder="Tu nombre" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input id="email" type="email" placeholder="tu@email.com" required />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <Input id="subject" placeholder="¿En qué podemos ayudarte?" required />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <Textarea id="message" placeholder="Describe tu consulta con detalle..." required rows={6} />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3"
              >
                Enviar Mensaje
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;

