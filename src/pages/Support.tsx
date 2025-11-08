import { HelpCircle, Shield, MessageCircle, Mail, Clock, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import HeaderNav from '@/components/HeaderNav';

const Support = () => {
  const _navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqCategories = [
    {
      title: "Cuenta y Perfil",
      icon: HelpCircle,
      questions: [
        {
          q: "�C�mo creo una cuenta en ComplicesConecta?",
          a: "Para crear una cuenta, haz clic en 'Crear Cuenta Gratis' en la p�gina principal. Necesitar�s verificar tu email y completar tu perfil con informaci�n b�sica."
        },
        {
          q: "�Puedo cambiar mi informaci�n de perfil despu�s de registrarme?",
          a: "S�, puedes editar tu perfil en cualquier momento desde la secci�n 'Configuraci�n' en tu cuenta."
        },
        {
          q: "�C�mo verifico mi perfil?",
          a: "La verificaci�n se realiza mediante nuestro sistema KYC avanzado. Sube una foto de tu identificaci�n oficial y una selfie para completar el proceso."
        }
      ]
    },
    {
      title: "Seguridad y Privacidad",
      icon: Shield,
      questions: [
        {
          q: "�Qu� medidas de seguridad tienen implementadas?",
          a: "Utilizamos verificaci�n KYC, tecnolog�a blockchain, cifrado end-to-end para mensajes y moderaci�n 24/7 para garantizar un ambiente seguro."
        },
        {
          q: "�C�mo reporto un perfil sospechoso?",
          a: "Puedes reportar cualquier perfil usando el bot�n 'Reportar' en su perfil. Nuestro equipo revisar� el reporte en menos de 24 horas."
        },
        {
          q: "�Mis datos personales est�n protegidos?",
          a: "Absolutamente. Cumplimos con todas las regulaciones de protecci�n de datos y nunca compartimos informaci�n personal sin tu consentimiento."
        }
      ]
    },
    {
      title: "Tokens y Funciones Premium",
      icon: MessageCircle,
      questions: [
        {
          q: "�Qu� son los tokens CMPX/GTK?",
          a: "CMPX son tokens internos para consumo (suministro ilimitado) que puedes usar para funciones premium, regalos virtuales y eventos VIP. GTK son tokens blockchain (suministro limitado) para staking e inversi�n, con roadmap hacia blockchain en Q2-Q4 2026."
        },
        {
          q: "�C�mo puedo ganar tokens?",
          a: "Puedes ganar CMPX invitando amigos (50 CMPX por referido, l�mite 500/mes), completando tu perfil (25 CMPX), login diario (5 CMPX), verificaci�n World ID (100 CMPX - pr�ximamente), o compr�ndolos directamente. GTK tokens estar�n disponibles para staking en Q2-Q4 2026."
        },
        {
          q: "�Qu� funciones premium est�n disponibles?",
          a: "Con CMPX puedes acceder a Super Like (10 CMPX), Boost de Perfil (50 CMPX), Regalos Virtuales (50-500 CMPX), Video Llamadas (75-200 CMPX), Eventos VIP (200-1000 CMPX), Galer�as NFT (100-1000 CMPX), Chat Premium (100 CMPX/mes), y m�s. Ver gu�a completa en /tokens-info."
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
      title: "Horario de Atenci�n",
      description: "Lun - Vie: 9:00 - 18:00",
      subtitle: "Hora de M�xico"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <HeaderNav />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mb-6">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            �En qu� podemos ayudarte?
          </h2>
          <p className="text-xl text-white font-medium max-w-2xl mx-auto mb-8">
            Encuentra respuestas r�pidas a las preguntas m�s frecuentes o cont�ctanos directamente
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5 z-10" />
            <Input
              placeholder="Buscar en preguntas frecuentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            />
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border-purple-300/30 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400/30 to-blue-400/30 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-300/20">
                  <method.icon className="w-6 h-6 text-purple-200" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{method.title}</h3>
                <p className="text-white font-medium mb-1">{method.description}</p>
                <p className="text-sm text-white font-medium">{method.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-center text-white mb-8">
            Preguntas Frecuentes
          </h3>
          
          {filteredFaqs.length > 0 ? (
            <div className="space-y-6">
              {filteredFaqs.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border-purple-300/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400/30 to-blue-400/30 rounded-lg flex items-center justify-center border border-purple-300/20">
                        <category.icon className="w-5 h-5 text-purple-200" />
                      </div>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.questions.map((faq, faqIndex) => {
                        const globalIndex = categoryIndex * 100 + faqIndex;
                        return (
                          <div key={faqIndex} className="border-b border-purple-300/20 last:border-b-0 pb-4 last:pb-0">
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === globalIndex ? null : globalIndex)}
                              className="w-full text-left flex items-center justify-between py-2 hover:text-purple-600 transition-colors"
                            >
                              <span className="font-medium text-white">{faq.q}</span>
                              {expandedFaq === globalIndex ? 
                                <ChevronUp className="w-5 h-5 text-purple-600" /> : 
                                <ChevronDown className="w-5 h-5 text-purple-300" />
                              }
                            </button>
                            {expandedFaq === globalIndex && (
                              <div className="mt-2 text-white font-medium leading-relaxed">
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
              <p className="text-white font-medium">No se encontraron preguntas que coincidan con tu b�squeda.</p>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border-purple-300/30">
          <CardHeader>
            <CardTitle className="text-center text-white">�No encontraste lo que buscabas?</CardTitle>
            <p className="text-center text-white font-medium">Env�anos un mensaje y te ayudaremos personalmente</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-1">Nombre</label>
                  <Input 
                    id="name" 
                    placeholder="Tu nombre" 
                    required 
                    className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@email.com" 
                    required 
                    className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-white mb-1">Asunto</label>
                <Input 
                  id="subject" 
                  placeholder="�En qu� podemos ayudarte?" 
                  required 
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-1">Mensaje</label>
                <Textarea 
                  id="message" 
                  placeholder="Describe tu consulta con detalle..." 
                  required 
                  rows={6}
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white py-3"
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

