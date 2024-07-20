import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

function EmailList() {
  const location = useLocation();
  const { emails } = location.state || { emails: [] };

  const [expandedEmail, setExpandedEmail] = useState(null);

  const toggleExpand = (index) => {
    setExpandedEmail(expandedEmail === index ? null : index);
  };

  const extractHumanReadableContent = (textContent) => {
    const parts = textContent.split(/--[a-fA-F0-9]+/);
    let content = parts.find(part => part.includes('Content-Type: text/html'));

    if (!content) {
      content = parts.find(part => part.includes('Content-Type: text/plain'));
    }

    if (!content) {
      return 'No readable content found';
    }

    content = content.replace(/Content-Type:.*?\r\n/g, '');
    content = content.replace(/Content-Transfer-Encoding:.*?\r\n/g, '');
    content = content.replace(/Content-Disposition:.*?\r\n/g, '');

    content = content.replace(/=\r\n/g, '');
    content = content.replace(/=([a-fA-F0-9]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));

    return content;
  };

  const extractAttachments = (email) => {
    const attachments = [];
    const attachmentRegex = /filename="([^"]+)"[\s\S]*?Content-Transfer-Encoding: base64[\s\S]*?([\w\d+/=]+)\s/g;
    let match;

    while ((match = attachmentRegex.exec(email.text)) !== null) {
      const [, filename, encodedContent] = match;
      attachments.push({ filename, encodedContent });
    }

    return attachments;
  };

  const validateBase64 = (base64) => {
    return base64.replace(/[^A-Za-z0-9+/=]/g, '');
  };

  const base64ToBlob = (base64, type) => {
    try {
      const byteCharacters = atob(base64);
      const byteArrays = [];
  
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
  
      return new Blob(byteArrays, { type });
    } catch (error) {
      console.error('Failed to decode base64 string:', error);
      throw error; // Rethrow the error to handle it in the calling function
    }
  };

  const renderAttachmentIcon = (attachment) => {
    const extension = attachment.filename.split('.').pop().toLowerCase();
    let icon;

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        icon = '🖼️'; // Image icon
        break;
      case 'pdf':
        icon = '📄'; // PDF icon
        break;
      case 'doc':
      case 'docx':
        icon = '📄'; // Word document icon
        break;
      case 'xls':
      case 'xlsx':
        icon = '📊'; // Excel icon
        break;
      default:
        icon = '📎'; // Generic attachment icon
        break;
    }

    try {
      if (extension === 'pdf') {
        const base64String = validateBase64(attachment.encodedContent);
        const blob = base64ToBlob(base64String, 'application/pdf');
        const url = URL.createObjectURL(blob);

        return (
          <div key={attachment.filename} className="attachment">
            {icon} <a href={url} download={attachment.filename} target="_blank" rel="noopener noreferrer">{attachment.filename}</a>
          </div>
        );
      } else {
        return (
          <div key={attachment.filename} className="attachment">
            {icon} <span>{attachment.filename}</span>
          </div>
        );
      }
    } catch (error) {
      console.error('Error rendering attachment:', error);
      return (
        <div key={attachment.filename} className="attachment-error">
          {icon} <span>Error decoding {attachment.filename}</span>
        </div>
      );
    }
  };

  return (
    <div>
      <h1>Email List</h1>
      <table className="email-table">
        <thead>
          <tr>
            <th>From</th>
            <th>Subject</th>
          </tr>
        </thead>
        <tbody>
          {emails.map((email, index) => (
            <React.Fragment key={index}>
              <tr onClick={() => toggleExpand(index)} className="email-row">
                <td>{email.from}</td>
                <td>{email.subject}</td>
              </tr>
              {expandedEmail === index && (
                <tr className="email-details">
                  <td colSpan="2">
                    <div>
                      <strong>From:</strong> {email.from} <br />
                      <strong>Subject:</strong> {email.subject} <br />
                      <div dangerouslySetInnerHTML={{ __html: extractHumanReadableContent(email.text) }} />
                      <div className="attachments">
                        {extractAttachments(email).map(renderAttachmentIcon)}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmailList;
