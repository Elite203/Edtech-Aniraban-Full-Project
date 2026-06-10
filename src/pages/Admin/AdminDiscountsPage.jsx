import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from "@/components/ui/use-toast";
import { Percent, Save, Loader2, AlertCircle, Plus, Trash2, Tag, BookOpen, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDiscountsPage = () => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [minCartValue, setMinCartValue] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [couponEnabled, setCouponEnabled] = useState(false);
  
  const [coupons, setCoupons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [couponSaving, setCouponSaving] = useState(false);

  // Current Affairs Monthly Test Pricing states
  const [monthlyPrice, setMonthlyPrice] = useState(10);
  const [monthlyValidity, setMonthlyValidity] = useState(1);
  const [monthlyPricingSaving, setMonthlyPricingSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, step: 1, label: '', onConfirm: null });

  // New Coupon Form State
  const [newCode, setNewCode] = useState('');
  const [newPercentage, setNewPercentage] = useState(0);
  const [newIsUniversal, setNewIsUniversal] = useState(true);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);

  const buildUrl = (path) => `${import.meta.env.VITE_BACKEND_URL}${path}`;

  useEffect(() => {
    const fetchSettingsAndData = async () => {
      try {
        const settingsRes = await axios.get(buildUrl('/api/Discounts/get_discount_settings.php'));
        if (settingsRes.data.success && settingsRes.data.data) {
          const settings = settingsRes.data.data;
          setIsEnabled(settings.is_enabled);
          setMinCartValue(settings.min_cart_value);
          setDiscountPercentage(settings.discount_percentage);
          setCouponEnabled(settings.coupon_enabled || false);
        }

        const couponsRes = await axios.get(buildUrl('/api/Coupons/get_coupons.php'));
        if (couponsRes.data.success) {
          setCoupons(couponsRes.data.data || []);
        }

        const coursesRes = await axios.get(buildUrl('/api/Courses/get_courses.php'));
        if (coursesRes.data.success) {
          setCourses(coursesRes.data.courses || []);
        }

        // Fetch monthly test pricing
        try {
          const pricingRes = await axios.get(buildUrl('/api/Discounts/get_monthly_test_pricing.php'));
          if (pricingRes.data.success && pricingRes.data.data) {
            setMonthlyPrice(pricingRes.data.data.price);
            setMonthlyValidity(pricingRes.data.data.validity_days);
          }
        } catch (e) {
          console.error("Failed to load monthly test pricing:", e);
        }
      } catch (error) {
        console.error("Failed to load discount settings or data:", error);
        toast({
          title: "Error",
          description: "Failed to load discount settings from server.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettingsAndData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    if (isEnabled) {
      if (minCartValue < 0) {
        toast({
          title: "Validation Error",
          description: "Minimum cart value cannot be negative.",
          variant: "destructive"
        });
        return;
      }

      if (discountPercentage < 0 || discountPercentage > 100) {
        toast({
          title: "Validation Error",
          description: "Discount percentage must be between 0% and 100%.",
          variant: "destructive"
        });
        return;
      }
    }

    setSaving(true);
    try {
      const response = await axios.post(buildUrl('/api/Discounts/update_discount_settings.php'), {
        is_enabled: isEnabled,
        min_cart_value: parseFloat(minCartValue),
        discount_percentage: parseFloat(discountPercentage),
        coupon_enabled: couponEnabled
      });

      if (response.data.success) {
        toast({
          title: "Settings Saved",
          description: "Discount mode settings have been updated successfully.",
          variant: "success"
        });
      } else {
        throw new Error(response.data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to save discount settings:", error);
      toast({
        title: "Error Saving Settings",
        description: error.message || "An error occurred while communicating with the server.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMode = async (mode) => {
    const newIsEnabled = mode === 'cart';
    const newCouponEnabled = mode === 'coupon';
    
    // Update local state first
    setIsEnabled(newIsEnabled);
    setCouponEnabled(newCouponEnabled);

    setSaving(true);
    try {
      const response = await axios.post(buildUrl('/api/Discounts/update_discount_settings.php'), {
        is_enabled: newIsEnabled,
        min_cart_value: parseFloat(minCartValue),
        discount_percentage: parseFloat(discountPercentage),
        coupon_enabled: newCouponEnabled
      });

      if (response.data.success) {
        toast({
          title: "Mode Updated",
          description: `Active discount mode updated to ${mode === 'cart' ? 'Cart Value Discount' : 'Coupon Code Discount'}.`,
          variant: "success"
        });
      } else {
        throw new Error(response.data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to save discount settings:", error);
      toast({
        title: "Error Saving Settings",
        description: error.message || "An error occurred while communicating with the server.",
        variant: "destructive"
      });
      // Revert states
      setIsEnabled(isEnabled);
      setCouponEnabled(couponEnabled);
    } finally {
      setSaving(false);
    }
  };


  const handleAddCoupon = async (e) => {
    e.preventDefault();
    
    if (!newCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Coupon code is required.",
        variant: "destructive"
      });
      return;
    }

    if (newPercentage <= 0 || newPercentage > 100) {
      toast({
        title: "Validation Error",
        description: "Discount percentage must be between 1% and 100%.",
        variant: "destructive"
      });
      return;
    }

    if (!newIsUniversal && selectedCourseIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one course for course-specific coupon.",
        variant: "destructive"
      });
      return;
    }

    setCouponSaving(true);
    try {
      const response = await axios.post(buildUrl('/api/Coupons/add_coupon.php'), {
        coupon_code: newCode.toUpperCase().trim(),
        discount_percentage: parseFloat(newPercentage),
        is_universal: newIsUniversal ? 1 : 0,
        course_ids: newIsUniversal ? null : selectedCourseIds.join(',')
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Coupon created successfully.",
          variant: "success"
        });
        setNewCode('');
        setNewPercentage(0);
        setNewIsUniversal(true);
        setSelectedCourseIds([]);
        
        // Refresh coupons list
        const couponsRes = await axios.get(buildUrl('/api/Coupons/get_coupons.php'));
        if (couponsRes.data.success) {
          setCoupons(couponsRes.data.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to create coupon:", error);
      toast({
        title: "Error Creating Coupon",
        description: error.response?.data?.message || error.message || "An error occurred.",
        variant: "destructive"
      });
    } finally {
      setCouponSaving(false);
    }
  };

  const handleDeleteCoupon = (id, code) => {
    setDeleteConfirm({
      open: true,
      step: 1,
      label: `coupon code "${code}"`,
      onConfirm: async () => {
        try {
          const response = await axios.post(buildUrl('/api/Coupons/delete_coupon.php'), { id });
          if (response.data.success) {
            toast({
              title: "Success",
              description: "Coupon deleted successfully.",
              variant: "success"
            });
            setCoupons(prev => prev.filter(c => c.id !== id));
          }
        } catch (error) {
          console.error("Failed to delete coupon:", error);
          toast({
            title: "Error Deleting Coupon",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    });
  };

  const handleSaveMonthlyPricing = async (e) => {
    e.preventDefault();
    
    if (monthlyPrice < 0) {
      toast({
        title: "Validation Error",
        description: "Price cannot be negative.",
        variant: "destructive"
      });
      return;
    }

    if (monthlyValidity <= 0) {
      toast({
        title: "Validation Error",
        description: "Validity must be at least 1 day.",
        variant: "destructive"
      });
      return;
    }

    setMonthlyPricingSaving(true);
    try {
      const response = await axios.post(buildUrl('/api/Discounts/update_monthly_test_pricing.php'), {
        price: parseFloat(monthlyPrice),
        validity_days: parseInt(monthlyValidity)
      });

      if (response.data.success) {
        toast({
          title: "Pricing Saved",
          description: "Current Affairs Monthly Test pricing has been updated successfully.",
          variant: "success"
        });
      } else {
        throw new Error(response.data.message || "Failed to update pricing");
      }
    } catch (error) {
      console.error("Failed to save monthly test pricing:", error);
      toast({
        title: "Error Saving Pricing",
        description: error.message || "An error occurred while communicating with the server.",
        variant: "destructive"
      });
    } finally {
      setMonthlyPricingSaving(false);
    }
  };

  const handleToggleCourseSelection = (courseId) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId]
    );
  };

  const getCourseTitlesText = (commaIds) => {
    if (!commaIds) return 'N/A';
    const ids = commaIds.split(',');
    const titles = ids.map(id => {
      const course = courses.find(c => String(c.id) === String(id));
      return course ? course.title : `ID: ${id}`;
    });
    return titles.join(', ');
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Percent className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Manage Discounts, Coupons & Pricing
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure active discounts, coupons, and pricing settings</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading discount configuration...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            
            {/* Mode selection card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Test Series Active Discount Mode</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Choose which discount system is currently active for test series. Only one system can be active at a time.</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mode 1: Cart Value Discount */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    isEnabled 
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                      : 'bg-gray-50 dark:bg-gray-900/30 border-gray-150 dark:border-gray-750'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <Percent className="w-4 h-4 text-blue-500" />
                          Cart Value Discount
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Apply discounts dynamically when cart value exceeds a specific threshold amount.</p>
                      </div>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleToggleMode('cart')}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-750'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Mode 2: Coupon Codes */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    couponEnabled 
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                      : 'bg-gray-50 dark:bg-gray-900/30 border-gray-150 dark:border-gray-750'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-blue-500" />
                          Coupon Code Discount
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Allow students to enter custom coupon codes. Applies to specific courses or universally.</p>
                      </div>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleToggleMode('coupon')}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          couponEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-750'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            couponEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-150 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    * Changing the active mode automatically updates the database and applies it to student checkouts.
                  </span>
                  {saving && (
                    <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium">
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Saving mode...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Cart value configurations card */}
            {isEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Test Series Cart Value Discount Configuration</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Specify thresholds and percentage discount rates for test series.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Minimum Cart Value (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={minCartValue}
                        onChange={(e) => setMinCartValue(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Discount Percentage (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        required
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-md disabled:opacity-75"
                    >
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Coupons system manager */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Tag className="w-5 h-5 text-blue-500" />
                    Test Series Coupon Code Manager
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add, edit, or delete custom discount coupons for test series.</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  couponEnabled 
                    ? 'bg-green-150 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {couponEnabled ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form column */}
                <div className="lg:col-span-1 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-700/50 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wider">Create New Coupon</h3>
                  
                  <form onSubmit={handleAddCoupon} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-400">Coupon Code</label>
                      <input
                        type="text"
                        required
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        placeholder="e.g. FLAT20"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-350 dark:border-gray-700 rounded-lg text-sm uppercase font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-400">Discount Percentage (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={newPercentage || ''}
                        onChange={(e) => setNewPercentage(e.target.value)}
                        placeholder="e.g. 20"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-350 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-400">Applicability Type</label>
                      <select
                        value={newIsUniversal ? 'universal' : 'specific'}
                        onChange={(e) => setNewIsUniversal(e.target.value === 'universal')}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-350 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                      >
                        <option value="universal">Universal (All Courses)</option>
                        <option value="specific">Specific Course(s)</option>
                      </select>
                    </div>

                    {/* Course Selection list for specific coupons */}
                    {!newIsUniversal && (
                      <div className="space-y-2 border-t pt-3">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-400 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                          Select Courses ({selectedCourseIds.length})
                        </label>
                        <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800 p-2 space-y-1">
                          {courses.map(course => {
                            const isChecked = selectedCourseIds.includes(String(course.id));
                            return (
                              <button
                                type="button"
                                key={course.id}
                                onClick={() => handleToggleCourseSelection(String(course.id))}
                                className={`w-full flex items-center gap-2 p-2 rounded text-left transition-colors text-xs ${
                                  isChecked 
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-400'
                                }`}
                              >
                                <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                  isChecked ? 'bg-blue-600 border-transparent text-white' : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {isChecked && <Check className="w-3 h-3" />}
                                </div>
                                <span className="truncate">{course.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={couponSaving}
                      className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-md disabled:opacity-75 mt-2"
                    >
                      {couponSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1.5" />
                          Create Coupon
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Table list column */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wider">Available Coupon Codes</h3>
                  
                  {coupons.length === 0 ? (
                    <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center text-gray-500 dark:text-gray-400">
                      <Tag className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="font-semibold text-sm">No coupons found</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Use the creator form to add new discount coupons.</p>
                    </div>
                  ) : (
                    <div className="border border-gray-150 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-150 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                              <th className="px-4 py-3">Code</th>
                              <th className="px-4 py-3">Discount</th>
                              <th className="px-4 py-3">Scope</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                            {coupons.map((coupon) => (
                              <tr key={coupon.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">{coupon.coupon_code}</td>
                                <td className="px-4 py-3 font-semibold">{parseFloat(coupon.discount_percentage)}%</td>
                                <td className="px-4 py-3 text-xs max-w-[200px] truncate">
                                  {coupon.is_universal == 1 ? (
                                    <span className="px-2 py-0.5 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 rounded-full font-bold">Universal</span>
                                  ) : (
                                    <span className="text-gray-500 dark:text-gray-400" title={getCourseTitlesText(coupon.course_ids)}>
                                      Specific: {getCourseTitlesText(coupon.course_ids)}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => handleDeleteCoupon(coupon.id, coupon.coupon_code)}
                                    className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>

            {/* Section 3: Current Affairs Monthly Test Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Current Affairs Monthly Test Pricing
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure the default pricing and validity duration for the monthly current affairs tests.</p>
              </div>

              <form onSubmit={handleSaveMonthlyPricing} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Pricing (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={monthlyPrice}
                      onChange={(e) => setMonthlyPrice(e.target.value)}
                      placeholder="e.g. 10.00"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Validity Period (in Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={monthlyValidity}
                      onChange={(e) => setMonthlyValidity(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end">
                  <button
                    type="submit"
                    disabled={monthlyPricingSaving}
                    className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-md disabled:opacity-75"
                  >
                    {monthlyPricingSaving ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1.5" />
                    )}
                    {monthlyPricingSaving ? 'Saving...' : 'Save Pricing Settings'}
                  </button>
                </div>
              </form>
            </motion.div>

          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.open && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteConfirm({ open: false, step: 1, label: '', onConfirm: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-2xl shadow-2xl p-6 border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>

              {deleteConfirm.step === 1 ? (
                <>
                  <h3 className="text-lg font-bold text-center mb-2">Delete?</h3>
                  <p className="text-sm text-center mb-5 text-gray-600 dark:text-gray-300">
                    Are you sure you want to delete the {deleteConfirm.label}?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ open: false, step: 1, label: '', onConfirm: null })}
                      className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(prev => ({ ...prev, step: 2 }))}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-center mb-2 text-red-600 dark:text-red-400">Final Confirmation</h3>
                  <p className="text-sm text-center mb-5 text-gray-600 dark:text-gray-300">
                    This action is <span className="font-bold text-red-600 dark:text-red-400">irreversible</span>. Proceed with permanent deletion?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ open: false, step: 1, label: '', onConfirm: null })}
                      className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const fn = deleteConfirm.onConfirm;
                        setDeleteConfirm({ open: false, step: 1, label: '', onConfirm: null });
                        if (fn) fn();
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-bold transition-colors"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminDiscountsPage;
