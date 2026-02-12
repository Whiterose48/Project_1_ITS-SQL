import React, { useState, useEffect } from 'react';

const CAPOO_GIFS = [
  "https://media.giphy.com/media/DVwUa7CmyEqAERURvo/giphy.gif",
  "https://media.giphy.com/media/kom58KCfnj8iGYGIdm/giphy.gif",
  "https://media.giphy.com/media/BvVHOQO7bLpN6zTwHH/giphy.gif",
  "https://media.giphy.com/media/Idx3Hj8UkVvkrOWNUN/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bW9qcXkxcGM0NnJiYmdjNGZ1Nzh6bm84cHFnZzRta2trZjVuMHBkdCZlcD12MV9zdGlja2Vyc19yZWxhdGVkJmN0PXM/SvK7Gxcq4QS4fNNjYH/giphy.gif",
  "https://media.giphy.com/media/jUKgHmzGqEo37AxKmq/giphy.gif",
  "https://media.giphy.com/media/9XY4f3FgFTT4QlaYqa/giphy.gif",
  "https://media.giphy.com/media/SL8v0BVfcT8kDPC1Na/giphy.gif",
  "https://media.giphy.com/media/5Yfcn9JO3ZMN6YtXPJ/giphy.gif",
  "https://media.giphy.com/media/ulLgsbxE3suN8LzK65/giphy.gif",
  "https://media.giphy.com/media/1wPCSFeSSKMAiXBFQi/giphy.gif"
];

export default function FeedbackOverlay({ isVisible }) {
  const [randomGif, setRandomGif] = useState(CAPOO_GIFS[0]);

  useEffect(() => {
    if (isVisible) {
      const randomIndex = Math.floor(Math.random() * CAPOO_GIFS.length);
      setRandomGif(CAPOO_GIFS[randomIndex]);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="animate-in zoom-in duration-300">
        <img 
          src={randomGif} 
          alt="Capoo Feedback" 
          className="w-96 h-96 object-contain" 
        />
      </div>
    </div>
  );
}