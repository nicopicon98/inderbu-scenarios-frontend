// shared/components/organisms/footer.tsx
import Image from "next/image";
import Link from "next/link";
import {
  SiFacebook,
  SiInstagram,
  SiYoutube,
} from "react-icons/si";
import { RiTwitterXLine } from "react-icons/ri";

export default function Footer() {
  const socialLinks = [
    { name: "Facebook", Icon: SiFacebook,   href: "#" },
    { name: "Instagram",Icon: SiInstagram,  href: "#" },
    { name: "YouTube",  Icon: SiYoutube,    href: "#" },
    { name: "x", Icon: RiTwitterXLine, href: "#" },
  ];

  return (
    <footer className="bg-white py-8 border-t border-gray-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="w-48">
            <Image
              src="https://inderbu.gov.co/wp-content/uploads/2024/07/LOGO-3.png"
              alt="INDERBU"
              width={240}
              height={80}
              className="object-contain"
            />
          </div>

          {/* Social Media */}
          <div className="flex items-center gap-4">
            {socialLinks.map(({ name, Icon, href }) => (
              <Link
                key={name}
                href={href}
                aria-label={name}
                className="flex items-center justify-center w-9 h-9 rounded-full
                           bg-gray-50 text-gray-500 hover:bg-green-50 hover:text-green-600
                           transition-colors duration-200 border border-gray-100"
              >
                <Icon size={18} />
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} INDERBU. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
