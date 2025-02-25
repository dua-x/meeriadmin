
import { playfair } from '@/app/fonts/font'; // le fichier de l'étape 1

export default function MeeriLogo() {
    return (
        <div className="flex flex-col items-center text-center">
            <h1
                className={`
          ${playfair.className} 
          text-4xl 
          m-1
          md:text-5xl 
          font-bold 
          leading-tight 
          uppercase
          tracking-wide
        `}
            >
                MEERI
            </h1>
            <p
                className={`
          ${playfair.className} 
          text-sm 
          md:text-base 
          md:tracking-[0.25em]
          tracking-[0.15em]
          uppercase
          
        `}
            >
                MEERI STORE
            </p>
        </div>
    );
}
