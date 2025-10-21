import React, { useState, useRef } from 'react';
import { Box, Typography, Avatar, Button, TextField, Divider, Switch, FormControlLabel, Paper, Tabs, Tab, Snackbar, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';

const AdminProfile = () => {
  const { user, setUser, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [tab, setTab] = useState(0);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [changing, setChanging] = useState(false);
  const [activity, setActivity] = useState([]);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const fileInputRef = useRef();

  // Username/email state for editing
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await api.post('/admin/update-profile', { username: editUsername, email: editEmail });
      setUser(prev => ({ ...prev, username: data.username, email: data.email }));
      setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to update profile.', severity: 'error' });
    }
    setSavingProfile(false);
  };

  // Fetch activity log if available
  React.useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await api.get('/admin/activities');
        setActivity(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.status === 401) {
          setSnackbar({ open: true, message: 'Session expired. Please log in again.', severity: 'error' });
          logout();
        }
        console.error('Activity fetch error:', err);
      }
    };
    fetchActivity();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: 'Please fill all fields and confirm new password.', severity: 'error' });
      return;
    }
    setChanging(true);
    try {
      await api.post('/admin/change-password', { oldPassword, newPassword });
      setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to change password.', severity: 'error' });
    }
    setChanging(false);
  };

  const handleAvatarButtonClick = () => {
    console.log('Change Avatar button clicked');
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarChange = async (e) => {
    console.log('File input changed');
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      console.log('Uploading avatar with token:', token);
      const res = await fetch('/api/admin/upload-avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.status === 401) {
        setSnackbar({ open: true, message: 'Session expired. Please log in again.', severity: 'error' });
        logout();
        setAvatarUploading(false);
        return;
      }
      const data = await res.json();
      if (data.url) {
        // Fetch latest user info
        console.log('Fetching /api/admin/me with token:', token);
        const meRes = await fetch('/api/admin/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (meRes.status === 401) {
          setSnackbar({ open: true, message: 'Session expired. Please log in again.', severity: 'error' });
          logout();
          setAvatarUploading(false);
          return;
        }
        const me = await meRes.json();
        setUser(me);
        setAvatarVersion(Date.now());
        setSnackbar({ open: true, message: 'Avatar updated!', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to upload avatar.', severity: 'error' });
      console.error('Avatar upload error:', err);
    }
    setAvatarUploading(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6, p: 3 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar src={user?.avatar ? user.avatar + '?v=' + avatarVersion : undefined} sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 32 }}>
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              console.log('Change Avatar button clicked');
              if (fileInputRef.current) fileInputRef.current.value = null; // Reset file input
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            disabled={avatarUploading}
            sx={{ ml: 2 }}
          >
            {avatarUploading ? 'Uploading...' : 'Change Avatar'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={async e => {
              console.log('File input changed');
              const file = e.target.files[0];
              if (!file) return;
              setAvatarUploading(true);
              const formData = new FormData();
              formData.append('avatar', file);
              try {
                const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
                console.log('Uploading avatar with token:', token);
                const res = await fetch('/api/admin/upload-avatar', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` },
                  body: formData
                });
                if (!res.ok) throw new Error('Failed to upload avatar');
                // Fetch updated user info
                const meRes = await fetch('/api/admin/me', {
                  headers: { Authorization: `Bearer ${token}` }
                });
                const me = await meRes.json();
                setUser(me);
                setAvatarVersion(Date.now()); // cache-busting
                setSnackbar({ open: true, message: 'Avatar updated!', severity: 'success' });
              } catch (err) {
                setSnackbar({ open: true, message: err.message || 'Failed to upload avatar.', severity: 'error' });
              }
              setAvatarUploading(false);
            }}
          />
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Profile" />
          <Tab label="Security" />
          <Tab label="Settings" />
          <Tab label="Activity" />
        </Tabs>
        {tab === 0 && (
          <Box>
            <Typography variant="subtitle1" mb={2}>Profile Overview</Typography>
            <Typography>Username: <b>{user?.username}</b></Typography>
            <Typography>Email: <b>{user?.email || 'Not set'}</b></Typography>
            <Typography>Role: <b>{user?.role}</b></Typography>
          </Box>
        )}
        {tab === 1 && (
          <Box component="form" onSubmit={handleProfileSave} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" mb={2}>Change Username & Email</Typography>
            <TextField label="Username" fullWidth sx={{ mb: 2 }} value={editUsername} onChange={e => setEditUsername(e.target.value)} required />
            <TextField label="Email" fullWidth sx={{ mb: 2 }} value={editEmail} onChange={e => setEditEmail(e.target.value)} />
            <Button type="submit" variant="contained" color="primary" disabled={savingProfile}>Save</Button>
          </Box>
        )}
        {tab === 1 && (
          <Box component="form" onSubmit={handleChangePassword} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" mb={2}>Change Password</Typography>
            <TextField label="Old Password" type="password" fullWidth sx={{ mb: 2 }} value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
            <TextField label="New Password" type="password" fullWidth sx={{ mb: 2 }} value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            <TextField label="Confirm New Password" type="password" fullWidth sx={{ mb: 2 }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            <Button type="submit" variant="contained" color="primary" disabled={changing}>Change Password</Button>
          </Box>
        )}
        {tab === 2 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" mb={2}>Settings</Typography>
            <FormControlLabel control={<Switch checked={isDarkMode} onChange={toggleDarkMode} />} label="Dark Mode" />
            {/* Add more settings here */}
          </Box>
        )}
        {tab === 3 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" mb={2}>Activity Log</Typography>
            {activity.length === 0 ? (
              <Typography color="text.secondary">No recent activity.</Typography>
            ) : (
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {activity.map((a, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <Typography fontSize={14}>{a.action} - <span style={{ color: '#888' }}>{a.date}</span></Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
        <Divider sx={{ my: 3 }} />
        <Button variant="outlined" color="error" onClick={logout} fullWidth>Logout</Button>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProfile; 