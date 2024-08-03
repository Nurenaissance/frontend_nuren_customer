// GmailCallback.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GmailCallback() {
    const navigate = useNavigate();
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hash = window.location.hash.substr(1);
        const result = hash.split('&').reduce((result, item) => {
            const parts = item.split('=');
            result[parts[0]] = decodeURIComponent(parts[1]);
            return result;
        }, {});

        if (result.access_token) {
            fetchEmails(result.access_token);
        } else {
            navigate('/'); // Redirect to home if no token
        }
    }, [navigate]);

    const fetchEmails = async (accessToken) => {
        try {
            const response = await axios.get(
                'https://www.googleapis.com/gmail/v1/users/me/messages',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        maxResults: 10, // Adjust as needed
                    },
                }
            );

            const emailPromises = response.data.messages.map(async (message) => {
                const emailResponse = await axios.get(
                    `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                return emailResponse.data;
            });

            const emailDetails = await Promise.all(emailPromises);
            setEmails(emailDetails);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching emails:', error.response ? error.response.data : error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading emails...</div>;
    }

    return (
        <div>
            <h2>Your Gmail Inbox</h2>
            <ul>
                {emails.map((email) => (
                    <li key={email.id}>
                        <strong>{email.payload.headers.find(h => h.name === 'Subject')?.value}</strong>
                        <br />
                        From: {email.payload.headers.find(h => h.name === 'From')?.value}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default GmailCallback;