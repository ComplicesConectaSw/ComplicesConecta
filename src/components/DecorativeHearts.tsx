import { Heart } from "lucide-react";

interface DecorativeHeartsProps {
  count?: number;
  className?: string;
}

export const DecorativeHearts: React.FC<DecorativeHeartsProps> = ({ 
  count = 6,
  className = '' 
}) => {
  // Generar posiciones aleatorias para los corazones
  // Usar posiciones predefinidas para mejor distribución
  const positions = [
    { top: '15%', left: '10%' },
    { top: '25%', right: '15%' },
    { top: '45%', left: '8%' },
    { top: '60%', right: '12%' },
    { top: '75%', left: '20%' },
    { top: '35%', right: '25%' },
    { top: '55%', left: '85%' },
    { top: '80%', right: '18%' },
    { top: '20%', left: '75%' },
    { top: '70%', right: '80%' },
  ];

  const hearts = Array.from({ length: count }, (_, i) => {
    const pos = positions[i % positions.length];
    const heartData: {
      id: number;
      top?: string;
      left?: string;
      right?: string;
      bottom?: string;
      size: number;
      delay: number;
      duration: number;
      opacity: number;
    } = {
      id: i,
      size: Math.random() * 16 + 12, // Entre 12px y 28px - más grandes
      delay: i * 0.8, // Delay escalonado más espaciado
      duration: Math.random() * 4 + 8, // Entre 8s y 12s - más lentas
      opacity: Math.random() * 0.4 + 0.3, // Entre 0.3 y 0.7 - más visibles
    };
    
    if ('top' in pos && typeof pos.top === 'string') heartData.top = pos.top;
    if ('left' in pos && typeof pos.left === 'string') heartData.left = pos.left;
    if ('right' in pos && typeof pos.right === 'string') heartData.right = pos.right;
    if ('bottom' in pos && typeof pos.bottom === 'string') heartData.bottom = pos.bottom;
    
    return heartData;
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {hearts.map((heart) => (
        <Heart
          key={heart.id}
          className="absolute text-white animate-float"
          style={{
            ...(heart.top && { top: heart.top }),
            ...(heart.left && { left: heart.left }),
            ...(heart.right && { right: heart.right }),
            ...(heart.bottom && { bottom: heart.bottom }),
            width: `${heart.size}px`,
            height: `${heart.size}px`,
            opacity: heart.opacity,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.5))',
          }}
          fill="currentColor"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
      ))}
    </div>
  );
};

export default DecorativeHearts;

