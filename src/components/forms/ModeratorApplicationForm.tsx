import { useState } from 'react'
import { Send, Shield, Users, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/lib/logger'

interface ModeratorFormData {
  nombre: string
  telefono: string
  correo: string
  edad: string
  experiencia: string
  motivacion: string
  disponibilidad: string
  zonaHoraria: string
  aceptaTerminos: boolean
}

const ModeratorApplicationForm = () => {
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<ModeratorFormData>({
    nombre: '',
    telefono: '',
    correo: '',
    edad: '',
    experiencia: '',
    motivacion: '',
    disponibilidad: '',
    zonaHoraria: 'GMT-6 (México)',
    aceptaTerminos: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const disponibilidadOpciones = [
    "Tiempo completo (40+ horas/semana)",
    "Medio tiempo (20-30 horas/semana)", 
    "Tiempo parcial (10-20 horas/semana)",
    "Fines de semana únicamente",
    "Noches (después de 6 PM)",
    "Flexible según necesidades"
  ]

  const zonasHorarias = [
    "GMT-8 (Pacífico)",
    "GMT-7 (Montaña)",
    "GMT-6 (México/Central)",
    "GMT-5 (Este)",
    "GMT-3 (Argentina)",
    "GMT+1 (España)",
    "Otra (especificar en motivación)"
  ]

  const handleInputChange = (field: keyof ModeratorFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.aceptaTerminos) {
      toast({
        variant: "destructive",
        title: "Términos requeridos",
        description: "Debes aceptar los términos y condiciones"
      })
      return
    }

    // Validar campos requeridos
    const requiredFields = ['nombre', 'telefono', 'correo', 'edad', 'experiencia', 'motivacion', 'disponibilidad']
    const missingFields = requiredFields.filter(field => !formData[field as keyof ModeratorFormData])
    
    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios"
      })
      return
    }

    // Validar edad mínima
    const edad = parseInt(formData.edad)
    if (isNaN(edad) || edad < 18) {
      toast({
        variant: "destructive",
        title: "Edad mínima",
        description: "Debes ser mayor de 18 años para aplicar como moderador"
      })
      return
    }

    setIsSubmitting(true)

    try {
      logger.info('📝 Enviando solicitud de moderador:', { 
        nombre: formData.nombre, 
        correo: formData.correo,
        disponibilidad: formData.disponibilidad
      })

      // Obtener información adicional para auditoría
      const userAgent = navigator.userAgent
      const timestamp = new Date().toISOString()

      // Insertar en la base de datos Supabase usando tabla existente
      const { data, error } = await (supabase as any)
        .from('career_applications')
        .insert([
          {
            nombre: formData.nombre.trim(),
            telefono: formData.telefono.trim(),
            correo: formData.correo.trim().toLowerCase(),
            domicilio: `${formData.disponibilidad} | ${formData.zonaHoraria}`,
            puesto: 'Moderador de Comunidad',
            experiencia: formData.experiencia.trim(),
            referencias: `Edad: ${formData.edad} años`,
            expectativas: formData.motivacion.trim(),
            cv_url: null,
            status: 'pending',
            user_agent: userAgent
          }
        ])
        .select()

      if (error) {
        logger.error('❌ Error al insertar solicitud de moderador en Supabase:', { error: error.message })
        throw new Error(`Error de base de datos: ${error.message}`)
      }

      logger.info('✅ Solicitud de moderador guardada exitosamente:', { 
        id: data?.[0]?.id,
        timestamp 
      })
      
      toast({
        title: "¡Solicitud enviada exitosamente!",
        description: `Tu solicitud para moderador ha sido registrada. Te contactaremos en las próximas 24 horas a ${formData.correo}`,
        duration: 7000
      })

      // Limpiar formulario
      setFormData({
        nombre: '',
        telefono: '',
        correo: '',
        edad: '',
        experiencia: '',
        motivacion: '',
        disponibilidad: '',
        zonaHoraria: 'GMT-6 (México)',
        aceptaTerminos: false
      })

    } catch (error: any) {
      logger.error('❌ Error al enviar solicitud de moderador:', { error: error.message })
      
      toast({
        variant: "destructive",
        title: "Error al enviar solicitud",
        description: error.message || "Hubo un problema al procesar tu solicitud. Inténtalo de nuevo o contacta a ComplicesConectaSw@outlook.es"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
          <Shield className="h-8 w-8" />
          Solicitud para Moderador
        </CardTitle>
        <p className="text-white/80 text-center mt-2">
          Únete a nuestro equipo de moderadores y ayuda a mantener una comunidad segura y respetuosa.
        </p>
        
        {/* Beneficios de ser moderador */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <h4 className="text-white font-semibold">Seguridad</h4>
            <p className="text-white/70 text-sm">Protege la comunidad</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <h4 className="text-white font-semibold">Comunidad</h4>
            <p className="text-white/70 text-sm">Fomenta el respeto</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <Eye className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <h4 className="text-white font-semibold">Supervisión</h4>
            <p className="text-white/70 text-sm">Monitorea contenido</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Personales */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Nombre Completo *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div>
              <Label className="text-white">Edad *</Label>
              <Input
                type="number"
                min="18"
                max="80"
                value={formData.edad}
                onChange={(e) => handleInputChange('edad', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="18"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Teléfono *</Label>
              <Input
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="+52 55 1234 5678"
                required
              />
            </div>
            <div>
              <Label className="text-white">Correo Electrónico *</Label>
              <Input
                type="email"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Disponibilidad *</Label>
              <Select value={formData.disponibilidad} onValueChange={(value: string) => handleInputChange('disponibilidad', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Selecciona tu disponibilidad" />
                </SelectTrigger>
                <SelectContent>
                  {disponibilidadOpciones.map((opcion) => (
                    <SelectItem key={opcion} value={opcion}>{opcion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Zona Horaria *</Label>
              <Select value={formData.zonaHoraria} onValueChange={(value: string) => handleInputChange('zonaHoraria', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Selecciona tu zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  {zonasHorarias.map((zona) => (
                    <SelectItem key={zona} value={zona}>{zona}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-white">Experiencia en Moderación *</Label>
            <Textarea
              value={formData.experiencia}
              onChange={(e) => handleInputChange('experiencia', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
              placeholder="Describe tu experiencia previa en moderación de comunidades, redes sociales, foros, etc. Si no tienes experiencia, explica por qué te interesa este rol..."
              required
            />
          </div>

          <div>
            <Label className="text-white">Motivación y Enfoque *</Label>
            <Textarea
              value={formData.motivacion}
              onChange={(e) => handleInputChange('motivacion', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[120px]"
              placeholder="¿Por qué quieres ser moderador de ComplicesConecta? ¿Cómo manejarías situaciones conflictivas? ¿Qué estrategias usarías para mantener un ambiente respetuoso?"
              required
            />
          </div>

          {/* Términos y Condiciones */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terminos-moderador"
              checked={formData.aceptaTerminos}
              onCheckedChange={(checked: boolean) => handleInputChange('aceptaTerminos', !!checked)}
              className="border-white/30"
            />
            <Label htmlFor="terminos-moderador" className="text-white/90 text-sm leading-relaxed">
              Acepto los términos y condiciones para moderadores. Entiendo que como moderador tendré acceso a contenido 
              sensible y me comprometo a mantener la confidencialidad, actuar con imparcialidad y seguir las políticas 
              de la comunidad. La respuesta será enviada en un plazo máximo de 24 horas a mi correo electrónico.
            </Label>
          </div>

          {/* Información adicional */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h4 className="text-white font-semibold mb-2">Responsabilidades del Moderador:</h4>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Revisar y moderar contenido reportado</li>
              <li>• Responder consultas de la comunidad</li>
              <li>• Aplicar políticas de manera consistente</li>
              <li>• Mantener un ambiente seguro y respetuoso</li>
              <li>• Reportar problemas técnicos o de seguridad</li>
            </ul>
          </div>

          {/* Botón de Envío */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 text-lg"
          >
            {isSubmitting ? (
              'Enviando solicitud...'
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Enviar Solicitud de Moderador
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default ModeratorApplicationForm

