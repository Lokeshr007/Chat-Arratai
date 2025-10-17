import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Delete as DeleteIcon, Forward as ForwardIcon, FileDownload as FileDownloadIcon, Reply as ReplyIcon } from '@mui/icons-material';

const SelectionActionsBar = ({ selectedCount, clearSelection, deleteSelected, forwardSelected, downloadSelected, replyToSelected }) => {
  return (
    <Box sx={{ position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(255,255,255,0.95)', display: 'flex', gap: 1, alignItems: 'center', p: 1, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      <Typography variant="body2" sx={{ ml: 1 }}>{selectedCount} selected</Typography>

      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
        <Tooltip title="Reply">
          <IconButton size="small" onClick={replyToSelected} aria-label="reply-selected">
            <ReplyIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Forward">
          <IconButton size="small" onClick={forwardSelected} aria-label="forward-selected">
            <ForwardIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Download">
          <IconButton size="small" onClick={downloadSelected} aria-label="download-selected">
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton size="small" onClick={deleteSelected} aria-label="delete-selected">
            <DeleteIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Clear selection">
          <IconButton size="small" onClick={clearSelection} aria-label="clear-selection">
            ✖
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

SelectionActionsBar.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  clearSelection: PropTypes.func.isRequired,
  deleteSelected: PropTypes.func.isRequired,
  forwardSelected: PropTypes.func.isRequired,
  downloadSelected: PropTypes.func.isRequired,
  replyToSelected: PropTypes.func.isRequired,
};

export default SelectionActionsBar;
