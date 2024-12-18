'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const newsItems = [
  '1. Breaking News: New Technology Emerges ',
  '2. Sports Update: Local Team Wins Championship!',
  '3. Market Trends: Stocks Surge to All-Time High!',
  '4. Weather Alert: Heavy Rain Predicted Tomorrow.',
  '5. Entertainment: New Movie Tops Box Office Charts!',
  '6. Breaking News: New Technology Emerges!',
  '7. Sports Update: Local Team Wins Championship!',
  '8. Market Trends: Stocks Surge to All-Time High!',
  '9. Weather Alert: Heavy Rain Predicted Tomorrow.',
  '10. Entertainment: New Movie Tops Box Office Charts!',
];

export default function UpscrollingFeed() {
  const [news, setNews] = useState(newsItems);

  useEffect(() => {
    const interval = setInterval(() => {
      setNews((prevNews) => {
        const [first, ...rest] = prevNews;
        return [...rest, first]; // Move the first item to the end for infinite loop effect
      });
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="mr-0 w-full border border-gray-300 rounded bg-white shadow-md overflow-auto dark:bg-gray-800 dark:border-gray-600">
      {/* Header */}
      <div className="bg-orange-500 px-3 py-2 border-b border-gray-300 dark:border-gray-600 h-8 justify-center sticky top-0">
        <h2 className="text-sm font-semibold text-white">News and Events</h2>
      </div>

      {/* News Feed */}
      <div className="relative h-40 sm:h-60 md:h-80 lg-h:96 w-full overflow-hidden text-xs bg-gray-200 dark:text-gray-300 dark:bg-gray-900 min-h-[50vh] max-h-[80vh]">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: -100 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute w-full space-y-2"
        >
          {news.map((item, index) => (
            <div
              key={index}
              className="px-4 py-2 text-black text-sm sm:text-xs dark:text-gray-300 whitespace-normal break-words"
            >
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
