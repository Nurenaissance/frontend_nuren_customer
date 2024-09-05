import React, { useState,useEffect,useRef } from 'react';

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
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Switch,
  FormControlLabel,
  Modal,
  MenuItem,
} from '@mui/material';
import uploadToBlob from "../../azureUpload.jsx";
import { v4 as uuidv4 } from 'uuid';
import CodeIcon from '@mui/icons-material/Code';
import {
  Send as SendIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  AutoFixHigh as MagicStickIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import axios from 'axios';
import EmailEditor from 'react-email-editor';
import axiosInstance from '../../api';


const emailProviders = {
  gmail: { host:'smtp.gmail.com', port:'465' },
  outlook: { host:'smtp-mail.outlook.com', port:'465'},
  zoho: { host:'smtp.zoho.com', port: '465' },
  godaddy: { host:'smtpout.secureserver.net', port:'465' },
  hostinger: { host:'smtp.hostinger.com', port:'465' },
};

function ComposeButton({ contactemails, show, onClose, emailUser, provider, userId, tenantId }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isHtml, setIsHtml] = useState(false);
  const [message, setMessage] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState('');



  useEffect(() => {
    if (contactemails && contactemails.length > 0) {
      // Join email addresses with commas and trim extra spaces
      const formattedEmails = contactemails
        .map(email => email.trim())
        .filter(email => email) // Remove any empty entries
        .join(',');
  
      setTo(formattedEmails);
    } else {
      setTo('');
    }
  }, [contactemails]);
  

  const [showPreview, setShowPreview] = useState(false);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);

  const emailEditorRef = useRef(null);

  const handleOpenHtmlEditor = () => {
    setShowHtmlEditor(true);
  };

  const handleCloseHtmlEditor = () => {
    setShowHtmlEditor(false);
  };

  const handleExportHtml = () => {
    emailEditorRef.current.editor.exportHtml((data) => {
      const { html } = data;
      setContent(html);
      setIsHtml(true);
      handleCloseHtmlEditor();
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedFiles = [];
  
    for (const file of files) {
      try {
        const fileUrl = await uploadToBlob(file, userId, tenantId);
        uploadedFiles.push({ name: file.name, url: fileUrl });
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  
    setAttachments([...attachments, ...uploadedFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prevAttachments => prevAttachments.filter((_, i) => i !== index));
  };
  




  const OPERATOR_CHOICES = {
    GMAIL: 'gmail',
    OUTLOOK: 'outlook',
    ZOHO: 'zoho',
    GODADDY: 'godaddy',
    HOSTINGER: 'hostinger',
  };


  const handleSendEmail = async (e) => {
    e.preventDefault();
    const providerConfig = emailProviders[provider];
    if (!providerConfig) {
      setMessage('Invalid email provider');
      return;
    }
    let links = [];
    let modifiedContent = content;
  
    // Regular expression to find links
    const regex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
  
    const trackingId = uuidv4();

      const trackingPixelUrl = `https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/track_open/${trackingId}/`;
      const trackingPixel = `${body}<img src="${trackingPixelUrl}" alt="" style="display:none;" />`;
    
      modifiedContent = content.replace(regex, (match, p1, p2) => {
        const linkTrackingId = uuidv4(); // Generate unique ID for each link
        const trackingUrl = `https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/track_click/${trackingId}/${linkTrackingId}/?redirect_url=${encodeURIComponent(p2)}`;
        
        links.push({
            link_id: linkTrackingId,
            url: p2,
            is_clicked: false,
            time_clicked: null
        });

        return match.replace(p2, trackingUrl);
    });
  
    if (isHtml) {
      modifiedContent += trackingPixel;
    }
  
    const emailData = {
      smtpUser: emailUser,
      smtpPass: localStorage.getItem(`${provider}_emailPass`),
      to: to.replace(/\s/g, '').split(','),
      subject: subject,
      text: isHtml ? undefined : content,
      html: isHtml ? modifiedContent : undefined,
      host: providerConfig.host,
      port: providerConfig.port,
      attachments: attachments.map(att => ({ filename: att.name, path: att.url }))
    };
  
    try {
      const response = await axios.post('https://emailserver-lake.vercel.app/send-email', emailData, {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage('Email sent successfully');
  
      // Send tracking data to '/emails' endpoint
      const trackingData = {
        is_open: false,
        time_open: null,
        tracking_id: trackingId,
        operator: "other",
        time: new Date().toISOString(),
        subject: subject,
        email_type: 'sent',

        email_id: to,
        links: links,
        open_count: 0,
        total_time_spent: '0:00:00'

      };
  
      try {
        const response = await axiosInstance.post('/emails/', trackingData, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('Server response:', response.data);
        setMessage('Email sent successfully');
        setTimeout(() => {
          onClose();
        }, 2000);
      } catch (error) {
        console.error('Error sending email:', error.response?.data || error.message);
        setMessage('Error sending email: ' + (error.response?.data?.error || error.message));
      }
    } catch (error) {
      setMessage('Error sending email: ' + (error.response?.data?.message || error.message));
      console.error('Error sending email', error);
    }
  };
  
  

  const handleMagicStickClick = () => {
    setPromptDialogOpen(true);
  };

  const handlePromptSubmit = async () => {
    try {
      // Replace with your OpenAI API endpoint
      const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
        prompt: promptText,
        max_tokens: 10, // Adjust based on your needs
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer YOUR_API_KEY`,
          'Content-Type': 'application/json'
        }
      });

      setSubject(response.data.choices[0].text.trim());
      setPromptDialogOpen(false);
    } catch (error) {
      console.error('Error generating subject:', error);
      setMessage('Error generating subject');
    }
  };


  // const handleSendEmail = async (e) => {
  //   e.preventDefault();
  //   const providerConfig = emailProviders[provider];
  //   if (!providerConfig) {
  //     setMessage('Invalid email provider');
  //     return;
  //   }
  
  //   const trackingId = uuidv4();
  //   const trackingPixelUrl = `https://lxx1lctm-8000.inc1.devtunnels.ms/track_open/${trackingId}/`;
  //   const trackingPixel = `${body}<img src="${trackingPixelUrl}" alt="" style="display:none;" />`;
  
  //   const emailData = {
  //     smtpUser: emailUser,
  //     smtpPass: localStorage.getItem(`${provider}_emailPass`),
  //     to: to.replace(/\s/g, '').split(','),
  //     subject: subject,
  //     text: isHtml ? undefined : content,
  //     html: isHtml ? content + trackingPixel : undefined,
  //     host: providerConfig.host,
  //     port: providerConfig.port,
  //   };
  
  //   try {
  //     const response = await axios.post('https://emailserver-lake.vercel.app/send-email', emailData,
  //       {
  //         raw: btoa(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${trackingPixel}`),
  //       },
  //        {
  //       headers: { 'Content-Type': 'application/json' }
  //     });
  //     setMessage('Email sent successfully');
  
  //     // Send tracking data to '/emails' endpoint
  //     const trackingData = {
  //       is_open: false,
  //       time_open: null,
  //       tracking_id: trackingId,
  //       operator: OPERATOR_CHOICES[provider.toUpperCase()],
  //       time: new Date().toISOString(),
  //       subject: subject,
  //       email_type: 'sent',
  //       email_id : to
  //     };
  
  //     await axiosInstance.post('https://lxx1lctm-8000.inc1.devtunnels.ms/emails/', trackingData, {
  //       headers: { 'Content-Type': 'application/json' }
  //     });
  
  //     setTimeout(() => {
  //       onClose();
  //     }, 2000);
  //   } catch (error) {
  //     setMessage('Error sending email: ' + (error.response?.data?.message || error.message));
  //     console.error('Error sending email', error);
  //   }
  // };

  const fetchDrafts = async () => {
    try {
      const response = await axiosInstance.get('https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/emails/?email_type=draft');
      setDrafts(response.data);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      setMessage('Error fetching drafts');
    }
  };
  
  useEffect(() => {
    fetchDrafts();
  }, []);
  
  
  const handleDraftSelection = (event) => {
    setSelectedDraft(event.target.value);
  };

  const loadDraft = () => {
    const draft = drafts.find(d => d.tracking_id === selectedDraft);
    if (draft) {
      setTo(draft.email_id || '');
      setSubject(draft.subject || '');
      setContent(draft.content || '');
      setIsHtml(draft.is_html || false);
      if (draft.attachments && Array.isArray(draft.attachments)) {
        setAttachments(draft.attachments);
      } else {
        setAttachments([]);
      }
    }
  };


  
  const handleSaveDraft = async () => {
    const trackingId = uuidv4();
  
    const draftData = {
      is_open: false,
      time_open: null,
      tracking_id: trackingId,
      operator: OPERATOR_CHOICES[provider.toUpperCase()],
      time: new Date().toISOString(),
      subject: subject,
      email_type: 'draft',
      email_id: to,
      content: content,
      is_html: isHtml,
      attachments: attachments.map(att => ({ name: att.name, url: att.url }))
    };
  
    try {
      await axiosInstance.post('https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/emails/', draftData, {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage('Draft saved successfully');
      fetchDrafts(); // Refresh the drafts list
      setTimeout(() => {
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage('Error saving draft: ' + (error.response?.data?.message || error.message));
      console.error('Error saving draft', error);
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
          width: '90%',
          maxWidth: 800,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" color="primary">Compose Email</Typography>
          <IconButton onClick={onClose} color="primary">
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
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleMagicStickClick}>
                    <MagicStickIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <FormControlLabel
              control={<Switch checked={isHtml} onChange={(e) => setIsHtml(e.target.checked)} />}
              label="Send as HTML"
            />
            <Box>
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => setShowPreview(!showPreview)}
                sx={{ mr: 1 }}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CodeIcon />}
                onClick={handleOpenHtmlEditor}
              >
                HTML Creator
              </Button>
            </Box>
          </Box>
          {showPreview && isHtml && (
            <Box mt={2} p={2} border={1} borderColor="grey.300" borderRadius={1}>
              <Typography variant="h6" gutterBottom>HTML Preview</Typography>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </Box>
          )}
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
        <ListItemText 
          primary={
            <a href={file.url} download={file.name}>
              {file.name}
            </a>
          } 
        />
        <ListItemSecondaryAction>
          <IconButton edge="end" onClick={() => removeAttachment(index)}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ))}
  </List>
)}
          <Box display="flex" alignItems="center" gap={2} mb={2}>
  <TextField
    select
    label="Select Draft"
    value={selectedDraft}
    onChange={handleDraftSelection}
    variant="outlined"
    sx={{ minWidth: 200 }}
  >
    {drafts.map((draft) => (
      <MenuItem key={draft.tracking_id} value={draft.tracking_id}>
        {draft.subject || 'Untitled Draft'}
      </MenuItem>
    ))}
  </TextField>
  <Button
    variant="contained"
    onClick={loadDraft}
    disabled={!selectedDraft}
  >
    Load Draft
  </Button>
</Box>
          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
            <Button variant="contained" type="submit" endIcon={<SendIcon />}>
              Send
            </Button>
            <Button variant="contained" color="secondary" onClick={handleSaveDraft}>
        Save Draft
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

      {/* Prompt Dialog */}
      <Dialog open={promptDialogOpen} onClose={() => setPromptDialogOpen(false)}>
        <DialogTitle>Generate Subject</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a brief prompt to generate a subject for your email:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Prompt"
            fullWidth
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromptDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePromptSubmit}>Generate</Button>
        </DialogActions>
      </Dialog>
      <Modal
        open={showHtmlEditor}
        onClose={handleCloseHtmlEditor}
        aria-labelledby="html-editor-modal"
        aria-describedby="html-editor-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 1000,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          <Typography id="html-editor-modal" variant="h6" component="h2" gutterBottom>
            HTML Creator
          </Typography>
          <Box sx={{ height: '70vh', mb: 2 }}>
            <EmailEditor
              ref={emailEditorRef}
              onLoad={() => console.log('Email editor loaded')}
              onReady={() => console.log('Email editor ready')}
            />
          </Box>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={handleExportHtml} variant="contained" color="primary">
              Export HTML
            </Button>
            <Button onClick={handleCloseHtmlEditor} variant="outlined">
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default ComposeButton;
