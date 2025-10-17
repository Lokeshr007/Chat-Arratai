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
  Zoom,
  Collapse,
  Card,
  CardMedia,
  GlobalStyles,
  SwipeableDrawer,
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
  LocationOn as LocationIcon,
  ContactPhone as ContactIcon,
  Poll as PollIcon,
  Psychology as PsychologyIcon,
  Celebration as CelebrationIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
  ClearAll as ClearAllIcon,
  MoreHoriz as MoreHorizIcon,
  Archive as ArchiveIcon,
  Report as ReportIcon,
  VolumeOff as VolumeOffIcon,
  Close as CloseIcon,
  Label as LabelIcon,
  SmartToy as AIIcon,
  Gif as GifIcon,
  StickyNote2 as StickerIcon,
  Code as CodeIcon,
  Translate as TranslateIcon,
  AutoAwesome as AutoAwesomeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  SmsFailed as SmsFailedIcon,
  DoneAll as DoneAllIcon,
  Done as DoneIcon,
} from "@mui/icons-material";
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { toast } from "react-hot-toast";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

// Modern gradient colors with enhanced contrast
const MODERN_COLORS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  warning: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  error: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  dark: 'linear-gradient(135deg, #0a0a14 0%, #151528 100%)',
  messageOwn: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  messageOther: 'linear-gradient(135deg, #2a2a3e 0%, #3a3a52 100%)',
  glass: 'rgba(255, 255, 255, 0.12)',
  glassDark: 'rgba(10, 10, 20, 0.95)',
  ai: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
  background: 'linear-gradient(135deg, #0a0a14 0%, #1a1a2e 50%, #151528 100%)',
};

// Enhanced Styled Components with better contrast
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: MODERN_COLORS.glass,
  backdropFilter: 'blur(25px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
  boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.45)',
}));

const GradientAppBar = styled(AppBar)(({ theme }) => ({
  background: MODERN_COLORS.glassDark,
  backdropFilter: 'blur(25px)',
  borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
  boxShadow: '0 6px 25px 0 rgba(0, 0, 0, 0.3)',
}));

const MessageBubblePaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isOwnMessage' && prop !== 'isSelected' && prop !== 'isPinned',
})(
  ({ theme, isOwnMessage, isSelected, isPinned }) => ({
    background: isOwnMessage ? MODERN_COLORS.messageOwn : MODERN_COLORS.messageOther,
    backdropFilter: 'blur(15px)',
    border: `1px solid ${alpha(theme.palette.common.white, isOwnMessage ? 0.25 : 0.15)}`,
    boxShadow: isSelected 
      ? '0 0 0 3px rgba(102, 126, 234, 0.8), 0 6px 25px rgba(0, 0, 0, 0.2)'
      : isPinned
      ? '0 0 0 3px rgba(255, 193, 7, 0.8), 0 6px 25px rgba(255, 193, 7, 0.15)'
      : '0 6px 25px rgba(0, 0, 0, 0.15)',
    borderRadius: '22px',
    borderBottomRightRadius: isOwnMessage ? '8px' : '22px',
    borderBottomLeftRadius: isOwnMessage ? '22px' : '8px',
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    position: 'relative',
    overflow: 'visible',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.3)}, transparent)`,
    },
    '&:hover': {
      transform: 'translateY(-3px) scale(1.02)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
    },
  })
);

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  background: MODERN_COLORS.primary,
  backdropFilter: 'blur(15px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
  boxShadow: '0 10px 35px rgba(102, 126, 234, 0.4)',
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  '&:hover': {
    background: MODERN_COLORS.secondary,
    transform: 'translateY(-3px) scale(1.1)',
    boxShadow: '0 15px 45px rgba(102, 126, 234, 0.6)',
  },
  '&:active': {
    transform: 'translateY(0) scale(0.95)',
  },
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: MODERN_COLORS.glass,
    backdropFilter: 'blur(15px)',
    border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
    borderRadius: '28px',
    color: theme.palette.common.white,
    transition: 'all 0.4s ease',
    '&:hover': {
      background: alpha(theme.palette.common.white, 0.18),
      border: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
    },
    '&.Mui-focused': {
      background: alpha(theme.palette.common.white, 0.2),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.8)}`,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '16px 22px',
    color: theme.palette.common.white,
    fontSize: '0.95rem',
    '&::placeholder': {
      color: alpha(theme.palette.common.white, 0.6),
    },
  },
}));

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  backdropFilter: 'blur(15px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
  '&:hover': {
    transform: 'scale(1.15) translateY(-3px)',
    background: alpha(theme.palette.common.white, 0.2),
    border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  },
  '&:active': {
    transform: 'scale(0.9) translateY(0)',
  },
}));

// Enhanced Message Status Component
const MessageStatus = ({ message, authUser }) => {
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
            <ScheduleIcon sx={{ fontSize: 18, color: alpha('#fff', 0.7) }} />
          </Tooltip>
        );
      case 'sent':
        return (
          <Tooltip title="Sent" arrow placement="top">
            <DoneIcon sx={{ fontSize: 18, color: alpha('#fff', 0.8) }} />
          </Tooltip>
        );
      case 'delivered':
        return (
          <Tooltip title="Delivered" arrow placement="top">
            <DoneAllIcon sx={{ fontSize: 18, color: alpha('#fff', 0.8) }} />
          </Tooltip>
        );
      case 'seen':
        return (
          <Tooltip title="Seen" arrow placement="top">
            <DoneAllIcon sx={{ fontSize: 18, color: '#4CAF50' }} />
          </Tooltip>
        );
      case 'failed':
        return (
          <Tooltip title="Failed to send" arrow placement="top">
            <ErrorIcon sx={{ fontSize: 18, color: '#ff4444' }} />
          </Tooltip>
        );
      default:
        return (
          <Tooltip title="Sent" arrow placement="top">
            <DoneIcon sx={{ fontSize: 18, color: alpha('#fff', 0.7) }} />
          </Tooltip>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <StatusIcon />
    </Box>
  );
};

