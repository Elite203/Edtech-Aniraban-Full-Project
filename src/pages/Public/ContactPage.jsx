import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import { useTheme } from "@/components/ThemeProvider";

const ContactPage = () => {
  const { theme } = useTheme();
  const [contactInfo, setContactInfo] = useState({
    address: "",
    whatsapp: "",
    email: ""
  });
  const [officeHours, setOfficeHours] = useState({
    monday_friday: "",
    saturday: "",
    sunday: ""
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', text: '' });
  const [errors, setErrors] = useState({});

  const handleContactHeadingAnimationComplete = () => {
    console.log("ContactPage: 'Contact Us' heading animation completed");
  };

  const showToast = (type, text) => {
    setToast({ show: true, type, text });
    setTimeout(() => {
      setToast({ show: false, type: '', text: '' });
    }, 5000);
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name) && name.trim().length > 0;
  };

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/Settings/contact_settings.php`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const settings = data.data;
          setContactInfo({
            address: settings.address || "",
            whatsapp: settings.whatsapp ? 
              (settings.whatsapp.startsWith('http') ? 
                settings.whatsapp.replace('https://wa.me/', '') : 
                settings.whatsapp) : 
              "",
            email: settings.email || ""
          });
          setOfficeHours({
            monday_friday: settings.monday_friday || "",
            saturday: settings.saturday || "",
            sunday: settings.sunday || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    // Real-time validation
    let newErrors = { ...errors };
    
    // Filter invalid characters for name fields
    let filteredValue = value;
    if (id === 'firstName' || id === 'lastName') {
      filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
      if (!validateName(filteredValue) && filteredValue.length > 0) {
        newErrors[id] = 'Only letters and spaces are allowed';
      } else {
        delete newErrors[id];
      }
    } else if (id === 'email') {
      if (!validateEmail(value) && value.length > 0) {
        newErrors[id] = 'Please enter a valid email address';
      } else {
        delete newErrors[id];
      }
    }
    
    setErrors(newErrors);
    setFormData(prev => ({
      ...prev,
      [id]: filteredValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Comprehensive validation
    let validationErrors = {};
    
    if (!formData.firstName.trim()) {
      validationErrors.firstName = 'First name is required';
    } else if (!validateName(formData.firstName)) {
      validationErrors.firstName = 'Only letters and spaces are allowed';
    }
    
    if (!formData.lastName.trim()) {
      validationErrors.lastName = 'Last name is required';
    } else if (!validateName(formData.lastName)) {
      validationErrors.lastName = 'Only letters and spaces are allowed';
    }
    
    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      validationErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      validationErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      validationErrors.message = 'Message is required';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('error', 'Please fix the errors below');
      return;
    }
    
    setErrors({});

    try {
      setSubmitting(true);
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/Content/contact_form.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showToast('success', data.message);
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        showToast('error', data.message || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('error', 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            <span>{toast.text}</span>
            <button
              onClick={() => setToast({ show: false, type: '', text: '' })}
              className="ml-3 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          <SplitText
            text="Contact Us"
            className="inline"
            delay={85}
            duration={0.8}
            onAnimationComplete={handleContactHeadingAnimationComplete}
          />
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          We're here to help. Reach out to us with any questions or for support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xl sm:text-2xl font-semibold mb-6">Get in Touch</p>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  type="text" 
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  type="text" 
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="mail@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={submitting}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                type="text" 
                placeholder="Regarding course..."
                value={formData.subject}
                onChange={handleInputChange}
                disabled={submitting}
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.subject}</p>
              )}
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Your message..." 
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                disabled={submitting}
                className={errors.message ? 'border-red-500' : ''}
              />
              {errors.message && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.message}</p>
              )}
            </div>
            <Button 
              type="submit" 
              size="lg" 
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-xl sm:text-2xl font-semibold mb-6">Contact Information</p>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Our Address</p>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {loading ? "Loading..." : contactInfo.address}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Call Us</p>
                <div className="text-muted-foreground text-sm sm:text-base">
                  {loading ? "Loading..." : (
                    <a 
                      href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors break-all"
                    >
                      WhatsApp {contactInfo.whatsapp}
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Email Us</p>
                <a 
                  href={`mailto:${loading ? '#' : contactInfo.email}`} 
                  className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm sm:text-base break-all"
                >
                  {loading ? "Loading..." : contactInfo.email}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
             <p className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Office Hours</p>
             <div className="space-y-1 sm:space-y-2 text-sm sm:text-base">
               <p className="text-muted-foreground">{loading ? "Loading..." : officeHours.monday_friday}</p>
               <p className="text-muted-foreground">{loading ? "Loading..." : officeHours.saturday}</p>
               <p className="text-muted-foreground">{loading ? "Loading..." : officeHours.sunday}</p>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactPage;