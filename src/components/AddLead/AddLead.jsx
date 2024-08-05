import React from 'react'
import './Addlead.css'
import { NavLink } from 'react-router-dom'
import Form from './Form'
function AddLead() {
  return (
    <>
      <div className="header-menu">
        {/* form */}
  
  
      </div>
      {/* <form>
        <label htmlFor="title" style={{marginLeft:"10"}}>Title</label>
        <br/>
        <input type="text" name="title" className='input1' />
        <br/>

        <div className='form-container'>
        <label htmlFor="Product">Product</label>
        
        <input type="text" name="Product" className='input2' />
        <br/>
        <label htmlFor="license">No. of License</label>
        
        <input type="number" name="license" className='input2' />
        
        
        </div>
        <div className="form-container">
        <label htmlFor="client">Client</label>
        <input type="text" name="client" className='input2' />

        <label htmlFor="company">Company</label>
        <input type="text" name="company" className='input2' />

        
        </div>
        <div className="form-container">
        <label htmlFor="payment">Payment Method</label>
        <input type="text" name="payment" className='input2' />

        <label htmlFor="currency">Currency</label>
        <input type="text" name="currency" className='input2' />
        </div>
        <div className="form-container">
        <label htmlFor="budget">Budget</label>
        <input type="number" name="budget" className='input2' />

        <label htmlFor="deposit">Deposit</label>
        <input type="number" name="deposit" className='input2' />
        </div>
        <div className="form-container">
        <label htmlFor="revenue">Est. Revenue</label>
        <input type="number" name="revenue" className='input2' />

        <label htmlFor="date">Est. Close date</label>
        <input type="number" name="date" className='input2' />
        </div>
      </form> */}
      <Form/>

    </>
  )
}

export default AddLead
