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
      // Valores deterministas basados en el índice para evitar Math.random en render
      size: 16 + (i % 5) * 4, // 16,20,24,28,32
      delay: i * 1.2, // Delay escalonado más espaciado para mejor distribución
      duration: 12 + (i % 4) * 2, // 12,14,16,18
      opacity: 0.5 + ((i % 6) * 0.1), // 0.5 a 1.0
    };
    
    if ('top' in pos && typeof pos.top === 'string') heartData.top = pos.top;
    if ('left' in pos && typeof pos.left === 'string') heartData.left = pos.left;
    if ('right' in pos && typeof pos.right === 'string') heartData.right = pos.right;
    if ('bottom' in pos && typeof pos.bottom === 'string') heartData.bottom = pos.bottom;
    
    return heartData;
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} style={{ willChange: 'transform' }}>
      {hearts.map((heart) => (
        <Heart
          key={heart.id}
          className="absolute text-white animate-float-heart-slow"
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
            filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.6))',
            willChange: 'transform, opacity',
            transform: 'translateZ(0)', // Force hardware acceleration
          }}
          fill="currentColor"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.5"
        />
      ))}
    </div>
  );
};

export default DecorativeHearts;

