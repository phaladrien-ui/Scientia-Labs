// components/chat/inspiration-gallery.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const images = [
  { src: "/images/image1.png", alt: "Design moderne" },
  { src: "/images/image2.png", alt: "Interface élégante" },
  { src: "/images/image3.png", alt: "Style créatif" },
];

export function InspirationGallery() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-2 mt-4"
      initial={{ opacity: 0, y: 8 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      {images.map((img) => (
        <div
          className="overflow-hidden rounded-xl border border-border/30 bg-muted/20 transition-all hover:border-border/50 hover:shadow-sm"
          key={img.src}
        >
          <Image
            alt={img.alt}
            className="object-cover"
            height={120}
            src={img.src}
            unoptimized
            width={190}
          />
        </div>
      ))}
    </motion.div>
  );
}
