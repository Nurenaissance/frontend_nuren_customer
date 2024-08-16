import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TicketPage.css';
import { Sidebar } from "../../components/Sidebar";
import TopNavbar from "../TopNavbar/TopNavbar.jsx";
import { MdCheckCircle, MdClose, MdArchive, MdSearch } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../../api.jsx";

const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    if (pathArray.length >= 2) {
        return pathArray[1]; // Assumes tenant_id is the first part of the path
    }
    return null; 
};

const Ticket = () => {
    const tenantId = getTenantIdFromUrl();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('all');
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [id , setid] = useState({});

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axiosInstance.get(`/tickets/`);
                const fetchedTickets = response.data;
                setTickets(fetchedTickets);
                console.log(tickets);
                filterTickets(selectedOption, fetchedTickets); // Initial filter after fetching
            } catch (error) {
                console.error('Error fetching tickets:', error);
                // Handle error (e.g., show an error message)
            }
        };

        fetchTickets();
    }, [tenantId, selectedOption]); // Fetch tickets when tenantId or selectedOption changes

    const filterTickets = (option, ticketsToFilter) => {
        if (option === 'all') {
            setFilteredTickets(ticketsToFilter);
        } else {
            setFilteredTickets(ticketsToFilter.filter(ticket => ticket.status === option));
        }
    };

    const handleClick = () => {
        navigate(`/${tenantId}/ticketform`);
    };

    const handleDragStart = (e, ticket) => {
        e.dataTransfer.setData("ticketId", ticket.id);
    };

    const handleDrop = (e, newStatus) => {
        const ticketId = e.dataTransfer.getData("ticketId");
        const updatedTickets = tickets.map(t => 
            t.id === parseInt(ticketId) ? { ...t, status: newStatus } : t
        );
        setFilteredTickets(updatedTickets);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleMarkAsSolved = (ticketToUpdate) => {
        const updatedTickets = tickets.map(t =>
            t.id === ticketToUpdate.id ? { ...t, status: 'solved' } : t
        );
        setTickets(updatedTickets);
        filterTickets(selectedOption, updatedTickets); // Re-filter after status update
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
    

    const handleArchive = (ticketToUpdate) => {
        const updatedTickets = tickets.map(t =>
            t.id === ticketToUpdate.id ? { ...t, status: 'archived' } : t
        );
        setTickets(updatedTickets);
        filterTickets(selectedOption, updatedTickets); // Re-filter after status update
    };

    return (
        <div className="ticket-page">
            <div className='ticket_nav'>
            <TopNavbar />
            </div>
            <div className="ticket-content">
                <div className="ticket-sidebar">
                    <Sidebar />
                </div>
                <div className="ticket-main">
                    <div className="ticket-header">
                        <h1>Generated Tickets</h1>
                        <div className="ticket-toolbar">
                            <div className="ticket-search">
                                <MdSearch className="ticket-search__icon" />
                                <input type="text" placeholder="Search..." className="ticket-search__input" />
                            </div>
                            <select className="ticket-filter" onChange={(e) => setSelectedOption(e.target.value)}>
                                <option value="all">Filter by</option>
                                <option value="notSolved">Not Solved</option>
                                <option value="solved">Solved</option>
                                <option value="archived">Archived</option>
                            </select>
                            <button className="ticket-create-btn" onClick={handleClick}>
                               + Create New
                            </button>
                            <div className="ticket-options">
                                <button className="ticket-options__btn" onClick={toggleDropdown}>⋮</button>
                                {dropdownOpen && (
                                    <div className="ticket-options__menu">
                                        <a href="#" className="ticket-options__item">Option 1</a>
                                        <a href="#" className="ticket-options__item">Option 2</a>
                                        <a href="#" className="ticket-options__item">Option 3</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="ticket-tabs">
                        <button className="ticket-tab" onClick={() => setSelectedOption('all')}>
                            All Tickets <span className="ticket-tab__badge">{filteredTickets.length}</span>
                        </button>
                        <button className="ticket-tab" onClick={() => setSelectedOption('notSolved')}>
                            Not Solved <span className="ticket-tab__badge">{filteredTickets.filter(ticket => ticket.status === 'notSolved').length}</span>
                        </button>
                        <button className="ticket-tab" onClick={() => setSelectedOption('solved')}>
                            Solved <span className="ticket-tab__badge">{filteredTickets.filter(ticket => ticket.status === 'solved').length}</span>
                        </button>
                        <button className="ticket-tab" onClick={() => setSelectedOption('archived')}>
                            Archived <span className="ticket-tab__badge">{filteredTickets.filter(ticket => ticket.status === 'archived').length}</span>
                        </button>
                    </div>
                    <div className="ticket-list">
                        {filteredTickets.map(ticket => (
                            <div 
                                key={ticket.id} 
                                className="ticket-item"
                                draggable
                                onDragStart={(e) => handleDragStart(e, ticket)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, selectedOption)}
                                onClick={() => setSelectedTicket(ticket)}
                            >
                                <div className="ticket-item__header">
                                    <span className="ticket-item__title">{ticket.case_reason}</span>
                                    <span className="ticket-item__id">#{ticket.casenumber}</span>
                                </div>
                                <div className="ticket-item__description">
                                    {ticket.description}
                                </div>
                                <button className="ticket-item__attachment">View Attachment</button>
                                <div className="ticket-item__actions">
                                    {ticket.status === 'open' && (
                                        <>
                                            <button 
                                                className="ticket-item__action"
                                                onClick={(e) => { e.stopPropagation(); handleMarkAsUnsolved(ticket); }}
                                            >
                                                <MdClose style={{ color: '#62CD14' }} />
                                            </button>
                                            <button 
                                                className="ticket-item__action"
                                                onClick={(e) => { e.stopPropagation(); handleArchive(ticket); }}
                                            >
                                                <MdArchive style={{ color: '#EFB034' }} />
                                            </button>
                                        </>
                                    )}
                                    {ticket.status === 'closed' && (
                                        <>
                                             <button 
                                                className="ticket-item__action"
                                                onClick={(e) => { e.stopPropagation(); handleMarkAsUnsolved(ticket); }}
                                            >
                                                <MdClose style={{ color: '#DE3B40' }} />
                                            </button>
                                            <button 
                                                className="ticket-item__action"
                                                onClick={(e) => { e.stopPropagation(); handleArchive(ticket); }}
                                            >
                                                <MdArchive style={{ color: '#EFB034' }} />
                                            </button>
                                        </>
                                    )}
                                    {ticket.status === 'pending' && ticket.priority === 'high' &&(
                                        <>
                                            <button 
                                                className="ticket-item__action"
                                                onClick={(e) => { e.stopPropagation(); handleMarkAsSolved(ticket); }}
                                            >
                                                <MdCheckCircle style={{ color: '#62CD14' }} />
                                            </button>
                                            <button 
                                                className="ticket-item__action"
                                                onClick={(e) => { e.stopPropagation(); handleMarkAsUnsolved(ticket); }}
                                            >
                                                <MdClose style={{ color: '#DE3B40' }} />
                                            </button>
                                        </>
                                    )}
                                    <Link to={`/${tenantId}/ticketinfo/${ticket.id}`} onClick={(e) => e.stopPropagation()}>View Ticket Info</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ticket;
