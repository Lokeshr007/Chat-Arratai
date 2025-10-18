import React from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, Typography, Tooltip, IconButton, Checkbox, Chip, Fade } from '@mui/material';
import { PlayArrow as PlayArrowIcon, Pause as PauseIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';

const MODERN_COLORS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  dark: 'linear-gradient(135deg, #1c1c2e 0%, #2d2d44 100%)',
};

const MessageBubble = ({
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
}) => {
  const isSelected = selectedMessages?.has(message._id);
const isPinned = localPinnedMessages.some(msg => msg._id === message._id);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 2,
        px: 2,
        position: 'relative',
      }}
    >
      {isSelectMode && (
        <Fade in={isSelectMode}>
          <Box sx={{ position: 'absolute', left: isOwnMessage ? 'auto' : 8, right: isOwnMessage ? 8 : 'auto', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
            <Checkbox size="small" checked={isSelected} onChange={() => toggleMessageSelection(message._id)} />
          </Box>
        </Fade>
      )}

      {isPinned && (
  <Box
    sx={{
      position: 'absolute',
      top: -8,
      left: isOwnMessage ? 'auto' : 8,
      right: isOwnMessage ? 8 : 'auto',
      background: CHAT_COLORS.primary,
      borderRadius: '12px',
      px: 1,
      py: 0.5,
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      zIndex: 5,
    }}
  >
    <FiMapPin size={10} />
    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
      Pinned
    </Typography>
  </Box>
)}

      <Box sx={{ maxWidth: '85%', minWidth: '120px', position: 'relative', opacity: isSelectMode && !isSelected ? 0.7 : 1 }}>
        {isGroup && !isOwnMessage && (
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', mb: 0.5, ml: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
            {message.senderId?.fullName || message.senderName}
          </Typography>
        )}

        {message.replyTo && (
          <Paper variant="outlined" sx={{ p: 1, mb: 1, backgroundColor: 'rgba(0,0,0,0.03)', borderLeft: `3px solid ${theme.palette.primary.main}`, borderRadius: '12px', cursor: 'pointer' }}>
            <Typography variant="caption" color="primary" fontWeight="bold" fontSize="0.7rem">
              Replying to {message.replyTo.senderId?._id === authUser._id ? 'yourself' : message.replyTo.senderId?.fullName}
            </Typography>
            <Typography variant="body2" noWrap sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              {message.replyTo.text || 'Media message'}
            </Typography>
          </Paper>
        )}

        <Tooltip title={new Date(message.createdAt).toLocaleString()} placement={isOwnMessage ? 'left' : 'right'}>
          <Paper id={`message-${message._id}`} elevation={0} sx={{ p: 1.5, background: isSelected ? 'rgba(102, 126, 234, 0.3)' : (isOwnMessage ? MODERN_COLORS.primary : 'background.paper'), color: isOwnMessage ? 'white' : 'text.primary', borderRadius: '18px' }}>
            {message.text && (
              <Typography variant="body1" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.4 }}>
                {message.text}
              </Typography>
            )}

            {message.media?.map((media, index) => (
              <Box key={index} sx={{ mt: 1 }}>
                {getFileType(media) === 'image' ? (
                  <img src={media} alt="Shared media" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: '12px', cursor: 'pointer' }} onClick={() => window.open(media, '_blank')} onError={(e) => { e.target.style.display = 'none'; }} />
                ) : getFileType(media) === 'video' ? (
                  <video src={media} controls style={{ maxWidth: '100%', maxHeight: 300, borderRadius: '12px' }} onError={() => console.error('Error loading video', media)} />
                ) : getFileType(media) === 'audio' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '20px', p: 1 }}>
                    <IconButton size="small" onClick={() => handlePlayAudio(media, message._id)} color={playingAudio === message._id ? 'primary' : 'default'}>
                      {playingAudio === message._id ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Voice message</Typography>
                  </Box>
                ) : (
                  <Chip icon={<AttachFileIcon />} label={media.split('/').pop()} onClick={() => window.open(media, '_blank')} onDelete={() => downloadFile(media, media.split('/').pop())} variant="outlined" />
                )}
              </Box>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem', color: isOwnMessage ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
            </Box>

            {message.reactions && message.reactions.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap', justifyContent: isOwnMessage ? 'flex-end' : 'flex-start' }}>
                {message.reactions.map((reaction, idx) => (
                  <Chip key={idx} label={<span>{reaction.emoji} {reaction.count > 1 ? reaction.count : ''}</span>} size="small" onClick={() => { if (reaction.users?.includes(authUser._id)) { removeReaction(message._id, reaction.emoji); } else { reactToMessage(message._id, reaction.emoji); } }} color={reaction.users?.includes(authUser._id) ? 'primary' : 'default'} variant={reaction.users?.includes(authUser._id) ? 'filled' : 'outlined'} sx={{ borderRadius: '12px', fontSize: '0.7rem', height: '24px' }} />
                ))}
              </Box>
            )}
          </Paper>
        </Tooltip>
      </Box>
    </Box>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.object.isRequired,
  isOwnMessage: PropTypes.bool,
  isGroup: PropTypes.bool,
  selectedMessages: PropTypes.instanceOf(Set),
  isSelectMode: PropTypes.bool,
  toggleMessageSelection: PropTypes.func,
  reactToMessage: PropTypes.func,
  removeReaction: PropTypes.func,
  getFileType: PropTypes.func,
  getFileIcon: PropTypes.func,
  downloadFile: PropTypes.func,
  playingAudio: PropTypes.any,
  handlePlayAudio: PropTypes.func,
  authUser: PropTypes.object,
  theme: PropTypes.object,
};

export default MessageBubble;
