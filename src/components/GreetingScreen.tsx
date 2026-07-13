import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const HELLOS = [
  "Hello",        // English
  "Hola",         // Spanish
  "Bonjour",      // French
  "Hallo",        // German
  "Ciao",         // Italian
  "こんにちは",     // Japanese
  "你好",          // Chinese
  "안녕하세요",      // Korean
  "नमस्ते",        // Hindi
  "Olá",          // Portuguese
  "Привет",       // Russian
  "Marhaba",      // Arabic
];

interface GreetingScreenProps {
  onFinish: () => void;
}

export default function GreetingScreen({ onFinish }: GreetingScreenProps) {
  const [index, setIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isExiting) return;

    const timer = setInterval(() => {
      setIndex((prev) => {
        if (prev === HELLOS.length - 1) {
          clearInterval(timer);
          setTimeout(() => setIsExiting(true), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500); // 1.5s per language for that "buttery smooth" feel

    return () => clearInterval(timer);
  }, [isExiting]);

  useEffect(() => {
    if (isExiting) {
      const finishTimer = setTimeout(() => {
        onFinish();
      }, 1000);
      return () => clearTimeout(finishTimer);
    }
  }, [isExiting, onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-[100] bg-white flex items-center justify-center overflow-hidden"
    >
      <div className="relative h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.h1
            key={index}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
            transition={{ 
              duration: 0.8, 
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.6 }
            }}
            className="text-5xl md:text-7xl font-semibold text-black tracking-tight text-center"
          >
            {HELLOS[index]}
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* Subtle indicator of progress */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5">
        {HELLOS.map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: i === index ? 1.2 : 1,
              opacity: i === index ? 1 : 0.2,
              backgroundColor: i === index ? '#000' : '#ccc'
            }}
            className="w-1.5 h-1.5 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}
