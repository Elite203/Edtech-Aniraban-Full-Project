import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Save, AlertCircle, CheckCircle, Image as ImageIcon, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';

const AdminPopupBannerPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [telegramLink, setTelegramLink] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [fetchingBanner, setFetchingBanner] = useState(true);
  const [popupEnabled, setPopupEnabled] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(true);
  
  // Current Affairs Banner State
  const [caBanner, setCaBanner] = useState(null);
  const [caSelectedFile, setCaSelectedFile] = useState(null);
  const [caPreviewUrl, setCaPreviewUrl] = useState(null);
  const [caLinks, setCaLinks] = useState({
    insta_link: '',
    fb_link: '',
    wa_link: '',
    li_link: '',
    tg_link: ''
  });
  const [caFetching, setCaFetching] = useState(true);
  const [caSaveLoading, setCaSaveLoading] = useState(false);


  const buildUrl = (path) => `${import.meta.env.VITE_BACKEND_URL}${path}`;

  // Fetch current banner on component mount
  const fetchCurrentBanner = async () => {
    console.log('🔍 Fetching current banner...');
    setFetchingBanner(true);
    
    try {
      const response = await axios.get(buildUrl('/api/Settings/get_banner.php'));
      console.log('📊 Current banner response:', response.data);
      
      if (response.data.success && response.data.banner) {
        console.log('✅ Current banner found, length:', response.data.banner.length);
        setCurrentBanner(`data:image/jpeg;base64,${response.data.banner}`);
        setTelegramLink(response.data.telegram_link || '');
        setTargetDate(response.data.target_date || '');
        setTelegramEnabled(response.data.telegram_enabled === 1);
        setTimerEnabled(response.data.timer_enabled === 1);
      } else {
        console.log('ℹ️ No current banner available');
        setCurrentBanner(null);
      }
    } catch (error) {
      console.error('❌ Error fetching current banner:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setCurrentBanner(null);
    } finally {
      setFetchingBanner(false);
    }
  };

  // Fetch popup toggle state from banner_toggle table
  const fetchPopupState = async () => {
    console.log('🔍 Fetching popup toggle state from banner_toggle table...');
    
    try {
      const response = await axios.get(buildUrl('/api/Settings/get_popup_state.php'));
      console.log('📊 Popup state response from banner_toggle table:', response.data);
      
      if (response.data.success) {
        const isEnabled = response.data.state !== undefined ? response.data.state : response.data.enabled;
        setPopupEnabled(isEnabled);
      } else {
        setPopupEnabled(true);
      }
    } catch (error) {
      console.error('❌ Error fetching popup state:', error);
      setPopupEnabled(true); 
    }
  };

  const fetchCABanner = async () => {
    setCaFetching(true);
    try {
      const response = await axios.get(buildUrl('/api/CurrentAffairs/get_ca_banner.php'));
      if (response.data.status === 'success') {
        const data = response.data.data;
        setCaBanner(data.banner_image);
        setCaLinks({
          insta_link: data.insta_link || '',
          fb_link: data.fb_link || '',
          wa_link: data.wa_link || '',
          li_link: data.li_link || '',
          tg_link: data.tg_link || ''
        });
      }
    } catch (error) {
      console.error('Error fetching CA banner:', error);
    } finally {
      setCaFetching(false);
    }
  };


  // Toggle popup state in banner_toggle table
  const handleTogglePopup = async (enabled) => {
    setToggleLoading(true);
    try {
      const response = await axios.post(buildUrl('/api/Settings/set_popup_state.php'), {
        state: enabled
      });
      if (response.data.success) {
        setPopupEnabled(enabled);
        setMessage({ 
          type: 'success', 
          text: `Popup ${enabled ? 'enabled' : 'disabled'} successfully!` 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating popup state.' });
    } finally {
      setToggleLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentBanner();
    fetchPopupState();
    fetchCABanner();
  }, []);


  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setMessage({ type: '', text: '' });
      } else {
        setMessage({ type: 'error', text: 'Please select a valid image file.' });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select an image file first.' });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('banner_image', selectedFile);
    formData.append('telegram_link', telegramLink);
    formData.append('target_date', targetDate);
    formData.append('telegram_enabled', telegramEnabled ? 1 : 0);
    formData.append('timer_enabled', timerEnabled ? 1 : 0);

    try {
      const response = await axios.post(buildUrl('/api/Settings/upload_banner.php'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Banner and settings updated successfully!' });
        setSelectedFile(null);
        setPreviewUrl(null);
        document.getElementById('fileInput').value = '';
        fetchCurrentBanner();
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Upload failed.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error uploading banner.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    setSaveLoading(true);
    try {
      // Format date for MySQL: replace 'T' with space
      const formattedDate = targetDate ? targetDate.replace('T', ' ') : null;
      
      const response = await axios.post(buildUrl('/api/Settings/update_banner_settings.php'), {
        telegram_link: telegramLink,
        target_date: formattedDate,
        telegram_enabled: telegramEnabled ? 1 : 0,
        timer_enabled: timerEnabled ? 1 : 0
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Banner settings updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Update failed.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating settings.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCAFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setCaSelectedFile(file);
      setCaPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCAUpdate = async () => {
    setCaSaveLoading(true);
    const formData = new FormData();
    if (caSelectedFile) formData.append('banner_image', caSelectedFile);
    formData.append('insta_link', caLinks.insta_link);
    formData.append('fb_link', caLinks.fb_link);
    formData.append('wa_link', caLinks.wa_link);
    formData.append('li_link', caLinks.li_link);
    formData.append('tg_link', caLinks.tg_link);

    try {
      const response = await axios.post(buildUrl('/api/CurrentAffairs/update_ca_banner.php'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.status === 'success') {
        setMessage({ type: 'success', text: 'Current Affairs banner updated!' });
        setCaSelectedFile(null);
        setCaPreviewUrl(null);
        fetchCABanner();
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating CA banner' });
    } finally {
      setCaSaveLoading(false);
    }
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Website Popup Banner</h1>
        </div>

        {/* Global Message Display */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center shadow-md ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span className="font-medium">{message.text}</span>
            <button 
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-auto text-current opacity-50 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Popup Toggle Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Popup Display Control</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {popupEnabled ? 'Popup is currently enabled and will appear on homepage' : 'Popup is currently disabled and will not appear on homepage'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${popupEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {popupEnabled ? 'ON' : 'OFF'}
              </span>
              <button
                onClick={() => handleTogglePopup(!popupEnabled)}
                disabled={toggleLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  popupEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                } ${toggleLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    popupEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              {toggleLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              )}
            </div>
          </div>
        </div>

        {/* Current Active Banner Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Active Banner</h2>
          
          {fetchingBanner ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mr-3"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading current banner...</span>
            </div>
          ) : currentBanner ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <img 
                  src={currentBanner}
                  alt="Current Active Banner"
                  className="max-w-md w-full h-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                />
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                This banner is currently displayed on the website homepage
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No banner is currently active</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Upload a new banner to get started</p>
            </div>
          )}
        </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Banner Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telegram Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={telegramLink}
                    onChange={(e) => setTelegramLink(e.target.value)}
                    placeholder="https://t.me/yourchannel"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Limited Time Offer (Target Date & Time)
                  </label>
                  <input
                    type="datetime-local"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Telegram Link Toggle</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Show or hide Telegram join button</p>
                  </div>
                  <button
                    onClick={() => setTelegramEnabled(!telegramEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      telegramEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${telegramEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Timer Toggle</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Show or hide limited time offer countdown</p>
                  </div>
                  <button
                    onClick={() => setTimerEnabled(!timerEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      timerEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${timerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleUpdateSettings}
                disabled={saveLoading}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {saveLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            {/* Current Affairs Exclusive Banner Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Affairs Exclusive Offer</h2>
                  <p className="text-sm text-gray-500">Manage the sharing offer popup for Current Affairs pages</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.keys(caLinks).map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                          {key.replace('_', ' ')}
                        </label>
                        <input
                          type="text"
                          value={caLinks[key]}
                          onChange={(e) => setCaLinks({ ...caLinks, [key]: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Link or #"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Banner Image (Fits perfectly in popup)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCAFileSelect}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                    />
                  </div>

                  <button
                    onClick={handleCAUpdate}
                    disabled={caSaveLoading}
                    className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {caSaveLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Current Affairs Banner
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Active Preview</h3>
                  <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    {caPreviewUrl || caBanner ? (
                      <img 
                        src={caPreviewUrl || caBanner} 
                        alt="CA Banner" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400 p-6">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No banner uploaded yet</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-800 dark:text-yellow-400">
                      <strong>Tip:</strong> Use an image with a horizontal aspect ratio (e.g., 4:3 or 16:9) to fit the popup correctly. The image will be stored as a high-quality BLOB.
                    </p>
                  </div>
                </div>
              </div>
            </div>


            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Instructions:</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Only image files (JPG, PNG, GIF) are supported</li>
                <li>• Recommended size: 800x600 pixels or similar aspect ratio</li>
                <li>• The banner will be displayed in the homepage popup</li>
                <li>• Uploading a new banner will replace the existing one</li>
              </ul>
            </div>
          </div>
    </AdminLayout>
  );
};

export default AdminPopupBannerPage;