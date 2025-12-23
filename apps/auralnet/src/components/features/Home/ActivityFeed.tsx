import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Activity {
  id: string;
  type: 'business' | 'volunteer' | 'impact';
  icon: string;
  text: string;
  time: string;
}

const MOCK_ACTIVITIES: Omit<Activity, 'id' | 'time'>[] = [
  { type: 'impact', icon: '🚀', text: 'Project Initialized' },
  { type: 'impact', icon: '⚖️', text: 'Legal Entity Formed' },
  { type: 'volunteer', icon: '👩‍💻', text: 'First Volunteer Joined' },
  { type: 'business', icon: '🏪', text: 'Pilot Business Identified' },
  { type: 'impact', icon: '🎨', text: 'Brand Identity Finalized' },
  { type: 'volunteer', icon: '📝', text: 'Drafted Mission Statement' },
  { type: 'business', icon: '🤝', text: 'First Community Partner' },
  { type: 'impact', icon: '🌐', text: 'Website MVP Deployed' },
];

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Initialize with some data
  useEffect(() => {
    const initial: Activity[] = MOCK_ACTIVITIES.slice(0, 4).map((a, i) => ({
      ...a,
      id: `init-${i}`,
      time: `${(i + 1) * 2}m ago`,
    }));
    setActivities(initial);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomItem = MOCK_ACTIVITIES[Math.floor(Math.random() * MOCK_ACTIVITIES.length)];
      const newActivity: Activity = {
        ...randomItem,
        id: Date.now().toString(),
        time: 'Just now',
      };

      setActivities((prev) => {
        // Add to top, keep max 5
        const updated = [newActivity, ...prev].slice(0, 5);
        // Update times for older ones roughly
        return updated.map((item, index) => {
          if (index === 0) return item;
          return { ...item, time: `${index * 5}m ago` }; // Fake time aging
        });
      });
    }, 3500); // New item every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="perspective-1000 relative flex h-[600px] w-full flex-col items-center justify-center overflow-hidden">
      {/* Background Glow */}
      <div className="bg-neon-400/10 animate-pulse-slow pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"></div>

      <div className="relative h-[400px] w-full max-w-[400px]">
        <AnimatePresence initial={false}>
          {activities.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{
                opacity: 1,
                y: index * -80, // Stack them upwards
                scale: 1 - index * 0.05, // Shrink slightly as they go up
                zIndex: 10 - index,
              }}
              exit={{ opacity: 0, y: -100, scale: 0.8 }}
              transition={{ duration: 0.8, ease: 'backOut' }}
              className="absolute right-0 bottom-0 left-0"
              style={{ transformOrigin: 'center bottom' }}
            >
              {/* Glass Card Implementation (CSS Modules would be better but using Tailwind directly) */}
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl">
                    {item.icon}
                  </div>
                  <p className="truncate font-mono text-sm font-bold text-white">{item.text}</p>
                </div>
                <p className="text-neon-400 flex-shrink-0 font-sans text-xs font-medium whitespace-nowrap">
                  {item.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Decorative Elements */}
      <div className="bg-accent-blue pointer-events-none absolute top-20 right-20 h-4 w-4 animate-ping rounded-full"></div>
      <div
        className="bg-secondary pointer-events-none absolute bottom-40 left-10 h-3 w-3 animate-ping rounded-full"
        style={{ animationDelay: '1s' }}
      ></div>
    </div>
  );
};

export default ActivityFeed;
