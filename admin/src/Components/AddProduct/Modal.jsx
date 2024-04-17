import React from 'react'
import './Modal.css'
const Modal = (props) => {
  return (
    <div className='modal-background'>
        <div className='modal-content'>
            <h2>Product was added!</h2>
            <p>Name: {props.name}</p>
            <p>Price: {props.price}</p>
            <div><p>Image:</p> <img src={props.img} alt="Product image" /></div>
            <button onClick={props.closeModal} className='modal-accept'>Ok</button>
        </div>
    </div>
  )
}

export default Modal