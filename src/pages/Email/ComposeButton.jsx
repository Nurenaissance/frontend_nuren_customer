import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';

const emailProviders = {
  gmail: { host:'smtp.gmail.com', port:'465' },
  outlook: { host:'smtp-mail.outlook.com', port:'465'},
  zoho: { host:'smtp.zoho.com', port: '465' },
  godaddy: { host:'smtpout.secureserver.net', port:'465' },
  hostinger: { host:'smtp.hostinger.com', port:'465' },
};

function ComposeButton({ onClose, emailUser, provider }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    const providerConfig = emailProviders[provider];
    if (!providerConfig) {
      setMessage('Invalid email provider');
      return;
    }
  
    const emailData = {
      smtpUser: emailUser,
      smtpPass: localStorage.getItem(`${provider}_emailPass`),
      to: to,
      subject: subject,
      text: text,
      host: providerConfig.host,
      port: providerConfig.port,
      attachments: attachments, // Send the attachments as part of the JSON if needed
    };
  
    try {
      const response = await axios.post('http://localhost:3001/send-email', emailData, {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage('Email sent successfully');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setMessage('Error sending email');
      console.error('Error sending email', error);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '80%',
          maxWidth: 600,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Compose Email</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <form onSubmit={handleSendEmail}>
          <TextField
            fullWidth
            label="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            margin="normal"
            
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            margin="normal"
            
          />
          <Box mt={2}>
            <input
              accept="*/*"
              id="contained-button-file"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              multiple
            />
            <label htmlFor="contained-button-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFileIcon />}
              >
                Attach Files
              </Button>
            </label>
          </Box>
          {attachments.length > 0 && (
            <List>
              {attachments.map((file, index) => (
                <ListItem key={index}>
                  <ListItemText primary={file.name} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => removeAttachment(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
            <Button variant="contained" type="submit" endIcon={<SendIcon />}>
              Send
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Box>
        </form>
        {message && (
          <Typography color="primary" align="center" mt={2}>
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default ComposeButton;