'use client';
import axios from 'axios';
import { Card, Button } from 'flowbite-react';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/actions/cropImage';
export default function ProductForm({ initialData }) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState('');
    const [richDescription, setRichDescription] = useState('');
    const [Price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [IsFeatured, setIsFeatured] = useState(false);
    const [images, setImages] = useState([]);
    const [productdetail, setProductDetail] = useState([{ color: '', sizes: [{ size: '', stock: '' }] }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const calculateTotalStock = useCallback(() => {
        return productdetail.reduce((total, variant) => {
            return total + variant.sizes.reduce((sum, size) => {
                return sum + (parseInt(size.stock) || 0);
            }, 0);
        }, 0);
    }, [productdetail]);


    const [CountINStock, setCountINStock] = useState(calculateTotalStock());
     useEffect(() => {
        setCountINStock(calculateTotalStock());
    }, [productdetail, calculateTotalStock]);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            setRichDescription(initialData.richDescription || '');
            setPrice(initialData.Price || '');
            setCategory(initialData.category || '');
            setCountINStock(initialData.CountINStock || '');
            setBrand(initialData.brand || '');
            setIsFeatured(initialData.IsFeatured || false);
            setImages(initialData.images || []);
            setProductDetail(initialData.productdetail || [{ color: '', sizes: [{ size: '', stock: '' }] }]);
        }
    }, [initialData]);
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);
    useEffect(() => {
    if (categories.length > 0 && !category) {
        setCategory(initialData?.category || categories[0]._id);
    }
}, [categories, category, initialData?.category]);
    
    useEffect(() => {
        axios
            .post(`${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/categories/categoryGET`, {
                query: `
                    query {
                        CategoryGET {
                            _id
                            name
                        }
                    }
                `,
            })
            .then((response) => {
                setCategories(response.data.data.CategoryGET);
            })
            .catch((error) => {
                console.error('Error fetching categories:', error);
            });
    }, []);

    const nextStep = (e) => {
        e.preventDefault();
        setStep((prev) => prev + 1);
    };

    const prevStep = (e) => {
        e.preventDefault();
        setStep((prev) => prev - 1);
    };

    

    const removeImage = (index) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const handleImageClick = (index) => {
        const img = images[index];
        setSelectedImageIndex(index);
        setImagePreview(img instanceof File ? URL.createObjectURL(img) : img);
    };    
    const handleProductDetailChange = (index, field, value) => {
        const newProductDetails = [...productdetail];
        newProductDetails[index][field] = value;
        setProductDetail(newProductDetails);
    };

    const handleSizeChange = (detailIndex, sizeIndex, field, value) => {
        const newProductDetails = [...productdetail];
        newProductDetails[detailIndex].sizes[sizeIndex][field] = value;
        setProductDetail(newProductDetails);
    };

    const addNewProductDetail = () => {
        setProductDetail([...productdetail, { color: '', sizes: [{ size: '', stock: '' }] }]);
    };

    const addNewSize = (index) => {
        const newProductDetails = [...productdetail];
        newProductDetails[index].sizes.push({ size: '', stock: '' });
        setProductDetail(newProductDetails);
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);
    
        if (validFiles.length === 0) {
            setError('File too large or invalid');
            return;
        }
    
        setImages((prev) => [...prev, ...validFiles]);
    
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result);
        reader.readAsDataURL(validFiles[0]);
    };
    

    const saveCroppedImage = async () => {
        if (!croppedAreaPixels || !imagePreview) return;

        try {
            const croppedImage = await getCroppedImg(imagePreview, croppedAreaPixels);
            setImages((prev) => {
                const updatedImages = [...prev];
                updatedImages[selectedImageIndex] = croppedImage;
                return updatedImages;
            });

            setSelectedImageIndex(null);
            setImagePreview(null);
        } catch (error) {
            console.error("Error cropping image:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!name || !Price || isNaN(Price)) {
            setError('Please fill out all fields and ensure the price is a valid number.');
            return;
        }
    
        setError(null);
        setLoading(true);
    
        try {
            const formData = new FormData();
    
            if (imagePreview && croppedAreaPixels) {
                try {
                    const croppedImage = await getCroppedImg(imagePreview, croppedAreaPixels);
                    formData.append('images', croppedImage);
                } catch (error) {
                    console.error('Error cropping image:', error);
                    setLoading(false);
                    return;
                }
            }
    
            images.forEach((image) => {
                if (image) formData.append("images", image);
            });
            
    
            formData.append('name', name);
            formData.append('description', description);
            formData.append('richDescription', richDescription);
            formData.append('Price', Price);
            formData.append('category', category);
            formData.append('CountINStock', CountINStock);
            formData.append('brand', brand);
            formData.append('IsFeatured', IsFeatured);
            formData.append('productdetail', JSON.stringify(productdetail));
    
            const token = localStorage.getItem('authtoken');
    
            const endpoint = `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/products/CreateProduct`;

    
            const method = initialData ? 'put' : 'post';
    
            await axios[method](endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
    
            location.href = '/products';
        } catch (err) {
            console.error('Error:', err.message);
            setError('Failed to save product.');
        } finally {
            setLoading(false);
        }
    };    

    return (

        <Card className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full max-w-3xl bg-transparent relative">
            <h1 className="text-2xl font-bold mb-4">
                {initialData ? 'Edit Product' : 'Create New Product'}
            </h1>
            {error && <p className="text-red-500">{error}</p>}

            {step === 1 && (
                <div>
                    <h1 className="text-2xl font-bold mb-4">Step 1: Basic Product Info</h1>
                    <div className="form-row mb-3">
                        <label>Product Name</label>
                        <input className="form-input" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="form-row mb-3">
                        <label>Description</label>
                        <input className="form-input" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="form-row mb-3">
                        <label>Rich Description</label>
                        <input className="form-input" type="text" value={richDescription} onChange={(e) => setRichDescription(e.target.value)} />
                    </div>
                    <div className="form-row mb-3">
                        
                    <div className="space-y-4">
            {/* File Upload */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                <label className="block text-gray-700 font-medium">Upload Images</label>
                <input
                    type="file"
                    multiple
                    className="mt-2 w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                    onChange={handleFileChange}
                />
            </div>

            {/* Image Previews */}
            <div className="grid grid-cols-5 gap-3">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className="relative group cursor-pointer hover:scale-105 transition-all duration-300"
                    >
                       <Image
    src={img instanceof File ? URL.createObjectURL(img) : img}
    alt="Preview"
    className="w-24 h-24 object-cover rounded-lg shadow-md"
    width={96}
    height={96}
    onClick={() => handleImageClick(index)}
/>

                        <button
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => removeImage(index)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {/* Image Cropper */}
            {imagePreview && selectedImageIndex !== null && (
                <div className="relative bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-2">Crop Image</h3>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                        <Cropper
                            image={imagePreview}
                            crop={crop}
                            zoom={zoom}
                            aspect={3 / 4}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
                        onClick={saveCroppedImage}
                    >
                        Save Cropped Image
                    </button>
                </div>
            )}
        </div>
                    </div>

                    <div className="form-row mb-3">
                        <label>Price</label>
                        <input className="form-input" type="number" value={Price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div className="form-row mb-3">
                        <label>Category</label>
                        <select
                            className="form-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                     <div className="form-row mb-3">
            <label>Total Stock Count</label>
            <div className="p-2 bg-gray-100 rounded-md">
                {CountINStock} (automatically calculated from variants)
            </div>
        </div>
                    <div className="form-row mb-3">
                        <label>Brand</label>
                        <input className="form-input" type="text" value={brand} onChange={(e) => setBrand(e.target.value)} />
                    </div>
                    <div className="form-row mb-3">
                        <label>Featured</label>
                        <select
                                className="form-select"
                                value={IsFeatured ? 'true' : 'false'}
                                onChange={(e) => setIsFeatured(e.target.value === 'true')}
                            >
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </select>

                    </div>
                    <div className="form-row">
                        <Button className="btn-primary w-full" type="button" onClick={nextStep}>
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h1 className="text-2xl font-bold mb-4">Step 2: Select Colors and Sizes</h1>
                    {productdetail.map((detail, detailIndex) => (
                        <div key={detailIndex} className="mb-4">
                            <div className="flex items-center gap-3">
                                <label>Color</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={detail.color}
                                    onChange={(e) => handleProductDetailChange(detailIndex, 'color', e.target.value)}
                                />
                                {detail.color && (
                                    <div 
                                    className="w-6 h-6 rounded-full border"
                                    style={{ backgroundColor: detail.color }}
                                    />
                                    )}
                            </div>
                            {detail.sizes.map((size, sizeIndex) => (
                                <div key={sizeIndex} className="form-row mb-2 flex gap-2">
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="Size"
                                        value={size.size}
                                        onChange={(e) => handleSizeChange(detailIndex, sizeIndex, 'size', e.target.value)}
                                    />
                                    <input
                                        className="form-input"
                                        type="number"
                                        placeholder="Stock"
                                        value={size.stock}
                                        onChange={(e) => handleSizeChange(detailIndex, sizeIndex, 'stock', e.target.value)}
                                    />
                                </div>
                            ))}
                            <Button className="btn-primary w-full mb-2" type="button" onClick={() => addNewSize(detailIndex)}>
                                Add Size
                            </Button>
                        </div>
                    ))}
                    <Button className="btn-primary w-full mb-4" type="button" onClick={addNewProductDetail}>
                        Add Another Color
                    </Button>
                    <div className="form-row flex justify-between">
                        <Button className="btn-primary w-1/2 mr-2" type="button" onClick={prevStep}>
                            Back
                        </Button>
                        <Button className="btn-primary w-1/2" type="submit" onClick={handleSubmit} disabled={loading}>
                        {loading ? <span className="animate-pulse">Creating...</span> : 'Create Product'}
                    </Button>

                    </div>
                </div>
            )}
        </Card>
    );
};
