import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-teal-500 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Image src="/inder-logo-white.svg" alt="INDER Medellín" width={150} height={60} />
          <div className="flex space-x-4">
            {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
              <Link key={social} href="#" className="hover:underline">
                <Image src={`/${social}-icon.svg`} alt={social} width={24} height={24} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}