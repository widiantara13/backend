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
            id: req.params.id
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
    const url = `${process.env.APP_URL}/images/${fileName}`; // Pastikan APP_URL dievaluasi
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
    try {
        
    } catch (error) {
        
    };
};
export const deleteProduct = async (req, res) => {
    try {
        
    } catch (error) {
        
    };
};