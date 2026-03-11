import { Search, Bell, Menu, Briefcase, Users, UserCog, ChevronDown, User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

const TopNavbar = () => {
    const { user } = useDashboard();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const isDarkBg = location.pathname === "/" || location.pathname.startsWith("/talents") || location.pathname === "/premium";

    if (!user) return null;

    return (
        <nav className={`h-14 fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 flex items-center justify-center ${isScrolled
            ? "bg-[#191B2D]/95 backdrop-blur-md border-b border-white/5 shadow-xl"
            : isDarkBg ? "bg-transparent" : "bg-white/80 backdrop-blur-md border-b border-slate-100"
            }`}>
            <div className={`max-w-[1400px] w-full flex items-center justify-between transition-colors duration-300 ${isDarkBg || isScrolled ? "text-white" : "text-slate-900"}`}>
                {/* Logo */}
                <Link to="/" className="flex items-center group px-1">
                    <div className={`h-10 w-auto transition-transform group-hover:scale-110 ${!isDarkBg && !isScrolled ? "brightness-0 opacity-80" : ""}`}>
                        <img src="/src/assets/qwok.svg" alt="Qwok Business" className="h-full w-auto object-contain" />
                    </div>
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-1">
                    <Link
                        to="/"
                        className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${location.pathname === "/"
                            ? (isDarkBg || isScrolled ? "bg-white/10 text-white" : "bg-slate-900 text-white")
                            : (isDarkBg || isScrolled ? "text-white/60 hover:text-white" : "text-slate-500 hover:text-slate-900")
                            }`}
                    >
                        Dashboard
                    </Link>

                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-medium outline-none transition-all ${location.pathname.startsWith("/talents")
                            ? (isDarkBg || isScrolled ? "bg-white/10 text-white" : "bg-slate-100 text-slate-900")
                            : (isDarkBg || isScrolled ? "text-white/60 hover:text-white" : "text-slate-500 hover:text-slate-900")
                            }`}>
                            Talent Hub
                            <ChevronDown className="size-3 opacity-50" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-[#191B2D] border-white/5 text-white p-1 rounded-xl shadow-2xl">
                            <DropdownMenuItem asChild className="focus:bg-white/10 rounded-lg cursor-pointer">
                                <Link to="/talents/jobs" className="flex items-center gap-2.5 py-2 px-3">
                                    <Briefcase className="size-3.5 text-indigo-400" />
                                    <span className="text-[12px] font-medium">Job Hub</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="focus:bg-white/10 rounded-lg cursor-pointer">
                                <Link to="/talents/freelance" className="flex items-center gap-2.5 py-2 px-3">
                                    <Users className="size-3.5 text-emerald-400" />
                                    <span className="text-[12px] font-medium">Freelance Hub</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link
                        to="/premium"
                        className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all text-amber-500 ${location.pathname === "/premium"
                            ? (isDarkBg || isScrolled ? "bg-white/10 text-white" : "bg-slate-900 text-white")
                            : (isDarkBg || isScrolled ? "text-amber-500/60 hover:text-amber-500" : "text-amber-600 hover:text-amber-700")
                            }`}
                    >
                        Premium
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center relative group">
                        <Search className={`absolute left-3 size-3.5 opacity-30 ${isDarkBg || isScrolled ? "text-white" : "text-slate-900"}`} />
                        <input
                            type="text"
                            placeholder="Search hubs..."
                            className={`pl-9 pr-4 py-1.5 rounded-lg text-[11px] font-medium w-32 focus:w-48 transition-all outline-none ${isDarkBg || isScrolled ? "bg-white/5 border-white/5 text-white focus:bg-white/10" : "bg-slate-100 border-transparent text-slate-900 focus:bg-white focus:border-slate-200"
                                }`}
                        />
                    </div>

                    <button className="relative p-1 opacity-60 hover:opacity-100 transition-opacity">
                        <Bell className="size-4" />
                        <span className="absolute top-0 right-0 size-1.5 bg-rose-500 rounded-full border border-[#191B2D]" />
                    </button>

                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="outline-none">
                            <div className="size-8 rounded-lg overflow-hidden border border-white/10 hover:ring-4 hover:ring-white/5 transition-all">
                                <img src={user.companyLogo || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`} alt={user.displayName} className="size-full object-cover" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#191B2D] border-white/5 text-white p-1.5 rounded-2xl shadow-2xl">
                            <div className="px-3 py-2 mb-1">
                                <p className="text-[11px] font-medium uppercase tracking-widest text-white/30">Authenticated User</p>
                                <p className="text-sm font-medium truncate">{user.displayName}</p>
                            </div>
                            <DropdownMenuSeparator className="bg-white/5 mx-1" />
                            <DropdownMenuItem asChild className="focus:bg-white/10 rounded-xl cursor-copy px-3 py-2">
                                <Link to="/profile" className="flex items-center gap-3">
                                    <User className="size-4 text-indigo-400" />
                                    <span className="text-[12px] font-medium">Profile Details</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="focus:bg-white/10 rounded-xl cursor-copy px-3 py-2">
                                <Link to="/settings" className="flex items-center gap-3">
                                    <UserCog className="size-4 text-slate-400" />
                                    <span className="text-[12px] font-medium">System Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5 mx-1" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="focus:bg-rose-500/10 text-rose-400 focus:text-rose-400 rounded-xl cursor-pointer px-3 py-2"
                            >
                                <div className="flex items-center gap-3">
                                    <LogOut className="size-4" />
                                    <span className="text-[12px] font-medium">Sign Out</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <button className="md:hidden p-1 opacity-60 hover:opacity-100">
                                <Menu className="size-5" />
                            </button>
                        </SheetTrigger>
                        <SheetContent className="bg-[#191B2D] border-white/5 text-white">
                            <div className="flex flex-col gap-6 pt-12">
                                <Link to="/" onClick={() => setMobileOpen(false)} className="text-lg font-medium">Dashboard</Link>
                                <Link to="/talents/jobs" onClick={() => setMobileOpen(false)} className="text-lg font-medium">Job Hub</Link>
                                <Link to="/talents/freelance" onClick={() => setMobileOpen(false)} className="text-lg font-medium">Freelance Hub</Link>
                                <Link to="/premium" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-amber-500">Premium Upgrade</Link>
                                <Link to="/settings" onClick={() => setMobileOpen(false)} className="text-lg font-medium">Settings</Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
};

export default TopNavbar;
