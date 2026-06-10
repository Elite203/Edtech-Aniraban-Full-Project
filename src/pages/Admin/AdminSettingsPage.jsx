import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  Mail,
  Globe,
  MessageSquare,
  MapPin,
  ImageIcon,
  Upload
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
const AdminSettingsPage = () => {
  const { isDarkMode } = useTheme();
  const [settings, setSettings] = useState({
    sessionTimeout: 5
  });
  
  const [footerSettings, setFooterSettings] = useState({
    site_name: "ANIRBAN'S ACADEMY",
    site_description: "Your path to success is to just built your concept. Don't rush towards the rules.",
    address: 'ASANSOL, WESTBENGAL, PIN-713303',
    email: '',
    whatsapp: '',
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    telegram: '',
    telegram_test_link: ''
  });
  
  const [contactSettings, setContactSettings] = useState({
    address: 'ASANSOL, WESTBENGAL, PIN-713303',
    email: 'info@anirbansacademy.com',
    whatsapp: '+918670509456',
    monday_friday: 'Monday - Friday: 9:00 AM - 6:00 PM',
    saturday: 'Saturday: 10:00 AM - 4:00 PM',
    sunday: 'Sunday: Closed'
  });
  
  const [bannerSettings, setBannerSettings] = useState({
    heroImage: null,
    heroImagePreview: null,
    androidImage: null,
    androidImagePreview: null,
    aboutUsImage: null,
    aboutUsImagePreview: null
  });
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: '',
    bio: '',
    image: null,
    imagePreview: null,
    display_order: ''
  });
  
  const [editingMember, setEditingMember] = useState(null);
  const [editMemberData, setEditMemberData] = useState({
    id: '',
    name: '',
    role: '',
    bio: '',
    image: null,
    imagePreview: null,
    display_order: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [toast, setToast] = useState({ show: false, type: '', text: '' });

  const buildUrl = useCallback((path) => `${import.meta.env.VITE_BACKEND_URL}${path}`, []);

  // Toast notification function
  const showToast = useCallback((type, text) => {
    setToast({ show: true, type, text });
    setTimeout(() => {
      setToast({ show: false, type: '', text: '' });
    }, 5000);
  }, []);

  // Load team members
  const loadTeamMembers = useCallback(async () => {
    try {
      console.log('Loading team members...');
      const response = await axios.get(buildUrl('/api/Content/handle_team_members.php'));
      console.log('Team members response:', response.data);
      
      if (response.data.success) {
        setTeamMembers(response.data.data);
        console.log(`Loaded ${response.data.count} team members`);
      } else {
        console.log('No team members found or error loading team members');
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      setTeamMembers([]);
    }
  }, [buildUrl]);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [sessionResponse, footerResponse, contactResponse, bannerResponse, androidBannerResponse, aboutUsBannerResponse] = await Promise.all([
          axios.get(buildUrl('/api/Settings/session_settings.php')),
          axios.get(buildUrl('/api/Settings/footer_settings.php')),
          axios.get(buildUrl('/api/Settings/contact_settings.php')),
          axios.get(buildUrl('/api/Settings/website_banners_update.php?banner_name=hero_banner')),
          axios.get(buildUrl('/api/Settings/website_banners_update.php?banner_name=android_banner')),
          axios.get(buildUrl('/api/Settings/website_banners_update.php?banner_name=about_us_banner'))
        ]);
        
        console.log('Loading settings - Banner response:', bannerResponse.data);
        console.log('Loading settings - Android Banner response:', androidBannerResponse.data);
        console.log('Loading settings - About Us Banner response:', aboutUsBannerResponse.data);
        
        // Load team members
        await loadTeamMembers();
        
        if (sessionResponse.data.success) {
          setSettings(sessionResponse.data.data);
        } else {
          // Keep default value if API doesn't return valid data
          setSettings(prev => ({ ...prev, sessionTimeout: 5 }));
        }
        
        if (footerResponse.data.success) {
          setFooterSettings(footerResponse.data.data);
        }
        
        if (contactResponse.data.success) {
          setContactSettings(contactResponse.data.data);
        }
        
        if (bannerResponse.data.success) {
          setBannerSettings(prev => ({
            ...prev,
            heroImagePreview: bannerResponse.data.data.image_data
          }));
          console.log('Hero banner loaded successfully');
        } else {
          console.log('No hero banner found or error loading banner');
        }
        
        if (androidBannerResponse.data.success) {
          setBannerSettings(prev => ({
            ...prev,
            androidImagePreview: androidBannerResponse.data.data.image_data
          }));
          console.log('Android banner loaded successfully');
        } else {
          console.log('No android banner found or error loading banner');
        }
        
        if (aboutUsBannerResponse.data.success) {
          setBannerSettings(prev => ({
            ...prev,
            aboutUsImagePreview: aboutUsBannerResponse.data.data.image_data
          }));
          console.log('About Us banner loaded successfully');
        } else {
          console.log('No about us banner found or error loading banner');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        showToast('error', 'Failed to load settings');
        // Ensure default sessionTimeout on error
        setSettings(prev => ({ ...prev, sessionTimeout: 5 }));
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, [buildUrl, showToast]);

  const handleInputChange = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleFooterInputChange = useCallback((key, value) => {
    setFooterSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleContactInputChange = useCallback((key, value) => {
    setContactSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleBannerImageChange = useCallback((e) => {
    const file = e.target.files[0];
    console.log('Banner image selected:', file);
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('error', 'Invalid file type. Only JPEG, PNG, and WebP are allowed.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File size too large. Maximum size is 5MB.');
        return;
      }
      
      setBannerSettings(prev => ({
        ...prev,
        heroImage: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerSettings(prev => ({
          ...prev,
          heroImagePreview: e.target.result
        }));
        console.log('Hero image preview created');
      };
      reader.readAsDataURL(file);
    }
  }, [showToast]);

  const handleAndroidBannerImageChange = useCallback((e) => {
    const file = e.target.files[0];
    console.log('Android banner image selected:', file);
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('error', 'Invalid file type. Only JPEG, PNG, and WebP are allowed.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File size too large. Maximum size is 5MB.');
        return;
      }
      
      setBannerSettings(prev => ({
        ...prev,
        androidImage: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerSettings(prev => ({
          ...prev,
          androidImagePreview: e.target.result
        }));
        console.log('Android image preview created');
      };
      reader.readAsDataURL(file);
    }
  }, [showToast]);

  const handleAboutUsBannerImageChange = useCallback((e) => {
    const file = e.target.files[0];
    console.log('About Us banner image selected:', file);
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('error', 'Invalid file type. Only JPEG, PNG, and WebP are allowed.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File size too large. Maximum size is 5MB.');
        return;
      }
      
      setBannerSettings(prev => ({
        ...prev,
        aboutUsImage: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerSettings(prev => ({
          ...prev,
          aboutUsImagePreview: e.target.result
        }));
        console.log('About Us image preview created');
      };
      reader.readAsDataURL(file);
    }
  }, [showToast]);

  const uploadHeroBanner = useCallback(async () => {
    if (!bannerSettings.heroImage) {
      showToast('error', 'Please select an image first');
      return;
    }
    
    console.log('Starting hero banner upload...');
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', bannerSettings.heroImage);
      formData.append('banner_name', 'hero_banner');
      
      const response = await axios.post(buildUrl('/api/Settings/website_banners_update.php'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Hero banner upload response:', response.data);
      
      if (response.data.success) {
        showToast('success', 'Hero banner updated successfully!');
        setBannerSettings(prev => ({
          ...prev,
          heroImage: null
        }));
      } else {
        showToast('error', response.data.message || 'Failed to update hero banner');
      }
    } catch (error) {
      console.error('Error uploading hero banner:', error);
      showToast('error', 'Error uploading banner. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [bannerSettings.heroImage, buildUrl, showToast]);

  const uploadAndroidBanner = useCallback(async () => {
    if (!bannerSettings.androidImage) {
      showToast('error', 'Please select an image first');
      return;
    }
    
    console.log('Starting android banner upload...');
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', bannerSettings.androidImage);
      formData.append('banner_name', 'android_banner');
      
      const response = await axios.post(buildUrl('/api/Settings/website_banners_update.php'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Android banner upload response:', response.data);
      
      if (response.data.success) {
        showToast('success', 'Android banner updated successfully!');
        setBannerSettings(prev => ({
          ...prev,
          androidImage: null
        }));
      } else {
        showToast('error', response.data.message || 'Failed to update android banner');
      }
    } catch (error) {
      console.error('Error uploading android banner:', error);
      showToast('error', 'Error uploading banner. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [bannerSettings.androidImage, buildUrl, showToast]);

  const uploadAboutUsBanner = useCallback(async () => {
    if (!bannerSettings.aboutUsImage) {
      showToast('error', 'Please select an image first');
      return;
    }
    
    console.log('Starting about us banner upload...');
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', bannerSettings.aboutUsImage);
      formData.append('banner_name', 'about_us_banner');
      
      const response = await axios.post(buildUrl('/api/Settings/website_banners_update.php'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('About Us banner upload response:', response.data);
      
      if (response.data.success) {
        showToast('success', 'About Us banner updated successfully!');
        setBannerSettings(prev => ({
          ...prev,
          aboutUsImage: null
        }));
      } else {
        showToast('error', response.data.message || 'Failed to update about us banner');
      }
    } catch (error) {
      console.error('Error uploading about us banner:', error);
      showToast('error', 'Error uploading banner. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [bannerSettings.aboutUsImage, buildUrl, showToast]);

  // Team member handlers
  const handleTeamMemberInputChange = useCallback((key, value) => {
    setNewTeamMember(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleTeamMemberImageChange = useCallback((e) => {
    const file = e.target.files[0];
    console.log('Team member image selected:', file);
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('error', 'Invalid file type. Only JPEG, PNG, and WebP are allowed.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File size too large. Maximum size is 5MB.');
        return;
      }
      
      setNewTeamMember(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewTeamMember(prev => ({
          ...prev,
          imagePreview: e.target.result
        }));
        console.log('Team member image preview created');
      };
      reader.readAsDataURL(file);
    }
  }, [showToast]);

  const addTeamMember = useCallback(async () => {
    if (!newTeamMember.name || !newTeamMember.role) {
      showToast('error', 'Name and role are required');
      return;
    }
    
    console.log('Adding team member:', newTeamMember);
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', newTeamMember.name);
      formData.append('role', newTeamMember.role);
      formData.append('bio', newTeamMember.bio);
      formData.append('display_order', newTeamMember.display_order || '0');
      
      if (newTeamMember.image) {
        formData.append('image', newTeamMember.image);
      }
      
      const response = await axios.post(buildUrl('/api/Content/handle_team_members.php'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Add team member response:', response.data);
      
      if (response.data.success) {
        showToast('success', 'Team member added successfully!');
        setNewTeamMember({
          name: '',
          role: '',
          bio: '',
          image: null,
          imagePreview: null,
          display_order: ''
        });
        await loadTeamMembers();
      } else {
        showToast('error', response.data.message || 'Failed to add team member');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      showToast('error', 'Error adding team member. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [newTeamMember, buildUrl, showToast, loadTeamMembers]);

  const deleteTeamMember = useCallback(async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }
    
    console.log('Deleting team member:', memberId);
    setLoading(true);
    
    try {
      const response = await axios.delete(buildUrl('/api/Content/handle_team_members.php'), {
        data: { id: memberId },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('Delete team member response:', response.data);
      
      if (response.data.success) {
        showToast('success', 'Team member deleted successfully!');
        await loadTeamMembers();
      } else {
        showToast('error', response.data.message || 'Failed to delete team member');
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      showToast('error', 'Error deleting team member. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [buildUrl, showToast, loadTeamMembers]);

  // Edit team member handlers
  const handleEditMemberInputChange = useCallback((key, value) => {
    console.log('Edit member input change:', key, value);
    setEditMemberData(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleEditMemberImageChange = useCallback((e) => {
    const file = e.target.files[0];
    console.log('Edit member image selected:', file);
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('error', 'Invalid file type. Only JPEG, PNG, and WebP are allowed.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File size too large. Maximum size is 5MB.');
        return;
      }
      
      setEditMemberData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditMemberData(prev => ({
          ...prev,
          imagePreview: e.target.result
        }));
        console.log('Edit member image preview created');
      };
      reader.readAsDataURL(file);
    }
  }, [showToast]);

  const startEditMember = useCallback((member) => {
    console.log('Starting edit for member:', member);
    setEditingMember(member.id);
    setEditMemberData({
      id: member.id,
      name: member.name,
      role: member.role,
      bio: member.bio || '',
      image: null,
      imagePreview: member.image_base64 || null,
      display_order: member.display_order?.toString() || ''
    });
  }, []);

  const cancelEditMember = useCallback(() => {
    console.log('Cancelling member edit');
    setEditingMember(null);
    setEditMemberData({
      id: '',
      name: '',
      role: '',
      bio: '',
      image: null,
      imagePreview: null,
      display_order: ''
    });
  }, []);

  const updateTeamMember = useCallback(async () => {
    if (!editMemberData.name || !editMemberData.role) {
      showToast('error', 'Name and role are required');
      return;
    }
    
    console.log('Updating team member:', editMemberData);
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('id', editMemberData.id);
      formData.append('name', editMemberData.name);
      formData.append('role', editMemberData.role);
      formData.append('bio', editMemberData.bio);
      formData.append('display_order', editMemberData.display_order || '0');
      
      if (editMemberData.image) {
        formData.append('image', editMemberData.image);
        console.log('Update API - Including new image in update');
      }
      
      const response = await axios.post(buildUrl('/api/Content/update_team_members.php'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Update team member response:', response.data);
      
      if (response.data.success) {
        showToast('success', 'Team member updated successfully!');
        setEditingMember(null);
        setEditMemberData({
          id: '',
          name: '',
          role: '',
          bio: '',
          image: null,
          imagePreview: null,
          display_order: ''
        });
        await loadTeamMembers();
      } else {
        showToast('error', response.data.message || 'Failed to update team member');
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      showToast('error', 'Error updating team member. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [editMemberData, buildUrl, showToast, loadTeamMembers]);

  // Separate function to clear toast to avoid clearing on every input change
  const clearToast = useCallback(() => {
    setToast(prev => prev.show ? { show: false, type: '', text: '' } : prev);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate session timeout
    if (!settings.sessionTimeout || settings.sessionTimeout < 1 || settings.sessionTimeout > 120) {
      showToast('error', 'Auto-logout timeout must be between 1 and 120 minutes');
      return;
    }
    
    setLoading(true);
    
    try {
      const [sessionResponse, footerResponse, contactResponse] = await Promise.all([
        axios.post(buildUrl('/api/Settings/session_settings.php'), settings),
        axios.post(buildUrl('/api/Settings/footer_settings.php'), footerSettings),
        axios.post(buildUrl('/api/Settings/contact_settings.php'), contactSettings)
      ]);
      
      if (sessionResponse.data.success && footerResponse.data.success && contactResponse.data.success) {
        showToast('success', 'All settings saved successfully!');
      } else {
        const errorMessage = !sessionResponse.data.success 
          ? sessionResponse.data.message || 'Failed to save session settings'
          : !footerResponse.data.success
          ? footerResponse.data.message || 'Failed to save footer settings'
          : contactResponse.data.message || 'Failed to save contact settings';
        showToast('error', errorMessage);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('error', 'Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [buildUrl, settings, footerSettings, contactSettings, showToast]);

  const SettingCard = useCallback(({ title, description, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}
    >
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      </div>
      {children}
    </motion.div>
  ), [isDarkMode]);

  if (loadingSettings) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#3936C9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading settings...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-[#3936C9] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-[#3936C9]" />
          </div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Settings</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your admin panel configuration and preferences
          </p>
        </motion.div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* System Settings */}
          <SettingCard 
            title="System Settings" 
            description="Configure system behavior and auto-logout preferences"
          >
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Auto-Logout Timeout (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={settings.sessionTimeout}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1) {
                    handleInputChange('sessionTimeout', value);
                  } else if (e.target.value === '') {
                    handleInputChange('sessionTimeout', '');
                  }
                }}
                onFocus={clearToast}
                className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
              />
              <div className={`mt-2 p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  <strong>Auto-Logout Feature:</strong> Users will be automatically logged out after {settings.sessionTimeout} minutes of inactivity (no mouse or keyboard activity detected).
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Range: 5-120 minutes. Activity is detected through mouse movements, clicks, keyboard input, and scrolling.
                </p>
              </div>
            </div>
          </SettingCard>

          {/* Footer Settings */}
          <SettingCard 
            title="Footer Settings" 
            description="Configure footer content and social media links"
          >
            <div className="space-y-4">
              {/* Site Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <Globe className="w-4 h-4 inline-block mr-2" />
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={footerSettings.site_name}
                    onChange={(e) => handleFooterInputChange('site_name', e.target.value)}
                    onFocus={clearToast}
                    className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <MapPin className="w-4 h-4 inline-block mr-2" />
                    Address
                  </label>
                  <input
                    type="text"
                    value={footerSettings.address}
                    onChange={(e) => handleFooterInputChange('address', e.target.value)}
                    onFocus={clearToast}
                    className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  <MessageSquare className="w-4 h-4 inline-block mr-2" />
                  Site Description
                </label>
                <textarea
                  value={footerSettings.site_description}
                  onChange={(e) => handleFooterInputChange('site_description', e.target.value)}
                  onFocus={clearToast}
                  rows={2}
                  className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <Mail className="w-4 h-4 inline-block mr-2" />
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={footerSettings.email}
                    onChange={(e) => handleFooterInputChange('email', e.target.value)}
                    onFocus={clearToast}
                    placeholder="contact@example.com"
                    className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={footerSettings.whatsapp}
                    onChange={(e) => handleFooterInputChange('whatsapp', e.target.value)}
                    onFocus={clearToast}
                    placeholder="+91XXXXXXXXXX or wa.me link"
                    className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-3">
                <h4 className={`text-md font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={footerSettings.facebook}
                      onChange={(e) => handleFooterInputChange('facebook', e.target.value)}
                      onFocus={clearToast}
                      placeholder="https://facebook.com/yourpage"
                      className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Twitter URL
                    </label>
                    <input
                      type="url"
                      value={footerSettings.twitter}
                      onChange={(e) => handleFooterInputChange('twitter', e.target.value)}
                      onFocus={clearToast}
                      placeholder="https://twitter.com/yourpage"
                      className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={footerSettings.instagram}
                      onChange={(e) => handleFooterInputChange('instagram', e.target.value)}
                      onFocus={clearToast}
                      placeholder="https://instagram.com/yourpage"
                      className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={footerSettings.youtube}
                      onChange={(e) => handleFooterInputChange('youtube', e.target.value)}
                      onFocus={clearToast}
                      placeholder="https://youtube.com/yourchannel"
                      className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Telegram URL
                    </label>
                    <input
                      type="url"
                      value={footerSettings.telegram}
                      onChange={(e) => handleFooterInputChange('telegram', e.target.value)}
                      onFocus={clearToast}
                      placeholder="https://t.me/yourchannel"
                      className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Telegram Current Affairs Link
                    </label>
                    <input
                      type="url"
                      value={footerSettings.telegram_test_link}
                      onChange={(e) => handleFooterInputChange('telegram_test_link', e.target.value)}
                      onFocus={clearToast}
                      placeholder="https://t.me/yourtestchannel"
                      className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </SettingCard>

          {/* Contact Settings */}
          <SettingCard 
            title="Contact Page Settings" 
            description="Configure contact information and office hours displayed on contact page"
          >
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <MapPin className="w-4 h-4 inline-block mr-2" />
                    Contact Address
                  </label>
                  <input
                    type="text"
                    value={contactSettings.address}
                    onChange={(e) => handleContactInputChange('address', e.target.value)}
                    onFocus={clearToast}
                    placeholder="Your office address"
                    className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <Mail className="w-4 h-4 inline-block mr-2" />
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactSettings.email}
                    onChange={(e) => handleContactInputChange('email', e.target.value)}
                    onFocus={clearToast}
                    placeholder="contact@example.com"
                    className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={contactSettings.whatsapp}
                  onChange={(e) => handleContactInputChange('whatsapp', e.target.value)}
                  onFocus={clearToast}
                  placeholder="+91XXXXXXXXXX or wa.me link"
                  className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                />
              </div>

              {/* Office Hours */}
              <div className="space-y-3">
                <h4 className={`text-md font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Office Hours</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Monday - Friday
                    </label>
                    <input
                      type="text"
                      value={contactSettings.monday_friday}
                      onChange={(e) => handleContactInputChange('monday_friday', e.target.value)}
                      onFocus={clearToast}
                      placeholder="Monday - Friday: 9:00 AM - 6:00 PM"
                      className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Saturday
                    </label>
                    <input
                      type="text"
                      value={contactSettings.saturday}
                      onChange={(e) => handleContactInputChange('saturday', e.target.value)}
                      onFocus={clearToast}
                      placeholder="Saturday: 10:00 AM - 4:00 PM"
                      className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Sunday
                  </label>
                  <input
                    type="text"
                    value={contactSettings.sunday}
                    onChange={(e) => handleContactInputChange('sunday', e.target.value)}
                    onFocus={clearToast}
                    placeholder="Sunday: Closed"
                    className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                  />
                </div>
              </div>
            </div>
          </SettingCard>

          {/* Website Banners Settings */}
          <SettingCard 
            title="Website Banners" 
            description="Manage website banner images and visual content"
          >
            <div className="space-y-6">
              {/* Hero Banner Section */}
              <div className="space-y-4">
                <h4 className={`text-md font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <ImageIcon className="w-4 h-4 inline-block mr-2" />
                  Hero Banner
                </h4>
                
                {/* Current Hero Image Preview */}
                {bannerSettings.heroImagePreview && (
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Current Hero Image:
                    </label>
                    <div className="relative">
                      <img 
                        src={bannerSettings.heroImagePreview} 
                        alt="Current Hero Banner" 
                        className="w-full max-w-md h-32 sm:h-40 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  </div>
                )}
                
                {/* Upload New Hero Image */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Upload New Hero Image:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleBannerImageChange}
                      onFocus={clearToast}
                      className={`flex-1 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDarkMode ? 'file:bg-indigo-600 file:text-white' : 'file:bg-indigo-50 file:text-indigo-700'} hover:file:bg-indigo-100`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={uploadHeroBanner}
                      disabled={loading || !bannerSettings.heroImage}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#3936C9] text-white rounded-lg font-medium shadow-md hover:bg-[#2D2B9E] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Supported formats: JPEG, PNG, WebP. Maximum size: 5MB. Recommended dimensions: 1200x600px or similar aspect ratio.
                  </p>
                </div>
              </div>

              {/* Android Banner Section */}
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-600 pt-6">
                <h4 className={`text-md font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <ImageIcon className="w-4 h-4 inline-block mr-2" />
                  Android Banner
                </h4>
                
                {/* Current Android Image Preview */}
                {bannerSettings.androidImagePreview && (
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Current Android Banner:
                    </label>
                    <div className="relative">
                      <img 
                        src={bannerSettings.androidImagePreview} 
                        alt="Current Android Banner" 
                        className="w-full max-w-md h-32 sm:h-40 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  </div>
                )}
                
                {/* Upload New Android Image */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Upload New Android Banner:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleAndroidBannerImageChange}
                      onFocus={clearToast}
                      className={`flex-1 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDarkMode ? 'file:bg-indigo-600 file:text-white' : 'file:bg-indigo-50 file:text-indigo-700'} hover:file:bg-indigo-100`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={uploadAndroidBanner}
                      disabled={loading || !bannerSettings.androidImage}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#3936C9] text-white rounded-lg font-medium shadow-md hover:bg-[#2D2B9E] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Supported formats: JPEG, PNG, WebP. Maximum size: 5MB. This banner will be displayed on the Mobile App Coming Soon page.
                  </p>
                </div>
              </div>

              {/* About Us Banner Section */}
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-600 pt-6">
                <h4 className={`text-md font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <ImageIcon className="w-4 h-4 inline-block mr-2" />
                  About Us Banner
                </h4>
                
                {/* Current About Us Image Preview */}
                {bannerSettings.aboutUsImagePreview && (
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Current About Us Banner:
                    </label>
                    <div className="relative">
                      <img 
                        src={bannerSettings.aboutUsImagePreview} 
                        alt="Current About Us Banner" 
                        className="w-full max-w-md h-32 sm:h-40 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  </div>
                )}
                
                {/* Upload New About Us Image */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Upload New About Us Banner:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleAboutUsBannerImageChange}
                      onFocus={clearToast}
                      className={`flex-1 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDarkMode ? 'file:bg-indigo-600 file:text-white' : 'file:bg-indigo-50 file:text-indigo-700'} hover:file:bg-indigo-100`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={uploadAboutUsBanner}
                      disabled={loading || !bannerSettings.aboutUsImage}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#3936C9] text-white rounded-lg font-medium shadow-md hover:bg-[#2D2B9E] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Supported formats: JPEG, PNG, WebP. Maximum size: 5MB. This banner will be displayed on the About page.
                  </p>
                </div>
              </div>
            </div>
          </SettingCard>

          {/* Team Members Settings */}
          <SettingCard 
            title="Team Members" 
            description="Manage team members displayed on the About page"
          >
            <div className="space-y-6">
              {/* Add New Team Member */}
              <div className="space-y-4">
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Add New Team Member
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newTeamMember.name}
                      onChange={(e) => handleTeamMemberInputChange('name', e.target.value)}
                      onFocus={clearToast}
                      placeholder="Enter team member name"
                      className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Role *
                    </label>
                    <input
                      type="text"
                      value={newTeamMember.role}
                      onChange={(e) => handleTeamMemberInputChange('role', e.target.value)}
                      onFocus={clearToast}
                      placeholder="Enter team member role"
                      className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Bio
                  </label>
                  <textarea
                    value={newTeamMember.bio}
                    onChange={(e) => handleTeamMemberInputChange('bio', e.target.value)}
                    onFocus={clearToast}
                    placeholder="Enter team member bio (optional)"
                    rows={3}
                    className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={newTeamMember.display_order}
                    onChange={(e) => handleTeamMemberInputChange('display_order', e.target.value)}
                    onFocus={clearToast}
                    placeholder="Enter display order"
                    min="0"
                    className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Lower numbers appear first. Leave empty for default (0).
                  </p>
                </div>
                
                {/* Image Preview */}
                {newTeamMember.imagePreview && (
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Image Preview:
                    </label>
                    <div className="flex justify-start">
                      <img 
                        src={newTeamMember.imagePreview} 
                        alt="Team member preview"
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                      />
                    </div>
                  </div>
                )}
                
                {/* Image Upload */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Team Member Image:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleTeamMemberImageChange}
                      onFocus={clearToast}
                      className={`flex-1 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDarkMode ? 'file:bg-indigo-600 file:text-white' : 'file:bg-indigo-50 file:text-indigo-700'} hover:file:bg-indigo-100`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={addTeamMember}
                      disabled={loading || !newTeamMember.name || !newTeamMember.role}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium shadow-md hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Add Member</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Supported formats: JPEG, PNG, WebP. Maximum size: 5MB. Recommended: Square aspect ratio (1:1).
                  </p>
                </div>
              </div>
              
              {/* Current Team Members */}
              {teamMembers.length > 0 && (
                <div className="space-y-4">
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Current Team Members ({teamMembers.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className={`border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} rounded-lg p-4`}>
                        {editingMember === member.id ? (
                          // Edit mode
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                  Name *
                                </label>
                                <input
                                  type="text"
                                  value={editMemberData.name}
                                  onChange={(e) => handleEditMemberInputChange('name', e.target.value)}
                                  onFocus={clearToast}
                                  placeholder="Enter team member name"
                                  className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                  Role *
                                </label>
                                <input
                                  type="text"
                                  value={editMemberData.role}
                                  onChange={(e) => handleEditMemberInputChange('role', e.target.value)}
                                  onFocus={clearToast}
                                  placeholder="Enter team member role"
                                  className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Bio
                              </label>
                              <textarea
                                value={editMemberData.bio}
                                onChange={(e) => handleEditMemberInputChange('bio', e.target.value)}
                                onFocus={clearToast}
                                placeholder="Enter team member bio (optional)"
                                rows={3}
                                className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                              />
                            </div>
                            
                            <div>
                              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Display Order
                              </label>
                              <input
                                type="number"
                                value={editMemberData.display_order}
                                onChange={(e) => handleEditMemberInputChange('display_order', e.target.value)}
                                onFocus={clearToast}
                                placeholder="Enter display order"
                                min="0"
                                className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                              />
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Lower numbers appear first. Leave empty for default (0).
                              </p>
                            </div>
                            
                            {/* Current and New Image Preview */}
                            <div className="flex gap-4 items-start">
                              {editMemberData.imagePreview && (
                                <div>
                                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    {editMemberData.image ? 'New Image:' : 'Current Image:'}
                                  </label>
                                  <img 
                                    src={editMemberData.imagePreview} 
                                    alt="Team member preview"
                                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                                  />
                                </div>
                              )}
                            </div>
                            
                            {/* Image Upload */}
                            <div>
                              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                {editMemberData.imagePreview ? 'Change Image:' : 'Add Image:'}
                              </label>
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleEditMemberImageChange}
                                onFocus={clearToast}
                                className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDarkMode ? 'file:bg-indigo-600 file:text-white' : 'file:bg-indigo-50 file:text-indigo-700'} hover:file:bg-indigo-100`}
                              />
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Supported formats: JPEG, PNG, WebP. Maximum size: 5MB.
                              </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={updateTeamMember}
                                disabled={loading || !editMemberData.name || !editMemberData.role}
                                className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loading ? 'Updating...' : 'Update Member'}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={cancelEditMember}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          // Display mode
                          <div className="space-y-3">
                            <div className="flex gap-4 items-start">
                              {member.image_base64 && (
                                <img 
                                  src={member.image_base64} 
                                  alt={member.name}
                                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                />
                              )}
                              <div className="flex-1">
                                <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {member.name}
                                </h5>
                                <p className={`text-sm ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                  {member.role}
                                </p>
                                {member.bio && (
                                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {member.bio}
                                  </p>
                                )}
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                  Display Order: {member.display_order}
                                </p>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => startEditMember(member)}
                                disabled={loading}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                Edit
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => deleteTeamMember(member.id)}
                                disabled={loading}
                                className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                Delete
                              </motion.button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {teamMembers.length === 0 && (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>No team members found. Add your first team member above.</p>
                </div>
              )}
            </div>
          </SettingCard>

        {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-[#3936C9] text-white rounded-lg font-semibold shadow-lg hover:bg-[#2D2B9E] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save All Settings</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg border max-w-sm ${
              toast.type === 'success' 
                ? `${isDarkMode ? 'bg-green-900 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-700'}` 
                : `${isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`
            }`}
          >
            <Save className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{toast.text}</span>
            <button
              onClick={() => setToast({ show: false, type: '', text: '' })}
              className={`ml-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettingsPage;