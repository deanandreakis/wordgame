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

  useEffect(() => {
    // Generate particles
    particles.current = Array.from({length: count}, (_, i) => {
      const angle = (Math.PI * 2 * i) / count;
      const velocity = 2 + Math.random() * 3;

      return {
        id: i,
        x,
        y,
        size: 4 + Math.random() * 8,
        color: [
          GAME_CONFIG.COLORS.primary,
          GAME_CONFIG.COLORS.accent,
          GAME_CONFIG.COLORS.warning,
          GAME_CONFIG.COLORS.success,
        ][Math.floor(Math.random() * 4)],
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity,
        opacity: new Animated.Value(1),
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
      };
    });

    // Animate particles
    particles.current.forEach(particle => {
      Animated.parallel([
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
      ]).start();
    });
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
