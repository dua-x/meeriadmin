"use client"
import MeeriLogo from '@/components/MeeriLogo';
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircleUserRound } from 'lucide-react';
import { navLinks } from "@/lib/constants";
import { handlelog} from "@/lib/actions/actions";


const LeftSideBar = () => {
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);
    const pathname = usePathname();

    const router = useRouter();

    const handleLogout = async () => {
        try {
            localStorage.removeItem('authtoken'); // Clear the token
            setUser(null); // Reset the user state
            setTimeout(()=>{
                router.push('/signin');

            },200);
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('authtoken');
                if (!token) return;
                const userData = await handlelog();
                setUser(userData);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };
        fetchUser();
    }, []);

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

<div
                        className="flex flex-col p-4
                        rounded-lg border bg-transparent shadow-xl "
                    >
                        <div className="flex items-center text-center">
                            <CircleUserRound className="text-custom-brown w-12 h-12 mb-2" />
                            <div className="flex flex-col items-center text-center">
                                <p className="font-semibold">{user ? user.username : 'Admin'}</p>
                                <p className="text-sm text-gray-500">{user ? user.email : 'admin@meeri.com'}</p>
                            </div>
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
            </div>

        </div>
    );
};

export default LeftSideBar;
