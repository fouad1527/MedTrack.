import React, { useState, useRef } from 'react';
import { useMedTrack } from '../store/useMedTrackStore';
import { translations } from '../translations';
import { Language, ThemeMode } from '../types';
import { UserAvatar } from './UserAvatar';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  User, 
  Globe, 
  Sun, 
  Moon, 
  Download, 
  RotateCcw, 
  LogOut, 
  CheckCircle2, 
  ShieldCheck, 
  Camera,
  Upload,
  Trash2,
  Lock,
  KeyRound,
  Mail,
  BookOpen,
  ZoomIn,
  ZoomOut,
  X,
  AlertCircle,
  Sparkles,
  GraduationCap,
  Building2,
  Check
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, updateUser, exportDataJSON, resetDemoData, logout } = useMedTrack();
  const t = translations[user.language] || translations['en'];

  // Personal Info Form State
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [university, setUniversity] = useState(user.university);
  const [faculty, setFaculty] = useState(user.faculty);
  const [academicYear, setAcademicYear] = useState(user.academicYear);
  const [studySystem, setStudySystem] = useState(user.studySystem || 'Credit Hours System');
  const [savedProfileSuccess, setSavedProfileSuccess] = useState(false);

  // Security / Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Email Update Status
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile Picture Upload / Crop State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState<string | null>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);

  // File Selection Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    // reset input value so re-selecting same file works
    e.target.value = '';
  };

  // Crop & Process Image
  const generateCroppedDataUrl = (): string => {
    if (!previewImgRef.current) return selectedImageSrc || '';
    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return selectedImageSrc || '';

    // Dark fill background for transparent PNGs
    ctx.fillStyle = '#121214';
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    // Move to center + pan offsets
    ctx.translate(size / 2 + panX, size / 2 + panY);
    ctx.scale(zoom, zoom);

    const img = previewImgRef.current;
    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW = size;
    let drawH = size;

    if (aspect > 1) {
      drawH = size;
      drawW = size * aspect;
    } else {
      drawW = size;
      drawH = size / aspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.92);
  };

  // Save Cropped Photo
  const handleSavePhoto = async () => {
    setIsUploadingPhoto(true);
    try {
      const croppedDataUrl = generateCroppedDataUrl();

      let finalUrl = croppedDataUrl;

      // Upload to Supabase Storage if configured
      if (isSupabaseConfigured()) {
        try {
          const blob = await (await fetch(croppedDataUrl)).blob();
          const fileName = `avatar-${user.id || 'user'}-${Date.now()}.jpg`;

          const { error: uploadErr } = await supabase.storage
            .from('avatars')
            .upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });

          if (!uploadErr) {
            const { data: publicData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            if (publicData?.publicUrl) {
              finalUrl = publicData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('Supabase storage fallback to data URL:', storageErr);
        }
      }

      updateUser({ avatarUrl: finalUrl });
      setShowCropModal(false);
      setSelectedImageSrc(null);
      setPhotoSuccessMsg('Profile picture updated successfully!');
      setTimeout(() => setPhotoSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Error saving avatar:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Remove Photo Handler
  const handleRemovePhoto = () => {
    updateUser({ avatarUrl: '' });
    setPhotoSuccessMsg('Profile picture removed. Initials avatar active.');
    setTimeout(() => setPhotoSuccessMsg(null), 3000);
  };

  // Save Personal Info
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      university,
      faculty,
      academicYear,
      studySystem,
    });

    // Check if email changed in Supabase
    if (email !== user.email && isSupabaseConfigured()) {
      supabase.auth.updateUser({ email }).then(({ error }) => {
        if (error) {
          setEmailStatus({ type: 'error', message: error.message });
        } else {
          setEmailStatus({ type: 'success', message: 'Verification link sent to new email address!' });
        }
      });
    }

    setSavedProfileSuccess(true);
    setTimeout(() => setSavedProfileSuccess(false), 3000);
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match. Please verify.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setUpdatingPassword(true);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          setPasswordStatus({ type: 'error', message: error.message });
        } else {
          setPasswordStatus({ type: 'success', message: 'Password successfully updated in Supabase Auth!' });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        }
      } else {
        // Local simulation feedback
        setPasswordStatus({ type: 'success', message: 'Password successfully updated!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1000px] mx-auto space-y-8 pb-24 md:pb-12">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <img 
          src="/medtrack-logo.svg" 
          alt="MedTrack Logo" 
          className="w-12 h-12 rounded-2xl shadow-md object-contain bg-transparent shrink-0" 
        />
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Workspace {t.settings} & Profile
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your personal medical credentials, photo, security settings, and app preferences.
          </p>
        </div>
      </div>

      {/* SECTION 1: PROFILE PICTURE MANAGEMENT */}
      <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Profile Photo</h3>
          </div>
          {photoSuccessMsg && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {photoSuccessMsg}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <UserAvatar 
              name={user.name} 
              avatarUrl={user.avatarUrl} 
              className="w-24 h-24 text-2xl" 
              textClassName="text-2xl font-extrabold"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
              <Camera className="w-5 h-5" />
              <span>Change Photo</span>
            </div>
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              {user.avatarUrl ? 'Custom Profile Photo' : 'Default Initials Avatar'}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
              Upload a clear photo or medical badge avatar. Your image syncs instantly across the header, sidebar, and workspace.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Photo</span>
              </button>

              {user.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3.5 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-red-500/10 hover:text-red-500 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PERSONAL & ACADEMIC INFORMATION */}
      <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{t.profileInfo}</h3>
          </div>
          {savedProfileSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Profile Updated
            </span>
          )}
        </div>

        {emailStatus && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            emailStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{emailStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                {t.university}
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. Johns Hopkins University"
                className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                {t.faculty}
              </label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="e.g. Faculty of Medicine"
                className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                {t.academicYear}
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="Medical Year 1">Medical Student (Year 1)</option>
                <option value="Medical Year 2">Medical Student (Year 2)</option>
                <option value="Medical Year 3">Medical Student (Year 3)</option>
                <option value="Medical Year 4">Medical Student (Year 4)</option>
                <option value="Medical Year 5">Medical Student (Year 5)</option>
                <option value="Internship Year">Internship Doctor</option>
                <option value="PGY-1 (Internal Medicine)">PGY-1 Resident</option>
                <option value="PGY-2 (Internal Medicine)">PGY-2 Resident</option>
                <option value="Fellowship">Fellow / Specialist</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                Study System
              </label>
              <select
                value={studySystem}
                onChange={(e) => setStudySystem(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="Credit Hours System">Credit Hours System</option>
                <option value="Semester System">Semester System</option>
                <option value="5+2 Integrated System">5+2 Integrated System</option>
                <option value="6+1 Traditional System">6+1 Traditional System</option>
                <option value="Organ-System Based Modular System">Organ-System Based Modular System</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Save Profile Information
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: SECURITY & PASSWORD MANAGEMENT */}
      <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Security & Password</h3>
        </div>

        {passwordStatus && (
          <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            passwordStatus.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {passwordStatus.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{passwordStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updatingPassword}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {updatingPassword && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 4: PREFERENCES & LOCALIZATION */}
      <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-500" />
          <span>App Preferences & Localization</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Selector */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" /> {t.theme}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateUser({ theme: 'light' })}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${user.theme === 'light' ? 'bg-white text-zinc-900 border-zinc-300 shadow-sm' : 'text-zinc-500 border-transparent hover:text-zinc-800 dark:hover:text-zinc-200'}`}
              >
                Light Theme
              </button>
              <button
                type="button"
                onClick={() => updateUser({ theme: 'dark' })}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${user.theme === 'dark' ? 'bg-zinc-900 text-white border-zinc-700 shadow-sm' : 'text-zinc-500 border-transparent hover:text-zinc-800 dark:hover:text-zinc-200'}`}
              >
                Dark Theme
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" /> {t.language}
            </label>
            <div className="flex gap-2">
              {(['en', 'ar', 'ar-eg'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => updateUser({ language: lang })}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all uppercase ${user.language === lang ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' : 'text-zinc-500 border-transparent'}`}
                >
                  {lang === 'ar-eg' ? 'Egyptian' : lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: DATA BACKUP & WORKSPACE */}
      <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          <span>Data Backup & Workspace Actions</span>
        </h3>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          {/* Export JSON */}
          <button
            onClick={exportDataJSON}
            className="px-5 py-2.5 bg-zinc-900 text-white dark:bg-zinc-800 font-bold text-xs rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{t.exportData} (JSON Backup)</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={resetDemoData}
            className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Curriculum</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="px-5 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold text-xs rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2 ml-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.signOut || 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* IMAGE CROP & PREVIEW MODAL */}
      {showCropModal && selectedImageSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121827] border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" /> Adjust & Crop Profile Picture
              </h3>
              <button
                onClick={() => { setShowCropModal(false); setSelectedImageSrc(null); }}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Circular Preview Container */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 rounded-full border-4 border-indigo-500/50 overflow-hidden relative bg-zinc-950 shadow-inner flex items-center justify-center">
                <img
                  ref={previewImgRef}
                  src={selectedImageSrc}
                  alt="Crop Preview"
                  style={{
                    transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                    transition: 'transform 0.05s linear',
                  }}
                  className="max-w-none max-h-none h-full object-cover select-none pointer-events-none"
                />
              </div>
              <p className="text-[11px] font-mono text-zinc-400">Circular Avatar Preview</p>
            </div>

            {/* Adjust Controls: Zoom & Pan */}
            <div className="space-y-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
                  <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5 text-indigo-400" /> Zoom Level</span>
                  <span>{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400">Pan Horizontal</span>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={panX}
                    onChange={(e) => setPanX(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400">Pan Vertical</span>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={panY}
                    onChange={(e) => setPanY(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowCropModal(false); setSelectedImageSrc(null); }}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={isUploadingPhoto}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUploadingPhoto ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Save Profile Picture</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
