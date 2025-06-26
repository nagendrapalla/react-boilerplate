import { useState, useEffect } from 'react';

type ConfettiPiece = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  vx: number;
  vy: number;
  vr: number;
};

type ConfettiProps = {
  active: boolean;
  duration?: number;
  particleCount?: number;
};

const COLORS = [
  '#5D8AA8', // Blue
  '#E32636', // Red
  '#FFBF00', // Amber
  '#9966CC', // Amethyst
  '#7CB9E8', // Blue
  '#F0DC82', // Buff
  '#00CC99', // Caribbean Green
  '#873260', // Claret
  '#FB9B93', // Coral Pink
  '#B87333', // Copper
  '#00FFFF', // Cyan
  '#0047AB', // Cobalt
  '#FF7F50', // Coral
];

export function Confetti({ 
  active = false, 
  duration = 4000, 
  particleCount = 150 
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(false);

  // Initialize confetti when active changes to true
  useEffect(() => {
    if (active && !visible) {
      // Make confetti visible
      setVisible(true);
      
      // Create confetti pieces
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < particleCount; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * -100,
          size: Math.random() * 10 + 5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: Math.random() * 360,
          vx: Math.random() * 6 - 3,
          vy: Math.random() * 2 + 2,
          vr: Math.random() * 3 - 1.5,
        });
      }
      setPieces(newPieces);

      // Set timeout to hide confetti after duration
      const timer = setTimeout(() => {
        setVisible(false);
        setPieces([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, particleCount, visible]);

  // Animation frame for moving confetti pieces
  useEffect(() => {
    if (!visible || pieces.length === 0) return;

    let animationFrameId: number;
    const updateConfetti = () => {
      setPieces((currentPieces) => {
        return currentPieces.map((piece) => {
          // Update position and rotation
          return {
            ...piece,
            x: piece.x + piece.vx,
            y: piece.y + piece.vy,
            rotation: piece.rotation + piece.vr,
            // Increase vertical speed (gravity)
            vy: piece.vy + 0.1,
          };
        }).filter(piece => piece.y < window.innerHeight + 100); // Remove pieces that are off-screen
      });
      animationFrameId = requestAnimationFrame(updateConfetti);
    };
    
    animationFrameId = requestAnimationFrame(updateConfetti);
    return () => cancelAnimationFrame(animationFrameId);
  }, [visible, pieces]);

  if (!visible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          style={{
            position: 'absolute',
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: '2px',
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
