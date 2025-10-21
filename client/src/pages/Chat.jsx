import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Stack,
  IconButton,
  TextField,
  Button,
  AppBar,
  Toolbar,
  Divider,
  InputAdornment,
  Fab,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import MicIcon from '@mui/icons-material/Mic';
import { getChatHistory, sendChatMessage } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { io } from 'socket.io-client';

const SOCKET_URL = window.location.origin.replace(/^http/, 'ws');

const Chat = () => {
  const { listingType, listingId, ownerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef();
  const socketRef = useRef();
  const { notify } = useNotification();

  // Connect to socket.io and join room
  useEffect(() => {
    if (!user?._id) return;
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = socket;
    // Join unified chat room based on listing
    socket.emit('joinRoom', { listingType, listingId, userId: user._id, ownerId });
    socket.on('chatMessage', (msg) => {
      setMessages(prev => [
        ...prev,
        msg,
      ]);
      // Notify if message is from someone else
      if (msg.from?._id && msg.from._id !== user._id) {
        notify('New chat message received', 'info');
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [listingType, listingId, ownerId, user?._id]);

  // Fetch chat history on mount
  useEffect(() => {
    const fetchChat = async () => {
      if (!user?._id) {
        setError('User not authenticated. Please log in.');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        console.log('Fetching chat history:', { listingType, listingId, userId: user._id, ownerId });
        const { messages } = await getChatHistory(listingType, listingId, user._id, ownerId);
        setMessages(messages);
      } catch (err) {
        console.error('Chat history error:', err);
        setError('Failed to load chat history.');
      }
      setLoading(false);
    };
    
    if (user?._id) {
      fetchChat();
    } else {
      setLoading(false);
      setError('User not authenticated. Please log in.');
    }
  }, [listingType, listingId, ownerId, user?._id]);

  const handleSend = async () => {
    if (!user?._id) {
      setSnackbar({ open: true, message: 'Please log in to send messages.', severity: 'error' });
      return;
    }
    
    if (!(input.trim() || image)) return;
    let msgObj;
    if (image) {
      msgObj = { type: 'image', content: image.name || 'image.jpg', from: { _id: user._id, name: user.name || 'You' }, timestamp: new Date().toISOString() };
    } else {
      msgObj = { type: 'text', content: input, from: { _id: user._id, name: user.name || 'You' }, timestamp: new Date().toISOString() };
    }
    try {
      console.log('Sending message:', { listingType, listingId, userId: user._id, ownerId, message: msgObj });
      // Send via REST for persistence
      await sendChatMessage(listingType, listingId, user._id, ownerId, { type: msgObj.type, content: msgObj.content }, user.token);
      // Emit via socket for real-time
      if (socketRef.current) {
        socketRef.current.emit('chatMessage', { listingType, listingId, userId: user._id, ownerId, message: msgObj });
      }
      setMessages(prev => [
        ...prev,
        msgObj,
      ]);
      setInput('');
      setImage(null);
    } catch (err) {
      console.error('Send message error:', err);
      setSnackbar({ open: true, message: 'Failed to send message.', severity: 'error' });
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Voice message (mocked)
  const handleVoice = () => {
    const msgObj = { from: { _id: user._id, name: user.name || 'You' }, type: 'voice', content: '[Voice message]', timestamp: new Date().toISOString() };
    if (socketRef.current) {
      socketRef.current.emit('chatMessage', { listingType, listingId, userId: user._id, ownerId, message: msgObj });
    }
    setMessages(prev => [
      ...prev,
      msgObj,
    ]);
  };

  // Get listing title based on type
  const getListingTitle = () => {
    return listingType === 'adoption' ? 'Adoption Listing' : 'Marketplace Listing';
  };

  // Get owner name (placeholder)
  const getOwnerName = () => {
    return 'Owner Name'; // This could be enhanced to fetch actual owner details
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ ml: 2, mr: 2 }} />
          <Box>
            <Typography variant="h6">Chat about {getListingTitle()}</Typography>
            <Typography variant="body2" color="text.secondary">with {getOwnerName()}</Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3, mb: 10 }}>
        <Paper sx={{ p: 2, minHeight: 400, maxHeight: 500, overflowY: 'auto', mb: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Stack spacing={2}>
              {messages.map((msg, idx) => (
                <Box key={idx} sx={{ display: 'flex', flexDirection: msg.from?._id === user._id ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                  <Avatar sx={{ bgcolor: msg.from?._id === user._id ? 'primary.main' : 'grey.400', ml: msg.from?._id === user._id ? 2 : 0, mr: msg.from?._id !== user._id ? 2 : 0 }}>
                    {msg.from?.name?.[0] || (msg.from?._id === user._id ? 'U' : 'O')}
                  </Avatar>
                  {msg.type === 'text' && (
                    <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: msg.from?._id === user._id ? 'primary.light' : 'grey.200', minWidth: 60, maxWidth: 320 }}>
                      <Typography variant="body2">{msg.content}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ float: 'right' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                    </Paper>
                  )}
                  {msg.type === 'image' && (
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: msg.from?._id === user._id ? 'primary.light' : 'grey.200', minWidth: 60, maxWidth: 320 }}>
                      <Typography variant="body2">[Image: {msg.content}]</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ float: 'right' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                    </Box>
                  )}
                  {msg.type === 'voice' && (
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: msg.from?._id === user._id ? 'primary.light' : 'grey.200', minWidth: 60, maxWidth: 320 }}>
                      <Typography variant="body2">[Voice message]</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ float: 'right' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
        <Divider sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton color="primary" component="label">
                    <ImageIcon />
                    <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageChange} />
                  </IconButton>
                  <IconButton color="primary" onClick={handleVoice}>
                    <MicIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Fab color="primary" size="medium" onClick={handleSend} sx={{ ml: 1 }}>
            <SendIcon />
          </Fab>
        </Stack>
        {image && (
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="caption">Image ready to send:</Typography>
            <Typography variant="body2">{image.name}</Typography>
          </Box>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Chat; 