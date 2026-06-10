import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { 
  Camera, 
  Edit3, 
  Save, 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Smartphone, 
  Monitor,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Check
} from 'lucide-react';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const fileInputRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchLoginHistory = async (studentId) => {
    try {
      const response = await axios.get(`${BASE_URL}api/StudentLoginDetect/get_login_activity.php?student_id=${studentId}&limit=5`);
      if (response.data.success) {
        setLoginHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching login history:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const storedAuth = localStorage.getItem("user");
      if (!storedAuth) return;
      
      const authData = JSON.parse(storedAuth);
      const response = await axios.get(`${BASE_URL}api/Students/get_student_profile.php?id=${authData.id}`);
      
      if (response.data.success && response.data.student) {
        const userData = response.data.student;
        const timestamp = new Date().getTime();
        const photoUrl = userData.id
          ? `${BASE_URL}api/Students/get_student_photo.php?id=${userData.id}&t=${timestamp}`
          : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        
        const fullUser = {
          ...userData,
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          email: userData.email || authData.email || "",
          age: userData.age || "",
          date_of_birth: userData.date_of_birth || "",
          profilePic: photoUrl,
          registrationDate: userData.registrationDate || "2024-01-01T10:00:00Z",
          state: userData.state || "Maharashtra",
          contactNo: userData.number || userData.contactNo || "",
        };
        
        setUser(fullUser);
        setEditedUser(fullUser);
        fetchLoginHistory(userData.id);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only JPEG, PNG, and GIF files are allowed",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
        setShowPhotoModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;

    setIsUpdatingPhoto(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('action', 'update_photo');
      formDataToSend.append('student_id', user?.id || '');
      formDataToSend.append('photo', selectedPhoto);
      
      const res = await axios.post(`${BASE_URL}api/Students/update_student_profile.php`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      let responseData;
      if (typeof res.data === 'string') {
        try {
          responseData = JSON.parse(res.data);
        } catch (parseError) {
          if (res.data === '' && res.status === 200) {
            responseData = { success: true };
          } else {
            responseData = { success: false, error: 'Invalid response format' };
          }
        }
      } else {
        responseData = res.data;
      }
      
      if (responseData.success || (res.status === 200 && (res.data === '' || res.data === null))) {
        toast({
          title: "Success",
          description: "Profile picture updated successfully!",
        });
        
        await fetchUserData();
        setShowPhotoModal(false);
        setSelectedPhoto(null);
        setPhotoPreview(null);
      } else {
        toast({
          title: "Upload failed",
          description: responseData?.error || "Upload failed - please try again",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Network error",
        description: "An error occurred while uploading: " + (err.response?.data?.error || err.message),
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const cancelPhotoUpload = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        action: 'update_profile',
        student_id: user?.id,
        first_name: editedUser?.firstName || "",
        last_name: editedUser?.lastName || "",
        number: user?.number || user?.contactNo || "", // Always use the original number as it's disabled for editing
        age: editedUser?.age || "",
        date_of_birth: editedUser?.date_of_birth || "",
        state: editedUser?.state || "Your State"
      };
      
      const res = await axios.post(`${BASE_URL}api/Students/update_student_profile.php`, payload);
      
      if (res.data.success || (res.status === 200 && res.data === '')) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        await fetchUserData();
        setIsEditing(false);
      } else {
        toast({
          title: "Update failed",
          description: res.data.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Network error",
        description: "An error occurred while updating",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      const payload = {
        action: 'change_password',
        student_id: user?.id,
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      };

      const response = await axios.post(`${BASE_URL}api/Students/update_student_profile.php`, payload);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Password updated successfully!",
        });
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Password update failed.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Network error",
        description: "An error occurred",
        variant: "destructive"
      });
    }
  };

  const getDeviceIcon = (deviceName) => {
    const name = (deviceName || '').toLowerCase();
    if (name.includes('android') || name.includes('iphone')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Not specified";
      return date.toLocaleString();
    } catch (e) {
      return "Not specified";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !editedUser) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account information and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={editedUser.profilePic}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white dark:border-gray-800 shadow-lg"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
                {isEditing && (
                  <button 
                    onClick={triggerPhotoUpload}
                    className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4">{user.firstName} {user.lastName}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  Member since {(() => {
                    const formatted = formatDateTime(user.registrationDate);
                    return formatted.includes(',') ? formatted.split(',')[0] : formatted;
                  })()}
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  {user.state}, India
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm font-medium"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center text-sm font-medium"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details & Login History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser?.firstName || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z]/g, '');
                      setEditedUser({ ...editedUser, firstName: value });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2 font-medium">{user?.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser?.lastName || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z]/g, '');
                      setEditedUser({ ...editedUser, lastName: value });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2 font-medium">{user?.lastName}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedUser?.email || ""}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2 font-medium break-all border border-gray-200 dark:border-gray-700 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">{user?.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedUser?.age || ""}
                    onChange={(e) => setEditedUser({ ...editedUser, age: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    min="1"
                    max="120"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2 font-medium">{user?.age || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedUser?.date_of_birth || ""}
                    onChange={(e) => setEditedUser({ ...editedUser, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2 font-medium">{user?.date_of_birth || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedUser?.contactNo || ""}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2 font-medium">{user?.contactNo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
                {isEditing ? (
                  <select
                    value={editedUser?.state || "Maharashtra"}
                    onChange={(e) => setEditedUser({ ...editedUser, state: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
<option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
<option value="Andhra Pradesh">Andhra Pradesh</option>
<option value="Arunachal Pradesh">Arunachal Pradesh</option>
<option value="Assam">Assam</option>
<option value="Bihar">Bihar</option>
<option value="Chandigarh">Chandigarh</option>
<option value="Chhattisgarh">Chhattisgarh</option>
<option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
<option value="Delhi">Delhi</option>
<option value="Goa">Goa</option>
<option value="Gujarat">Gujarat</option>
<option value="Haryana">Haryana</option>
<option value="Himachal Pradesh">Himachal Pradesh</option>
<option value="Jammu and Kashmir">Jammu and Kashmir</option>
<option value="Jharkhand">Jharkhand</option>
<option value="Karnataka">Karnataka</option>
<option value="Kerala">Kerala</option>
<option value="Ladakh">Ladakh</option>
<option value="Lakshadweep">Lakshadweep</option>
<option value="Madhya Pradesh">Madhya Pradesh</option>
<option value="Maharashtra">Maharashtra</option>
<option value="Manipur">Manipur</option>
<option value="Meghalaya">Meghalaya</option>
<option value="Mizoram">Mizoram</option>
<option value="Nagaland">Nagaland</option>
<option value="Odisha">Odisha</option>
<option value="Puducherry">Puducherry</option>
<option value="Punjab">Punjab</option>
<option value="Rajasthan">Rajasthan</option>
<option value="Sikkim">Sikkim</option>
<option value="Tamil Nadu">Tamil Nadu</option>
<option value="Telangana">Telangana</option>
<option value="Tripura">Tripura</option>
<option value="Uttar Pradesh">Uttar Pradesh</option>
<option value="Uttarakhand">Uttarakhand</option>
<option value="West Bengal">West Bengal</option>


                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white py-2 font-medium">{user.state}</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Security Notice - Positioned Above */}
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">⚠️</span>
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400">Important Security Notice</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                  If you notice any unfamiliar login date, time, device, or activity in your account, we strongly recommend please change your password immediately to protect your account from unauthorized access or possible compromise.
                </p>
                
                <div className="p-4 bg-white/50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <p className="text-xs text-amber-900 dark:text-amber-200 font-bold uppercase tracking-wider mb-2 text-red-600 dark:text-red-400">PLEASE NOTE :</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                    Account sharing, unauthorized access, or misuse of login credentials is strictly prohibited. If any suspicious activity, unauthorized access, or ID/password sharing is detected, <span className="font-bold">YOUR COURSE ACCESS MAY BE TEMPORARILY SUSPENDED OR PERMANENTLY BLOCKED WITHOUT PRIOR NOTICE.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Login History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Login Activity</h3>
              
              <div className="space-y-4">
                {loginHistory.length > 0 ? loginHistory.map((attempt, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm text-gray-600 dark:text-gray-300">
                        {getDeviceIcon(attempt.device || 'Monitor')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {attempt.browser || 'Unknown Browser'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{attempt.city}</p>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <div className="flex items-center sm:justify-end space-x-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {(() => {
                            if (!attempt.login_at) return 'Unknown';
                            try {
                              const date = new Date(attempt.login_at.replace(' ', 'T'));
                              if (isNaN(date.getTime())) return attempt.login_at;
                              return `${date.toLocaleDateString('en-IN')} at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
                            } catch (e) {
                              return attempt.login_at || 'Unknown';
                            }
                          })()}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}>
                        Successful
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent login activity found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Photo Preview & Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Update Profile Picture</h3>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-48 h-48 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900/30"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handlePhotoUpload}
                disabled={isUpdatingPhoto}
                className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-semibold disabled:opacity-50"
              >
                {isUpdatingPhoto ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {isUpdatingPhoto ? 'Uploading...' : 'Upload Photo'}
              </button>
              <button
                onClick={cancelPhotoUpload}
                disabled={isUpdatingPhoto}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
