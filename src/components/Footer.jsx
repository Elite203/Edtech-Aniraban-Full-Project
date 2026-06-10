import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import WaveText from '@/components/WaveText';
import { useToast } from "@/components/ui/use-toast";

const Footer = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setLoading(true);
        // Fetch settings
        const settingsResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/Settings/footer_settings.php`);
        if (!settingsResponse.ok) throw new Error('Settings fetch failed');
        const settingsData = await settingsResponse.json();
        if (settingsData.success) {
          setSettings(settingsData.data);
        }

        // Fetch courses to extract active categories
        const coursesResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/Courses/get_courses.php?exclude_images=1`);
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          if (coursesData.success) {
            // Extract unique categories that actually have courses
            const activeCategories = [...new Set(coursesData.courses.map(c => c.category).filter(Boolean))]
              .slice(0, 12)
              .map((name, index) => ({ id: index, name }));
            setCategories(activeCategories);
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching footer data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };



  const TelegramIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M21.05 2.26 2.8 10.34c-1.08.44-1.07 1.04-.2 1.31l4.94 1.54 11.45-7.19c.54-.33 1.03-.15.63.21L9.6 15.95l-.36 5.26c.53 0 .77-.24 1.07-.52l2.57-2.49 5.36 3.94c.98.54 1.69.26 1.93-.9l3.27-18.38c.36-1.64-.59-2.37-1.9-1.6z" />
    </svg>
  );

  // Dynamic social links based on settings
  const socialLinks = [
    {
      href: settings?.facebook || "#",
      label: "Facebook",
      icon: <Facebook size={20} />,
      show: !!settings?.facebook
    },
    {
      href: settings?.twitter || "#",
      label: "Twitter",
      icon: <Twitter size={20} />,
      show: !!settings?.twitter
    },
    {
      href: settings?.telegram || "#",
      label: "Telegram",
      icon: TelegramIcon,
      show: !!settings?.telegram
    },
    {
      href: settings?.instagram || "#",
      label: "Instagram",
      icon: <Instagram size={20} />,
      show: !!settings?.instagram
    },
    {
      href: settings?.youtube || "#",
      label: "YouTube",
      icon: <Youtube size={20} />,
      show: !!settings?.youtube
    },
  ].filter(link => link.show);

  if (loading) {
    return (
      <footer className="bg-[#191919] text-white py-12">
        <div className="container mx-auto px-6 text-center">
          Loading footer content...
        </div>
      </footer>
    );
  }

  if (error) {
    return (
      <footer className="bg-[#191919] text-white py-12">
        <div className="container mx-auto px-6 text-center text-red-400">
          Error loading footer: {error}
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#191919] text-white py-12 relative overflow-hidden">
      {/* Logo Background */}
      <div className="absolute inset-0 flex items-center justify-end pr-4 sm:pr-6 md:pr-12 lg:pr-16">
        <img
          src="/img/highhdbiglogo.png"
          alt="Logo"
          className="w-48 h-full xs:w-56 sm:w-64 md:w-72 lg:w-96 xl:w-112 2xl:w-[32rem] opacity-20 object-contain"
        />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <p
              onClick={scrollToTop}
              className="text-2xl font-bold mb-2 hover:opacity-80 transition-colors cursor-pointer"
              style={{ color: '#f25304' }}
            >
              {(settings?.site_name || "ANIRBAN'S ACADEMY").replace("ANIRBAN's", "ANIRBAN'S")}
            </p>
            <p className="text-sm">
              {settings?.site_description || "Your path to success is to just built your concept. Don't rush towards the rules."}
            </p>
            <nav aria-label="Social media" className="flex space-x-4 mt-6">
              {socialLinks.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="hover:text-primary transition-colors"
                >
                  {icon}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-lg font-semibold mb-4"><span style={{ color: '#f25304' }}>Quick</span> <WaveText text="Links" as="span" /></p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" onClick={scrollToTop} className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/terms-and-conditions" onClick={scrollToTop} className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" onClick={scrollToTop} className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund-and-cancellation-policy" onClick={scrollToTop} className="hover:text-primary transition-colors">Refund and Cancellation Policy</Link></li>
              <li><Link to="/shipping-and-delivery-policy" onClick={scrollToTop} className="hover:text-primary transition-colors">Shipping and Delivery Policy</Link></li>
              <li><Link to="/contact" onClick={scrollToTop} className="hover:text-primary transition-colors">Help Us Improve</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-lg font-semibold mb-4"><span style={{ color: '#f25304' }}>Popular</span> <WaveText text="Exams" as="span" /></p>
            <div className="grid grid-cols-2 grid-flow-col grid-rows-6 gap-x-4 gap-y-2 text-sm">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/courses?category=${encodeURIComponent(category.name)}`}
                  onClick={scrollToTop}
                  className="hover:text-primary transition-colors whitespace-normal leading-tight"
                  title={category.name}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-lg font-semibold mb-4"><span style={{ color: '#f25304' }}>Contact</span> <WaveText text="Us" as="span" /></p>
            <address className="not-italic text-sm space-y-2">
              <p>{settings?.address || "ASANSOL, WESTBENGAL, PIN-713303"}</p>
              {settings?.whatsapp && (
                <p>WhatsApp: <a
                  href={settings.whatsapp.startsWith('http') ? settings.whatsapp : `https://wa.me/${settings.whatsapp}`}
                  className="hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {settings.whatsapp.replace('https://wa.me/', '')}
                </a></p>
              )}
              {settings?.email && (
                <p>Email: <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {settings.email}
                </a></p>
              )}
            </address>
            <div className="mt-4">
              <p className="text-md font-semibold mb-3"><WaveText text="Download App" as="span" /></p>
              <div className="space-y-3 flex flex-col items-start opacity-80">
                <a
                  href="https://anirbansacademy.com/mobile-app-coming-soon"
                  className="flex items-center bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm w-full max-w-[180px] sm:max-w-[200px] lg:max-w-[176px]"
                  rel="noopener noreferrer"
                >
                  <img src="/img/google-play.png" alt="Google Play" className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0 object-contain" />
                  <div className="min-w-0">
                    <div className="text-xs opacity-75 leading-tight">Get it on</div>
                    <div className="font-semibold leading-tight">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-footer-foreground/20 pt-8 text-center text-sm">
          <p>
            &copy; <span style={{ color: 'white', fontWeight: 'bold' }}>COPYRIGHT</span> {new Date().getFullYear()} <span style={{ color: '#f25304', fontWeight: 'bold' }}>{(settings?.site_name || "ANIRBAN'S ACADEMY").replace("ANIRBAN's", "ANIRBAN'S")}</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;