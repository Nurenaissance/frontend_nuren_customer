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
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchTicketData();
    }, [id]);

    const handleMarkAsSolved = () => {
        console.log("Marking as solved...");
    };

    const handleMarkAsImportant = () => {
        console.log("Marking as important...");
    };

    const handleSave = () => {
        console.log("Saving changes...");
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
                            <button className="ticket-info-btn ticket-info-btn--solve" onClick={handleMarkAsSolved}>Mark as Solved</button>
                            <button className="ticket-info-btn ticket-info-btn--important" onClick={handleMarkAsImportant}>Mark as Important</button>
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
                        <button className="ticket-info-btn ticket-info-btn--solve" onClick={handleMarkAsSolved}>Mark as Solved</button>
                        <button className="ticket-info-btn ticket-info-btn--important" onClick={handleMarkAsImportant}>Mark as Important</button>
                        <button className="ticket-info-btn ticket-info-btn--save" onClick={handleSave}>Save for later</button>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default TicketInfo;