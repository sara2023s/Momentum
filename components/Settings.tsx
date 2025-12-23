import React, { useState, useEffect, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Calendar, Phone, Image as ImageIcon, Save, Upload, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../App';
import { updateUserProfile, uploadProfileImage } from '../actions/user';
import { supabase } from '../lib/supabase';

export const Settings: React.FC = () => {
  const { user: authUser } = useAuth();
  const { refreshUser } = useApp();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authUser) return;
    
    const fetchUserProfile = async () => {
      try {
        const { data: user, error } = await supabase
          .from('User')
          .select('name, birthday, phoneNumber, profileImageUrl')
          .eq('id', authUser.id)
          .single();

        if (error) {
          // If columns don't exist yet, that's okay - we'll handle it gracefully
          if (error.code === '42703' || error.message?.includes('column')) {
            console.warn('Profile columns not found. Please run the migration SQL.');
            // Use auth user data as fallback
            setName(authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '');
            setLoading(false);
            return;
          }
          if (error.code !== 'PGRST116') {
            throw error;
          }
        }

        if (user) {
          setName(user.name || '');
          setBirthday(user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '');
          setPhoneNumber(user.phoneNumber || '');
          setProfileImageUrl(user.profileImageUrl || null);
        } else {
          // Use auth user data as fallback
          setName(authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '');
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = await uploadProfileImage(authUser.id, file);
      setProfileImageUrl(imageUrl);
      setMessage({ type: 'success', text: 'Profile image uploaded successfully' });
    } catch (error) {
      console.error('Failed to upload image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!authUser) return;
    
    setUploadingImage(true);
    try {
      await updateUserProfile(authUser.id, { profileImageUrl: null });
      setProfileImageUrl(null);
      setMessage({ type: 'success', text: 'Profile image removed' });
    } catch (error) {
      console.error('Failed to remove image:', error);
      setMessage({ type: 'error', text: 'Failed to remove image' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    startTransition(async () => {
      try {
        const birthdayDate = birthday ? new Date(birthday) : null;
        await updateUserProfile(authUser.id, {
          name: name.trim() || null,
          birthday: birthdayDate,
          phoneNumber: phoneNumber.trim() || null,
          profileImageUrl: profileImageUrl || null,
        });
        
        await refreshUser();
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error('Failed to update profile:', error);
        setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text/60">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <SettingsIcon size={24} className="text-primary" />
          Settings
        </h2>
        <p className="text-text/70 text-xs sm:text-sm mt-1">Manage your profile and preferences.</p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="bg-surface border border-surface/50 rounded-xl p-6">
          <label className="text-sm font-medium text-text mb-4 block flex items-center gap-2">
            <ImageIcon size={18} className="text-primary" />
            Profile Image
          </label>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              {profileImageUrl ? (
                <div className="relative group">
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-surface/50"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={uploadingImage}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-surface/50 border-2 border-surface/50 flex items-center justify-center">
                  <User size={32} className="text-text/40" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage || isPending}
                  className="hidden"
                />
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface/50 hover:bg-surface/70 rounded-lg text-text/70 hover:text-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Upload size={16} />
                  {uploadingImage ? 'Uploading...' : profileImageUrl ? 'Change Image' : 'Upload Image'}
                </div>
              </label>
              <p className="text-xs text-text/60 mt-2">JPG, PNG or GIF. Max size 5MB.</p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="bg-surface border border-surface/50 rounded-xl p-6">
          <label htmlFor="name" className="text-sm font-medium text-text mb-3 block flex items-center gap-2">
            <User size={18} className="text-primary" />
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-obsidian border border-surface/50 rounded-lg px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px]"
            disabled={isPending}
          />
        </div>

        {/* Birthday */}
        <div className="bg-surface border border-surface/50 rounded-xl p-6">
          <label htmlFor="birthday" className="text-sm font-medium text-text mb-3 block flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            Birthday
          </label>
          <input
            id="birthday"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-obsidian border border-surface/50 rounded-lg px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px]"
            disabled={isPending}
          />
        </div>

        {/* Phone Number */}
        <div className="bg-surface border border-surface/50 rounded-xl p-6">
          <label htmlFor="phone" className="text-sm font-medium text-text mb-3 block flex items-center gap-2">
            <Phone size={18} className="text-primary" />
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full bg-obsidian border border-surface/50 rounded-lg px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px]"
            disabled={isPending}
          />
        </div>

        {/* Email (Read-only) */}
        <div className="bg-surface border border-surface/50 rounded-xl p-6">
          <label className="text-sm font-medium text-text mb-3 block">Email</label>
          <input
            type="email"
            value={authUser?.email || ''}
            disabled
            className="w-full bg-obsidian/50 border border-surface/50 rounded-lg px-4 py-3 text-text/60 cursor-not-allowed min-h-[44px]"
          />
          <p className="text-xs text-text/60 mt-2">Email cannot be changed</p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || uploadingImage}
            className="px-6 py-3 bg-primary hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            <Save size={18} />
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

