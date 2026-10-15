import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Flame, Zap, BookOpen, ArrowUpRight, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
}

interface PromptCardData {
  id: string;
  tag: string;
  title: string;
  prompt: string;
  icon: React.ReactNode;
  accent: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  const promptCards: PromptCardData[] = [
    {
      id: 'chest-day',
      tag: 'PUSH FOCUS',
      title: 'CHEST DAY',
      prompt: 'Build my perfect chest workout.',
      icon: <Dumbbell className="w-5 h-5 text-neon-400" />,
      accent: 'group-hover:border-neon-400/50 group-hover:shadow-[0_0_20px_rgba(200,245,60,0.15)]',
    },
    {
      id: 'back-biceps',
      tag: 'PULL FOCUS',
      title: 'BACK & BICEPS',
      prompt: 'Help me plan my pull-day session.',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      accent: 'group-hover:border-amber-400/50 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]',
    },
    {
      id: 'leg-day',
      tag: 'LOWER BODY',
      title: 'LEG DAY',
      prompt: 'Give me a complete leg workout.',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      accent: 'group-hover:border-emerald-400/50 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]',
    },
    {
      id: 'exercise-guide',
      tag: 'TECHNIQUE & FORM',
      title: 'EXERCISE GUIDE',
      prompt: 'Teach me how to perform an exercise.',
      icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
      accent: 'group-hover:border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-8 text-center max-w-3xl mx-auto">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon-500/10 border border-neon-500/20 text-neon-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-neon-sm"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>TRAIN SMARTER. GET STRONGER.</span>
      </motion.div>

      {/* Main Greeting */}
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4"
      >
        Hey, Athlete! <span className="inline-block animate-pulse">💪</span>
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-4 font-normal"
      >
        I'm <strong className="text-white font-semibold">FitBot AI</strong>, your personal gym companion. Ask me for a workout, learn proper exercise techniques, or get answers to your fitness questions.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.24 }}
        className="text-neon-400 text-sm sm:text-base font-semibold tracking-wide uppercase mb-10"
      >
        What's your goal today?
      </motion.p>

      {/* 4 Prompt Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left"
      >
        {promptCards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelectPrompt(card.prompt)}
            className={`group relative p-4 rounded-xl glass-panel border border-white/5 hover:bg-dark-800/90 transition-all duration-300 text-left ${card.accent}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-dark-750 border border-white/5 group-hover:scale-110 transition-transform duration-200">
                  {card.icon}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    {card.tag}
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-wide group-hover:text-neon-400 transition-colors">
                    {card.title}
                  </h3>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-neon-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>

            <p className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">
              "{card.prompt}"
            </p>
          </button>
        ))}
      </motion.div>
    </div>
  );
};
