import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Badge,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Tooltip,
  Fab,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  CircularProgress,
  Alert,
  Snackbar,
  Slide,
  alpha,
  styled,
  Fade,
  Collapse,
  Card,
  CardMedia,
  GlobalStyles,
  SwipeableDrawer,
  Switch,
  FormControlLabel,
  InputAdornment,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Mic as MicIcon,
  MoreVert as MoreVertIcon,
  Clear as ClearIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Forward as ForwardIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Videocam as VideocamIcon,
  Audiotrack as AudiotrackIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  SelectAll as SelectAllIcon,
  Label as LabelIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  VolumeOff as VolumeOffIcon,
  Archive as ArchiveIcon,
  Report as ReportIcon,
  DoneAll as DoneAllIcon,
  Done as DoneIcon,
  Block as BlockIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Groups as GroupsIcon,
  ExitToApp as ExitToAppIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  Pin as PinIcon,
  PushPin as PushPinIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

// WhatsApp-inspired Color scheme with solid colors for alpha operations
const CHAT_COLORS = {
  primary: '#0084ff',
  primaryLight: '#5dadec',
  primaryDark: '#0066cc',
  secondary: '#25d366',
  background: '#f0f0f0',
  backgroundGradient: 'linear-gradient(135deg, #f0f0f0 0%, #e6f7ff 100%)',
  surface: '#ffffff',
  surfaceGradient: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
  surfaceDark: '#f8f9fa',
  surfaceDarkGradient: 'linear-gradient(135deg, #f8f9fa 0%, #eef2f7 100%)',
  messageOwn: '#dcf8c6',
  messageOwnGradient: 'linear-gradient(135deg, #dcf8c6 0%, #c5f7a5 100%)',
  messageOther: '#ffffff',
  messageOtherGradient: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  textPrimary: '#303030',
  textSecondary: '#65676b',
  textLight: '#ffffff',
  online: '#25d366',
  offline: '#9e9e9e',
  typing: '#0084ff',
  border: '#e4e6ea',
  borderGradient: 'linear-gradient(135deg, #e4e6ea 0%, #dce1e8 100%)',
  hover: '#f5f5f5',
  hoverGradient: 'linear-gradient(135deg, #f5f5f5 0%, #eef2f7 100%)',
  success: '#25d366',
  error: '#ff3b30',
  warning: '#ff9500',
  whatsappGreen: '#25d366',
  whatsappLightGreen: '#dcf8c6',
  whatsappDarkGreen: '#128c7e',
  gradientPrimary: 'linear-gradient(135deg, #0084ff 0%, #0055cc 100%)',
  gradientSecondary: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
  gradientPurple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientOrange: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
};

// Dark mode colors with solid colors for alpha operations
const DARK_COLORS = {
  primary: '#0084ff',
  primaryLight: '#5dadec',
  primaryDark: '#0066cc',
  secondary: '#25d366',
  background: '#0d1418',
  backgroundGradient: 'linear-gradient(135deg, #0d1418 0%, #1a1a2e 50%, #16213e 100%)',
  surface: '#1f2c34',
  surfaceGradient: 'linear-gradient(135deg, #1f2c34 0%, #2a3942 100%)',
  surfaceDark: '#182229',
  surfaceDarkGradient: 'linear-gradient(135deg, #182229 0%, #1e2a32 100%)',
  messageOwn: '#005c4b',
  messageOwnGradient: 'linear-gradient(135deg, #005c4b 0%, #004d40 100%)',
  messageOther: '#1f2c34',
  messageOtherGradient: 'linear-gradient(135deg, #1f2c34 0%, #2a3942 100%)',
  textPrimary: '#e9edef',
  textSecondary: '#8696a0',
  textLight: '#ffffff',
  online: '#25d366',
  offline: '#8696a0',
  typing: '#0084ff',
  border: '#2a3942',
  borderGradient: 'linear-gradient(135deg, #2a3942 0%, #344753 100%)',
  hover: '#2a3942',
  hoverGradient: 'linear-gradient(135deg, #2a3942 0%, #30444f 100%)',
  success: '#25d366',
  error: '#ff3b30',
  warning: '#ff9500',
  whatsappGreen: '#25d366',
  whatsappLightGreen: '#005c4b',
  whatsappDarkGreen: '#128c7e',
  gradientPrimary: 'linear-gradient(135deg, #0084ff 0%, #0055cc 100%)',
  gradientSecondary: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
  gradientPurple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientOrange: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
};

