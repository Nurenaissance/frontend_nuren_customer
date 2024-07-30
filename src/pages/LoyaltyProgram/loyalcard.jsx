import React from 'react';
import { Sidebar } from "../../components/Sidebar";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path
import './loyalty.css';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StyleIcon from '@mui/icons-material/Style';
import Image from '../../assets/Image.png';
const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    if (pathArray.length >= 2) {
        return pathArray[1]; 
    }
    return null;
};

const Loyalcard = () => {
    const tenantId = getTenantIdFromUrl();

  

    return (
        <div className="info-loyal-page">
            <div className="home_left_box-loyal">
                <Sidebar />
            </div>
            <div style={{marginLeft:'300px'}}>
                <div className='loyal_topbar'>
                    <TopNavbar />
                </div>
                <div style={{marginTop:'-50px',marginLeft:'20px'}}>
              
                    <h1 className='loyal-head'>Loyalty Program</h1>
                    <img src={Image} alt="Loyalty Image" style={{marginLeft:'200px',marginBottom:'10px'}}/>
                </div>
                <div className="infoboxloyal1">
                    <p className="info-detail-loyal">Choose any of the programs and customize the rewards and conditions</p>
                    <div className="box-container">
                      <div className="box-container1">
                        <div> <LocalOfferIcon  style={{width:'32px',height:'32px', fill:'#171A1FFF',marginTop:'40px', position:'relative',left:'20px'
                            
                        }}/></div>
                        <div className='loyal-bx-data'>
                           <span className='promo-code'>Promo Code</span>
                           <p>get a code to receive</p>
                           <p>10% discount on</p>
                           <p>specific products</p>
                        </div>
                      </div>
                      <div className="box-container2">
                      <div> <StyleIcon  style={{width:'32px',height:'32px', fill:'#171A1FFF',marginTop:'40px', position:'relative',left:'20px'
                            
                        }}/></div>
                        <div className='loyal-bx-data'>
                           <span className='promo-code'>Loyalty Cards</span>
                           <p>Win points with each</p>
                           <p>purchases, and use</p>
                           <p>points to get gifts</p>
                        </div>
                      </div>
                      <div className="box-container3">
                      <div> <LocalOfferIcon  style={{width:'32px',height:'32px', fill:'#171A1FFF',marginTop:'40px', position:'relative',left:'20px'
                            
                        }}/></div>
                        <div className='loyal-bx-data'>
                           <span className='promo-code'>Fidelity Cards</span>
                           <p>Buy 10 products,and </p>
                           <p>get 10$ discount on</p>
                           <p>the 11th one</p>
                        </div>
                      </div>
                      <div className="box-container4">
                      <div> <LocalOfferIcon  style={{width:'32px',height:'32px', fill:'#171A1FFF',marginTop:'40px', position:'relative',left:'20px'
                            
                        }}/></div>
                        <div className='loyal-bx-data'>
                           <span className='promo-code'>Promotional Program</span>
                           <p>Automatic promotion</p>
                           <p> : free shipping</p>
                           <p> on orders higher</p>
                           <p>  than $50</p>
                        </div>
                      </div>
                      <div className="box-container5">
                      <div> <LocalOfferIcon  style={{width:'32px',height:'32px', fill:'#171A1FFF',marginTop:'40px', position:'relative',left:'20px'
                            
                        }}/></div>
                        <div className='loyal-bx-data'>
                           <span className='promo-code'>Coupans</span>
                           <p>Send unique coupons</p>
                           <p> that give access to</p>
                           <p> rewards</p>
                          
                        </div>
                      </div>
                      <div className="box-container6">
                      <div> <LocalOfferIcon  style={{width:'32px',height:'32px', fill:'#171A1FFF',marginTop:'40px', position:'relative',left:'20px'
                            
                        }}/></div>
                        <div className='loyal-bx-data'>
                           <span className='promo-code'>2 + 1 Free</span>
                           <p>Buy  2 product and</p>
                           <p> get a third one for</p>
                           <p> free</p>
                         
                        </div>
                      </div>
                      <div className="box-container7">
                      <div> <LocalOfferIcon  style={{width:'32px',height:'32px', fill:'#171A1FFF',marginTop:'40px', position:'relative',left:'20px'
                            
                        }}/></div>
                        <div className='loyal-bx-data'>
                           <span className='promo-code'>Next Order Coupans </span>
                           <p>Send unique,single-</p>
                           <p> use coupand code for</p>
                           <p> the next purchase</p>
                           
                        </div>
                      </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loyalcard;
