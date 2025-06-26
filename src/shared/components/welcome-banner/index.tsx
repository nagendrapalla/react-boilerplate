import React, { memo } from "react";
import { motion } from "framer-motion";

interface WelcomeBannerProps {
  name: string;
  imageSrc: string;
  imageAlt?: string;
  subText?: string;
  imageSize?: string;
  containerClassName?: string;
}

const WelcomeBannerComponent: React.FC<WelcomeBannerProps> = ({ 
  name, 
  imageSrc, 
  imageAlt = "Welcome Banner",
  subText,
  imageSize = "h-48",
  containerClassName = "welcome-container",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={containerClassName}
    >
      <div className="welcome-content">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="welcome-heading"
        >
          Welcome, {name}!
        </motion.h1>
        {subText && (
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="welcome-subtext text-white"
          >
            {subText}
          </motion.p>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="welcome-image-container"
      >
        <img className={imageSize} src={imageSrc} alt={imageAlt} />
      </motion.div>
    </motion.div>
  );
};

export const WelcomeBanner = memo(WelcomeBannerComponent);
WelcomeBanner.displayName = "WelcomeBanner";
