import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ClayCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const ClayCard = ({ children, className, hoverEffect = true }: ClayCardProps) => {
    return (
        <motion.div
            whileHover={hoverEffect ? { y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" } : {}}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
                "clay-card p-6",
                className
            )}
        >
            {children}
        </motion.div>
    );
};
