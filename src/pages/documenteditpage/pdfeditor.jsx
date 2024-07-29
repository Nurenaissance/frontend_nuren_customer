// src/components/IframePage.jsx

import React from 'react';
import TopNavbar from '../TopNavbar/TopNavbar';
import { Sidebar } from '../../components/Sidebar';

const IframePage = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', marginTop:'-60px', marginLeft:'250px' }}>
            <div><Sidebar/></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div><TopNavbar/></div>
                <iframe
                    title="External Page"
                    src="https://mypdf-gamma.vercel.app/"  // Replace with your desired URL
                    style={{ border: 'none', width: '100%', flex: 1 }}
                    frameBorder="0"
                />
            </div>
        </div>
    );
}

export default IframePage;
