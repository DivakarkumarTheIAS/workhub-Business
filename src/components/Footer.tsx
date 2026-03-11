import { Mail, Phone, MapPin, Linkedin, Twitter, Github, Facebook, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#191B2D] border-t border-white/5">
            {/* Main Footer Content */}
            <div className="max-w-[1400px] mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-2">Qwok Business</h3>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Connect with talent, manage projects, and grow your business on a unified platform.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg bg-white/5 hover:bg-indigo-600 text-white/60 hover:text-white flex items-center justify-center transition-all group">
                                <Linkedin className="size-4 group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg bg-white/5 hover:bg-sky-500 text-white/60 hover:text-white flex items-center justify-center transition-all group">
                                <Twitter className="size-4 group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg bg-white/5 hover:bg-slate-700 text-white/60 hover:text-white flex items-center justify-center transition-all group">
                                <Github className="size-4 group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg bg-white/5 hover:bg-blue-600 text-white/60 hover:text-white flex items-center justify-center transition-all group">
                                <Facebook className="size-4 group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>

                    {/* For Business */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wide">For Business</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    Dashboard
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </li>
                            <li>
                                <Link to="/talents/jobs" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    Job Hub
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </li>
                            <li>
                                <Link to="/talents/freelance" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    Freelance Hub
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </li>
                            <li>
                                <Link to="/premium" className="text-white/60 hover:text-amber-500 text-sm transition-colors flex items-center gap-1.5 group">
                                    Premium Plans
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </li>
                            <li>
                                <Link to="/become-owner" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    Become an Owner
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wide">Account</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/profile" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    My Profile
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </li>
                            <li>
                                <Link to="/edit-profile" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    Edit Profile
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </li>
                            <li>
                                <Link to="/settings" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    Settings
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    Billing
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    Security
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wide">Resources</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    Documentation
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    Blog
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    Community
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    API Reference
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                                    Status Page
                                    <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wide">Support & Contact</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="size-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[11px] uppercase tracking-widest text-white/40 font-medium">Email Support</p>
                                    <a href="mailto:support@qwok.business" className="text-white hover:text-indigo-400 text-sm font-medium transition-colors">
                                        support@qwok.business
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="size-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[11px] uppercase tracking-widest text-white/40 font-medium">Phone</p>
                                    <a href="tel:+1234567890" className="text-white hover:text-emerald-400 text-sm font-medium transition-colors">
                                        +1 (234) 567-8900
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="size-4 text-rose-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[11px] uppercase tracking-widest text-white/40 font-medium">Office</p>
                                    <p className="text-white text-sm font-medium">
                                        123 Business Street<br />
                                        New York, NY 10001
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0 my-8" />

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-white/40 text-xs font-medium">
                        © {currentYear} Qwok Business. All rights reserved.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <a href="#" className="text-white/60 hover:text-white text-xs font-medium transition-colors">
                            Privacy Policy
                        </a>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <a href="#" className="text-white/60 hover:text-white text-xs font-medium transition-colors">
                            Terms of Service
                        </a>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <a href="#" className="text-white/60 hover:text-white text-xs font-medium transition-colors">
                            Cookie Policy
                        </a>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <a href="#" className="text-white/60 hover:text-white text-xs font-medium transition-colors">
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
