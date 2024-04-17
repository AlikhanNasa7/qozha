import React, { useState } from 'react'
import './AddProduct.css'
import {useForm} from 'react-hook-form'
import upload_cloud_icon from '../../Assets/upload_cloud_icon.svg'
import Modal from './Modal'

const AddProduct = () => {

    const [showModal, setShowModal] = useState(false);

    const {register, handleSubmit, watch, formState: { errors, isDirty, isValid,isSubmitted }, getValues, setValue, reset} = useForm();

    const onError = (errors) => console.log(errors);

    const [image, setImage] = useState(null);
    const [imageURL, setImageURL] = useState(null);
    const [category, setCategory] = useState('women');
    const [productDetails, setProductDetails] = useState({});

    console.log(category)

    function imageHandler(e){
        console.log(1324)
        if (e.target.files.length==0){
            return;
        }
        const currentImage = e.target.files[0];
        console.log(currentImage);
        const currentImageURL = URL.createObjectURL(currentImage);
        console.log(currentImageURL);
        setImage(currentImage);
        setImageURL(currentImageURL);
    }

    const onSubmit = (data) => {
        const isFormValid = image && isDirty && isValid;
        if (!isFormValid){
            return;
        }
        console.log(data)
        const productDetails = {
            name: data.title,
            category: category,
            new_price: data.offerprice,
            old_price: data.price
        }
        AddProduct(productDetails);
    }
    async function AddProduct(productDetails){
        console.log(productDetails);
        let responseData;
        let formData = new FormData();
        formData.append('product', image);
        await fetch('http://localhost:4000/upload', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        }).then(response=>response.json()).then(data=>responseData=data);

        if (responseData.success){
            console.log('Successfully uploaded the image.');
            productDetails.image = responseData.image_url;
            console.log(productDetails);
            await fetch('http://localhost:4000/addproduct', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productDetails)
            }).then(response=>response.json()).then(data=>{
                console.log(data);
                setShowModal(true);
                setProductDetails(productDetails);
            });
        }else{
            console.log('Could not do it.')
        }
    }

    function setExampleValues(){
        setValue('title', 'Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket');
        setValue('price', 124.0);
        setValue('offerprice', 85.0);
        setValue('image', "");
    }

    return (
        <div className='addproduct-page'>
            <form onSubmit={handleSubmit(onSubmit, onError)} className='submition-form' noValidate>
                <div className='inputfield'>
                    <label htmlFor="title">Product Title</label>
                    <input id="title" {...register("title", {required: {value: true, message: 'Product title is required.'},minLength:{value:6, message: "The minimum length for a product title is 6."},maxLength:{value:85, message: 'Character limit reached!'}})} className='product-title'/>
                    <p className='input-error'>{errors.title?.message}</p>
                </div>
                <div className='input-prices'>
                    <div className='inputfield'>
                        <label htmlFor="price">Price</label>
                        <input id="price" {...register("price", { required: {value: true, message: 'Price is required.'}, 
                        pattern: {
                            value: /\d+(\.\d{1,2})?/,
                            message: 'Just enter the valid number, without any signs.'
                        },
                        validate: (value)=>{
                            return (!isNaN(+(value)) || "Enter a valid number!")
                        }})} />
                        <p className='input-error'>{errors.price?.message}</p>
                    </div>
                    <div className='inputfield'>
                        <label htmlFor="offerprice">Offer Price</label>
                        <input id="offerprice" {...register("offerprice", { required: {value:true, message: 'Offer price is required.'}, 
                        pattern: {
                            value: /\d+(\.\d{1,2})?/,
                            message: 'Just enter the valid number, without any signs.'
                        },
                        validate:{
                            isNumber : (value)=>{
                                return (!isNaN(+(value)) || "Enter a valid number!")
                            },
                            isValid : (value)=>{
                                return (+getValues('price')>=+value || "Offer price should be lower or equal to the standard price!")
                            }
                        }})} />
                        <p className='input-error'>{errors.offerprice?.message}</p>
                    </div>
                </div>
                <div className='inputfield categoryfield'>
                    <label htmlFor="">Product Category</label>
                    <select name="category" className='add-product-selector' onChange={(e)=>setCategory(e.target.value)}>
                        <option value="women">Women</option>
                        <option value="men">Men</option>
                        <option value="kids">Kids</option>
                    </select>
                </div>
                <div className='inputfield'>
                    <label htmlFor="file-input" className='addproduct-file'>
                        <img src={imageURL ?? upload_cloud_icon} alt="" className='addproduct-file_img'/>
                    </label>
                    <input onChange={imageHandler} type="file" name='image' id='file-input' hidden/>
                    {isSubmitted && !image && <p className='input-error'>You did not upload an image of the product.</p>}
                </div>

                <button type="submit" className='submit-button' /*disabled={!isDirty || !isValid || !image}*/>SUBMIT</button>
                <button type="reset" className='reset-button' onClick={()=>reset()}>Reset</button>
                <button type="button" className='example-button' onClick={setExampleValues}>Example values</button>
            </form>
            {showModal && <Modal name={productDetails.name} price={productDetails.new_price} img={productDetails.image} closeModal={()=>setShowModal(false)}/>}
        </div>
    )
}

export default AddProduct