"use client";
import MeeriLogo from "@/components/MeeriLogo";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircleUserRound, Menu } from 'lucide-react';
import { navLinks } from "@/lib/constants";

const TopBar = () => {
    const [dropdownMenu, setDropdownMenu] = useState(false);
    const [userDropdown, setUserDropdown] = useState(false);
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);
    const pathname = usePathname();
    const menuRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const handleLogout = async () => {
        try {
            localStorage.removeItem('authtoken'); // Clear the token
            setUser(null); // Reset the user state
            router.push('/');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setDropdownMenu(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setUserDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="
         sticky top-0 z-50 px-4 py-2 shadow-md
          flex justify-between items-center
          bg-custom-beige/90 backdrop-blur-sm
          text-white transition-all duration-300 ease-out
      lg:hidden  w-full ">
            <Link
                href="/"
                className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
            >
                <MeeriLogo />
            </Link>

            <div className="flex gap-8 max-md:hidden">
                {navLinks.map((link) => (
                    <Link
                        href={link.url}
                        key={link.label}
                        className={`flex gap-4 text-body-medium transition-colors duration-200 ${pathname === link.url
                            ? "text-white font-semibold"
                            : "text-custom-brown hover:text-white"
                            }`}
                    >
                        <p>{link.label}</p>
                    </Link>
                ))}
            </div>

            <div className="relative flex gap-4 items-center" ref={menuRef}>
                <Menu
                    aria-label="Toggle Menu"
                    className="cursor-pointer md:hidden ease-in-out transition-transform hover:scale-110"
                    onClick={() => setDropdownMenu(!dropdownMenu)}
                />
                {dropdownMenu && (
                    <div className="absolute top-10 right-6 flex flex-col gap-4 p-5 bg-white/95 backdrop-blur-md shadow-xl rounded-lg transition-all duration-300">
                        {navLinks.map((link) => (
                            <Link
                                href={link.url}
                                key={link.label}

                                className="flex items-center gap-4 
                                text-body-medium text-custom-beige
                                hover:text-custom-brown font-semibold
                                transition-colors duration-200"
                                onClick={() => setDropdownMenu(false)}
                            >
                                {link.icon} <p>{link.label}</p>
                            </Link>
                        ))}
                    </div>
                )}

                 {/* User Icon & Dropdown */}
                 <button
                    className="cursor-pointer p-1 relative transition-transform duration-200 hover:scale-110"
                    onClick={() => setUserDropdown(!userDropdown)}
                    aria-label="User profile"
                >
                    <CircleUserRound />
                </button>

                {/* Dropdown Menu */}
                {userDropdown && (
                    <div
                        ref={userDropdownRef}
                        className="fixed top-[72px] right-6 z-50 flex flex-col gap-2 p-4 w-56 
                        rounded-lg border bg-white shadow-xl transition-opacity duration-300 scale-100 opacity-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <CircleUserRound className="text-gray-600 w-12 h-12 mb-2" />
                            <p className="font-semibold">{user ? user.username : 'Guest'}</p>
                            <p className="text-sm text-gray-500">{user ? user.email : 'guest@example.com'}</p>
                        </div>

                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="mt-3 text-center bg-custom-beige text-white py-1 rounded-lg hover:bg-[#a27a64] transition-colors duration-300"
                            >
                                Log out
                            </button>
                        ) : (
                            <Link
                                href="/signin"
                                className="mt-3 text-center bg-custom-beige hover:bg-[#a27a64] text-white py-1 rounded-lg transition-colors duration-300"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopBar;
