import Product from '../models/ProductModel.js';
import User from '../models/UserModel.js';
import path from 'path';
import {Op} from 'sequelize';
import { promises as fsPromises } from 'fs'
import dotenv from 'dotenv';

dotenv.config();

export const getProduct = async (req, res) => {
    try {
        let response;
        if(req.role === "Admin"){
            response = await Product.findAll({
                include:[{
                    model: User
                }]
            });
        }else{
            response = await Product.findAll({
                where:{
                    userId: req.userId
                },
                include:[{
                    model: User
                }]
            });
        };

        if(!response || (Array.isArray(response) && response.length === 0)){
            return res.status(404).json({
                msg: "Data Empty"
            })
        }
        
        res.status(200).json({
            msg: "Success",
            data: response
        });
    } catch (error) {
        res.status(500).json({
            msg: error.message
        });
        console.log(error.message);
    };
};
export const getProductById = async (req, res) => {
    const product = await Product.findOne({
        where:{
            uuid: req.params.id
        }
    });
    if(!product){
        return res.status(404).json({
            msg: "Product not found"
        })
    }
    try {
        let response;
        if(req.role === "Admin"){
            response = await Product.findOne({
                include:[{
                    model: User
                }],
                where:{
                    id: product.id
                }
            });
        }else{
            response = await Product.findAll({
                where:{
                    [Op.and]:[{id: product.id},{userId: req.userId}]
                    
                },
                include:[{
                    model: User
                }]
            });
        };

        if(!response || (Array.isArray(response) && response.length === 0)){
            return res.status(404).json({
                msg: "Data Empty"
            })
        }
        
        res.status(200).json({
            msg: "Success",
            data: response
        });
    } catch (error) {
        res.status(500).json({
            msg: error.message
        });
        console.log(error.message);
    };
};

export const addProduct = async (req, res) => {
    if(req.files === null || req.files.file === null){
        return res.status(404).json({
            msg: "No file uploaded"
        });
    };
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${process.env.APP_URL}/images/${fileName}`; 
    const allowType = [".png", ".jpg", ".jpeg"];

    if(!allowType.includes(ext.toLowerCase())){
        return res.status(422).json({
            msg:"Image extention is not valid, please upload image .png, .jpg, .jpeg"
        });
    };

    if(fileSize > 5000000){
        return res.status(422).json({
            msg: "Image must less than 5 mb"
        });
    };

    const uploadPath = `./public/images/${fileName}`; 
    const {name, price} = req.body;
    file.mv(uploadPath, async (err) => { 
        if(err){
            return res.status(500).json({
                msg: err.message
            });
        };
        try {
            await Product.create({
                name: name,
                image: fileName,
                url: url,
                price: price,
                userId: req.userId
            })
            res.status(201).json({
                msg: "Success add product"
            });
        } catch (error) {
            console.error( error.message); 
            res.status(500).json({ msg: "Failed to save product data." }); 
        }
    })
    
    
};
export const updateProduct = async (req, res) => {
    let product;
    try {
        product = await Product.findOne({
            where: {
                uuid: req.params.id 
            }
        });
    } catch (error) {
        console.error("Error fetching product:", error.message);
        return res.status(500).json({ msg: "Error fetching product data." });
    }

    if (!product) {
        return res.status(404).json({ msg: "Product not found" });
    }

  
    if (req.role !== "Admin" && product.userId !== req.userId) {
        return res.status(403).json({ msg: "Access denied. You can only update your own products." });
    }

 
    const updateData = {
        name: product.name,
        price: product.price,
        image: product.image, 
        url: product.url      
    };

    if (req.body.name !== undefined) {
        updateData.name = req.body.name;
    }

    if (req.body.price !== undefined) {
        const priceValue = Number(req.body.price);
        if (isNaN(priceValue)) {
            return res.status(400).json({ msg: "Price must be a valid number." });
        }
        updateData.price = priceValue;
    }
    
    try {
       
        if (req.files && req.files.file) {
            const file = req.files.file;
            const fileSize = file.data.length;
            const ext = path.extname(file.name);
            const generatedFileName = file.md5 + ext;
            const allowedTypes = [".png", ".jpg", ".jpeg"];

            if (!allowedTypes.includes(ext.toLowerCase())) {
                return res.status(422).json({
                    msg: "Image extension is not valid. Only .png, .jpg, .jpeg are allowed."
                });
            }
            if (fileSize > 5000000) { 
                return res.status(422).json({
                    msg: "Image size must be less than 5 MB."
                });
            }

            const newImageFileSystemPath = `./public/images/${generatedFileName}`;
    
            await new Promise((resolve, reject) => {
                file.mv(newImageFileSystemPath, (err) => {
                    if (err) {
                        console.error("Error moving uploaded file:", err.message);
                        return reject(new Error("Failed to process uploaded image.")); 
                    }
                    resolve();
                });
            });

            if (product.image && product.image !== generatedFileName) {
                const oldImageFileSystemPath = `./public/images/${product.image}`;
                try {
                    await fsPromises.unlink(oldImageFileSystemPath);
                    console.log("Old product image deleted: " + oldImageFileSystemPath);
                } catch (unlinkError) {
                    if (unlinkError.code === "ENOENT") {
                        console.warn("Old product image not found for deletion: " + oldImageFileSystemPath);
                    } else {
                        console.error("Error deleting old product image: " + unlinkError.message);
                    }
                }
            }
            
            updateData.image = generatedFileName;
            updateData.url = `./public/images/${generatedFileName}`;
        }

  
        await Product.update(updateData, {
            where: {
                id: product.id 
            }
        });

        res.status(200).json({ msg: "Product updated successfully." });

    } catch (error) {
        console.error("Error during product update process:", error.message);
        if (error.message === "Failed to process uploaded image.") {
             return res.status(500).json({ msg: error.message });
        }
        return res.status(500).json({ msg: "An error occurred while updating the product. Please try again." });
    }
};
export const deleteProduct = async (req, res) => {
    const response = await Product.findOne({
        where:{
            uuid:req.params.id
        }
    });
    
    if(!response){
        return res.status(404).json({
            msg: "Data not found"
        });
    }

    if (req.role !== "Admin" && response.userId !== req.userId) {
        return res.status(403).json({ msg: "Access denied. You can only update your own products." });
    };

    const filePath = `./public/images/${response.image}`
    try {       
        await fsPromises.unlink(filePath); 
        console.log(`File deleted: ${filePath}`);
    } catch (unlinkError) {
        
        if (unlinkError.code === 'ENOENT') {
            console.warn(`File not found for deletion: ${filePath}`);
        } else {
            
        }
    }
    try {        
        if(req.role === 'Admin'){
            await Product.destroy(
                { where:{
                id: response.id
            }});
        }else{ 
            if(req.userId !== response.userId) {
                return res.status(403).json({msg: "Akses terlarang"})
            }          
            await Product.destroy(
                {
                    where:{
                    [Op.and]:[{userId: req.userId},{ id: response.id}]
                    
                }
                }
            )
        }
        res.status(200).json({
            msg: "Data deleted"
        });
    } catch (dbError) {
        console.error("Error deleting picture record:", dbError.message); 
        res.status(500).json({
            msg: dbError.message
        });
    };
};