// Particle Background Component for Chat
const ChatParticleBackground = ({ darkMode }) => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 25 + 15,
    delay: Math.random() * 10
  }));

  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Aurora Background */}
      <Box sx={{ position: 'absolute', inset: 0 }}>
        <motion.div 
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 240,
            height: 240,
            backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.05)',
            borderRadius: '50%',
            filter: 'blur(48px)',
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 240,
            height: 240,
            backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.05)',
            borderRadius: '50%',
            filter: 'blur(48px)',
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </Box>
      
      {/* Animated Particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 15, 0],
            opacity: [0, 0.6, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </Box>
  );
};

// Styled Components with enhanced animations - FIXED VERSION
const GlassPaper = styled(Paper)(({ darkMode }) => ({
  background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const MessageBubblePaper = styled(Paper)(({ isOwnMessage, darkMode }) => ({
  background: isOwnMessage 
    ? (darkMode ? DARK_COLORS.messageOwn : CHAT_COLORS.messageOwn)
    : (darkMode ? DARK_COLORS.messageOther : CHAT_COLORS.messageOther),
  color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
  borderRadius: '18px',
  borderBottomRightRadius: isOwnMessage ? '4px' : '18px',
  borderBottomLeftRadius: isOwnMessage ? '18px' : '4px',
  borderTopLeftRadius: '18px',
  borderTopRightRadius: '18px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'visible',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const ModernTextField = styled(TextField)(({ darkMode }) => ({
  '& .MuiOutlinedInput-root': {
    background: darkMode ? 'rgba(42, 57, 66, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    borderRadius: '25px',
    color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      background: darkMode ? 'rgba(42, 57, 66, 0.9)' : 'rgba(248, 249, 250, 0.9)',
      transform: 'translateY(-1px)',
    },
    '&.Mui-focused': {
      background: darkMode ? 'rgba(42, 57, 66, 1)' : 'rgba(255, 255, 255, 1)',
      border: `2px solid ${CHAT_COLORS.primary}`,
      boxShadow: `0 0 0 4px ${alpha(CHAT_COLORS.primary, 0.1)}`,
      transform: 'translateY(-2px)',
    },
    '& fieldset': {
      border: `2px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.5)}`,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px 20px',
    color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
    fontSize: '1rem',
    fontWeight: 500,
    '&::placeholder': {
      color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
      fontWeight: 400,
    },
  },
}));

const FloatingActionButton = styled(Fab)({
  background: CHAT_COLORS.gradientPrimary,
  color: CHAT_COLORS.textLight,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0, 132, 255, 0.3)',
  '&:hover': {
    background: CHAT_COLORS.primaryDark,
    transform: 'scale(1.1) translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0, 132, 255, 0.4)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  '&:disabled': {
    background: CHAT_COLORS.border,
    color: CHAT_COLORS.textSecondary,
    transform: 'none',
    boxShadow: 'none',
  },
});

const AnimatedIconButton = styled(IconButton)(({ darkMode }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
  backdropFilter: 'blur(10px)',
  '&:hover': {
    color: CHAT_COLORS.primary,
    background: alpha(CHAT_COLORS.primary, 0.15),
    transform: 'scale(1.15) rotate(5deg)',
    boxShadow: '0 4px 15px rgba(0, 132, 255, 0.2)',
  },
}));

// Enhanced Message Status Component with animations
const MessageStatus = ({ message, authUser, darkMode }) => {
  if (message.senderId?._id !== authUser._id && message.senderId !== authUser._id) return null;

  const getStatus = () => {
    if (message.status === 'failed') return 'failed';
    if (message.seen || message.seenBy?.some(seen => seen.userId === authUser._id)) return 'seen';
    if (message.delivered) return 'delivered';
    if (message.status === 'sending') return 'sending';
    return 'sent';
  };

  const status = getStatus();

  const StatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <Tooltip title="Sending..." arrow placement="top">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <ScheduleIcon sx={{ 
                fontSize: 16, 
                color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
              }} />
            </motion.div>
          </Tooltip>
        );
      case 'sent':
        return (
          <Tooltip title="Sent" arrow placement="top">
            <motion.div
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <DoneIcon sx={{ 
                fontSize: 16, 
                color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
              }} />
            </motion.div>
          </Tooltip>
        );
      case 'delivered':
        return (
          <Tooltip title="Delivered" arrow placement="top">
            <motion.div
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <DoneAllIcon sx={{ 
                fontSize: 16, 
                color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
              }} />
            </motion.div>
          </Tooltip>
        );
      case 'seen':
        return (
          <Tooltip title="Seen" arrow placement="top">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                color: [CHAT_COLORS.primary, CHAT_COLORS.primaryLight, CHAT_COLORS.primary]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <DoneAllIcon sx={{ 
                fontSize: 16, 
                color: CHAT_COLORS.primary,
              }} />
            </motion.div>
          </Tooltip>
        );
      case 'failed':
        return (
          <Tooltip title="Failed to send - Click to retry" arrow placement="top">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <ErrorIcon sx={{ 
                fontSize: 16, 
                color: CHAT_COLORS.error,
              }} />
            </motion.div>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  return <StatusIcon />;
};

// Enhanced Message Details Component
const MessageDetails = ({ message, isGroup, authUser, darkMode, onClose }) => {
  if (!message) return null;

  return (
    <Dialog
      open={!!message}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
          overflow: 'hidden',
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
          borderBottom: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
          py: 3,
          background: darkMode ? 'rgba(31, 44, 52, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        }}>
          <Typography variant="h6" fontWeight="700" sx={{
            background: CHAT_COLORS.gradientPrimary,
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}>
            Message Details
          </Typography>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{
              background: alpha(darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 0.1),
              '&:hover': {
                background: alpha(CHAT_COLORS.primary, 0.2),
                transform: 'rotate(90deg)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Message Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Typography variant="caption" sx={{
                color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Message
              </Typography>
              <Paper
                sx={{
                  p: 2.5,
                  mt: 1.5,
                  background: darkMode ? DARK_COLORS.surfaceDark : CHAT_COLORS.surfaceDark,
                  borderRadius: '12px',
                  border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {message.text || 'Media message'}
                </Typography>
              </Paper>
            </motion.div>

            {/* Sender Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Typography variant="caption" sx={{
                color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Sent By
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5 }}>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Avatar 
                    src={message.senderId?.profilePic} 
                    sx={{ 
                      width: 48, 
                      height: 48,
                      border: `2px solid ${CHAT_COLORS.primary}`,
                      boxShadow: '0 4px 12px rgba(0, 132, 255, 0.3)',
                    }}
                  >
                    {message.senderId?.fullName?.charAt(0)}
                  </Avatar>
                </motion.div>
                <Box>
                  <Typography variant="body1" fontWeight="700" sx={{
                    background: CHAT_COLORS.gradientPrimary,
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                  }}>
                    {message.senderId?.fullName || 'Unknown User'}
                  </Typography>
                  <Typography variant="caption" color={darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary}>
                    {message.senderId?._id === authUser._id ? 'You' : message.senderId?.email}
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            {/* Timestamp */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Typography variant="caption" sx={{
                color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Sent At
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                {new Date(message.createdAt).toLocaleString()}
              </Typography>
            </motion.div>

            {/* Message Status */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Typography variant="caption" sx={{
                color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                <MessageStatus message={message} authUser={authUser} darkMode={darkMode} />
                <Typography variant="body2" fontWeight="600">
                  {message.status === 'sending' ? 'Sending...' : 
                   message.seen ? 'Seen' : 
                   message.delivered ? 'Delivered' : 
                   message.status === 'failed' ? 'Failed' : 'Sent'}
                </Typography>
              </Box>
            </motion.div>
          </Box>
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};

// Enhanced Selection Actions Bar
const SelectionActionsBar = ({ 
  selectedCount, 
  clearSelection, 
  deleteSelected, 
  forwardSelected, 
  downloadSelected,
  replyToSelected,
  pinSelected,
  copySelected,
  darkMode
}) => {
  if (!selectedCount || selectedCount === 0) return null;

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 120,
            left: '50%',
            transform: 'translateX(-50%)',
            p: 2.5,
            borderRadius: '30px',
            color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            zIndex: 9999,
            minWidth: { xs: '90%', sm: 500 },
            border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
            backdropFilter: 'blur(20px)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: CHAT_COLORS.gradientPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  color: CHAT_COLORS.textLight,
                  boxShadow: '0 4px 15px rgba(0, 132, 255, 0.4)',
                }}
              >
                {selectedCount}
              </Box>
            </motion.div>
            <Typography variant="body1" sx={{ fontWeight: '700', fontSize: '1.1rem' }}>
              {selectedCount} message{selectedCount > 1 ? 's' : ''} selected
            </Typography>
          </Box>
          
          <Divider orientation="vertical" flexItem sx={{ height: 32 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title="Clear Selection" arrow placement="top">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton size="small" onClick={clearSelection} sx={{
                  background: alpha(CHAT_COLORS.primary, 0.1),
                  '&:hover': { background: alpha(CHAT_COLORS.primary, 0.2) }
                }}>
                  <ClearIcon />
                </IconButton>
              </motion.div>
            </Tooltip>
            
            <Tooltip title="Copy Text" arrow placement="top">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton size="small" onClick={copySelected} sx={{
                  background: alpha(CHAT_COLORS.primary, 0.1),
                  '&:hover': { background: alpha(CHAT_COLORS.primary, 0.2) }
                }}>
                  <CopyIcon />
                </IconButton>
              </motion.div>
            </Tooltip>

            <Tooltip title="Delete Selected" arrow placement="top">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton size="small" onClick={deleteSelected} sx={{
                  background: alpha(CHAT_COLORS.error, 0.1),
                  '&:hover': { background: alpha(CHAT_COLORS.error, 0.2) }
                }}>
                  <DeleteIcon />
                </IconButton>
              </motion.div>
            </Tooltip>
            
            <Tooltip title="Forward Selected" arrow placement="top">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton size="small" onClick={forwardSelected} sx={{
                  background: alpha(CHAT_COLORS.primary, 0.1),
                  '&:hover': { background: alpha(CHAT_COLORS.primary, 0.2) }
                }}>
                  <ForwardIcon />
                </IconButton>
              </motion.div>
            </Tooltip>

            {selectedCount === 1 && (
              <Tooltip title="Reply to Selected" arrow placement="top">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton size="small" onClick={replyToSelected} sx={{
                    background: alpha(CHAT_COLORS.primary, 0.1),
                    '&:hover': { background: alpha(CHAT_COLORS.primary, 0.2) }
                  }}>
                    <ReplyIcon />
                  </IconButton>
                </motion.div>
              </Tooltip>
            )}
          </Box>
        </Paper>
      </motion.div>
    </Slide>
  );
};

// Enhanced Voice Recorder Component
const VoiceRecorder = ({ onRecordingComplete, onCancel, darkMode }) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingState, setRecordingState] = useState('idle');
  const timerRef = useRef(null);

  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingState]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      setRecordingState('recording');
      setRecordingTime(0);
    } catch (error) {
      console.error('Recording failed:', error);
      setRecordingState('idle');
    }
  };

  const handleStopRecording = () => {
    setRecordingState('processing');
    setTimeout(() => {
      onRecordingComplete({
        duration: recordingTime,
        url: 'blob:recording-placeholder',
        size: recordingTime * 16000
      });
    }, 1000);
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
    >
      <Paper
        sx={{
          p: 4,
          m: 2,
          background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
          borderRadius: '25px',
          border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography variant="h6" color={darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary} gutterBottom sx={{ 
          fontWeight: '700', 
          mb: 3,
          background: CHAT_COLORS.gradientPrimary,
          backgroundClip: 'text',
          textFillColor: 'transparent',
        }}>
          Voice Message
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 4 }}>
          {recordingState === 'recording' && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 24 }}
            >
              <Box sx={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 3, 2, 1].map((height, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      height: [height * 6, height * 12, height * 6],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: index * 0.1,
                    }}
                    style={{
                      width: 6,
                      background: CHAT_COLORS.primary,
                      borderRadius: 3,
                    }}
                  />
                ))}
              </Box>
              <Typography variant="h4" color={darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary} fontWeight="700" sx={{ minWidth: '80px' }}>
                {formatTime(recordingTime)}
              </Typography>
            </motion.div>
          )}
          
          {recordingState === 'processing' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 24 }}
            >
              <CircularProgress size={40} sx={{ color: CHAT_COLORS.primary }} />
              <Typography variant="h6" color={darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary} sx={{ fontWeight: 700 }}>
                Processing...
              </Typography>
            </motion.div>
          )}
          
          {recordingState === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Typography variant="body1" color={darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary} sx={{ fontSize: '1.1rem' }}>
                Ready to record voice message
              </Typography>
            </motion.div>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
          {recordingState === 'idle' && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={handleStartRecording}
                startIcon={<MicIcon />}
                sx={{
                  background: CHAT_COLORS.gradientPrimary,
                  borderRadius: '25px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  boxShadow: '0 4px 15px rgba(0, 132, 255, 0.4)',
                  '&:hover': {
                    background: CHAT_COLORS.primaryDark,
                    boxShadow: '0 6px 20px rgba(0, 132, 255, 0.6)',
                  },
                }}
              >
                Start Recording
              </Button>
            </motion.div>
          )}
          
          {recordingState === 'recording' && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={handleStopRecording}
                startIcon={<ClearIcon />}
                sx={{
                  background: CHAT_COLORS.gradientOrange,
                  borderRadius: '25px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  boxShadow: '0 4px 15px rgba(255, 59, 48, 0.4)',
                  '&:hover': {
                    background: '#dc2626',
                    boxShadow: '0 6px 20px rgba(255, 59, 48, 0.6)',
                  },
                }}
              >
                Stop Recording
              </Button>
            </motion.div>
          )}
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{
                borderColor: alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.5),
                color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
                borderRadius: '25px',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: '700',
                borderWidth: 2,
                '&:hover': {
                  borderColor: CHAT_COLORS.primary,
                  background: alpha(CHAT_COLORS.primary, 0.08),
                  borderWidth: 2,
                },
              }}
            >
              Cancel
            </Button>
          </motion.div>
        </Box>
      </Paper>
    </motion.div>
  );
};

