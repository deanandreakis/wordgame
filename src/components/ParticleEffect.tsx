import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, Dimensions} from 'react-native';
import {GAME_CONFIG, ANIMATIONS} from '@/config/constants';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
  opacity: Animated.Value;
  translateX: Animated.Value;
  translateY: Animated.Value;
  rotate: Animated.Value;  // Add rotation for firefly effect
}

interface Props {
  x: number;
  y: number;
  color?: string;
  count?: number;
}

const {width, height} = Dimensions.get('window');

export const ParticleEffect: React.FC<Props> = ({
  x,
  y,
  color = GAME_CONFIG.COLORS.primary,
  count = 12,
}) => {
  const particles = useRef<Particle[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    // Stop any running animations
    animationsRef.current.forEach(anim => anim.stop());
    animationsRef.current = [];

    // Generate particles - firefly-like floating effect
    particles.current = Array.from({length: count}, (_, i) => {
      const angle = (Math.PI * 2 * i) / count;
      const velocity = (2 + Math.random() * 3) * 0.7;  // Reduced by 30% for floating effect
      const spiralFactor = 0.8 + Math.random() * 0.4;  // Varying speeds for spiral

      return {
        id: i,
        x,
        y,
        size: 4 + Math.random() * 8,
        color: [
          GAME_CONFIG.COLORS.glowGreen,  // Firefly effect
          GAME_CONFIG.COLORS.accent,      // Moss green
          GAME_CONFIG.COLORS.dewDrop,     // Light mint
          GAME_CONFIG.COLORS.success,     // Leaf green
        ][Math.floor(Math.random() * 4)],
        velocityX: Math.cos(angle) * velocity * spiralFactor,
        velocityY: Math.sin(angle) * velocity,
        opacity: new Animated.Value(1),
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        rotate: new Animated.Value(0),  // Initial rotation
      };
    });

    // Animate particles with rotation and spiral motion
    particles.current.forEach(particle => {
      const rotationDirection = Math.random() > 0.5 ? 1 : -1;  // Random spin direction

      const animation = Animated.parallel([
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: ANIMATIONS.PARTICLE_LIFETIME,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateX, {
          toValue: particle.velocityX * 100,
          duration: ANIMATIONS.PARTICLE_LIFETIME,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: particle.velocityY * 100,
          duration: ANIMATIONS.PARTICLE_LIFETIME,
          useNativeDriver: true,
        }),
        Animated.timing(particle.rotate, {
          toValue: rotationDirection * 360,  // Full rotation
          duration: ANIMATIONS.PARTICLE_LIFETIME,
          useNativeDriver: true,
        }),
      ]);
      animationsRef.current.push(animation);
      animation.start();
    });

    // Cleanup function to stop all animations
    return () => {
      animationsRef.current.forEach(anim => anim.stop());
      animationsRef.current = [];
    };
  }, [x, y, count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map(particle => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              transform: [
                {translateX: particle.translateX},
                {translateY: particle.translateY},
                {
                  rotate: particle.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
});
