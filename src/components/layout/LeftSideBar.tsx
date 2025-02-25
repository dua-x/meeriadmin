"use client"
import MeeriLogo from '@/components/MeeriLogo';
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navLinks } from "@/lib/constants";

const LeftSideBar = () => {
    const pathname = usePathname();

    return (
        <div className="sticky left-0 top-0  p-10 shadow-md
          flex flex-col gap-16  
          bg-custom-beige/90 backdrop-blur-sm
          text-white transition-all duration-300 ease-out
      h-screen max-lg:hidden">
            <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
                <MeeriLogo />
            </Link>


            <div className="flex flex-col gap-12">
                {navLinks.map((link) => (
                    <Link
                        href={link.url}
                        key={link.label}
                        className={`flex gap-4 text-body-medium transition-colors duration-200 ${pathname === link.url
                            ? "text-white font-semibold"
                            : "text-custom-brown hover:text-white"
                            }`}
                    >
                        {link.icon} <p>{link.label}</p>
                    </Link>
                ))}
            </div>

            <div className="flex gap-4 text-body-medium items-center">
                {/* <UserButton /> */}
                <p>Edit Profile</p>
            </div>
        </div>
    );
};

export default LeftSideBar;