// Enhanced Message Bubble Component
const MessageBubble = React.memo(({ 
  message, 
  isOwnMessage, 
  isGroup,
  selectedMessages,
  isSelectMode,
  toggleMessageSelection,
  reactToMessage,
  removeReaction,
  getFileType,
  getFileIcon,
  downloadFile,
  playingAudio,
  handlePlayAudio,
  authUser,
  onMessageMenuOpen,
  onShowMessageDetails,
  darkMode,
  pinnedMessages
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [reactionsPanelOpen, setReactionsPanelOpen] = useState(false);
  const isSelected = selectedMessages.has(message._id);
  const isPinned = pinnedMessages.some(pinned => pinned._id === message._id);
  
  const bubbleRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bubbleRef.current && !bubbleRef.current.contains(event.target)) {
        setReactionsPanelOpen(false);
        setShowReactions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReactionClick = (emoji) => {
    if (message.reactions?.some(r => r.emoji === emoji && r.users?.includes(authUser._id))) {
      removeReaction(message._id, emoji);
    } else {
      reactToMessage(message._id, emoji);
    }
    setShowReactions(false);
    setReactionsPanelOpen(false);
  };

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😠'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Box
        ref={bubbleRef}
        sx={{
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          mb: 2,
          px: 2,
          position: 'relative',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isSelectMode && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: isOwnMessage ? 'auto' : 8,
                right: isOwnMessage ? 8 : 'auto',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
              }}
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMessageSelection(message._id);
                }}
                sx={{
                  color: isSelected ? CHAT_COLORS.primary : darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
                  background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.background,
                  border: `2px solid ${isSelected ? CHAT_COLORS.primary : alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.5)}`,
                  '&:hover': {
                    background: alpha(CHAT_COLORS.primary, 0.1),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isSelected && <CheckCircleIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Box>
          </motion.div>
        )}

        {isPinned && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                left: isOwnMessage ? 'auto' : 45,
                right: isOwnMessage ? 45 : 'auto',
                background: CHAT_COLORS.gradientPrimary,
                borderRadius: '16px',
                px: 1.5,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                zIndex: 5,
                boxShadow: '0 4px 12px rgba(0, 132, 255, 0.3)',
              }}
            >
              <PinIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                Pinned
              </Typography>
            </Box>
          </motion.div>
        )}

        <Box sx={{ 
          maxWidth: { xs: '85%', sm: '70%' }, 
          minWidth: '120px', 
          position: 'relative',
        }}>
          {isGroup && !isOwnMessage && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, ml: 1 }}>
                <Avatar
                  src={message.senderId?.profilePic}
                  sx={{ 
                    width: 24, 
                    height: 24,
                    border: `2px solid ${alpha(CHAT_COLORS.primary, 0.3)}`,
                  }}
                >
                  {message.senderId?.fullName?.charAt(0)}
                </Avatar>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: CHAT_COLORS.primary,
                    fontSize: '0.8rem',
                  }}
                >
                  {message.senderId?.fullName || message.senderName}
                </Typography>
              </Box>
            </motion.div>
          )}

          {message.replyTo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <Paper
                sx={{
                  p: 2,
                  mb: 1.5,
                  background: alpha(CHAT_COLORS.primary, 0.08),
                  borderLeft: `4px solid ${CHAT_COLORS.primary}`,
                  cursor: 'pointer',
                  borderRadius: '12px',
                  '&:hover': {
                    background: alpha(CHAT_COLORS.primary, 0.12),
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => {
                  const repliedElement = document.getElementById(`message-${message.replyTo._id}`);
                  if (repliedElement) {
                    repliedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              >
                <Typography variant="caption" color={CHAT_COLORS.primary} fontWeight="700">
                  Replying to {message.replyTo.senderId?._id === authUser._id ? 'yourself' : message.replyTo.senderId?.fullName}
                </Typography>
                <Typography variant="body2" noWrap sx={{ color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, mt: 0.5 }}>
                  {message.replyTo.text || 'Media message'}
                </Typography>
              </Paper>
            </motion.div>
          )}

          <Tooltip 
            title={new Date(message.createdAt).toLocaleString()}
            placement={isOwnMessage ? "left" : "right"}
            arrow
          >
            <MessageBubblePaper
              isOwnMessage={isOwnMessage}
              darkMode={darkMode}
              sx={{
                p: 2.5,
                transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: isSelected 
                  ? `0 0 0 3px ${CHAT_COLORS.primary}, 0 4px 20px rgba(0, 132, 255, 0.3)`
                  : isHovered
                  ? '0 6px 25px rgba(0, 0, 0, 0.15)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                cursor: isSelectMode ? 'pointer' : 'default',
                position: 'relative',
                '&::before': isOwnMessage ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  right: -8,
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: `8px solid ${darkMode ? DARK_COLORS.messageOwn : CHAT_COLORS.messageOwn}`,
                } : {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: -8,
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: `8px solid ${darkMode ? DARK_COLORS.messageOther : CHAT_COLORS.messageOther}`,
                }
              }}
              onClick={(e) => {
                if (isSelectMode) {
                  e.stopPropagation();
                  toggleMessageSelection(message._id);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                onMessageMenuOpen(e, message);
              }}
            >
              {/* Message content */}
              {message.text && (
                <Typography variant="body1" sx={{ lineHeight: 1.5, mb: 1 }}>
                  {message.text}
                </Typography>
              )}
              
              {/* Message timestamp and status */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" sx={{ 
                  color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MessageStatus message={message} authUser={authUser} darkMode={darkMode} />
                </Box>
              </Box>
            </MessageBubblePaper>
          </Tooltip>

          {/* Reactions display below message */}
          {message.reactions && message.reactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Box sx={{ 
                display: 'flex', 
                gap: 0.5, 
                mt: 1, 
                flexWrap: 'wrap',
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
              }}>
                {message.reactions.map((reaction, index) => {
                  const hasReacted = reaction.users?.includes(authUser._id);
                  return (
                    <motion.div
                      key={`${reaction.emoji}-${index}`}
                      whileHover={{ scale: 1.1, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span style={{ fontSize: '0.8rem' }}>{reaction.emoji}</span>
                            {reaction.count > 1 && (
                              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                {reaction.count}
                              </Typography>
                            )}
                          </Box>
                        }
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasReacted) {
                            removeReaction(message._id, reaction.emoji);
                          } else {
                            reactToMessage(message._id, reaction.emoji);
                          }
                        }}
                        color={hasReacted ? "primary" : "default"}
                        variant={hasReacted ? "filled" : "outlined"}
                        sx={{
                          borderRadius: '16px',
                          fontSize: '0.7rem',
                          height: '26px',
                          background: hasReacted ? CHAT_COLORS.primary : darkMode ? DARK_COLORS.surface : CHAT_COLORS.background,
                          color: hasReacted ? CHAT_COLORS.textLight : darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
                          borderColor: hasReacted ? CHAT_COLORS.primary : alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.5),
                          cursor: 'pointer',
                          fontWeight: 600,
                          '&:hover': {
                            background: hasReacted ? CHAT_COLORS.primaryDark : darkMode ? DARK_COLORS.hover : CHAT_COLORS.hover,
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </motion.div>
                  );
                })}
              </Box>
            </motion.div>
          )}

          {/* Seen status for groups */}
          {isGroup && message.seenBy && message.seenBy.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5, 
                mt: 0.5,
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
              }}>
                <VisibilityIcon sx={{ fontSize: 12, color: CHAT_COLORS.textSecondary }} />
                <Typography variant="caption" color={CHAT_COLORS.textSecondary} sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                  Seen by {message.seenBy.length} member{message.seenBy.length > 1 ? 's' : ''}
                </Typography>
              </Box>
            </motion.div>
          )}
        </Box>
      </Box>
    </motion.div>
  );
});

// Enhanced Mobile Options Drawer
const MobileOptionsDrawer = ({ 
  open, 
  onClose, 
  onClearChat, 
  onSearch, 
  onSelectMode, 
  onViewProfile, 
  onExitGroup,
  onViewMedia,
  onViewLinks,
  onViewDocs,
  onViewPinned,
  isGroup,
  darkMode 
}) => {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      sx={{
        '& .MuiDrawer-paper': {
          background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
          borderTopLeftRadius: '25px',
          borderTopRightRadius: '25px',
          border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
          borderBottom: 'none',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ 
            width: 60, 
            height: 6, 
            background: alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.5), 
            borderRadius: 3 
          }} />
        </Box>
        
        <List>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ListItem 
              button 
              onClick={() => {
                onSearch();
                onClose();
              }}
              sx={{ 
                borderRadius: '16px', 
                mb: 2,
                background: alpha(CHAT_COLORS.primary, 0.05),
                '&:hover': {
                  background: alpha(CHAT_COLORS.primary, 0.1),
                }
              }}
            >
              <ListItemIcon>
                <SearchIcon sx={{ color: CHAT_COLORS.primary }} />
              </ListItemIcon>
              <ListItemText 
                primary="Search Messages" 
                primaryTypographyProps={{ 
                  fontWeight: 700, 
                  color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary 
                }}
              />
            </ListItem>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ListItem 
              button 
              onClick={() => {
                onSelectMode();
                onClose();
              }}
              sx={{ 
                borderRadius: '16px', 
                mb: 2,
                background: alpha(CHAT_COLORS.primary, 0.05),
                '&:hover': {
                  background: alpha(CHAT_COLORS.primary, 0.1),
                }
              }}
            >
              <ListItemIcon>
                <SelectAllIcon sx={{ color: CHAT_COLORS.primary }} />
              </ListItemIcon>
              <ListItemText 
                primary="Select Messages" 
                primaryTypographyProps={{ 
                  fontWeight: 700, 
                  color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary 
                }}
              />
            </ListItem>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ListItem 
              button 
              onClick={() => {
                onViewMedia();
                onClose();
              }}
              sx={{ 
                borderRadius: '16px', 
                mb: 2,
                background: alpha(CHAT_COLORS.primary, 0.05),
                '&:hover': {
                  background: alpha(CHAT_COLORS.primary, 0.1),
                }
              }}
            >
              <ListItemIcon>
                <PhotoCameraIcon sx={{ color: CHAT_COLORS.primary }} />
              </ListItemIcon>
              <ListItemText 
                primary="View Media" 
                primaryTypographyProps={{ 
                  fontWeight: 700, 
                  color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary 
                }}
              />
            </ListItem>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ListItem 
              button 
              onClick={() => {
                onViewPinned();
                onClose();
              }}
              sx={{ 
                borderRadius: '16px', 
                mb: 2,
                background: alpha(CHAT_COLORS.primary, 0.05),
                '&:hover': {
                  background: alpha(CHAT_COLORS.primary, 0.1),
                }
              }}
            >
              <ListItemIcon>
                <PushPinIcon sx={{ color: CHAT_COLORS.primary }} />
              </ListItemIcon>
              <ListItemText 
                primary="Pinned Messages" 
                primaryTypographyProps={{ 
                  fontWeight: 700, 
                  color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary 
                }}
              />
            </ListItem>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ListItem 
              button 
              onClick={() => {
                onViewProfile();
                onClose();
              }}
              sx={{ 
                borderRadius: '16px', 
                mb: 2,
                background: alpha(CHAT_COLORS.primary, 0.05),
                '&:hover': {
                  background: alpha(CHAT_COLORS.primary, 0.1),
                }
              }}
            >
              <ListItemIcon>
                <PersonIcon sx={{ color: CHAT_COLORS.primary }} />
              </ListItemIcon>
              <ListItemText 
                primary="View Profile" 
                primaryTypographyProps={{ 
                  fontWeight: 700, 
                  color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary 
                }}
              />
            </ListItem>
          </motion.div>

          {isGroup && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ListItem 
                button 
                onClick={() => {
                  onExitGroup();
                  onClose();
                }}
                sx={{ 
                  borderRadius: '16px', 
                  mb: 2,
                  background: alpha(CHAT_COLORS.error, 0.05),
                  '&:hover': {
                    background: alpha(CHAT_COLORS.error, 0.1),
                  }
                }}
              >
                <ListItemIcon>
                  <ExitToAppIcon sx={{ color: CHAT_COLORS.error }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Exit Group" 
                  primaryTypographyProps={{ fontWeight: 700, color: CHAT_COLORS.error }}
                />
              </ListItem>
            </motion.div>
          )}
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ListItem 
              button 
              onClick={() => {
                onClearChat();
                onClose();
              }}
              sx={{ 
                borderRadius: '16px',
                background: alpha(CHAT_COLORS.error, 0.05),
                '&:hover': {
                  background: alpha(CHAT_COLORS.error, 0.1),
                }
              }}
            >
              <ListItemIcon>
                <ClearAllIcon sx={{ color: CHAT_COLORS.error }} />
              </ListItemIcon>
              <ListItemText 
                primary="Clear Chat" 
                primaryTypographyProps={{ fontWeight: 700, color: CHAT_COLORS.error }}
              />
            </ListItem>
          </motion.div>
        </List>
      </Box>
    </SwipeableDrawer>
  );
};

