import { useState, useEffect } from 'react';

/**
 * Simulated Growth Data Interface
 */
export interface SimulatedData {
  volunteerCount: number;
  businessesServed: number;
  impactDollars: number;
  hoursContributed: number;
}

/**
 * useSimulatedData Hook
 *
 * Implements the PRD's simulated growth algorithm for the Transparency Dashboard.
 * Calculates metrics based on time elapsed since launch date.
 *
 * Algorithm (from PRD Section 4.5):
 * - monthsPassed = (CurrentDate - "2024-01-01") in months
 * - VolunteerCount = 20 + (monthsPassed * 5.5)
 * - ImpactDollars = 5000 + (monthsPassed * 4200)
 * - BusinessesServed = 10 + (monthsPassed * 3.2)
 * - HoursContributed = 500 + (monthsPassed * 125)
 *
 * @param launchDate Optional launch date (defaults to 2024-01-01)
 * @returns {SimulatedData} Calculated metrics
 */
export function useSimulatedData(launchDate: Date = new Date('2024-01-01')): SimulatedData {
  const [data, setData] = useState<SimulatedData>({
    volunteerCount: 20,
    businessesServed: 10,
    impactDollars: 5000,
    hoursContributed: 500,
  });

  useEffect(() => {
    // Calculate months passed since launch
    const now = new Date();
    const timeDiff = now.getTime() - launchDate.getTime();
    const monthsPassed = timeDiff / (1000 * 60 * 60 * 24 * 30.44); // Average days per month

    // Apply growth formulas
    const calculatedData: SimulatedData = {
      volunteerCount: Math.round(20 + monthsPassed * 5.5),
      businessesServed: Math.round(10 + monthsPassed * 3.2),
      impactDollars: Math.round(5000 + monthsPassed * 4200),
      hoursContributed: Math.round(500 + monthsPassed * 125),
    };

    setData(calculatedData);
  }, [launchDate]);

  return data;
}

/**
 * useAnimatedNumber Hook
 *
 * Animates a number from 0 to target value using spring animation.
 * Used in conjunction with useSimulatedData for dashboard metrics.
 *
 * @param target The target number to animate to
 * @param duration Animation duration in milliseconds (default: 2000)
 * @returns {number} Current animated value
 */
export function useAnimatedNumber(target: number, duration: number = 2000): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out quad easing for smooth deceleration
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);

      setCurrent(Math.floor(target * easeOutQuad));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return current;
}
