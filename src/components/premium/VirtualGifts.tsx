import { useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/ui/Button";
import { Gift, Crown, Send } from "lucide-react";
import { safeGetItem } from '@/utils/safeLocalStorage';

// Check if user is in demo mode
const isDemoMode = () => {
  return safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' }) === 'true';
};

import { useFeatures } from "@/hooks/useFeatures";
import { mockVirtualGifts, VirtualGift } from "@/lib/data";

interface VirtualGiftsProps {
  recipientName?: string;
  onSendGift?: (gift: VirtualGift) => void;
}

const VirtualGifts = ({ recipientName, onSendGift }: VirtualGiftsProps) => {
  const { features } = useFeatures();
  const [gifts] = useState<VirtualGift[]>(mockVirtualGifts);
  const [selectedGift, setSelectedGift] = useState<VirtualGift | null>(null);
  const [message, setMessage] = useState('');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'romantic':
        return 'from-pink-500 to-red-500';
      case 'luxury':
        return 'from-yellow-500 to-orange-500';
      case 'fun':
        return 'from-blue-500 to-purple-500';
      case 'special':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatPrice = (price: number) => {
    return `${price} tokens`;
  };

  const handleSendGift = () => {
    if (selectedGift && onSendGift) {
      onSendGift(selectedGift);
      setSelectedGift(null);
      setMessage('');
    }
  };

  if (!features.virtualGifts && !isDemoMode()) {
    return (
      <Card className="p-8 text-center bg-black/30 backdrop-blur-sm border-white/10">
        <Gift className="h-16 w-16 mx-auto mb-4 text-white/50" />
        <h3 className="text-xl font-semibold text-white mb-2">Regalos Virtuales</h3>
        <p className="text-white/70 mb-4">
          Envía regalos especiales para expresar tu interés con tu membresía Premium.
        </p>
        <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
          <Crown className="h-4 w-4 mr-2" />
          Actualizar a Premium
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
          <Gift className="h-6 w-6 mr-2 text-pink-400" />
          Regalos Virtuales
        </h2>
        {recipientName && (
          <p className="text-white/70">Envía un regalo especial a {recipientName}</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {gifts.map((gift) => (
          <Card 
            key={gift.id}
            className="p-4 bg-black/30 backdrop-blur-sm border-white/10 hover:scale-105 transition-transform cursor-pointer text-center"
            onClick={() => setSelectedGift(gift)}
          >
            <div className="text-4xl mb-2">{gift.icon}</div>
            <h3 className="font-semibold text-white mb-1">{gift.name}</h3>
            <p className="text-white/70 text-xs mb-3 line-clamp-2">{gift.description}</p>
            
            <div className="flex items-center justify-between">
              <Badge 
                className={`bg-gradient-to-r ${getCategoryColor(gift.category)} text-white text-xs`}
              >
                {gift.category}
              </Badge>
              <span className="text-yellow-400 font-bold text-sm">
                {formatPrice(gift.price)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de regalo */}
      {selectedGift && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-black/90 backdrop-blur-sm border-white/20">
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">{selectedGift.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{selectedGift.name}</h3>
              <p className="text-white/70 mb-4">{selectedGift.description}</p>
              
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Badge 
                  className={`bg-gradient-to-r ${getCategoryColor(selectedGift.category)} text-white`}
                >
                  {selectedGift.category}
                </Badge>
                <span className="text-yellow-400 font-bold text-lg">
                  {formatPrice(selectedGift.price)}
                </span>
              </div>

              {recipientName && (
                <div className="mb-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Añade un mensaje personal (opcional)..."
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none"
                    rows={3}
                  />
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleSendGift}
                  className={`flex-1 bg-gradient-to-r ${getCategoryColor(selectedGift.category)} hover:opacity-90 text-white`}
                  disabled={!recipientName}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {recipientName ? `Enviar a ${recipientName}` : 'Enviar Regalo'}
                </Button>
                <Button
                  onClick={() => setSelectedGift(null)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VirtualGifts;
