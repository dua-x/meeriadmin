"use client";
import MeeriLogo from "@/components/MeeriLogo";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { navLinks } from "@/lib/constants";

const TopBar = () => {
    const [dropdownMenu, setDropdownMenu] = useState(false);
    const pathname = usePathname();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setDropdownMenu(false);
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
            </div>
        </div>
    );
};

export default TopBar;
