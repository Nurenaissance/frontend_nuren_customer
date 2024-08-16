import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import './TicketInfo.css';
import TopNavbar from "../TopNavbar/TopNavbar.jsx";
import axiosInstance from "../../api.jsx";

const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    return pathArray.length >= 2 ? pathArray[1] : null;
};

const TicketInfo = () => {
    const tenantId = getTenantIdFromUrl();
    const { id } = useParams();
    const [ticketData, setTicketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTicketData = async () => {
            try {
                const response = await axiosInstance.get(`/tickets/${id}`);
                setTicketData(response.data);
                setLoading(false);
                console.log(response.data);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchTicketData();
    }, [id]);

    const handleMarkAsSolved = async () => {
        try {
            await axiosInstance.put(`/tickets/${id}/`, {
                ...ticketData,
                status: 'closed' // Update the status to 'closed'
            });
            setTicketData(prevData => ({
                ...prevData,
                Status: 'closed'
            }));
            console.log("Marked as solved and status updated to 'closed'");
        } catch (error) {
            setError(error);
            console.error("Error marking as solved:", error);
        }
    };

    const handleMarkAsUnsolved = async () => {
        try {
            const response = await axiosInstance.put(`/tickets/${id}/`, {
                ...ticketData,
                status: 'open' // Update the status to 'open'
            });
            setTicketData(response.data); // Update ticketData with the response data
            console.log("Marked as unsolved and status updated to 'open'");
        } catch (error) {
            setError(error);
            console.error("Error marking as unsolved:", error);
        }
    };

    const handleMarkAsImportant = async () => {
        try {
            const response = await axiosInstance.put(`/tickets/${id}/`, {
                ...ticketData,
                priority: 'high' // Update the priority to 'high'
            });
            setTicketData(response.data); // Update ticketData with the response data
            console.log("Marked as important and priority updated to 'high'");
        } catch (error) {
            setError(error);
            console.error("Error marking as important:", error);
        }
    };

    const handleSave = async () => {
        try {
            const response = await axiosInstance.put(`/tickets/${id}/`, {
                ...ticketData,
                status: 'pending' // Update the status to 'pending'
            });
            setTicketData(response.data); // Update ticketData with the response data
        } catch (error) {
            setError(error);
            console.error("Error saving changes:", error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="ticket-info-page">
            <TopNavbar />
            <div className="ticket-info-content">
                <aside className="ticket-info-sidebar">
                    <Link to={`/${tenantId}/ticket`}> Back </Link>
                </aside>
                <main className="ticket-info-main">
                    <header className="ticket-info-header">
                        <h1 className="ticket-info-title">Ticket Information</h1>
                        <div className="ticket-info-actions">
                        {ticketData.status !== 'closed' && (
                                <button className="ticket-info-btn ticket-info-btn--solve" onClick={handleMarkAsSolved}>
                                    Mark as Solved
                                </button>
                            )}
                                 {ticketData.status !== 'open' && (
                            <button className="ticket-info-btn ticket-info-btn--unsolved" onClick={handleMarkAsUnsolved}>
                                Mark as Unsolved
                            </button>
                        )}
                            {ticketData.priority !== 'high' && (
                            <button className="ticket-info-btn ticket-info-btn--important" onClick={handleMarkAsImportant}>
                                Mark as Important
                            </button>
                        )}
                        </div>
                    </header>

                    <section className="ticket-info-section">
                        <div className="ticket-info-grid">
                            <div className="ticket-info-field">
                                <span className="ticket-info-label">Contact Name:</span>
                                <span className="ticket-info-value">{ticketData.contactName}</span>
                            </div>
                            <div className="ticket-info-field">
                                <span className="ticket-info-label">Account Name:</span>
                                <span className="ticket-info-value">{ticketData.owner}</span>
                            </div>
                            <div className="ticket-info-field">
                                <span className="ticket-info-label">Email:</span>
                                <span className="ticket-info-value">{ticketData.webemail}</span>
                            </div>
                            <div className="ticket-info-field">
                                <span className="ticket-info-label">Related to:</span>
                                <span className="ticket-info-value">{ticketData.case_reason}</span>
                            </div>
                            <div className="ticket-info-field">
                                <span className="ticket-info-label">Status:</span>
                                <span className="ticket-info-value">{ticketData.Status}</span>
                            </div>
                            <div className="ticket-info-field">
                                <span className="ticket-info-label">Description:</span>
                                <span className="ticket-info-value">{ticketData.description}</span>
                            </div>
                        </div>
                        <button className="ticket-info-attachment">View Attachment</button>
                    </section>

                    <section className="ticket-info-section">
                        <h2>Additional Information</h2>
                        <div className="ticket-info-grid">
                            <div className="ticket-info-field">
                                <span className="ticket-info-label">Remarks:</span>
                                <span className="ticket-info-value">{ticketData.subject}</span>
                            </div>
                            <div className="ticket-info-field">
                                <span className="ticket-info-label">Add Comments:</span>
                                <span className="ticket-info-value">{ticketData.addComments}</span>
                            </div>
                        </div>
                    </section>

                    <footer className="ticket-info-footer">
                    {ticketData.status !== 'closed' && (
                                <button className="ticket-info-btn ticket-info-btn--solve" onClick={handleMarkAsSolved}>
                                    Mark as Solved
                                </button>
                            )}
                             {ticketData.status !== 'open' && (
                            <button className="ticket-info-btn ticket-info-btn--unsolved" onClick={handleMarkAsUnsolved}>
                                Mark as Unsolved
                            </button>
                        )}
                            
                            {ticketData.priority !== 'high' && (
                            <button className="ticket-info-btn ticket-info-btn--important" onClick={handleMarkAsImportant}>
                                Mark as Important
                            </button>
                        )}
                        {ticketData.status !== 'pending' && (
                            <button className="ticket-info-btn ticket-info-btn--save" onClick={handleSave}>
                                Save for later
                            </button>
                        )}
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default TicketInfo;