// Enhanced Selection Actions Bar with better visibility
const SelectionActionsBar = ({ 
  selectedCount, 
  clearSelection, 
  deleteSelected, 
  forwardSelected, 
  downloadSelected,
  replyToSelected,
  pinSelected,
  copySelected
}) => {
  if (!selectedCount || selectedCount === 0) return null;

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <GlassPaper
        elevation={12}
        sx={{
          position: 'fixed',
          bottom: 120,
          left: '50%',
          transform: 'translateX(-50%)',
          p: 2.5,
          borderRadius: '25px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          zIndex: 9999,
          minWidth: { xs: '92%', sm: 450 },
          border: `1px solid ${alpha('#fff', 0.25)}`,
          boxShadow: '0 15px 45px rgba(0, 0, 0, 0.4)',
          animation: 'float 4s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateX(-50%) translateY(0px)' },
            '50%': { transform: 'translateX(-50%) translateY(-8px)' },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: MODERN_COLORS.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
          >
            {selectedCount}
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
            {selectedCount} message{selectedCount > 1 ? 's' : ''} selected
          </Typography>
        </Box>
        
        <Divider orientation="vertical" flexItem sx={{ backgroundColor: alpha('#fff', 0.4), height: 28 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Clear Selection" arrow placement="top">
            <AnimatedIconButton 
              size="small" 
              onClick={clearSelection}
              sx={{ color: 'white' }}
            >
              <DeselectIcon />
            </AnimatedIconButton>
          </Tooltip>
          
          <Tooltip title="Copy Text" arrow placement="top">
            <AnimatedIconButton 
              size="small" 
              onClick={copySelected}
              sx={{ color: 'white' }}
            >
              <CopyIcon />
            </AnimatedIconButton>
          </Tooltip>

          <Tooltip title="Pin Message" arrow placement="top">
            <AnimatedIconButton 
              size="small" 
              onClick={pinSelected}
              sx={{ color: 'warning.main' }}
            >
              <LabelIcon />
            </AnimatedIconButton>
          </Tooltip>
          
          <Tooltip title="Delete Selected" arrow placement="top">
            <AnimatedIconButton 
              size="small" 
              onClick={deleteSelected}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon />
            </AnimatedIconButton>
          </Tooltip>
          
          <Tooltip title="Forward Selected" arrow placement="top">
            <AnimatedIconButton 
              size="small" 
              onClick={forwardSelected}
              sx={{ color: 'white' }}
            >
              <ForwardIcon />
            </AnimatedIconButton>
          </Tooltip>
          
          <Tooltip title="Download Selected" arrow placement="top">
            <AnimatedIconButton 
              size="small" 
              onClick={downloadSelected}
              sx={{ color: 'white' }}
            >
              <DownloadIcon />
            </AnimatedIconButton>
          </Tooltip>

          {selectedCount === 1 && (
            <Tooltip title="Reply to Selected" arrow placement="top">
              <AnimatedIconButton 
                size="small" 
                onClick={replyToSelected}
                sx={{ color: 'white' }}
              >
                <ReplyIcon />
              </AnimatedIconButton>
            </Tooltip>
          )}
        </Box>
      </GlassPaper>
    </Slide>
  );
};

// Enhanced AI Assistant Component
const AIAssistant = ({ onAIAction, theme, onClose }) => {
  const [aiSuggestions] = useState([
    "Help me improve this message",
    "Translate to Spanish",
    "Make it more professional",
    "Shorten this message",
    "Add emojis to make it friendly",
    "Check grammar and spelling",
    "Make it more casual",
    "Rephrase for clarity"
  ]);

  return (
    <Fade in={true}>
      <GlassPaper
        sx={{
          m: 2.5,
          mb: 1.5,
          p: 2.5,
          background: MODERN_COLORS.ai,
          borderRadius: '20px',
          border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
          position: 'relative',
          boxShadow: '0 10px 35px rgba(255, 107, 107, 0.3)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AIIcon sx={{ color: 'white', fontSize: 24 }} />
            <Typography variant="h6" fontWeight="bold" color="white">
              AI Assistant
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: 'white', '&:hover': { background: alpha('#fff', 0.2) } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant="body2" color="white" sx={{ opacity: 0.9, mb: 2, display: 'block', fontSize: '0.9rem' }}>
          Need help with your message? Try these suggestions:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {aiSuggestions.map((suggestion, index) => (
            <Chip
              key={index}
              label={suggestion}
              size="medium"
              onClick={() => onAIAction(suggestion)}
              sx={{
                background: alpha(theme.palette.common.white, 0.25),
                color: 'white',
                fontSize: '0.8rem',
                height: '32px',
                fontWeight: 500,
                '&:hover': {
                  background: alpha(theme.palette.common.white, 0.35),
                  transform: 'scale(1.08)',
                },
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>
      </GlassPaper>
    </Fade>
  );
};

// Enhanced Message Bubble Component with superior hover effects
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
  theme,
  onMessageMenuOpen,
  onPinMessage,
  isPinned
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [reactionsPanelOpen, setReactionsPanelOpen] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const isSelected = selectedMessages.has(message._id);
  
  const bubbleRef = useRef(null);

  // Enhanced hover effects with delayed appearance
  useEffect(() => {
    let hoverTimer;
    if (isHovered) {
      hoverTimer = setTimeout(() => {
        // Additional hover effects can be triggered here
      }, 100);
    }
    return () => clearTimeout(hoverTimer);
  }, [isHovered]);

  // Close reactions panel when clicking outside
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

  const handleTranslate = async () => {
    if (!message.text || translatedText) {
      setTranslatedText(null);
      return;
    }

    setIsTranslating(true);
    try {
      // Simulate translation API call
      setTimeout(() => {
        setTranslatedText(`[Translated] ${message.text}`);
        setIsTranslating(false);
      }, 1000);
    } catch (error) {
      console.error("Translation failed:", error);
      setIsTranslating(false);
    }
  };

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😠'];

  return (
    <Box
      ref={bubbleRef}
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 3,
        px: 2.5,
        position: 'relative',
        transition: 'all 0.4s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Selection Checkbox */}
      {isSelectMode && (
        <Box
          sx={{
            position: 'absolute',
            left: isOwnMessage ? 'auto' : 10,
            right: isOwnMessage ? 10 : 'auto',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            opacity: isHovered || isSelected ? 1 : 0,
            transition: 'all 0.4s ease',
          }}
        >
          <AnimatedIconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleMessageSelection(message._id);
            }}
            sx={{
              color: 'white',
              background: isSelected ? MODERN_COLORS.primary : MODERN_COLORS.glassDark,
              backdropFilter: 'blur(15px)',
              borderRadius: '50%',
              border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
              width: 32,
              height: 32,
              '&:hover': {
                background: isSelected ? MODERN_COLORS.secondary : alpha(theme.palette.common.white, 0.15),
                transform: 'scale(1.2)',
              },
            }}
          >
            {isSelected ? 
              <CheckCircleIcon sx={{ fontSize: 18 }} /> : 
              <CheckCircleIcon sx={{ fontSize: 18, opacity: 0.6 }} />
            }
          </AnimatedIconButton>
        </Box>
      )}

      {/* Enhanced Pin Indicator */}
      {isPinned && (
        <Box
          sx={{
            position: 'absolute',
            left: isOwnMessage ? 'auto' : -12,
            right: isOwnMessage ? -12 : 'auto',
            top: -6,
            zIndex: 5,
          }}
        >
          <Tooltip title="Pinned Message" arrow placement="top">
            <LabelIcon sx={{ fontSize: 20, color: 'warning.main', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
          </Tooltip>
        </Box>
      )}

      <Box sx={{ 
        maxWidth: { xs: '88%', sm: '78%' }, 
        minWidth: '140px', 
        position: 'relative',
        opacity: isSelectMode && !isSelected ? 0.7 : 1,
        transition: 'all 0.4s ease',
        transform: isSelectMode && !isSelected ? 'scale(0.96)' : 'scale(1)',
        filter: isSelectMode && !isSelected ? 'blur(0.5px)' : 'blur(0px)',
      }}>
        {/* Enhanced Sender name for group chats */}
        {isGroup && !isOwnMessage && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, ml: 2 }}>
            <Avatar
              src={message.senderId?.profilePic}
              sx={{ 
                width: 24, 
                height: 24,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {message.senderId?.fullName?.charAt(0)}
            </Avatar>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: 'primary.light',
                fontSize: '0.75rem',
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              {message.senderId?.fullName || message.senderName}
            </Typography>
          </Box>
        )}

        {/* Enhanced Reply context */}
        {message.replyTo && (
          <GlassPaper
            sx={{
              p: 2,
              mb: 2,
              background: alpha(theme.palette.primary.main, 0.15),
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              cursor: 'pointer',
              borderRadius: '16px',
              transition: 'all 0.4s ease',
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.2),
                transform: 'translateX(6px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              },
            }}
            onClick={() => {
              const repliedElement = document.getElementById(`message-${message.replyTo._id}`);
              if (repliedElement) {
                repliedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                repliedElement.style.background = alpha(theme.palette.warning.main, 0.4);
                repliedElement.style.transition = 'background 0.4s ease';
                setTimeout(() => {
                  repliedElement.style.background = '';
                }, 2500);
              }
            }}
          >
            <Typography variant="caption" color="primary" fontWeight="bold" fontSize="0.75rem">
              Replying to {message.replyTo.senderId?._id === authUser._id ? 'yourself' : message.replyTo.senderId?.fullName}
            </Typography>
            <Typography variant="body2" noWrap sx={{ 
              color: alpha(theme.palette.common.white, 0.9), 
              fontSize: '0.85rem', 
              mt: 0.75,
              fontWeight: 500,
            }}>
              {message.replyTo.text || 'Media message'}
            </Typography>
          </GlassPaper>
        )}

        <Tooltip 
          title={new Date(message.createdAt).toLocaleString()}
          placement={isOwnMessage ? "left" : "right"}
          arrow
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 10],
                },
              },
            ],
          }}
        >
          <MessageBubblePaper
            id={`message-${message._id}`}
            elevation={0}
            isOwnMessage={isOwnMessage}
            isSelected={isSelected}
            isPinned={isPinned}
            sx={{
              p: 2.5,
              color: isOwnMessage ? 'white' : 'text.primary',
              cursor: isSelectMode ? 'pointer' : 'default',
              '&:hover': {
                transform: isSelectMode ? 'scale(1.03)' : 'translateY(-3px) scale(1.02)',
                '& .message-actions': {
                  opacity: 1,
                  transform: 'translateY(0) scale(1)',
                },
                '& .quick-reactions': {
                  opacity: 1,
                  transform: 'translateY(0) scale(1)',
                },
              },
            }}
            onClick={(e) => {
              if (isSelectMode) {
                e.stopPropagation();
                toggleMessageSelection(message._id);
              }
            }}
          >
            {/* Message content with better readability */}
            {message.text && (
              <Box>
                <Typography variant="body1" sx={{ 
                  wordBreak: 'break-word', 
                  whiteSpace: 'pre-wrap',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  fontWeight: 400,
                  textShadow: isOwnMessage ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                  color: isOwnMessage ? 'white' : alpha(theme.palette.common.white, 0.95),
                }}>
                  {message.text}
                </Typography>
                
                {/* Enhanced Translation */}
                {translatedText && (
                  <Fade in={true}>
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 2,
                        background: alpha(theme.palette.common.white, 0.15),
                        borderRadius: '12px',
                        borderLeft: `4px solid ${theme.palette.info.main}`,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Typography variant="body2" sx={{ 
                        fontSize: '0.9rem',
                        fontStyle: 'italic',
                        color: alpha(theme.palette.common.white, 0.9),
                        lineHeight: 1.5,
                        fontWeight: 500,
                      }}>
                        {translatedText}
                      </Typography>
                    </Box>
                  </Fade>
                )}
              </Box>
            )}

            {/* Enhanced Media content */}
            {message.media?.map((media, index) => (
              <Box key={index} sx={{ mt: 2 }}>
                {getFileType(media) === 'image' ? (
                  <Card
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.4s ease',
                      maxWidth: 320,
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: '0 12px 35px rgba(0,0,0,0.25)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={media}
                      alt="Shared media"
                      sx={{ 
                        maxHeight: 320, 
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: alpha(theme.palette.common.black, 0.7),
                        borderRadius: '50%',
                        p: 1,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 18, color: 'white' }} />
                    </Box>
                  </Card>
                ) : getFileType(media) === 'video' ? (
                  <Box
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '20px',
                      maxWidth: 320,
                      '&:hover .play-overlay': {
                        opacity: 1,
                      },
                    }}
                  >
                    <video
                      src={media}
                      controls
                      style={{
                        width: '100%',
                        maxHeight: 320,
                        borderRadius: '20px',
                        transition: 'transform 0.4s ease',
                      }}
                      onError={(e) => {
                        console.error("Error loading video:", media);
                      }}
                    />
                    <Box
                      className="play-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.4s ease',
                        borderRadius: '20px',
                      }}
                    >
                      <PlayArrowIcon sx={{ color: 'white', fontSize: 56, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }} />
                    </Box>
                  </Box>
                ) : getFileType(media) === 'audio' ? (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2.5,
                    background: alpha(theme.palette.common.black, 0.4),
                    borderRadius: '25px',
                    p: 2.5,
                    border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
                    maxWidth: 320,
                    backdropFilter: 'blur(10px)',
                  }}>
                    <AnimatedIconButton
                      onClick={() => handlePlayAudio(media, message._id)}
                      color={playingAudio === message._id ? "primary" : "default"}
                      sx={{
                        background: playingAudio === message._id ? MODERN_COLORS.primary : MODERN_COLORS.glass,
                        color: 'white',
                        width: 48,
                        height: 48,
                      }}
                    >
                      {playingAudio === message._id ? <PauseIcon /> : <PlayArrowIcon />}
                    </AnimatedIconButton>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                        Voice message
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={playingAudio === message._id ? 70 : 0} 
                        sx={{ 
                          mt: 1.5, 
                          height: 6, 
                          borderRadius: 3,
                          background: alpha(theme.palette.common.white, 0.25),
                          '& .MuiLinearProgress-bar': {
                            background: MODERN_COLORS.primary,
                            borderRadius: 3,
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.8), fontWeight: 500 }}>
                      0:30
                    </Typography>
                  </Box>
                ) : (
                  <Chip
                    icon={getFileIcon(media)}
                    label={media.split('/').pop()}
                    onClick={() => window.open(media, '_blank')}
                    onDelete={() => downloadFile(media, media.split('/').pop())}
                    deleteIcon={<DownloadIcon />}
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: '16px',
                      background: MODERN_COLORS.glass,
                      backdropFilter: 'blur(15px)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      padding: '12px 16px',
                      '& .MuiChip-deleteIcon': {
                        color: alpha(theme.palette.common.white, 0.8),
                        '&:hover': {
                          color: 'white',
                        }
                      },
                      '&:hover': {
                        background: alpha(theme.palette.common.white, 0.2),
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                )}
              </Box>
            ))}

            {/* Enhanced Message footer */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                gap: 1.5,
              }}
            >
              <Typography variant="caption" sx={{ 
                opacity: 0.9,
                fontSize: '0.75rem',
                color: isOwnMessage ? alpha(theme.palette.common.white, 0.9) : alpha(theme.palette.common.white, 0.8),
                fontWeight: 500,
              }}>
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {message.isEdited && (
                  <Typography variant="caption" sx={{ 
                    opacity: 0.8, 
                    fontStyle: 'italic',
                    fontSize: '0.75rem',
                    color: isOwnMessage ? alpha(theme.palette.common.white, 0.9) : alpha(theme.palette.common.white, 0.8),
                    fontWeight: 500,
                  }}>
                    edited
                  </Typography>
                )}
                <MessageStatus message={message} authUser={authUser} />
              </Box>
            </Box>

            {/* Enhanced Quick reactions bar */}
            {isHovered && !isSelectMode && !showReactions && (
              <Fade in={isHovered}>
                <Box
                  className="quick-reactions"
                  sx={{
                    position: 'absolute',
                    top: -45,
                    left: isOwnMessage ? 'auto' : 0,
                    right: isOwnMessage ? 0 : 'auto',
                    display: 'flex',
                    gap: 1,
                    borderRadius: '25px',
                    background: MODERN_COLORS.glassDark,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                    p: 1,
                    zIndex: 20,
                    opacity: 0,
                    transform: 'translateY(10px) scale(0.9)',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  {quickReactions.map((emoji, index) => (
                    <AnimatedIconButton
                      key={index}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReactionClick(emoji);
                      }}
                      sx={{ 
                        fontSize: '1.1rem',
                        width: 32,
                        height: 32,
                        '&:hover': {
                          transform: 'scale(1.4)',
                        }
                      }}
                    >
                      {emoji}
                    </AnimatedIconButton>
                  ))}
                  <AnimatedIconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReactions(true);
                      setReactionsPanelOpen(true);
                    }}
                    sx={{ 
                      width: 32,
                      height: 32,
                      fontSize: '0.9rem',
                    }}
                  >
                    <FavoriteIcon fontSize="small" />
                  </AnimatedIconButton>
                </Box>
              </Fade>
            )}

            {/* Enhanced reactions panel */}
            {showReactions && !isSelectMode && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -60,
                  left: isOwnMessage ? 'auto' : 0,
                  right: isOwnMessage ? 0 : 'auto',
                  p: 2,
                  display: 'flex',
                  gap: 1,
                  borderRadius: '30px',
                  boxShadow: '0 15px 45px rgba(0,0,0,0.4)',
                  zIndex: 25,
                  animation: 'slideUp 0.4s ease',
                  background: MODERN_COLORS.glassDark,
                  backdropFilter: 'blur(25px)',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
                  flexWrap: 'wrap',
                  width: 'auto',
                  minWidth: 240,
                  '@keyframes slideUp': {
                    '0%': { transform: 'translateY(15px) scale(0.9)', opacity: 0 },
                    '100%': { transform: 'translateY(0) scale(1)', opacity: 1 },
                  },
                }}
              >
                {['👍', '❤️', '😂', '😮', '😢', '😠', '🔥', '👏', '🎉', '🤔', '👀', '💯'].map((emoji, index) => (
                  <AnimatedIconButton
                    key={index}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReactionClick(emoji);
                    }}
                    sx={{ 
                      fontSize: '1.2rem',
                      width: 36,
                      height: 36,
                      '&:hover': {
                        transform: 'scale(1.5)',
                        background: alpha(theme.palette.primary.main, 0.3),
                      }
                    }}
                  >
                    {emoji}
                  </AnimatedIconButton>
                ))}
              </Box>
            )}

            {/* Enhanced Message actions */}
            {!isSelectMode && (
              <Box
                className="message-actions"
                sx={{
                  position: 'absolute',
                  top: -16,
                  right: isOwnMessage ? 'auto' : -16,
                  left: isOwnMessage ? -16 : 'auto',
                  opacity: 0,
                  transform: 'translateY(15px) scale(0.9)',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  display: 'flex',
                  gap: 1,
                  zIndex: 5,
                }}
              >
                {message.text && !translatedText && (
                  <Tooltip title="Translate" arrow placement="top">
                    <AnimatedIconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTranslate();
                      }}
                      disabled={isTranslating}
                      sx={{
                        background: MODERN_COLORS.glassDark,
                        color: 'white',
                        width: 32,
                        height: 32,
                        '&:hover': {
                          background: MODERN_COLORS.primary,
                          transform: 'scale(1.2)',
                        },
                      }}
                    >
                      {isTranslating ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <TranslateIcon fontSize="small" />
                      )}
                    </AnimatedIconButton>
                  </Tooltip>
                )}

                <Tooltip title="More Options" arrow placement="top">
                  <AnimatedIconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMessageMenuOpen(e, message);
                    }}
                    sx={{
                      background: MODERN_COLORS.glassDark,
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        background: MODERN_COLORS.primary,
                        transform: 'scale(1.2)',
                      },
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </AnimatedIconButton>
                </Tooltip>
              </Box>
            )}
          </MessageBubblePaper>
        </Tooltip>

        {/* Enhanced Reactions Display */}
        {message.reactions && message.reactions.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            mt: 1.5, 
            flexWrap: 'wrap',
            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
            animation: 'fadeIn 0.4s ease',
            maxWidth: '100%',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(8px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            {message.reactions.map((reaction, index) => {
              const hasReacted = reaction.users?.includes(authUser._id);
              return (
                <Chip
                  key={`${reaction.emoji}-${index}`}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <span style={{ fontSize: '0.9rem' }}>{reaction.emoji}</span>
                      {reaction.count > 1 && (
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
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
                    borderRadius: '18px',
                    fontSize: '0.8rem',
                    height: '28px',
                    background: hasReacted 
                      ? MODERN_COLORS.primary 
                      : MODERN_COLORS.glass,
                    backdropFilter: 'blur(15px)',
                    border: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
                    color: 'white',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                      background: hasReacted 
                        ? MODERN_COLORS.secondary 
                        : alpha(theme.palette.common.white, 0.2),
                    },
                  }}
                />
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
});

// Enhanced Mobile Drawer
const MobileOptionsDrawer = ({ open, onClose, onClearChat, onSearch, onSelectMode }) => {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      sx={{
        '& .MuiDrawer-paper': {
          background: MODERN_COLORS.glassDark,
          backdropFilter: 'blur(25px)',
          borderTopLeftRadius: '25px',
          borderTopRightRadius: '25px',
          border: `1px solid ${alpha('#fff', 0.2)}`,
          color: 'white',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.4)',
        },
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
          <Box sx={{ width: 48, height: 5, background: alpha('#fff', 0.4), borderRadius: 3 }} />
        </Box>
        
        <List>
          <ListItem 
            button 
            onClick={() => {
              onSearch();
              onClose();
            }}
            sx={{ 
              borderRadius: '16px', 
              mb: 1.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: alpha('#fff', 0.15),
                transform: 'translateX(5px)',
              }
            }}
          >
            <ListItemIcon>
              <SearchIcon sx={{ color: 'white', fontSize: 24 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Search Messages" 
              primaryTypographyProps={{ fontSize: '1rem', fontWeight: 500 }}
            />
          </ListItem>
          
          <ListItem 
            button 
            onClick={() => {
              onSelectMode();
              onClose();
            }}
            sx={{ 
              borderRadius: '16px', 
              mb: 1.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: alpha('#fff', 0.15),
                transform: 'translateX(5px)',
              }
            }}
          >
            <ListItemIcon>
              <SelectAllIcon sx={{ color: 'white', fontSize: 24 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Select Messages" 
              primaryTypographyProps={{ fontSize: '1rem', fontWeight: 500 }}
            />
          </ListItem>
          
          <ListItem 
            button 
            onClick={() => {
              onClearChat();
              onClose();
            }}
            sx={{ 
              borderRadius: '16px', 
              mb: 1.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: alpha('#ff4444', 0.2),
                transform: 'translateX(5px)',
              }
            }}
          >
            <ListItemIcon>
              <ClearAllIcon sx={{ color: 'error.main', fontSize: 24 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Clear Chat" 
              primaryTypographyProps={{ fontSize: '1rem', fontWeight: 500, color: 'error.main' }}
            />
          </ListItem>
        </List>
      </Box>
    </SwipeableDrawer>
  );
};

// Main ChatContainer Component
const ChatContainer = ({ onOpenProfile, onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    messages,
    selectedUser,
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
    getCachedMessages,
    setCachedMessages,
    forwardMessagesToUser,
    clearCachedMessages,
    pinMessage,
    unpinMessage,
    getPinnedMessages,
    pinnedMessages,
    clearChatPermanently
  } = useContext(ChatContext);

  const { authUser, socket } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [recording, setRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isRecordingSupported, setIsRecordingSupported] = useState(true);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [uploadSnackbar, setUploadSnackbar] = useState({ open: false, message: '' });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [messageError, setMessageError] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Selection states
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false);
  const [moreOptionsAnchor, setMoreOptionsAnchor] = useState(null);
  const [usersForForward, setUsersForForward] = useState([]);
  const [selectedForwardUsers, setSelectedForwardUsers] = useState(new Set());

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const audioRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Enhanced message persistence
  const loadMessages = useCallback(async (forceRefresh = false) => {
    if (!selectedUser?._id) {
      setMessages([]);
      return;
    }
    
    try {
      const cachedMessages = getCachedMessages(selectedUser._id);
      
      if (cachedMessages && cachedMessages.length > 0 && !forceRefresh) {
        setMessages(cachedMessages);
        setMessageError(null);
        
        // Background refresh
        setTimeout(async () => {
          try {
            const freshMessages = await getMessage(selectedUser._id, 1, true);
            if (freshMessages && freshMessages.length !== cachedMessages.length) {
              setMessages(freshMessages);
            }
          } catch (error) {
            console.log("Background refresh failed");
          }
        }, 500);
        
        return;
      }
      
      const freshMessages = await getMessage(selectedUser._id, 1, true);
      
      if (freshMessages && freshMessages.length > 0) {
        setMessages(freshMessages);
        setMessageError(null);
      } else {
        setMessages([]);
        setMessageError("No messages yet. Start a conversation!");
      }
      
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessageError("Failed to load messages");
      
      const cachedMessages = getCachedMessages(selectedUser._id);
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
        toast.error("Using cached messages - connection issue");
      } else {
        setMessages([]);
        toast.error("Failed to load messages");
      }
    }
  }, [selectedUser, getMessage, setMessages, getCachedMessages]);

  // Enhanced cache persistence
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      setCachedMessages(selectedUser._id, messages);
    }
  }, [messages, selectedUser, setCachedMessages]);

  // Load messages when component mounts or user changes
  useEffect(() => {
    if (selectedUser) {
      loadMessages();
      
      // Load pinned messages
      try {
        getPinnedMessages(selectedUser._id);
      } catch (pinError) {
        console.log('Could not load pinned messages');
      }
    } else {
      setMessages([]);
    }
  }, [selectedUser?._id]);

  // Enhanced reactions system
  const handleReactToMessage = useCallback(async (messageId, emoji) => {
    if (!messageId || !emoji) return;

    try {
      await reactToMessage(messageId, emoji);
      
      // Optimistic update
      setMessages(prev => prev.map(msg => {
        if (msg._id === messageId) {
          const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
          
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions.map(r =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.count + 1,
                      users: [...(r.users || []), authUser._id]
                    }
                  : r
              )
            };
          } else {
            return {
              ...msg,
              reactions: [
                ...(msg.reactions || []),
                {
                  emoji,
                  count: 1,
                  users: [authUser._id]
                }
              ]
            };
          }
        }
        return msg;
      }));
      
    } catch (error) {
      console.error("Failed to react to message:", error);
      toast.error("Failed to add reaction");
      loadMessages(true);
    }
  }, [reactToMessage, authUser._id, loadMessages]);

  const handleRemoveReaction = useCallback(async (messageId, emoji) => {
    if (!messageId || !emoji) return;

    try {
      await removeReaction(messageId, emoji);
      
      // Optimistic update
      setMessages(prev => prev.map(msg => {
        if (msg._id === messageId) {
          const updatedReactions = msg.reactions
            ?.map(r => {
              if (r.emoji === emoji) {
                const newCount = r.count - 1;
                const newUsers = r.users?.filter(id => id !== authUser._id);
                return newCount > 0 
                  ? { ...r, count: newCount, users: newUsers }
                  : null;
              }
              return r;
            })
            .filter(Boolean);
          
          return {
            ...msg,
            reactions: updatedReactions || []
          };
        }
        return msg;
      }));
      
    } catch (error) {
      console.error("Failed to remove reaction:", error);
      toast.error("Failed to remove reaction");
      loadMessages(true);
    }
  }, [removeReaction, authUser._id, loadMessages]);

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

  const deleteSelectedMessages = useCallback(async () => {
    if (selectedMessages.size === 0) return;

    try {
      const deletePromises = Array.from(selectedMessages).map(messageId => 
        deleteMessageById(messageId)
      );
      
      await Promise.all(deletePromises);
      toast.success(`Deleted ${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''}`);
      clearSelection();
    } catch (error) {
      console.error("Failed to delete selected messages:", error);
      toast.error("Failed to delete messages");
    }
  }, [selectedMessages, deleteMessageById, clearSelection]);

  const forwardSelectedMessages = useCallback(async () => {
    if (selectedMessages.size === 0) return;

    try {
      const messagesToForward = messages.filter(msg => selectedMessages.has(msg._id));
      
      if (selectedForwardUsers.size === 0) {
        toast.error("Please select at least one recipient");
        return;
      }

      const recipientIds = Array.from(selectedForwardUsers);
      
      for (const recipientId of recipientIds) {
        await forwardMessagesToUser(messagesToForward, [recipientId]);
      }

      toast.success(`Forwarded ${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''} to ${recipientIds.length} recipient${recipientIds.length > 1 ? 's' : ''}`);
      setForwardDialogOpen(false);
      clearSelection();
      setSelectedForwardUsers(new Set());
    } catch (error) {
      console.error("Failed to forward messages:", error);
      toast.error("Failed to forward messages");
    }
  }, [selectedMessages, messages, selectedForwardUsers, forwardMessagesToUser, clearSelection]);

  const downloadSelectedMessages = useCallback(() => {
    if (selectedMessages.size === 0) return;
    
    const selectedMsgs = messages.filter(msg => selectedMessages.has(msg._id));
    let hasDownloadableContent = false;

    selectedMsgs.forEach(msg => {
      if (msg.media && msg.media.length > 0) {
        hasDownloadableContent = true;
        msg.media.forEach(mediaUrl => {
          try {
            const filename = mediaUrl.split('/').pop() || `file-${msg._id}`;
            downloadFile(mediaUrl, filename);
          } catch (error) {
            console.error('Failed to download media:', error);
          }
        });
      }
    });

    if (!hasDownloadableContent) {
      toast.info("No downloadable media in selected messages");
    }
    
    clearSelection();
  }, [selectedMessages, messages, downloadFile, clearSelection]);

  const replyToSelectedMessages = useCallback(() => {
    if (selectedMessages.size === 0) return;
    const firstId = Array.from(selectedMessages)[0];
    const msg = messages.find(m => m._id === firstId);
    if (msg) setReplyingTo(msg);
    clearSelection();
  }, [selectedMessages, messages, clearSelection]);

  const pinSelectedMessage = useCallback(async () => {
    if (selectedMessages.size === 0) return;
    
    try {
      const messageId = Array.from(selectedMessages)[0];
      await pinMessage(messageId);
      toast.success("Message pinned successfully");
      clearSelection();
    } catch (error) {
      console.error("Failed to pin message:", error);
      toast.error("Failed to pin message");
    }
  }, [selectedMessages, pinMessage, clearSelection]);

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

  // Clear entire chat
  const clearChat = useCallback(async () => {
    if (!selectedUser) return;

    try {
      const success = await clearChatPermanently(selectedUser._id);
      
      if (success) {
        setClearChatDialogOpen(false);
      }
    } catch (error) {
      console.error("Clear chat error:", error);
      toast.error("Failed to clear chat");
    }
  }, [selectedUser, clearChatPermanently]);

  // Load users for forwarding
  const loadUsersForForward = useCallback(async () => {
    try {
      const availableUsers = friends.filter(friend => 
        friend._id !== selectedUser?._id && 
        friend._id !== authUser?._id
      );
      setUsersForForward(availableUsers);
    } catch (error) {
      console.error("Failed to load users for forwarding:", error);
      toast.error("Failed to load users");
    }
  }, [friends, selectedUser, authUser]);

  const toggleForwardUserSelection = useCallback((userId) => {
    setSelectedForwardUsers(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(userId)) {
        newSelection.delete(userId);
      } else {
        newSelection.add(userId);
      }
      return newSelection;
    });
  }, []);

  // Message functions
  const scrollToBottom = useCallback((instant = false) => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: instant ? 'auto' : 'smooth',
          block: "end" 
        });
      }, 100);
    }
  }, []);

  const handleTyping = (e) => {
    const value = e.target.value;
    setInput(value);
    
    if (!selectedUser || !socket) return;

    sendTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTypingStatus(false), 1200);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() && mediaFiles.length === 0) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    if (!selectedUser) {
      toast.error("Please select a conversation first");
      return;
    }

    // FRIENDS ONLY CHECK
    if (!isGroup) {
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
      
      // Handle file uploads with progress
      if (mediaFiles.length > 0) {
        setUploadSnackbar({ open: true, message: 'Uploading files...' });
        
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
        setUploadSnackbar({ open: false, message: '' });
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
        if (isGroup) {
          await sendGroupMessage(messageData);
        } else {
          await sendMessage(messageData);
        }
        toast.success("Message sent successfully");
      }

      // Reset state
      setInput("");
      setMediaFiles([]);
      setShowEmoji(false);
      setReplyingTo(null);
      setShowAIAssistant(false);
      sendTypingStatus(false);
      
      // Scroll to bottom after sending
      setTimeout(() => scrollToBottom(true), 200);
      
    } catch (error) {
      console.error("Send message failed:", error);
      toast.error(error.message || "Failed to send message");
      
      if (error.message.includes('network') || error.message.includes('connection')) {
        toast.error("Network error: Please check your internet connection");
      }
    }
  };

  const handleAIAction = (action) => {
    switch (action) {
      case "Help me improve this message":
        setInput(prev => prev + " [AI: Could you help me improve this message?]");
        break;
      case "Translate to Spanish":
        setInput(prev => prev + " [AI: Spanish translation]");
        break;
      case "Make it more professional":
        setInput(prev => prev.replace(/hey/gi, "Hello").replace(/u/gi, "you"));
        break;
      case "Shorten this message":
        setInput(prev => prev.length > 50 ? prev.substring(0, 50) + "..." : prev);
        break;
      case "Add emojis to make it friendly":
        setInput(prev => prev + " 😊");
        break;
      case "Check grammar and spelling":
        setInput(prev => prev + " [AI: Grammar check applied]");
        break;
      case "Make it more casual":
        setInput(prev => prev.replace(/Hello/gi, "Hey").replace(/Thank you/gi, "Thanks"));
        break;
      case "Rephrase for clarity":
        setInput(prev => prev + " [AI: Rephrased for better clarity]");
        break;
      default:
        break;
    }
    inputRef.current?.focus();
  };

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

  const uploadFiles = async (files) => {
    const uploadPromises = files.map(async (file, index) => {
      try {
        const url = await uploadFile(file, (progress) => {
          setUploadProgress(prev => ({ ...prev, [index]: progress }));
        });
        return url;
      } catch (error) {
        console.error(`Upload failed for file ${index}:`, error);
        throw error;
      }
    });

    const results = await Promise.all(uploadPromises);
    setUploadProgress({});
    return results;
  };

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
        loadUsersForForward();
        break;
      case 'select':
        toggleMessageSelection(selectedMessage._id);
        break;
      case 'pin':
        pinMessage(selectedMessage._id);
        toast.success("Message pinned");
        break;
      case 'unpin':
        unpinMessage(selectedMessage._id);
        toast.success("Message unpinned");
        break;
      case 'copy':
        navigator.clipboard.writeText(selectedMessage.text || '');
        toast.success("Message copied to clipboard");
        break;
      default:
        break;
    }
    
    handleMessageMenuClose();
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessageById(messageId);
      toast.success("Message deleted successfully");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleVoiceRecord = async () => {
    if (!isRecordingSupported) {
      toast.error("Voice recording is not supported in your browser");
      return;
    }

    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          } 
        });
        
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          
          if (audioBlob.size === 0) {
            toast.error("No audio recorded");
            return;
          }

          try {
            setUploadSnackbar({ open: true, message: 'Uploading voice message...' });
            
            const uploadRes = await uploadAudio(audioBlob);

            if (uploadRes.success) {
              const messageData = {
                text: '',
                mediaUrls: [uploadRes.url],
                fileType: 'audio'
              };

              if (isGroup) {
                await sendGroupMessage(messageData);
              } else {
                await sendMessage(messageData);
              }
              
              toast.success('Voice message sent!');
            }
          } catch (error) {
            console.error("Voice message processing error:", error);
            toast.error("Failed to send voice message");
          } finally {
            setUploadSnackbar({ open: false, message: '' });
            stream.getTracks().forEach(track => track.stop());
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
        setAudioChunks(chunks);
        
      } catch (err) {
        console.error("Microphone access denied:", err);
        toast.error("Microphone access is required for voice messages");
        setRecording(false);
        setIsRecordingSupported(false);
      }
    } else {
      // Stop recording
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        setRecording(false);
        setMediaRecorder(null);
      }
    }
  };

  const handlePlayAudio = (audioUrl, messageId) => {
    if (playingAudio === messageId) {
      // Pause audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingAudio(null);
    } else {
      // Play audio
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
    if (selectedUser && messages.length > 0) {
      const hasUnseenMessages = messages.some(msg => {
        const isFromOtherUser = msg.senderId?._id !== authUser?._id && msg.senderId !== authUser?._id;
        const isUnseen = !msg.seen && !msg.seenBy?.includes(authUser?._id);
        return isFromOtherUser && isUnseen;
      });
      
      if (hasUnseenMessages) {
        const timer = setTimeout(() => {
          markMessagesAsSeen(selectedUser._id);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [messages, selectedUser, authUser, markMessagesAsSeen]);

  // Check recording support
  useEffect(() => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setIsRecordingSupported(false);
    }
  }, []);

  // Connection status handling
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (selectedUser) {
        loadMessages(true);
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom]);

  // Show AI Assistant when typing long messages
  useEffect(() => {
    if (input.length > 100 && !showAIAssistant) {
      setShowAIAssistant(true);
    } else if (input.length <= 100 && showAIAssistant) {
      setShowAIAssistant(false);
    }
  }, [input, showAIAssistant]);

  // Enhanced background animation
  const BackgroundAnimation = () => (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: MODERN_COLORS.background,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 12s ease-in-out infinite reverse',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
      }}
    />
  );

  if (!selectedUser) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'text.secondary',
          textAlign: 'center',
          p: 3,
          background: MODERN_COLORS.background,
          backgroundSize: 'cover',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <BackgroundAnimation />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            background: MODERN_COLORS.glass,
            backdropFilter: 'blur(25px)',
            borderRadius: '28px',
            p: 5,
            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            boxShadow: '0 15px 45px rgba(0, 0, 0, 0.3)',
          }}
        >
          <PsychologyIcon sx={{ fontSize: 90, mb: 3, opacity: 0.9, color: 'primary.main' }} />
          <Typography variant="h3" gutterBottom fontWeight="bold" sx={{ 
            background: MODERN_COLORS.primary,
            backgroundClip: 'text',
            textFillColor: 'transparent',
            mb: 3,
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}>
            AI Chat Messenger
          </Typography>
          <Typography variant="h5" sx={{ color: alpha(theme.palette.common.white, 0.9), mb: 2, fontWeight: 500 }}>
            Welcome to Modern Chat
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(theme.palette.common.white, 0.7), fontSize: '1.1rem' }}>
            Select a conversation to start messaging
          </Typography>
        </Box>
      </Box>
    );
  }

  const displayMessages = isSearching ? filteredMessages : messages;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      background: MODERN_COLORS.background,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <BackgroundAnimation />
      
      {/* Connection Status Indicator */}
      {!isOnline && (
        <Slide direction="down" in={!isOnline}>
          <Alert 
            severity="warning" 
            sx={{ 
              borderRadius: 0, 
              py: 1.5,
              background: alpha(theme.palette.warning.main, 0.15),
              backdropFilter: 'blur(15px)',
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              color: 'warning.light',
              zIndex: 1000,
            }}
          >
            You are currently offline. Messages will be sent when connection is restored.
          </Alert>
        </Slide>
      )}

      {/* Enhanced Header */}
      <GradientAppBar 
        position="static" 
        elevation={0}
      >
        <Toolbar sx={{ py: 1.5 }}>
          {isMobile && (
            <AnimatedIconButton
              edge="start"
              color="inherit"
              onClick={onBack}
              sx={{ 
                mr: 1.5, 
                color: 'white',
              }}
            >
              <ArrowBackIcon />
            </AnimatedIconButton>
          )}
          
          <Badge
            color="success"
            variant="dot"
            invisible={!onlineUsers.includes(selectedUser._id)}
            overlap="circular"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiBadge-dot': {
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.5)',
              },
            }}
          >
            <Avatar
              src={selectedUser.profilePic || selectedUser.image}
              sx={{ 
                width: 48, 
                height: 48, 
                cursor: 'pointer',
                border: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                background: MODERN_COLORS.primary,
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  transform: 'scale(1.08)',
                  transition: 'transform 0.3s ease',
                }
              }}
              onClick={onOpenProfile}
            >
              {selectedUser.fullName?.charAt(0) || selectedUser.name?.charAt(0)}
            </Avatar>
          </Badge>
          
          <Box sx={{ flex: 1, ml: 2.5, minWidth: 0, cursor: 'pointer' }} onClick={onOpenProfile}>
            <Typography variant="h6" noWrap fontWeight="700" color="white" sx={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)', fontSize: '1.1rem' }}>
              {selectedUser.fullName || selectedUser.name}
            </Typography>
            <Box sx={{ color: alpha(theme.palette.common.white, 0.8), fontSize: '0.9rem', noWrap: true, mt: 0.5 }}>
              {isTyping ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: theme.palette.primary.main, animation: 'bounce 1.2s infinite' }} />
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: theme.palette.primary.main, animation: 'bounce 1.2s infinite 0.1s' }} />
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: theme.palette.primary.main, animation: 'bounce 1.2s infinite 0.2s' }} />
                  </Box>
                  <span style={{ fontStyle: 'italic', fontSize: '0.85rem', fontWeight: 500 }}>typing...</span>
                </Box>
              ) : isGroup ? (
                `${selectedUser.members?.length || 0} members • ${onlineUsers.filter(id => selectedUser.members?.some(m => m._id === id)).length} online`
              ) : (
                onlineUsers.includes(selectedUser._id) ? 
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#4CAF50', animation: 'pulse 2s infinite', boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)' }} />
                  <span style={{ fontWeight: 500 }}>Online</span>
                </Box> : 
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: alpha(theme.palette.common.white, 0.6) }} />
                  <span style={{ fontWeight: 500 }}>Offline</span>
                </Box>
              )}
            </Box>
          </Box>

          {/* Enhanced Header Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Search Messages" arrow placement="bottom">
              <AnimatedIconButton 
                onClick={() => setIsSearching(!isSearching)}
                sx={{ 
                  color: isSearching ? 'primary.main' : 'white',
                  background: isSearching ? alpha(theme.palette.primary.main, 0.25) : 'transparent',
                }}
              >
                <SearchIcon />
              </AnimatedIconButton>
            </Tooltip>

            {!isMobile && (
              <>
                <Tooltip title={isSelectMode ? "Exit Selection" : "Select Messages"} arrow placement="bottom">
                  <AnimatedIconButton 
                    onClick={() => setIsSelectMode(!isSelectMode)}
                    sx={{ 
                      color: isSelectMode ? 'primary.main' : 'white',
                      background: isSelectMode ? alpha(theme.palette.primary.main, 0.25) : 'transparent',
                    }}
                  >
                    <SelectAllIcon />
                  </AnimatedIconButton>
                </Tooltip>

                <Tooltip title="More Options" arrow placement="bottom">
                  <AnimatedIconButton 
                    onClick={(e) => setMoreOptionsAnchor(e.currentTarget)}
                    sx={{ color: 'white' }}
                  >
                    <MoreVertIcon />
                  </AnimatedIconButton>
                </Tooltip>
              </>
            )}

            {isMobile && (
              <Tooltip title="Options" arrow placement="bottom">
                <AnimatedIconButton 
                  onClick={() => setMobileDrawerOpen(true)}
                  sx={{ color: 'white' }}
                >
                  <MoreVertIcon />
                </AnimatedIconButton>
              </Tooltip>
            )}

            <Tooltip title="View Profile" arrow placement="bottom">
              <AnimatedIconButton 
                onClick={onOpenProfile} 
                sx={{ color: 'white' }}
              >
                <PersonIcon />
              </AnimatedIconButton>
            </Tooltip>
          </Box>
        </Toolbar>

        {/* Enhanced Search Bar */}
        {isSearching && (
          <Collapse in={isSearching}>
            <Box sx={{ px: 2.5, pb: 1.5 }}>
              <ModernTextField
                fullWidth
                size="small"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: alpha(theme.palette.common.white, 0.6), mr: 1.5 }} />,
                  endAdornment: searchQuery && (
                    <IconButton
                      size="small"
                      onClick={() => handleSearch('')}
                      sx={{ color: alpha(theme.palette.common.white, 0.6), '&:hover': { color: 'white' } }}
                    >
                      <CloseIcon />
                    </IconButton>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: alpha(theme.palette.common.white, 0.08),
                  },
                }}
              />
              {searchQuery && (
                <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.8), mt: 1, display: 'block', fontWeight: 500 }}>
                  {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''} found
                </Typography>
              )}
            </Box>
          </Collapse>
        )}
      </GradientAppBar>

      {/* Enhanced Messages Area */}
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 1.5,
          background: 'transparent',
          position: 'relative',
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: MODERN_COLORS.primary,
            borderRadius: 4,
            '&:hover': {
              background: MODERN_COLORS.secondary,
            },
          },
        }}
      >
        {messageError && (
          <Slide direction="down" in={!!messageError}>
            <Alert 
              severity="error" 
              sx={{ 
                m: 2.5, 
                background: alpha(theme.palette.error.main, 0.15),
                backdropFilter: 'blur(15px)',
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                color: 'error.light',
                borderRadius: '16px',
                boxShadow: '0 6px 25px rgba(244, 67, 54, 0.2)',
              }}
              action={
                <Button 
                  size="small" 
                  onClick={() => loadMessages(true)} 
                  sx={{ color: 'error.light', fontWeight: 500 }}
                >
                  Retry
                </Button>
              }
            >
              {messageError}
            </Alert>
          </Slide>
        )}

        {displayMessages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: alpha(theme.palette.common.white, 0.8),
              textAlign: 'center',
              p: 3,
            }}
          >
            <Box
              sx={{
                background: MODERN_COLORS.glass,
                backdropFilter: 'blur(25px)',
                borderRadius: '28px',
                p: 5,
                border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
                boxShadow: '0 15px 45px rgba(0, 0, 0, 0.3)',
                maxWidth: 450,
              }}
            >
              {isSearching ? (
                <>
                  <SmsFailedIcon sx={{ fontSize: 72, mb: 2.5, opacity: 0.6, color: 'primary.main' }} />
                  <Typography variant="h5" gutterBottom color="white" fontWeight="bold">
                    No results found
                  </Typography>
                  <Typography variant="body1" color={alpha(theme.palette.common.white, 0.7)} sx={{ mt: 1 }}>
                    No messages match your search criteria
                  </Typography>
                </>
              ) : (
                <>
                  <CelebrationIcon sx={{ fontSize: 72, mb: 2.5, opacity: 0.6, color: 'primary.main' }} />
                  <Typography variant="h5" gutterBottom color="white" fontWeight="bold">
                    No messages yet
                  </Typography>
                  <Typography variant="body1" color={alpha(theme.palette.common.white, 0.7)} sx={{ mt: 1 }}>
                    Start the conversation by sending a message!
                  </Typography>
                  {!isOnline && (
                    <Typography variant="caption" color="warning.main" sx={{ mt: 2, display: 'block', fontWeight: 500 }}>
                      You are offline. Connect to the internet to send messages.
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Box>
        ) : (
          displayMessages.map((message, index) => (
            <MessageBubble
              key={message._id || `message-${index}-${Date.now()}`}
              message={message}
              isOwnMessage={message.senderId?._id === authUser._id || message.senderId === authUser._id}
              isGroup={isGroup}
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
              theme={theme}
              onMessageMenuOpen={handleMessageMenuOpen}
              onPinMessage={pinMessage}
              isPinned={pinnedMessages.some(pm => pm._id === message._id)}
            />
          ))
        )}
        
        {isTyping && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', px: 2.5, mb: 2.5 }}>
            <GlassPaper
              sx={{
                p: 2.5,
                background: alpha(theme.palette.primary.main, 0.15),
                borderRadius: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
                animation: 'pulse 2s infinite',
                backdropFilter: 'blur(15px)',
              }}
            >
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: theme.palette.primary.main, animation: 'bounce 1.2s infinite' }} />
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: theme.palette.primary.main, animation: 'bounce 1.2s infinite 0.1s' }} />
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: theme.palette.primary.main, animation: 'bounce 1.2s infinite 0.2s' }} />
              </Box>
              <Typography variant="body2" color={alpha(theme.palette.common.white, 0.9)} sx={{ fontStyle: 'italic', fontWeight: 500 }}>
                typing...
              </Typography>
            </GlassPaper>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant 
          onAIAction={handleAIAction} 
          theme={theme} 
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      {/* Selection Actions Bar */}
      <SelectionActionsBar
        selectedCount={selectedMessages.size}
        clearSelection={clearSelection}
        deleteSelected={deleteSelectedMessages}
        forwardSelected={() => {
          setForwardDialogOpen(true);
          loadUsersForForward();
        }}
        downloadSelected={downloadSelectedMessages}
        replyToSelected={replyToSelectedMessages}
        pinSelected={pinSelectedMessage}
        copySelected={copySelectedMessages}
      />

      {/* Enhanced Reply Preview */}
      {replyingTo && (
        <Slide direction="up" in={!!replyingTo}>
          <GlassPaper
            variant="outlined"
            sx={{
              m: 2.5,
              mb: 1.5,
              p: 2.5,
              background: alpha(theme.palette.primary.main, 0.15),
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              borderRadius: '20px',
              border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
              animation: 'slideIn 0.4s ease',
              backdropFilter: 'blur(15px)',
              '@keyframes slideIn': {
                '0%': { transform: 'translateY(25px)', opacity: 0 },
                '100%': { transform: 'translateY(0)', opacity: 1 },
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="primary" fontWeight="bold" fontSize="0.8rem">
                  Replying to {replyingTo.senderId?._id === authUser._id ? 'yourself' : replyingTo.senderId?.fullName}
                </Typography>
                <Typography variant="body2" noWrap sx={{ 
                  color: alpha(theme.palette.common.white, 0.9), 
                  fontSize: '0.9rem', 
                  mt: 1,
                  fontWeight: 500,
                }}>
                  {replyingTo.text || 'Media message'}
                </Typography>
              </Box>
              <AnimatedIconButton size="small" onClick={() => setReplyingTo(null)} sx={{ color: 'white', ml: 1 }}>
                <ClearIcon fontSize="small" />
              </AnimatedIconButton>
            </Box>
          </GlassPaper>
        </Slide>
      )}

      {/* Enhanced Edit Preview */}
      {editingMessage && (
        <Slide direction="up" in={!!editingMessage}>
          <GlassPaper
            variant="outlined"
            sx={{
              m: 2.5,
              mb: 1.5,
              p: 2.5,
              background: alpha(theme.palette.warning.main, 0.15),
              borderLeft: `4px solid ${theme.palette.warning.main}`,
              borderRadius: '20px',
              border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
              animation: 'slideIn 0.4s ease',
              backdropFilter: 'blur(15px)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="warning.main" fontWeight="bold" fontSize="0.8rem">
                  Editing message
                </Typography>
                <Typography variant="body2" noWrap sx={{ 
                  color: alpha(theme.palette.common.white, 0.9), 
                  fontSize: '0.9rem', 
                  mt: 1,
                  fontWeight: 500,
                }}>
                  {editingMessage.text}
                </Typography>
              </Box>
              <AnimatedIconButton 
                size="small" 
                onClick={() => {
                  setEditingMessage(null);
                  setInput('');
                }}
                sx={{ color: 'white', ml: 1 }}
              >
                <ClearIcon fontSize="small" />
              </AnimatedIconButton>
            </Box>
          </GlassPaper>
        </Slide>
      )}

      {/* Enhanced Input Area */}
      <GlassPaper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 0,
          borderTop: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
          background: MODERN_COLORS.glassDark,
          backdropFilter: 'blur(25px)',
          position: 'relative',
        }}
      >
        {/* Enhanced File Preview */}
        {mediaFiles.length > 0 && (
          <Box sx={{ mb: 2.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {mediaFiles.map((file, index) => (
              <Chip
                key={index}
                icon={getFileIcon(file.name)}
                label={
                  <Box>
                    <Typography variant="caption" display="block" noWrap sx={{ 
                      maxWidth: 140, 
                      color: 'white', 
                      fontWeight: 600,
                      fontSize: '0.8rem',
                    }}>
                      {file.name}
                    </Typography>
                    {uploadProgress[index] !== undefined && (
                      <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress[index]} 
                        sx={{ 
                          width: 80, 
                          height: 5, 
                          borderRadius: 2.5,
                          background: alpha(theme.palette.common.white, 0.25),
                          '& .MuiLinearProgress-bar': {
                            background: MODERN_COLORS.primary,
                            borderRadius: 2.5,
                          }
                        }}
                      />
                    )}
                  </Box>
                }
                onDelete={() => {
                  setMediaFiles(prev => prev.filter((_, i) => i !== index));
                  setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[index];
                    return newProgress;
                  });
                }}
                variant="outlined"
                sx={{ 
                  maxWidth: 220,
                  borderRadius: '18px',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
                  color: 'white',
                  background: MODERN_COLORS.glass,
                  backdropFilter: 'blur(15px)',
                  padding: '10px 16px',
                  '& .MuiChip-deleteIcon': {
                    color: alpha(theme.palette.common.white, 0.8),
                    fontSize: '1.1rem',
                    '&:hover': {
                      color: 'white',
                    }
                  },
                  '&:hover': {
                    background: alpha(theme.palette.common.white, 0.2),
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>
        )}

        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}
        >
          {/* Enhanced AI Assistant Toggle */}
          <Tooltip title="AI Assistant" arrow placement="top">
            <AnimatedIconButton 
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              sx={{
                background: showAIAssistant ? MODERN_COLORS.ai : 'transparent',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  background: MODERN_COLORS.ai,
                  transform: 'scale(1.15)',
                }
              }}
            >
              <AIIcon />
            </AnimatedIconButton>
          </Tooltip>

          {/* Enhanced Attachment Button */}
          <Tooltip title="Attach files" arrow placement="top">
            <AnimatedIconButton 
              onClick={() => fileInputRef.current?.click()}
              sx={{
                background: MODERN_COLORS.secondary,
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  background: MODERN_COLORS.primary,
                  transform: 'scale(1.15)',
                }
              }}
            >
              <AttachFileIcon />
            </AnimatedIconButton>
          </Tooltip>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
          />

          {/* Enhanced Emoji Picker */}
          {showEmoji && (
            <Box 
              ref={emojiPickerRef}
              sx={{ 
                position: 'absolute', 
                bottom: '100%', 
                left: isMobile ? 0 : 'auto',
                right: isMobile ? 'auto' : 0,
                zIndex: 1000,
                mb: 2.5,
                animation: 'slideUp 0.4s ease',
                '@keyframes slideUp': {
                  '0%': { transform: 'translateY(15px)', opacity: 0 },
                  '100%': { transform: 'translateY(0)', opacity: 1 },
                },
              }}
            >
              <Picker
                onSelect={(emoji) => {
                  setInput(prev => prev + emoji.native);
                  inputRef.current?.focus();
                }}
                theme="dark"
                set="apple"
                showPreview={false}
                showSkinTones={false}
                style={{ 
                  borderRadius: '20px',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  background: MODERN_COLORS.glassDark,
                  backdropFilter: 'blur(25px)',
                }}
              />
            </Box>
          )}

          <Tooltip title="Add emoji" arrow placement="top">
            <AnimatedIconButton
              onClick={() => setShowEmoji(!showEmoji)}
              sx={{
                background: showEmoji ? MODERN_COLORS.primary : 'transparent',
                color: showEmoji ? 'white' : alpha(theme.palette.common.white, 0.8),
                width: 48,
                height: 48,
                '&:hover': {
                  background: MODERN_COLORS.primary,
                  color: 'white',
                  transform: 'scale(1.15)',
                }
              }}
            >
              <EmojiIcon />
            </AnimatedIconButton>
          </Tooltip>

          <ModernTextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={handleTyping}
            placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
            variant="outlined"
            size="small"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            disabled={!isOnline}
          />

          {isRecordingSupported && (
            <Tooltip title={recording ? "Stop recording" : "Voice message"} arrow placement="top">
              <AnimatedIconButton
                onClick={handleVoiceRecord}
                disabled={!isOnline}
                sx={{
                  background: recording ? MODERN_COLORS.error : 'transparent',
                  color: recording ? 'white' : alpha(theme.palette.common.white, 0.8),
                  animation: recording ? 'pulse 1.2s infinite' : 'none',
                  width: 48,
                  height: 48,
                  '&:hover': {
                    background: recording ? MODERN_COLORS.error : MODERN_COLORS.primary,
                    color: 'white',
                    transform: 'scale(1.15)',
                  },
                  '&:disabled': {
                    background: 'transparent',
                    color: alpha(theme.palette.common.white, 0.4),
                  },
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' },
                  }
                }}
              >
                <MicIcon />
              </AnimatedIconButton>
            </Tooltip>
          )}

          <FloatingActionButton
            color="primary"
            size="medium"
            type="submit"
            disabled={(!input.trim() && mediaFiles.length === 0) || recording || !isOnline}
            sx={{
              width: 56,
              height: 56,
            }}
          >
            {editingMessage ? <EditIcon /> : <SendIcon />}
          </FloatingActionButton>
        </Box>
      </GlassPaper>

      {/* Enhanced Mobile Options Drawer */}
      <MobileOptionsDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        onClearChat={() => setClearChatDialogOpen(true)}
        onSearch={() => setIsSearching(true)}
        onSelectMode={() => setIsSelectMode(true)}
      />

      {/* ============ DIALOGS AND MENUS ============ */}

      {/* Enhanced Message Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMessageMenuClose}
        onClick={handleMessageMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            background: MODERN_COLORS.glassDark,
            backdropFilter: 'blur(25px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            borderRadius: '16px',
            boxShadow: '0 15px 45px rgba(0, 0, 0, 0.4)',
            color: 'white',
            minWidth: 180,
            '& .MuiMenuItem-root': {
              fontSize: '0.9rem',
              fontWeight: 500,
              padding: '12px 16px',
              '&:hover': {
                background: alpha(theme.palette.common.white, 0.15),
              },
            },
            animation: 'scaleIn 0.3s ease',
            '@keyframes scaleIn': {
              '0%': { transform: 'scale(0.9)', opacity: 0 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }
        }}
      >
        <MenuItem onClick={() => handleMessageAction('reply')}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Reply" />
        </MenuItem>
        
        <MenuItem onClick={() => handleMessageAction('select')}>
          <ListItemIcon>
            <SelectAllIcon fontSize="small" sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Select" />
        </MenuItem>

        <MenuItem onClick={() => handleMessageAction('copy')}>
          <ListItemIcon>
            <CopyIcon fontSize="small" sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Copy Text" />
        </MenuItem>
        
        {selectedMessage?.senderId?._id === authUser._id && (
          <MenuItem onClick={() => handleMessageAction('edit')}>
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>
        )}
        
        <MenuItem onClick={() => handleMessageAction('forward')}>
          <ListItemIcon>
            <ForwardIcon fontSize="small" sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Forward" />
        </MenuItem>

        {pinnedMessages.some(pm => pm._id === selectedMessage?._id) ? (
          <MenuItem onClick={() => handleMessageAction('unpin')}>
            <ListItemIcon>
              <LabelIcon fontSize="small" sx={{ color: 'warning.main' }} />
            </ListItemIcon>
            <ListItemText primary="Unpin Message" />
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleMessageAction('pin')}>
            <ListItemIcon>
              <LabelIcon fontSize="small" sx={{ color: 'warning.main' }} />
            </ListItemIcon>
            <ListItemText primary="Pin Message" />
          </MenuItem>
        )}
        
        {selectedMessage?.senderId?._id === authUser._id && (
          <MenuItem 
            onClick={() => handleMessageAction('delete')}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        )}
      </Menu>

      {/* Enhanced More Options Menu */}
      <Menu
        anchorEl={moreOptionsAnchor}
        open={Boolean(moreOptionsAnchor)}
        onClose={() => setMoreOptionsAnchor(null)}
        PaperProps={{
          sx: {
            background: MODERN_COLORS.glassDark,
            backdropFilter: 'blur(25px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            borderRadius: '16px',
            boxShadow: '0 15px 45px rgba(0, 0, 0, 0.4)',
            color: 'white',
            minWidth: 200,
            '& .MuiMenuItem-root': {
              fontSize: '0.9rem',
              fontWeight: 500,
              padding: '12px 16px',
              '&:hover': {
                background: alpha(theme.palette.common.white, 0.15),
              },
            },
            animation: 'scaleIn 0.3s ease',
          }
        }}
      >
        <MenuItem onClick={() => {
          setIsSelectMode(true);
          setMoreOptionsAnchor(null);
        }}>
          <ListItemIcon>
            <SelectAllIcon fontSize="small" sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Select Messages" />
        </MenuItem>

        <MenuItem onClick={() => {
          setClearChatDialogOpen(true);
          setMoreOptionsAnchor(null);
        }}>
          <ListItemIcon>
            <ClearAllIcon fontSize="small" sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Clear Chat" />
        </MenuItem>

        <MenuItem onClick={() => {
          toast.success("Chat archived");
          setMoreOptionsAnchor(null);
        }}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Archive Chat" />
        </MenuItem>

        <MenuItem onClick={() => {
          toast.success("Chat muted");
          setMoreOptionsAnchor(null);
        }}>
          <ListItemIcon>
            <VolumeOffIcon fontSize="small" sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Mute Notifications" />
        </MenuItem>

        <Divider sx={{ backgroundColor: alpha(theme.palette.common.white, 0.15), my: 1 }} />

        <MenuItem onClick={() => {
          toast.success("Chat reported");
          setMoreOptionsAnchor(null);
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <ReportIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Report Chat" />
        </MenuItem>
      </Menu>

      {/* Enhanced Forward Dialog */}
      <Dialog
        open={forwardDialogOpen}
        onClose={() => setForwardDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '25px',
            background: MODERN_COLORS.glassDark,
            backdropFilter: 'blur(25px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.5)',
            color: 'white',
            animation: 'scaleIn 0.4s ease',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          background: MODERN_COLORS.primary,
          backgroundClip: 'text',
          textFillColor: 'transparent',
          fontWeight: 'bold',
          fontSize: '1.4rem',
          py: 3,
        }}>
          Forward {selectedMessages.size} Message{selectedMessages.size > 1 ? 's' : ''}
          <IconButton
            aria-label="close"
            onClick={() => setForwardDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3.5 }}>
          <Typography variant="body2" sx={{ 
            mb: 3, 
            color: alpha(theme.palette.common.white, 0.8), 
            textAlign: 'center',
            fontSize: '0.95rem',
            fontWeight: 500,
          }}>
            Select recipients to forward to:
          </Typography>
          
          <List sx={{ maxHeight: 350, overflow: 'auto' }}>
            {usersForForward.map((user) => (
              <ListItem
                key={user._id}
                sx={{
                  borderRadius: '16px',
                  mb: 1.5,
                  background: selectedForwardUsers.has(user._id) 
                    ? alpha(theme.palette.primary.main, 0.25) 
                    : MODERN_COLORS.glass,
                  backdropFilter: 'blur(15px)',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: alpha(theme.palette.common.white, 0.15),
                    transform: 'translateX(6px)',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={user.profilePic} 
                    sx={{ 
                      width: 48, 
                      height: 48,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    }}
                  >
                    {user.fullName?.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={user.fullName} 
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box 
                        sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          background: onlineUsers.includes(user._id) ? MODERN_COLORS.success : alpha(theme.palette.common.white, 0.6),
                          animation: onlineUsers.includes(user._id) ? 'pulse 2s infinite' : 'none',
                          boxShadow: onlineUsers.includes(user._id) ? '0 0 10px rgba(76, 175, 80, 0.5)' : 'none',
                        }} 
                      />
                      {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                    </Box>
                  }
                  primaryTypographyProps={{ 
                    color: 'white', 
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                  secondaryTypographyProps={{ 
                    color: alpha(theme.palette.common.white, 0.8),
                    fontSize: '0.85rem',
                    fontWeight: 500,
                  }}
                />
                <AnimatedIconButton
                  onClick={() => toggleForwardUserSelection(user._id)}
                  sx={{
                    color: selectedForwardUsers.has(user._id) ? 'primary.main' : 'white',
                    width: 40,
                    height: 40,
                  }}
                >
                  {selectedForwardUsers.has(user._id) ? 
                    <CheckCircleIcon sx={{ fontSize: 24 }} /> : 
                    <CheckCircleIcon sx={{ fontSize: 24, opacity: 0.5 }} />
                  }
                </AnimatedIconButton>
              </ListItem>
            ))}
          </List>
          
          {usersForForward.length === 0 && (
            <Typography 
              variant="body2" 
              textAlign="center" 
              sx={{ 
                color: alpha(theme.palette.common.white, 0.6), 
                py: 5,
                fontStyle: 'italic',
                fontSize: '1rem',
              }}
            >
              No available contacts to forward to
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3.5, gap: 2.5 }}>
          <Button 
            onClick={() => setForwardDialogOpen(false)}
            sx={{ 
              color: 'white',
              background: MODERN_COLORS.glass,
              backdropFilter: 'blur(15px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
              borderRadius: '14px',
              px: 4,
              py: 1.5,
              fontSize: '0.95rem',
              fontWeight: 600,
              '&:hover': {
                background: alpha(theme.palette.common.white, 0.15),
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={forwardSelectedMessages}
            disabled={selectedForwardUsers.size === 0}
            sx={{
              background: MODERN_COLORS.primary,
              backdropFilter: 'blur(15px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
              borderRadius: '14px',
              px: 4,
              py: 1.5,
              fontSize: '0.95rem',
              fontWeight: 'bold',
              '&:hover': {
                background: MODERN_COLORS.secondary,
                transform: 'translateY(-3px) scale(1.05)',
                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
              },
              '&:disabled': {
                background: alpha(theme.palette.common.white, 0.1),
                color: alpha(theme.palette.common.white, 0.4),
              },
              transition: 'all 0.4s ease',
            }}
          >
            Forward
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Clear Chat Dialog */}
      <Dialog
        open={clearChatDialogOpen}
        onClose={() => setClearChatDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '25px',
            background: MODERN_COLORS.glassDark,
            backdropFilter: 'blur(25px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.5)',
            color: 'white',
            animation: 'scaleIn 0.4s ease',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.4rem',
          py: 3,
        }}>
          Clear Chat
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 3.5 }}>
          <Box
            sx={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: alpha(theme.palette.error.main, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: `3px solid ${alpha(theme.palette.error.main, 0.4)}`,
              boxShadow: '0 8px 25px rgba(244, 67, 54, 0.3)',
            }}
          >
            <DeleteIcon sx={{ fontSize: 48, color: 'error.main' }} />
          </Box>
          <Typography variant="body2" sx={{ 
            color: alpha(theme.palette.common.white, 0.9), 
            lineHeight: 1.7,
            fontSize: '1rem',
            fontWeight: 500,
          }}>
            Are you sure you want to clear this chat? This action cannot be undone and will remove all messages from your view.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3.5, gap: 2.5 }}>
          <Button 
            onClick={() => setClearChatDialogOpen(false)}
            sx={{ 
              color: 'white',
              background: MODERN_COLORS.glass,
              backdropFilter: 'blur(15px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
              borderRadius: '14px',
              px: 4,
              py: 1.5,
              flex: 1,
              fontSize: '0.95rem',
              fontWeight: 600,
              '&:hover': {
                background: alpha(theme.palette.common.white, 0.15),
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={clearChat}
            color="error"
            sx={{
              background: MODERN_COLORS.error,
              backdropFilter: 'blur(15px)',
              border: `1px solid ${alpha(theme.palette.error.main, 0.4)}`,
              borderRadius: '14px',
              px: 4,
              py: 1.5,
              flex: 1,
              fontSize: '0.95rem',
              fontWeight: 'bold',
              '&:hover': {
                background: '#d32f2f',
                transform: 'translateY(-3px) scale(1.05)',
                boxShadow: '0 12px 35px rgba(244, 67, 54, 0.4)',
              },
              transition: 'all 0.4s ease',
            }}
          >
            Clear Chat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Upload Snackbar */}
      <Snackbar
        open={uploadSnackbar.open}
        autoHideDuration={6000}
        onClose={() => setUploadSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        TransitionComponent={Slide}
      >
        <Alert 
          severity="info"
          icon={false}
          sx={{
            background: MODERN_COLORS.primary,
            backdropFilter: 'blur(25px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
            borderRadius: '16px',
            color: 'white',
            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
            fontSize: '0.95rem',
            fontWeight: 500,
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              padding: '8px 0',
            },
          }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => setUploadSnackbar({ open: false, message: '' })}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          <CircularProgress size={20} sx={{ color: 'white' }} />
          {uploadSnackbar.message}
        </Alert>
      </Snackbar>

      {/* Enhanced CSS Animations */}
      <GlobalStyles
        styles={{
          '@keyframes bounce': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-8px)' },
          },
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.6 },
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-15px)' },
          },
          '@keyframes slideIn': {
            '0%': { transform: 'translateY(20px)', opacity: 0 },
            '100%': { transform: 'translateY(0)', opacity: 1 },
          },
        }}
      />
    </Box>
  );
};

export default ChatContainer;