// Main ChatContainer Component
const ChatContainer = ({ onOpenProfile, onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [darkMode, setDarkMode] = useState(false);
  
  const {
    messages,
    selectedUser,
    selectedGroup,
    sendMessage,
    sendGroupMessage,
    getMessage,
    setMessages,
    deleteMessageById,
    markMessagesAsSeen,
    isTyping,
    sendTypingStatus,
    canSendMessageToUser,
    reactToMessage,
    removeReaction,
    editMessage,
    onlineUsers,
    isGroup,
    downloadFile,
    getFileType,
    getFileIcon,
    uploadFile,
    uploadAudio,
    friends,
    clearChatPermanently,
    blockUser,
    toggleFavorite,
    forwardMessagesToUser,
    groups,
    addFavorite,
    removeFavorite,
    favorites,
    exitGroup,
    pinnedMessages,
    getPinnedMessages,
    pinMessage,
    unpinMessage,
    chatMedia,
    sharedLinks,
    sharedDocs
  } = useContext(ChatContext);

  const { authUser, socket } = useContext(AuthContext);

  // State management
  const [input, setInput] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [messageDetails, setMessageDetails] = useState(null);
  const [exitGroupDialogOpen, setExitGroupDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [pinnedDialogOpen, setPinnedDialogOpen] = useState(false);

  // Selection states
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false);
  const [moreOptionsAnchor, setMoreOptionsAnchor] = useState(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [forwardToGroups, setForwardToGroups] = useState(false);
  const [selectedForwardUsers, setSelectedForwardUsers] = useState(new Set());

  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Check if current chat is favorited
  useEffect(() => {
    if (selectedUser || selectedGroup) {
      const chatId = selectedUser?._id || selectedGroup?._id;
      const isFavorited = favorites?.some(fav => fav._id === chatId);
      setIsStarred(isFavorited);
    }
  }, [selectedUser, selectedGroup, favorites]);

  // Load messages and pinned messages
  const loadMessages = useCallback(async (forceRefresh = false) => {
    const currentChat = selectedUser || selectedGroup;
    if (!currentChat?._id) {
      setMessages([]);
      return;
    }
    
    try {
      const freshMessages = await getMessage(currentChat._id, 1, true);
      if (freshMessages && freshMessages.length > 0) {
        setMessages(freshMessages);
      } else {
        setMessages([]);
      }
      
      // Load pinned messages
      await getPinnedMessages(currentChat._id);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  }, [selectedUser, selectedGroup, getMessage, setMessages, getPinnedMessages]);

  // Toggle favorite
  const handleToggleFavorite = async () => {
    const currentChat = selectedUser || selectedGroup;
    if (!currentChat) return;

    try {
      if (isStarred) {
        await removeFavorite(currentChat._id);
        setIsStarred(false);
        toast.success("Removed from favorites");
      } else {
        await addFavorite(currentChat._id, isGroup ? 'group' : 'user');
        setIsStarred(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
      toast.error("Failed to update favorites");
    }
  };

  // Exit Group Function
  const handleExitGroup = async () => {
    if (!selectedGroup) return;

    try {
      await exitGroup(selectedGroup._id);
      setExitGroupDialogOpen(false);
      toast.success("You have left the group");
      onBack?.();
    } catch (error) {
      console.error("Exit group error:", error);
      toast.error("Failed to exit group");
    }
  };

  // Show message details
  const handleShowMessageDetails = (message) => {
    setMessageDetails(message);
  };

  // Pin/Unpin message
  const handlePinMessage = async (message) => {
    try {
      await pinMessage(message._id);
      toast.success("Message pinned");
    } catch (error) {
      console.error("Pin message error:", error);
      toast.error("Failed to pin message");
    }
  };

  const handleUnpinMessage = async (messageId) => {
    try {
      await unpinMessage(messageId);
      toast.success("Message unpinned");
    } catch (error) {
      console.error("Unpin message error:", error);
      toast.error("Failed to unpin message");
    }
  };

  // Reactions
  const handleReactToMessage = useCallback(async (messageId, emoji) => {
    if (!messageId || !emoji) return;

    try {
      await reactToMessage(messageId, emoji);
    } catch (error) {
      console.error("Failed to react to message:", error);
      toast.error("Failed to add reaction");
    }
  }, [reactToMessage]);

  const handleRemoveReaction = useCallback(async (messageId, emoji) => {
    if (!messageId || !emoji) return;

    try {
      await removeReaction(messageId, emoji);
    } catch (error) {
      console.error("Failed to remove reaction:", error);
      toast.error("Failed to remove reaction");
    }
  }, [removeReaction]);

  // Selection functions
  const toggleMessageSelection = useCallback((messageId) => {
    setSelectedMessages(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(messageId)) {
        newSelection.delete(messageId);
      } else {
        newSelection.add(messageId);
      }
      
      if (newSelection.size > 0 && !isSelectMode) {
        setIsSelectMode(true);
      } else if (newSelection.size === 0 && isSelectMode) {
        setIsSelectMode(false);
      }
      
      return newSelection;
    });
  }, [isSelectMode]);

  const clearSelection = useCallback(() => {
    setSelectedMessages(new Set());
    setIsSelectMode(false);
  }, []);

  // Delete selected messages
  const deleteSelectedMessages = useCallback(async () => {
    if (selectedMessages.size === 0) return;

    try {
      const messageIds = Array.from(selectedMessages);
      
      for (const messageId of messageIds) {
        try {
          await deleteMessageById(messageId);
        } catch (error) {
          console.error(`Failed to delete message ${messageId}:`, error);
        }
      }
      
      setMessages(prev => prev.filter(msg => !selectedMessages.has(msg._id)));
      
      toast.success(`Deleted ${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''}`);
      clearSelection();
    } catch (error) {
      console.error("Failed to delete selected messages:", error);
      toast.error("Failed to delete messages");
    }
  }, [selectedMessages, deleteMessageById, clearSelection, setMessages]);

  const copySelectedMessages = useCallback(() => {
    if (selectedMessages.size === 0) return;
    
    const selectedMsgs = messages.filter(msg => selectedMessages.has(msg._id));
    const textToCopy = selectedMsgs.map(msg => msg.text).join('\n\n');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success(`Copied ${selectedMsgs.length} message${selectedMsgs.length > 1 ? 's' : ''} to clipboard`);
      clearSelection();
    }).catch(() => {
      toast.error("Failed to copy messages");
    });
  }, [selectedMessages, messages, clearSelection]);

  const replyToSelectedMessages = useCallback(() => {
    if (selectedMessages.size === 0) return;
    const firstId = Array.from(selectedMessages)[0];
    const msg = messages.find(m => m._id === firstId);
    if (msg) setReplyingTo(msg);
    clearSelection();
  }, [selectedMessages, messages, clearSelection]);

  // Enhanced forward function with group support
  const forwardSelectedMessages = useCallback(async () => {
    if (selectedMessages.size === 0) return;

    try {
      const messagesToForward = messages.filter(msg => selectedMessages.has(msg._id));
      const currentChat = selectedUser || selectedGroup;
      
      if (!currentChat) {
        toast.error("No chat selected");
        return;
      }

      if (forwardToGroups) {
        const selectedGroups = Array.from(selectedForwardUsers).filter(id => 
          groups?.some(group => group._id === id)
        );
        
        if (selectedGroups.length === 0) {
          toast.error("Please select at least one group");
          return;
        }

        for (const groupId of selectedGroups) {
          await forwardMessagesToUser(messagesToForward, [groupId]);
        }

        toast.success(`Forwarded ${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''} to ${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''}`);
      } else {
        const selectedUsers = Array.from(selectedForwardUsers).filter(id => 
          friends?.some(friend => friend._id === id)
        );
        
        if (selectedUsers.length === 0) {
          toast.error("Please select at least one recipient");
          return;
        }

        for (const userId of selectedUsers) {
          await forwardMessagesToUser(messagesToForward, [userId]);
        }

        toast.success(`Forwarded ${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''} to ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`);
      }

      setForwardDialogOpen(false);
      clearSelection();
      setSelectedForwardUsers(new Set());
      setForwardToGroups(false);
    } catch (error) {
      console.error("Failed to forward messages:", error);
      toast.error("Failed to forward messages");
    }
  }, [selectedMessages, messages, selectedUser, selectedGroup, forwardToGroups, groups, friends, forwardMessagesToUser, clearSelection, selectedForwardUsers]);

  // Voice recording
  const handleVoiceRecord = async () => {
    setShowVoiceRecorder(true);
  };

  const handleVoiceRecordingComplete = async (recordingData) => {
    try {
      const currentChat = selectedUser || selectedGroup;
      if (!currentChat) return;

      const messageData = {
        text: '',
        mediaUrls: [`blob:voice-recording-${Date.now()}`],
        fileType: 'audio'
      };

      if (selectedGroup) {
        await sendGroupMessage(messageData);
      } else {
        await sendMessage(messageData);
      }
      
      toast.success('Voice message sent!');
      
    } catch (error) {
      console.error("Voice message processing error:", error);
      toast.error("Failed to send voice message");
    } finally {
      setShowVoiceRecorder(false);
    }
  };

  // Clear chat
  const handleClearChat = useCallback(async () => {
    const currentChat = selectedUser || selectedGroup;
    if (!currentChat) return;

    try {
      await clearChatPermanently(currentChat._id);
      setClearChatDialogOpen(false);
      setMessages([]);
      toast.success("Chat cleared successfully");
    } catch (error) {
      console.error("Clear chat error:", error);
      toast.error("Failed to clear chat");
    }
  }, [selectedUser, selectedGroup, clearChatPermanently, setMessages]);

  // Block user
  const handleBlockUser = async () => {
    if (!selectedUser) return;

    try {
      await blockUser(selectedUser._id);
      setBlockDialogOpen(false);
      toast.success("User blocked successfully");
      onBack?.();
    } catch (error) {
      console.error("Block user error:", error);
      toast.error("Failed to block user");
    }
  };

  // Message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() && mediaFiles.length === 0) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    const currentChat = selectedUser || selectedGroup;
    if (!currentChat) {
      toast.error("Please select a conversation first");
      return;
    }

    // Friends only check for direct messages
    if (selectedUser) {
      const isFriend = friends?.some(friend => friend._id === selectedUser._id) || false;
      if (!isFriend) {
        toast.error("You can only message friends. This user is not in your friends list.");
        return;
      }
      
      if (!canSendMessageToUser(selectedUser)) {
        toast.error("You cannot send messages to this user due to privacy settings");
        return;
      }
    }

    try {
      let mediaUrls = [];
      
      // Handle file uploads
      if (mediaFiles.length > 0) {
        const uploadPromises = mediaFiles.map(async (file, index) => {
          try {
            const url = await uploadFile(file, (progress) => {
              setUploadProgress(prev => ({ ...prev, [index]: progress }));
            });
            return url;
          } catch (error) {
            console.error(`Upload failed for file ${index}:`, error);
            throw new Error(`Failed to upload ${file.name}: ${error.message}`);
          }
        });

        mediaUrls = await Promise.all(uploadPromises);
      }

      const messageData = {
        text: input.trim(),
        mediaUrls,
        fileType: mediaFiles.length > 0 ? getFileType(mediaFiles[0].name) : 'text',
        replyTo: replyingTo?._id
      };

      if (editingMessage) {
        await editMessage(editingMessage._id, input.trim());
        setEditingMessage(null);
        toast.success("Message updated successfully");
      } else {
        if (selectedGroup) {
          await sendGroupMessage(messageData);
        } else {
          await sendMessage(messageData);
        }
      }

      // Reset state
      setInput("");
      setMediaFiles([]);
      setShowEmoji(false);
      setReplyingTo(null);
      sendTypingStatus(false);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error("Send message failed:", error);
      toast.error(error.message || "Failed to send message");
    }
  };

  // Search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setIsSearching(false);
      setFilteredMessages([]);
      return;
    }

    setIsSearching(true);
    const filtered = messages.filter(msg => 
      msg.text?.toLowerCase().includes(query.toLowerCase()) ||
      msg.senderId?.fullName?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMessages(filtered);
  }, [messages]);

  // File handling
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });
    
    setMediaFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMessageMenuOpen = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMessageMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleMessageAction = (action) => {
    if (!selectedMessage) return;

    switch (action) {
      case 'reply':
        setReplyingTo(selectedMessage);
        break;
      case 'edit':
        if (selectedMessage.senderId?._id === authUser._id) {
          setEditingMessage(selectedMessage);
          setInput(selectedMessage.text || '');
          inputRef.current?.focus();
        } else {
          toast.error("You can only edit your own messages");
        }
        break;
      case 'delete':
        handleDeleteMessage(selectedMessage._id);
        break;
      case 'forward':
        setSelectedMessages(new Set([selectedMessage._id]));
        setIsSelectMode(true);
        setForwardDialogOpen(true);
        break;
      case 'select':
        toggleMessageSelection(selectedMessage._id);
        break;
      case 'copy':
        navigator.clipboard.writeText(selectedMessage.text || '');
        toast.success("Message copied to clipboard");
        break;
      case 'details':
        handleShowMessageDetails(selectedMessage);
        break;
      case 'pin':
        handlePinMessage(selectedMessage);
        break;
      case 'unpin':
        handleUnpinMessage(selectedMessage._id);
        break;
      default:
        break;
    }
    
    handleMessageMenuClose();
  };

  // Fixed single message deletion
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessageById(messageId);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      toast.success("Message deleted successfully");
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handlePlayAudio = (audioUrl, messageId) => {
    if (playingAudio === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
      setPlayingAudio(messageId);
      
      audio.onended = () => {
        setPlayingAudio(null);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        console.error("Error playing audio");
        setPlayingAudio(null);
        audioRef.current = null;
        toast.error("Failed to play audio");
      };
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setInput(value);
    
    const currentChat = selectedUser || selectedGroup;
    if (!currentChat || !socket) return;

    sendTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTypingStatus(false), 1200);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark messages as seen when user is active
  useEffect(() => {
    const currentChat = selectedUser || selectedGroup;
    if (currentChat && messages.length > 0) {
      const hasUnseenMessages = messages.some(msg => {
        const isFromOtherUser = msg.senderId?._id !== authUser?._id && msg.senderId !== authUser?._id;
        const isUnseen = !msg.seen && !msg.seenBy?.includes(authUser?._id);
        return isFromOtherUser && isUnseen;
      });
      
      if (hasUnseenMessages) {
        const timer = setTimeout(() => {
          markMessagesAsSeen(currentChat._id);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [messages, selectedUser, selectedGroup, authUser, markMessagesAsSeen]);

  // Load messages when component mounts or user changes
  useEffect(() => {
    loadMessages();
  }, [selectedUser?._id, selectedGroup?._id, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isTyping]);

  const currentChat = selectedUser || selectedGroup;
  const displayMessages = isSearching ? filteredMessages : messages;

  if (!currentChat) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
          textAlign: 'center',
          p: 4,
          background: darkMode ? DARK_COLORS.background : CHAT_COLORS.background,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ChatParticleBackground darkMode={darkMode} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <GlassPaper
            darkMode={darkMode}
            sx={{
              p: 6,
              textAlign: 'center',
              maxWidth: 500,
              width: '100%',
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 15,
                delay: 0.2 
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 4,
                  borderRadius: '30px',
                  background: CHAT_COLORS.gradientPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(0, 132, 255, 0.3)',
                }}
              >
                <Typography variant="h2" sx={{ color: 'white' }}>
                  💬
                </Typography>
              </Box>
            </motion.div>

            <Typography variant="h4" gutterBottom fontWeight="800" sx={{ 
              mb: 3, 
              background: CHAT_COLORS.gradientPrimary,
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}>
              WhatsApp Clone
            </Typography>
            
            <Typography variant="h6" sx={{ 
              color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 
              mb: 2, 
              fontWeight: 700,
            }}>
              Welcome to Modern Chat
            </Typography>
            
            <Typography variant="body1" sx={{ 
              color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
              lineHeight: 1.6,
            }}>
              Select a conversation to start messaging with your friends and groups in real-time.
            </Typography>

            {/* Feature highlights */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 4, justifyContent: 'center' }}>
              {['Real-time Chat', 'Media Sharing', 'Voice Messages', 'Group Chats'].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Chip
                    label={feature}
                    sx={{
                      background: alpha(CHAT_COLORS.primary, 0.1),
                      color: CHAT_COLORS.primary,
                      fontWeight: 600,
                      borderRadius: '20px',
                      border: `1px solid ${alpha(CHAT_COLORS.primary, 0.2)}`,
                    }}
                  />
                </motion.div>
              ))}
            </Box>
          </GlassPaper>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      background: darkMode ? DARK_COLORS.background : CHAT_COLORS.background,
      position: 'relative',
      overflow: 'hidden',
    }}>
      
      {/* Particle Background */}
      <ChatParticleBackground darkMode={darkMode} />
      
      {/* Voice Recorder */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecordingComplete}
          onCancel={() => setShowVoiceRecorder(false)}
          darkMode={darkMode}
        />
      )}

      {/* Message Details Dialog */}
      <MessageDetails
        message={messageDetails}
        isGroup={!!selectedGroup}
        authUser={authUser}
        darkMode={darkMode}
        onClose={() => setMessageDetails(null)}
      />

      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: darkMode ? 'rgba(31, 44, 52, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          borderBottom: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
          backdropFilter: 'blur(20px)',
          zIndex: 10,
        }}
      >
        <Toolbar sx={{ py: 1.5, minHeight: '70px !important' }}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onBack}
              sx={{ mr: 1.5 }}
            >
              <ArrowBackIcon />
            </IconButton>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar
              src={currentChat.profilePic || currentChat.image}
              sx={{ 
                width: 45, 
                height: 45, 
                cursor: 'pointer',
                background: CHAT_COLORS.gradientPrimary,
                border: `2px solid ${alpha(CHAT_COLORS.primary, 0.3)}`,
                boxShadow: '0 4px 12px rgba(0, 132, 255, 0.3)',
              }}
              onClick={onOpenProfile}
            >
              {currentChat.fullName?.charAt(0) || currentChat.name?.charAt(0)}
            </Avatar>
          </motion.div>
          
          <Box sx={{ flex: 1, ml: 2.5, minWidth: 0, cursor: 'pointer' }} onClick={onOpenProfile}>
            <Typography variant="h6" noWrap fontWeight="800" sx={{ fontSize: '1.2rem', mb: 0.5 }}>
              {selectedGroup ? currentChat.name : currentChat.fullName}
            </Typography>
            <Box sx={{ color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, fontSize: '0.9rem', fontWeight: 600 }}>
              {isTyping ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {[0, 1, 2].map((dot) => (
                      <motion.div
                        key={dot}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: dot * 0.2,
                        }}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: CHAT_COLORS.primary,
                        }}
                      />
                    ))}
                  </Box>
                  <span style={{ fontStyle: 'italic', fontWeight: 600 }}>typing...</span>
                </motion.div>
              ) : selectedGroup ? (
                `${currentChat.members?.length || 0} members • ${onlineUsers.filter(id => currentChat.members?.some(m => m._id === id)).length} online`
              ) : (
                onlineUsers.includes(currentChat._id) ? 
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: CHAT_COLORS.online,
                    }}
                  />
                  <span style={{ fontWeight: 700 }}>Online</span>
                </motion.div> : 
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Box sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    background: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary 
                  }} />
                  <span style={{ fontWeight: 700 }}>Offline</span>
                </Box>
              )}
            </Box>
          </Box>

          {/* Header Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isStarred ? "Remove from favorites" : "Add to favorites"} arrow placement="bottom">
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <IconButton 
                  onClick={handleToggleFavorite}
                  sx={{ color: isStarred ? '#FFD700' : 'inherit' }}
                >
                  {isStarred ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              </motion.div>
            </Tooltip>

            <Tooltip title="Search Messages" arrow placement="bottom">
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <IconButton 
                  onClick={() => setIsSearching(!isSearching)}
                >
                  <SearchIcon />
                </IconButton>
              </motion.div>
            </Tooltip>

            <Tooltip title={isSelectMode ? "Exit Selection" : "Select Messages"} arrow placement="bottom">
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <IconButton 
                  onClick={() => setIsSelectMode(!isSelectMode)}
                >
                  <SelectAllIcon />
                </IconButton>
              </motion.div>
            </Tooltip>

            <Tooltip title="More Options" arrow placement="bottom">
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <IconButton 
                  onClick={(e) => setMoreOptionsAnchor(e.currentTarget)}
                >
                  <MoreVertIcon />
                </IconButton>
              </motion.div>
            </Tooltip>
          </Box>
        </Toolbar>

        {/* Search Bar */}
        {isSearching && (
          <Collapse in={isSearching}>
            <Box sx={{ px: 2.5, pb: 2 }}>
              <ModernTextField
                darkMode={darkMode}
                fullWidth
                size="small"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, mr: 1 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleSearch('')}
                          sx={{ color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </motion.div>
                    </InputAdornment>
                  ),
                }}
              />
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Typography variant="caption" sx={{ 
                    color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 
                    mt: 1.5, 
                    display: 'block',
                    fontWeight: 600,
                  }}>
                    {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''} found
                  </Typography>
                </motion.div>
              )}
            </Box>
          </Collapse>
        )}
      </AppBar>

      {/* Messages Area */}
      <Box
        ref={messagesEndRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          background: 'transparent',
          position: 'relative',
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 0.3),
            borderRadius: 4,
            '&:hover': {
              background: CHAT_COLORS.primary,
            },
          },
        }}
      >
        <AnimatePresence mode="popLayout">
          {displayMessages.length === 0 ? (
            <motion.div
              key="no-messages"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: 32 }}
            >
              {isSearching ? (
                <>
                  <Typography variant="h6" gutterBottom color={darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary} fontWeight="800">
                    No results found
                  </Typography>
                  <Typography variant="body1" color={darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary}>
                    No messages match your search criteria
                  </Typography>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  >
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '25px',
                        background: alpha(CHAT_COLORS.primary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        border: `2px solid ${alpha(CHAT_COLORS.primary, 0.2)}`,
                      }}
                    >
                      <Typography variant="h4" sx={{ color: CHAT_COLORS.primary }}>
                        💬
                      </Typography>
                    </Box>
                  </motion.div>
                  <Typography variant="h6" gutterBottom color={darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary} fontWeight="800">
                    No messages yet
                  </Typography>
                  <Typography variant="body1" color={darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary}>
                    Start the conversation by sending a message!
                  </Typography>
                </>
              )}
            </motion.div>
          ) : (
            displayMessages.map((message, index) => (
              <MessageBubble
                key={message._id || `message-${index}-${Date.now()}`}
                message={message}
                isOwnMessage={message.senderId?._id === authUser._id || message.senderId === authUser._id}
                isGroup={!!selectedGroup}
                selectedMessages={selectedMessages}
                isSelectMode={isSelectMode}
                toggleMessageSelection={toggleMessageSelection}
                reactToMessage={handleReactToMessage}
                removeReaction={handleRemoveReaction}
                getFileType={getFileType}
                getFileIcon={getFileIcon}
                downloadFile={downloadFile}
                playingAudio={playingAudio}
                handlePlayAudio={handlePlayAudio}
                authUser={authUser}
                onMessageMenuOpen={handleMessageMenuOpen}
                onShowMessageDetails={handleShowMessageDetails}
                darkMode={darkMode}
                pinnedMessages={pinnedMessages}
              />
            ))
          )}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 16, paddingRight: 16, marginBottom: 16 }}
          >
            <Paper
              sx={{
                p: 2,
                background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
              }}
            >
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[0, 1, 2].map((dot) => (
                  <motion.div
                    key={dot}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: dot * 0.2,
                    }}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: CHAT_COLORS.primary,
                    }}
                  />
                ))}
              </Box>
              <Typography variant="body2" color={darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary} fontWeight={600}>
                typing...
              </Typography>
            </Paper>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Selection Actions Bar */}
      <SelectionActionsBar
        selectedCount={selectedMessages.size}
        clearSelection={clearSelection}
        deleteSelected={deleteSelectedMessages}
        forwardSelected={() => setForwardDialogOpen(true)}
        downloadSelected={() => {}}
        replyToSelected={replyToSelectedMessages}
        pinSelected={() => {}}
        copySelected={copySelectedMessages}
        darkMode={darkMode}
      />

      {/* Reply Preview */}
      {replyingTo && (
        <Slide direction="up" in={!!replyingTo}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Paper
              variant="outlined"
              sx={{
                m: 2.5,
                mb: 1.5,
                p: 2,
                background: alpha(CHAT_COLORS.primary, 0.08),
                borderLeft: `4px solid ${CHAT_COLORS.primary}`,
                borderRadius: '16px',
                border: `1px solid ${alpha(CHAT_COLORS.primary, 0.2)}`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color={CHAT_COLORS.primary} fontWeight="700">
                    Replying to {replyingTo.senderId?._id === authUser._id ? 'yourself' : replyingTo.senderId?.fullName}
                  </Typography>
                  <Typography variant="body2" noWrap sx={{ color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, mt: 1, fontWeight: 600 }}>
                    {replyingTo.text || 'Media message'}
                  </Typography>
                </Box>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton size="small" onClick={() => setReplyingTo(null)}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
        </Slide>
      )}

      {/* Edit Preview */}
      {editingMessage && (
        <Slide direction="up" in={!!editingMessage}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Paper
              variant="outlined"
              sx={{
                m: 2.5,
                mb: 1.5,
                p: 2,
                background: alpha(CHAT_COLORS.primary, 0.12),
                borderLeft: `4px solid ${CHAT_COLORS.primary}`,
                borderRadius: '16px',
                border: `1px solid ${alpha(CHAT_COLORS.primary, 0.3)}`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color={CHAT_COLORS.primary} fontWeight="700">
                    Editing message
                  </Typography>
                  <Typography variant="body2" noWrap sx={{ color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, mt: 1, fontWeight: 600 }}>
                    {editingMessage.text}
                  </Typography>
                </Box>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton size="small" onClick={() => {
                    setEditingMessage(null);
                    setInput('');
                  }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
        </Slide>
      )}

      {/* Input Area */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 0,
          borderTop: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
          background: darkMode ? 'rgba(31, 44, 52, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {/* File Preview */}
        {mediaFiles.length > 0 && (
          <Box sx={{ mb: 2.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {mediaFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <Chip
                  icon={getFileIcon(file.name)}
                  label={
                    <Box>
                      <Typography variant="caption" display="block" noWrap sx={{ 
                        maxWidth: 120, 
                        fontWeight: 700,
                        color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
                      }}>
                        {file.name}
                      </Typography>
                      {uploadProgress[index] !== undefined && (
                        <LinearProgress 
                          variant="determinate" 
                          value={uploadProgress[index]} 
                          sx={{ width: 80, height: 6, borderRadius: 3, mt: 0.5 }}
                        />
                      )}
                    </Box>
                  }
                  onDelete={() => {
                    setMediaFiles(prev => prev.filter((_, i) => i !== index));
                  }}
                  variant="outlined"
                  sx={{ 
                    borderRadius: '20px',
                    maxWidth: 200,
                    background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.background,
                    color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
                    borderColor: alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.5),
                    fontWeight: 600,
                    '&:hover': {
                      background: darkMode ? DARK_COLORS.hover : CHAT_COLORS.hover,
                    },
                  }}
                />
              </motion.div>
            ))}
          </Box>
        )}

        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}
        >
          {/* Attachment Button */}
          <Tooltip title="Attach files" arrow placement="top">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <AnimatedIconButton 
                darkMode={darkMode}
                onClick={() => fileInputRef.current?.click()}
              >
                <AttachFileIcon />
              </AnimatedIconButton>
            </motion.div>
          </Tooltip>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
          />

          {/* Voice Message Button */}
          <Tooltip title="Voice message" arrow placement="top">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <AnimatedIconButton
                darkMode={darkMode}
                onClick={handleVoiceRecord}
              >
                <MicIcon />
              </AnimatedIconButton>
            </motion.div>
          </Tooltip>

          {/* Emoji Picker */}
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              ref={emojiPickerRef}
              style={{ 
                position: 'absolute', 
                bottom: '100%', 
                left: isMobile ? 0 : 'auto',
                right: isMobile ? 'auto' : 0,
                zIndex: 1000,
                marginBottom: 16,
              }}
            >
              <Picker
                onSelect={(emoji) => {
                  setInput(prev => prev + emoji.native);
                  inputRef.current?.focus();
                }}
                theme={darkMode ? "dark" : "light"}
                set="apple"
                showPreview={false}
                showSkinTones={false}
                style={{ 
                  borderRadius: '16px',
                  border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(20px)',
                }}
              />
            </motion.div>
          )}

          <Tooltip title="Add emoji" arrow placement="top">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <AnimatedIconButton
                darkMode={darkMode}
                onClick={() => setShowEmoji(!showEmoji)}
              >
                <EmojiIcon />
              </AnimatedIconButton>
            </motion.div>
          </Tooltip>

          <ModernTextField
            darkMode={darkMode}
            fullWidth
            inputRef={inputRef}
            placeholder="Type a message..."
            value={input}
            onChange={handleTyping}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            multiline
            maxRows={4}
            InputProps={{
              sx: {
                borderRadius: '25px',
                background: darkMode ? 'rgba(42, 57, 66, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  background: darkMode ? 'rgba(42, 57, 66, 0.9)' : 'rgba(248, 249, 250, 0.9)',
                },
                '&.Mui-focused': {
                  background: darkMode ? 'rgba(42, 57, 66, 1)' : 'rgba(255, 255, 255, 1)',
                },
              }
            }}
          />

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <FloatingActionButton
              type="submit"
              disabled={!input.trim() && mediaFiles.length === 0}
              sx={{
                width: 52,
                height: 52,
              }}
            >
              {editingMessage ? <EditIcon /> : <SendIcon />}
            </FloatingActionButton>
          </motion.div>
        </Box>
      </Paper>

      {/* Message Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMessageMenuClose}
        onClick={handleMessageMenuClose}
        PaperProps={{
          sx: {
            background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
            border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
            borderRadius: '16px',
            minWidth: 200,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <MenuItem onClick={() => handleMessageAction('reply')}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Reply" 
            primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
          />
        </MenuItem>
        
        <MenuItem onClick={() => handleMessageAction('select')}>
          <ListItemIcon>
            <SelectAllIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Select" 
            primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
          />
        </MenuItem>

        <MenuItem onClick={() => handleMessageAction('copy')}>
          <ListItemIcon>
            <CopyIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Copy Text" 
            primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
          />
        </MenuItem>

        <MenuItem onClick={() => handleMessageAction('details')}>
          <ListItemIcon>
            <InfoIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Message Details" 
            primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
          />
        </MenuItem>

        {pinnedMessages.some(pinned => pinned._id === selectedMessage?._id) ? (
          <MenuItem onClick={() => handleMessageAction('unpin')}>
            <ListItemIcon>
              <PinIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />
            </ListItemIcon>
            <ListItemText 
              primary="Unpin Message" 
              primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
            />
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleMessageAction('pin')}>
            <ListItemIcon>
              <PushPinIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />
            </ListItemIcon>
            <ListItemText 
              primary="Pin Message" 
              primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
            />
          </MenuItem>
        )}
        
        {selectedMessage?.senderId?._id === authUser._id && (
          <MenuItem onClick={() => handleMessageAction('edit')}>
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />
            </ListItemIcon>
            <ListItemText 
              primary="Edit" 
              primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
            />
          </MenuItem>
        )}
        
        <MenuItem onClick={() => handleMessageAction('forward')}>
          <ListItemIcon>
            <ForwardIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Forward" 
            primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
          />
        </MenuItem>

        <Divider />

        {selectedMessage?.senderId?._id === authUser._id && (
          <MenuItem 
            onClick={() => handleMessageAction('delete')}
            sx={{ color: CHAT_COLORS.error }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: CHAT_COLORS.error }} />
            </ListItemIcon>
            <ListItemText 
              primary="Delete" 
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </MenuItem>
        )}
      </Menu>

      {/* More Options Menu */}
      <Menu
        anchorEl={moreOptionsAnchor}
        open={Boolean(moreOptionsAnchor)}
        onClose={() => setMoreOptionsAnchor(null)}
        PaperProps={{
          sx: {
            background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
            border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
            borderRadius: '16px',
            minWidth: 240,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <MenuItem onClick={() => {
          setIsSelectMode(true);
          setMoreOptionsAnchor(null);
        }}>
          <ListItemIcon>
            <SelectAllIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Select Messages" 
            primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
          />
        </MenuItem>

        <MenuItem onClick={() => {
          onOpenProfile();
          setMoreOptionsAnchor(null);
        }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText 
            primary="View Profile" 
            primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
          />
        </MenuItem>

        <MenuItem onClick={() => {
          handleToggleFavorite();
          setMoreOptionsAnchor(null);
        }}>
          <ListItemIcon>
            {isStarred ? <StarIcon fontSize="small" sx={{ color: '#FFD700' }} /> : <StarBorderIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />}
          </ListItemIcon>
          <ListItemText 
            primary={isStarred ? "Remove from Favorites" : "Add to Favorites"} 
            primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
          />
        </MenuItem>

        <MenuItem onClick={() => {
          setMediaDialogOpen(true);
          setMoreOptionsAnchor(null);
        }}>
          <ListItemIcon>
            <PhotoCameraIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText 
            primary="View Media" 
            primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
          />
        </MenuItem>

        <MenuItem onClick={() => {
          setPinnedDialogOpen(true);
          setMoreOptionsAnchor(null);
        }}>
          <ListItemIcon>
            <PushPinIcon fontSize="small" sx={{ color: CHAT_COLORS.primary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Pinned Messages" 
            primaryTypographyProps={{ fontWeight: 600, color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary }}
          />
        </MenuItem>

        {selectedGroup && (
          <MenuItem onClick={() => {
            setExitGroupDialogOpen(true);
            setMoreOptionsAnchor(null);
          }} sx={{ color: CHAT_COLORS.error }}>
            <ListItemIcon>
              <ExitToAppIcon fontSize="small" sx={{ color: CHAT_COLORS.error }} />
            </ListItemIcon>
            <ListItemText 
              primary="Exit Group" 
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </MenuItem>
        )}

        <Divider />

        {selectedUser && (
          <MenuItem onClick={() => {
            setBlockDialogOpen(true);
            setMoreOptionsAnchor(null);
          }} sx={{ color: CHAT_COLORS.error }}>
            <ListItemIcon>
              <BlockIcon fontSize="small" sx={{ color: CHAT_COLORS.error }} />
            </ListItemIcon>
            <ListItemText 
              primary="Block User" 
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </MenuItem>
        )}

        <MenuItem onClick={() => {
          setClearChatDialogOpen(true);
          setMoreOptionsAnchor(null);
        }} sx={{ color: CHAT_COLORS.error }}>
          <ListItemIcon>
            <ClearAllIcon fontSize="small" sx={{ color: CHAT_COLORS.error }} />
          </ListItemIcon>
          <ListItemText 
            primary="Clear Chat" 
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </MenuItem>
      </Menu>

      {/* Enhanced Forward Dialog with Group Support */}
      <Dialog
        open={forwardDialogOpen}
        onClose={() => {
          setForwardDialogOpen(false);
          setForwardToGroups(false);
          setSelectedForwardUsers(new Set());
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
            overflow: 'hidden',
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            fontWeight: '800', 
            color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 3,
            background: darkMode ? 'rgba(31, 44, 52, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderBottom: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
          }}>
            <Typography variant="h6" fontWeight="800" sx={{
              background: CHAT_COLORS.gradientPrimary,
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}>
              Forward Messages
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={forwardToGroups}
                  onChange={(e) => setForwardToGroups(e.target.checked)}
                  color="primary"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: CHAT_COLORS.primary,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: CHAT_COLORS.primary,
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupsIcon fontSize="small" />
                  <Typography variant="body2" fontWeight="600">
                    Forward to Groups
                  </Typography>
                </Box>
              }
              sx={{ m: 0 }}
            />
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Typography variant="body2" sx={{ 
                color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 
                mb: 3, 
                textAlign: 'center',
                fontWeight: 600,
              }}>
                Select {forwardToGroups ? 'groups' : 'users'} to forward {selectedMessages.size} message{selectedMessages.size > 1 ? 's' : ''} to
              </Typography>
            </motion.div>
            
            <Box sx={{ maxHeight: 300, overflow: 'auto', pr: 1 }}>
              {forwardToGroups ? (
                // Groups list
                groups?.filter(group => group._id !== selectedGroup?._id).map((group, index) => (
                  <motion.div
                    key={group._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ListItem
                      sx={{
                        borderRadius: '16px',
                        mb: 1.5,
                        background: selectedForwardUsers.has(group._id) 
                          ? alpha(CHAT_COLORS.primary, 0.15) 
                          : darkMode ? DARK_COLORS.surfaceDark : CHAT_COLORS.surfaceDark,
                        border: `2px solid ${selectedForwardUsers.has(group._id) ? CHAT_COLORS.primary : alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: alpha(CHAT_COLORS.primary, 0.1),
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                      onClick={() => {
                        const newSelection = new Set(selectedForwardUsers);
                        if (newSelection.has(group._id)) {
                          newSelection.delete(group._id);
                        } else {
                          newSelection.add(group._id);
                        }
                        setSelectedForwardUsers(newSelection);
                      }}
                    >
                      <ListItemAvatar>
                        <motion.div whileHover={{ scale: 1.1 }}>
                          <Avatar 
                            src={group.image} 
                            sx={{ 
                              bgcolor: CHAT_COLORS.primary,
                              boxShadow: '0 4px 12px rgba(0, 132, 255, 0.3)',
                            }}
                          >
                            <GroupsIcon />
                          </Avatar>
                        </motion.div>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Typography fontWeight="700" sx={{
                            background: selectedForwardUsers.has(group._id) ? CHAT_COLORS.gradientPrimary : 'none',
                            backgroundClip: selectedForwardUsers.has(group._id) ? 'text' : 'none',
                            textFillColor: selectedForwardUsers.has(group._id) ? 'transparent' : 'inherit',
                          }}>
                            {group.name}
                          </Typography>
                        }
                        secondary={`${group.members?.length || 0} members`}
                        primaryTypographyProps={{ 
                          color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
                          fontWeight: 700 
                        }}
                        secondaryTypographyProps={{ 
                          color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
                          fontWeight: 600 
                        }}
                      />
                      {selectedForwardUsers.has(group._id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <CheckCircleIcon sx={{ color: CHAT_COLORS.primary }} />
                        </motion.div>
                      )}
                    </ListItem>
                  </motion.div>
                ))
              ) : (
                // Users list
                friends?.filter(friend => friend._id !== selectedUser?._id).map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ListItem
                      sx={{
                        borderRadius: '16px',
                        mb: 1.5,
                        background: selectedForwardUsers.has(user._id) 
                          ? alpha(CHAT_COLORS.primary, 0.15) 
                          : darkMode ? DARK_COLORS.surfaceDark : CHAT_COLORS.surfaceDark,
                        border: `2px solid ${selectedForwardUsers.has(user._id) ? CHAT_COLORS.primary : alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: alpha(CHAT_COLORS.primary, 0.1),
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                      onClick={() => {
                        const newSelection = new Set(selectedForwardUsers);
                        if (newSelection.has(user._id)) {
                          newSelection.delete(user._id);
                        } else {
                          newSelection.add(user._id);
                        }
                        setSelectedForwardUsers(newSelection);
                      }}
                    >
                      <ListItemAvatar>
                        <motion.div whileHover={{ scale: 1.1 }}>
                          <Avatar 
                            src={user.profilePic} 
                            sx={{ 
                              bgcolor: CHAT_COLORS.primary,
                              boxShadow: '0 4px 12px rgba(0, 132, 255, 0.3)',
                              border: `2px solid ${onlineUsers.includes(user._id) ? CHAT_COLORS.online : 'transparent'}`,
                            }}
                          >
                            {user.fullName?.charAt(0)}
                          </Avatar>
                        </motion.div>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Typography fontWeight="700" sx={{
                            background: selectedForwardUsers.has(user._id) ? CHAT_COLORS.gradientPrimary : 'none',
                            backgroundClip: selectedForwardUsers.has(user._id) ? 'text' : 'none',
                            textFillColor: selectedForwardUsers.has(user._id) ? 'transparent' : 'inherit',
                          }}>
                            {user.fullName}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: onlineUsers.includes(user._id) ? CHAT_COLORS.online : CHAT_COLORS.offline,
                              }}
                            />
                            <Typography variant="caption" fontWeight="600">
                              {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ 
                          color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
                          fontWeight: 700 
                        }}
                        secondaryTypographyProps={{ 
                          color: onlineUsers.includes(user._id) ? CHAT_COLORS.online : darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
                          fontWeight: 600 
                        }}
                      />
                      {selectedForwardUsers.has(user._id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <CheckCircleIcon sx={{ color: CHAT_COLORS.primary }} />
                        </motion.div>
                      )}
                    </ListItem>
                  </motion.div>
                ))
              )}
              
              {(forwardToGroups ? groups?.length === 0 : friends?.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Typography 
                    variant="body2" 
                    textAlign="center" 
                    sx={{ 
                      color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 
                      py: 4,
                      fontStyle: 'italic',
                      fontWeight: 600,
                    }}
                  >
                    No {forwardToGroups ? 'groups' : 'users'} available to forward to
                  </Typography>
                </motion.div>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2, background: darkMode ? 'rgba(31, 44, 52, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => {
                  setForwardDialogOpen(false);
                  setForwardToGroups(false);
                  setSelectedForwardUsers(new Set());
                }}
                sx={{ 
                  color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
                  borderRadius: '12px',
                  px: 4,
                  py: 1,
                  fontWeight: '700',
                  border: `2px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
                  '&:hover': {
                    background: alpha(darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 0.1),
                  },
                }}
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={forwardSelectedMessages}
                disabled={selectedForwardUsers.size === 0}
                sx={{
                  background: selectedForwardUsers.size > 0 ? CHAT_COLORS.gradientPrimary : alpha(CHAT_COLORS.primary, 0.3),
                  borderRadius: '12px',
                  px: 4,
                  py: 1,
                  fontWeight: '700',
                  boxShadow: selectedForwardUsers.size > 0 ? '0 4px 15px rgba(0, 132, 255, 0.4)' : 'none',
                  '&:hover': selectedForwardUsers.size > 0 ? {
                    background: CHAT_COLORS.primaryDark,
                    boxShadow: '0 6px 20px rgba(0, 132, 255, 0.6)',
                  } : {},
                  '&:disabled': {
                    background: alpha(CHAT_COLORS.primary, 0.3),
                    color: alpha(CHAT_COLORS.textLight, 0.5),
                  },
                }}
              >
                Forward ({selectedForwardUsers.size})
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>

      {/* Enhanced Media Dialog */}
      <Dialog
        open={mediaDialogOpen}
        onClose={() => setMediaDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
            overflow: 'hidden',
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
            borderBottom: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
            py: 3,
            background: darkMode ? 'rgba(31, 44, 52, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          }}>
            <Typography variant="h6" fontWeight="800" sx={{
              background: CHAT_COLORS.gradientPrimary,
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}>
              Shared Media
            </Typography>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <IconButton 
                onClick={() => setMediaDialogOpen(false)} 
                size="small"
                sx={{
                  background: alpha(darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 0.1),
                  '&:hover': {
                    background: alpha(CHAT_COLORS.primary, 0.2),
                    transform: 'rotate(90deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CloseIcon />
              </IconButton>
            </motion.div>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {chatMedia.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, 
                  gap: 2 
                }}>
                  {chatMedia.map((media, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          '&:hover': {
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={media}
                          alt="Shared media"
                          sx={{ 
                            height: 150, 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            },
                          }}
                          onClick={() => window.open(media, '_blank')}
                        />
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '20px',
                        background: alpha(CHAT_COLORS.primary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        border: `2px solid ${alpha(CHAT_COLORS.primary, 0.2)}`,
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 40, color: CHAT_COLORS.primary }} />
                    </Box>
                  </motion.div>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary, 
                      mb: 1,
                      fontWeight: 700,
                    }}
                  >
                    No Media Shared
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 
                      fontStyle: 'italic',
                      fontWeight: 600,
                    }}
                  >
                    No media has been shared in this chat yet
                  </Typography>
                </Box>
              </motion.div>
            )}
          </DialogContent>
        </motion.div>
      </Dialog>

      {/* Enhanced Pinned Messages Dialog */}
      <Dialog
        open={pinnedDialogOpen}
        onClose={() => setPinnedDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
            overflow: 'hidden',
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary,
            borderBottom: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
            py: 3,
            background: darkMode ? 'rgba(31, 44, 52, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          }}>
            <Typography variant="h6" fontWeight="800" sx={{
              background: CHAT_COLORS.gradientPrimary,
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}>
              Pinned Messages
            </Typography>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <IconButton 
                onClick={() => setPinnedDialogOpen(false)} 
                size="small"
                sx={{
                  background: alpha(darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 0.1),
                  '&:hover': {
                    background: alpha(CHAT_COLORS.primary, 0.2),
                    transform: 'rotate(90deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CloseIcon />
              </IconButton>
            </motion.div>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {pinnedMessages.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {pinnedMessages.map((message, index) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Paper
                      sx={{
                        p: 2.5,
                        background: darkMode ? DARK_COLORS.surfaceDark : CHAT_COLORS.surfaceDark,
                        borderRadius: '16px',
                        border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          background: darkMode ? DARK_COLORS.hover : CHAT_COLORS.hover,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                        },
                      }}
                      onClick={() => {
                        const messageElement = document.getElementById(`message-${message._id}`);
                        if (messageElement) {
                          messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        setPinnedDialogOpen(false);
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: '0.9rem',
                            background: CHAT_COLORS.gradientPrimary,
                            boxShadow: '0 4px 12px rgba(0, 132, 255, 0.3)',
                          }}
                        >
                          {message.senderId?.fullName?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="800" sx={{
                            background: CHAT_COLORS.gradientPrimary,
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                          }}>
                            {message.senderId?._id === authUser._id ? 'You' : message.senderId?.fullName}
                          </Typography>
                          <Typography variant="caption" color={darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary} sx={{ fontWeight: 600 }}>
                            {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            background: CHAT_COLORS.gradientPrimary,
                            borderRadius: '12px',
                            px: 1.5,
                            py: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <PinIcon sx={{ fontSize: 14, color: CHAT_COLORS.textLight }} />
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 700, color: CHAT_COLORS.textLight }}>
                            Pinned
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
                        {message.text || 'Media message'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnpinMessage(message._id);
                            }}
                            sx={{ 
                              color: CHAT_COLORS.error,
                              background: alpha(CHAT_COLORS.error, 0.1),
                              '&:hover': {
                                background: alpha(CHAT_COLORS.error, 0.2),
                              },
                            }}
                          >
                            <PushPinIcon fontSize="small" />
                          </IconButton>
                        </motion.div>
                      </Box>
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '20px',
                        background: alpha(CHAT_COLORS.primary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        border: `2px solid ${alpha(CHAT_COLORS.primary, 0.2)}`,
                      }}
                    >
                      <PushPinIcon sx={{ fontSize: 40, color: CHAT_COLORS.primary }} />
                    </Box>
                  </motion.div>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary, 
                      mb: 1,
                      fontWeight: 700,
                    }}
                  >
                    No Pinned Messages
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 
                      fontStyle: 'italic',
                      fontWeight: 600,
                    }}
                  >
                    No messages have been pinned in this chat yet
                  </Typography>
                </Box>
              </motion.div>
            )}
          </DialogContent>
        </motion.div>
      </Dialog>

      {/* Enhanced Clear Chat Dialog */}
      <Dialog
        open={clearChatDialogOpen}
        onClose={() => setClearChatDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
            overflow: 'hidden',
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogTitle sx={{ textAlign: 'center', fontWeight: '800', color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary, py: 3 }}>
            <Typography variant="h6" fontWeight="800" sx={{
              background: CHAT_COLORS.gradientPrimary,
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}>
              Clear Chat
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', p: 3 }}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '25px',
                  background: alpha(CHAT_COLORS.error, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  border: `2px solid ${alpha(CHAT_COLORS.error, 0.3)}`,
                  boxShadow: '0 4px 15px rgba(255, 59, 48, 0.2)',
                }}
              >
                <DeleteIcon sx={{ fontSize: 48, color: CHAT_COLORS.error }} />
              </Box>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Typography variant="body2" sx={{ 
                color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 
                lineHeight: 1.6,
                fontWeight: 600,
              }}>
                Are you sure you want to clear this chat? This action cannot be undone and will remove all messages from your view.
              </Typography>
            </motion.div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2, background: darkMode ? 'rgba(31, 44, 52, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setClearChatDialogOpen(false)}
                sx={{ 
                  color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
                  borderRadius: '12px',
                  px: 4,
                  py: 1,
                  fontWeight: '700',
                  border: `2px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
                  '&:hover': {
                    background: alpha(darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 0.1),
                  },
                }}
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={handleClearChat}
                sx={{
                  background: CHAT_COLORS.gradientOrange,
                  borderRadius: '12px',
                  px: 4,
                  py: 1,
                  fontWeight: '700',
                  boxShadow: '0 4px 15px rgba(255, 59, 48, 0.4)',
                  '&:hover': {
                    background: '#dc2626',
                    boxShadow: '0 6px 20px rgba(255, 59, 48, 0.6)',
                  },
                }}
              >
                Clear Chat
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>

      {/* Enhanced Block User Dialog */}
      <Dialog
        open={blockDialogOpen}
        onClose={() => setBlockDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
            overflow: 'hidden',
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogTitle sx={{ textAlign: 'center', fontWeight: '800', color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary, py: 3 }}>
            <Typography variant="h6" fontWeight="800" sx={{
              background: CHAT_COLORS.gradientPrimary,
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}>
              Block User
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', p: 3 }}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '25px',
                  background: alpha(CHAT_COLORS.error, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  border: `2px solid ${alpha(CHAT_COLORS.error, 0.3)}`,
                  boxShadow: '0 4px 15px rgba(255, 59, 48, 0.2)',
                }}
              >
                <BlockIcon sx={{ fontSize: 48, color: CHAT_COLORS.error }} />
              </Box>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Typography variant="body2" sx={{ 
                color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 
                lineHeight: 1.6,
                fontWeight: 600,
              }}>
                Are you sure you want to block {selectedUser?.fullName || selectedUser?.name}? You will no longer receive messages from this user and they won't be able to see your online status.
              </Typography>
            </motion.div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2, background: darkMode ? 'rgba(31, 44, 52, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setBlockDialogOpen(false)}
                sx={{ 
                  color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
                  borderRadius: '12px',
                  px: 4,
                  py: 1,
                  fontWeight: '700',
                  border: `2px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
                  '&:hover': {
                    background: alpha(darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 0.1),
                  },
                }}
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={handleBlockUser}
                sx={{
                  background: CHAT_COLORS.gradientOrange,
                  borderRadius: '12px',
                  px: 4,
                  py: 1,
                  fontWeight: '700',
                  boxShadow: '0 4px 15px rgba(255, 59, 48, 0.4)',
                  '&:hover': {
                    background: '#dc2626',
                    boxShadow: '0 6px 20px rgba(255, 59, 48, 0.6)',
                  },
                }}
              >
                Block User
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>

      {/* Enhanced Exit Group Dialog */}
      <Dialog
        open={exitGroupDialogOpen}
        onClose={() => setExitGroupDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: darkMode ? DARK_COLORS.surface : CHAT_COLORS.surface,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
            overflow: 'hidden',
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogTitle sx={{ textAlign: 'center', fontWeight: '800', color: darkMode ? DARK_COLORS.textPrimary : CHAT_COLORS.textPrimary, py: 3 }}>
            <Typography variant="h6" fontWeight="800" sx={{
              background: CHAT_COLORS.gradientPrimary,
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}>
              Exit Group
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', p: 3 }}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '25px',
                  background: alpha(CHAT_COLORS.warning, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  border: `2px solid ${alpha(CHAT_COLORS.warning, 0.3)}`,
                  boxShadow: '0 4px 15px rgba(255, 149, 0, 0.2)',
                }}
              >
                <ExitToAppIcon sx={{ fontSize: 48, color: CHAT_COLORS.warning }} />
              </Box>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Typography variant="body2" sx={{ 
                color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 
                lineHeight: 1.6,
                fontWeight: 600,
              }}>
                Are you sure you want to exit the group "{selectedGroup?.name}"? You will no longer receive messages from this group and won't be able to rejoin unless invited.
              </Typography>
            </motion.div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2, background: darkMode ? 'rgba(31, 44, 52, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setExitGroupDialogOpen(false)}
                sx={{ 
                  color: darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary,
                  borderRadius: '12px',
                  px: 4,
                  py: 1,
                  fontWeight: '700',
                  border: `2px solid ${alpha(darkMode ? DARK_COLORS.border : CHAT_COLORS.border, 0.3)}`,
                  '&:hover': {
                    background: alpha(darkMode ? DARK_COLORS.textSecondary : CHAT_COLORS.textSecondary, 0.1),
                  },
                }}
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={handleExitGroup}
                sx={{
                  background: CHAT_COLORS.gradientOrange,
                  borderRadius: '12px',
                  px: 4,
                  py: 1,
                  fontWeight: '700',
                  boxShadow: '0 4px 15px rgba(255, 149, 0, 0.4)',
                  '&:hover': {
                    background: '#d97706',
                    boxShadow: '0 6px 20px rgba(255, 149, 0, 0.6)',
                  },
                }}
              >
                Exit Group
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>
    </Box>
  );
};

export default ChatContainer;