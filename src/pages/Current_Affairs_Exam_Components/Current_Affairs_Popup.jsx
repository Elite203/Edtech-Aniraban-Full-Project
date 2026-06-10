import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, Facebook, MessageCircle, Linkedin, Send } from 'lucide-react';
import { createPortal } from 'react-dom';
import axios from 'axios';

const Current_Affairs_Popup = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    banner_image: null,
    insta_link: '#',
    fb_link: '#',
    wa_link: '#',
    li_link: '#',
    tg_link: '#'
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (isOpen) {
      axios.get(`${BASE_URL}api/CurrentAffairs/get_ca_banner.php`)
        .then(res => {
          if (res.data.status === 'success') {
            setSettings(res.data.data);
          }
        })
        .catch(err => console.error('Error fetching CA banner settings:', err));
    }
  }, [isOpen, BASE_URL]);

  if (!isOpen) return null;

  const socialPlatforms = [
    { Icon: Instagram, color: '#E1306C', label: 'Instagram', link: settings.insta_link },
    { Icon: Facebook, color: '#1877F2', label: 'Facebook', link: settings.fb_link },
    { Icon: MessageCircle, color: '#25D366', label: 'WhatsApp', link: settings.wa_link },
    { Icon: Linkedin, color: '#0077B5', label: 'LinkedIn', link: settings.li_link },
    { Icon: Send, color: '#0088cc', label: 'Telegram', link: settings.tg_link }
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 pt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-white shadow-2xl flex flex-col p-2.5 pt-8 sm:pt-2.5 box-border border-[6px] sm:border-[12px] border-transparent"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '98%',
              maxWidth: '620px',
              height: 'auto',
              borderImage: 'linear-gradient(135deg, #8a6d3b, #f9f295, #d4af37, #f9f295, #8a6d3b) 1',
              fontFamily: "'Arial Black', Gadget, sans-serif",
              overflow: 'visible'
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-5 -right-2 sm:-top-6 sm:-right-6 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors shadow-lg z-[100] border-2 border-white"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Top Header Badge */}
            <div 
              className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 text-white px-4 sm:px-7 py-1.5 sm:py-2 text-[10px] sm:text-lg whitespace-nowrap rounded z-50 shadow-md border-2 border-[#f9f295]"
              style={{
                background: 'linear-gradient(to bottom, #d4af37, #8a6d3b)',
                textShadow: '1px 1px 2px #000'
              }}
            >
              EXCLUSIVE OFFER ON EACH SHARE
            </div>

            {/* Social Icons Row */}
            <div className="flex justify-center gap-3 sm:gap-4.5 mt-2 sm:mt-6 mb-2 sm:mb-2.5">
              {socialPlatforms.map((platform, idx) => (
                <motion.a
                  key={idx}
                  href={platform.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white border-2 border-[#f9f295] shadow-lg"
                  style={{ background: platform.color }}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  title={platform.label}
                >
                  <platform.Icon size={16} className="sm:w-5 sm:h-5" />
                </motion.a>
              ))}
            </div>

            {/* Image Content Container - Fully filled */}
            <div className="flex-1 flex items-center justify-center m-1 sm:m-2.5 mx-0.5 rounded overflow-hidden shadow-lg min-h-[160px] sm:min-h-[250px] relative">
              {settings.banner_image ? (
                <img 
                  src={settings.banner_image} 
                  alt="Exclusive Offer" 
                  className="absolute inset-0 w-full h-full object-fill"
                />
              ) : (
                <div className="flex-1 bg-[#f4f4f4] border border-[#ddd] w-full h-full flex items-center justify-center italic text-[#bbb] text-xs sm:text-base">
                  [ Exclusive Current Affairs Offer ]
                </div>
              )}
            </div>

            {/* Bottom Glowing Text Section - Higher Visibility */}
            <div className="text-center py-2 sm:py-5 px-2">
              <h2 
                className="m-0 text-xl sm:text-4xl uppercase leading-tight italic font-black"
                style={{
                    background: 'linear-gradient(to bottom, #f39c12 0%, #d35400 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    WebkitTextStroke: '1px #8e44ad',
                    filter: 'drop-shadow(0 0 8px rgba(230, 126, 34, 0.6))',
                    letterSpacing: '1px'
                }}
              >
                Free Validity Extension <br /> Upto 18 Month
              </h2>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Current_Affairs_Popup;

