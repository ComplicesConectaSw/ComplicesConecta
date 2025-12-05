/**
 * =====================================================
 * ADVANCED PROFILE EDITOR
 * =====================================================
 * Editor avanzado de perfil con preview en tiempo real
 * Features: Markdown bio, tags, privacidad, preview live
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import { Save, Eye, Lock, Globe, Users, X, Plus, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface AdvancedProfileEditorProps {
  userId: string;
  profileType: 'single' | 'couple';
  initialData?: ProfileData;
  onSave: (data: ProfileData) => Promise<void>;
  onCancel?: () => void;
}

interface ProfileData {
  name: string;
  bio: string;
  age: number;
  location: string;
  interests: string[];
  lookingFor: string[];
  relationshipStatus: string;
  privacy: {
    profileVisibility: 'public' | 'members' | 'private';
    photoVisibility: 'public' | 'members' | 'private';
    allowMessages: 'everyone' | 'members' | 'matches';
    showOnlineStatus: boolean;
    showLocation: boolean;
  };
}

const INTEREST_SUGGESTIONS = [
  '🎵 Música', '🎬 Cine', '📚 Lectura', '🏃 Deporte', '🍳 Cocina',
  '✈️ Viajes', '🎨 Arte', '🎮 Gaming', '🧘 Yoga', '🍷 Vino',
  '🏖️ Playa', '⛰️ Montaña', '💃 Baile', '🎭 Teatro', '📸 Fotografía'
];

const LOOKING_FOR_OPTIONS = [
  'Amistad', 'Citas casuales', 'Relación seria', 'Matrimonio',
  'Eventos sociales', 'Intercambio de parejas', 'Tríos'
];

export const AdvancedProfileEditor: React.FC<AdvancedProfileEditorProps> = ({
  userId: _userId,
  profileType,
  initialData,
  onSave,
  onCancel
}) => {
  const [data, setData] = useState<ProfileData>(initialData || {
    name: '',
    bio: '',
    age: 18,
    location: '',
    interests: [],
    lookingFor: [],
    relationshipStatus: 'single',
    privacy: {
      profileVisibility: 'members',
      photoVisibility: 'members',
      allowMessages: 'members',
      showOnlineStatus: true,
      showLocation: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [bioCharCount, setBioCharCount] = useState(0);
  const [customInterest, setCustomInterest] = useState('');

  const MAX_BIO_LENGTH = 500;
  const MAX_INTERESTS = 10;

  useEffect(() => {
    setBioCharCount(data.bio.length);
  }, [data.bio]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(data);
    } finally {
      setIsSaving(false);
    }
  };

  const addInterest = (interest: string) => {
    if (data.interests.length < MAX_INTERESTS && !data.interests.includes(interest)) {
      setData({ ...data, interests: [...data.interests, interest] });
    }
  };

  const removeInterest = (interest: string) => {
    setData({ ...data, interests: data.interests.filter(i => i !== interest) });
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && data.interests.length < MAX_INTERESTS) {
      addInterest(customInterest.trim());
      setCustomInterest('');
    }
  };

  const toggleLookingFor = (option: string) => {
    const current = data.lookingFor;
    if (current.includes(option)) {
      setData({ ...data, lookingFor: current.filter(o => o !== option) });
    } else {
      setData({ ...data, lookingFor: [...current, option] });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Editar Perfil {profileType === 'couple' ? 'de Pareja' : 'Individual'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personaliza tu perfil y configura tu privacidad
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Ocultar' : 'Vista Previa'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className={`${showPreview ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="interests">Intereses</TabsTrigger>
              <TabsTrigger value="privacy">Privacidad</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nombre {profileType === 'couple' && '(Pareja)'}
                    </label>
                    <Input
                      value={data.name}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                      placeholder={profileType === 'couple' ? 'Ej: Ana & Carlos' : 'Tu nombre'}
                      maxLength={50}
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Edad
                    </label>
                    <Input
                      type="number"
                      value={data.age}
                      onChange={(e) => setData({ ...data, age: parseInt(e.target.value) || 18 })}
                      min={18}
                      max={99}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ubicación
                    </label>
                    <Input
                      value={data.location}
                      onChange={(e) => setData({ ...data, location: e.target.value })}
                      placeholder="Ciudad, País"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Biografía
                      <span className="text-xs text-gray-500 ml-2">
                        {bioCharCount}/{MAX_BIO_LENGTH}
                      </span>
                    </label>
                    <textarea
                      value={data.bio}
                      onChange={(e) => setData({ ...data, bio: e.target.value.slice(0, MAX_BIO_LENGTH) })}
                      placeholder="Cuéntanos sobre ti... (Soporta Markdown: **negrita**, *cursiva*, etc.)"
                      className="w-full h-32 p-3 border rounded-lg resize-none dark:bg-gray-800 dark:border-gray-700"
                      maxLength={MAX_BIO_LENGTH}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Tip: Usa **texto** para negrita, *texto* para cursiva
                    </p>
                  </div>

                  {/* Relationship Status */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Estado de Relación
                    </label>
                    <select
                      value={data.relationshipStatus}
                      onChange={(e) => setData({ ...data, relationshipStatus: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      aria-label="Estado de Relación"
                    >
                      <option value="single">Soltero/a</option>
                      <option value="in_relationship">En una relación</option>
                      <option value="married">Casado/a</option>
                      <option value="open_relationship">Relación abierta</option>
                      <option value="polyamorous">Poliamoroso/a</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interests */}
            <TabsContent value="interests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Intereses ({data.interests.length}/{MAX_INTERESTS})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selected Interests */}
                  <div className="flex flex-wrap gap-2">
                    {data.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="pl-3 pr-1 py-1 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                        onClick={() => removeInterest(interest)}
                      >
                        {interest}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                    {data.interests.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Selecciona tus intereses abajo
                      </p>
                    )}
                  </div>

                  {/* Suggestions */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sugerencias
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_SUGGESTIONS.filter(i => !data.interests.includes(i)).map((interest) => (
                        <Badge
                          key={interest}
                          variant="outline"
                          className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900"
                          onClick={() => addInterest(interest)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Custom Interest */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Agregar Interés Personalizado
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={customInterest}
                        onChange={(e) => setCustomInterest(e.target.value)}
                        placeholder="Ej: Fotografía"
                        maxLength={30}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
                      />
                      <Button
                        onClick={addCustomInterest}
                        disabled={!customInterest.trim() || data.interests.length >= MAX_INTERESTS}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Looking For */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ¿Qué buscas?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {LOOKING_FOR_OPTIONS.map((option) => (
                        <Badge
                          key={option}
                          variant={data.lookingFor.includes(option) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleLookingFor(option)}
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy */}
            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Privacidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Visibility */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Visibilidad del Perfil
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'public', icon: Globe, label: 'Público', desc: 'Visible para todos' },
                        { value: 'members', icon: Users, label: 'Solo Miembros', desc: 'Solo usuarios registrados' },
                        { value: 'private', icon: Lock, label: 'Privado', desc: 'Solo tú y tus matches' }
                      ].map(({ value, icon: Icon, label, desc }) => (
                        <div
                          key={value}
                          onClick={() => setData({
                            ...data,
                            privacy: { ...data.privacy, profileVisibility: value as any }
                          })}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            data.privacy.profileVisibility === value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5" />
                            <div>
                              <div className="font-medium">{label}</div>
                              <div className="text-xs text-gray-500">{desc}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Photo Visibility */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Visibilidad de Fotos
                    </label>
                    <select
                      value={data.privacy.photoVisibility}
                      onChange={(e) => setData({
                        ...data,
                        privacy: { ...data.privacy, photoVisibility: e.target.value as any }
                      })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      aria-label="Visibilidad de Fotos"
                    >
                      <option value="public">Público</option>
                      <option value="members">Solo Miembros</option>
                      <option value="private">Solo Matches</option>
                    </select>
                  </div>

                  {/* Allow Messages */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ¿Quién puede enviarte mensajes?
                    </label>
                    <select
                      value={data.privacy.allowMessages}
                      onChange={(e) => setData({
                        ...data,
                        privacy: { ...data.privacy, allowMessages: e.target.value as any }
                      })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      aria-label="Quién puede enviarte mensajes"
                    >
                      <option value="everyone">Todos</option>
                      <option value="members">Solo Miembros</option>
                      <option value="matches">Solo Matches</option>
                    </select>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer">
                      <span className="font-medium">Mostrar estado en línea</span>
                      <input
                        type="checkbox"
                        checked={data.privacy.showOnlineStatus}
                        onChange={(e) => setData({
                          ...data,
                          privacy: { ...data.privacy, showOnlineStatus: e.target.checked }
                        })}
                        className="h-5 w-5 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer">
                      <span className="font-medium">Mostrar ubicación</span>
                      <input
                        type="checkbox"
                        checked={data.privacy.showLocation}
                        onChange={(e) => setData({
                          ...data,
                          privacy: { ...data.privacy, showLocation: e.target.checked }
                        })}
                        className="h-5 w-5 cursor-pointer"
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Vista Previa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Camera className="h-12 w-12 text-white opacity-50" />
                </div>

                {/* Name & Age */}
                <div>
                  <h3 className="text-xl font-bold">{data.name || 'Tu Nombre'}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {data.age} años {data.location && `• ${data.location}`}
                  </p>
                </div>

                {/* Bio */}
                {data.bio && (
                  <div className="text-sm">
                    <p className="whitespace-pre-wrap">{data.bio}</p>
                  </div>
                )}

                {/* Interests */}
                {data.interests.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Intereses</p>
                    <div className="flex flex-wrap gap-1">
                      {data.interests.slice(0, 6).map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                      {data.interests.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{data.interests.length - 6}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Looking For */}
                {data.lookingFor.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Buscando</p>
                    <div className="flex flex-wrap gap-1">
                      {data.lookingFor.map((item) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy Badge */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {data.privacy.profileVisibility === 'public' && <Globe className="h-3 w-3" />}
                    {data.privacy.profileVisibility === 'members' && <Users className="h-3 w-3" />}
                    {data.privacy.profileVisibility === 'private' && <Lock className="h-3 w-3" />}
                    <span className="capitalize">{data.privacy.profileVisibility}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdvancedProfileEditor;

