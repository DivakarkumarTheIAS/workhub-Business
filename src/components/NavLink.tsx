import type { NavLinkProps as RouterNavLinkProps } from "react-router-dom";
import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps extends RouterNavLinkProps {
    activeClassName?: string;
}

export const NavLink = ({ className, activeClassName, ...props }: NavLinkProps) => {
    return (
        <RouterNavLink
            {...props}
            className={(navLinkProps) =>
                cn(
                    typeof className === "function" ? className(navLinkProps) : className,
                    navLinkProps.isActive && activeClassName
                )
            }
        />
    );
};
