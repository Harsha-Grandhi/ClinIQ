import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageWrapper({ children, className = '', noPadding = false }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`min-h-screen ${noPadding ? '' : 'px-4 md:px-6 py-6 pb-20 md:pb-6'} ${className}`}
    >
      {children}
    </motion.div>
  );
}
