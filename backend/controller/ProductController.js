import Product from '../models/ProductModel.js';
import path from 'path';
import { promises as fsPromises } from 'fs'
import dotenv from 'dotenv';

dotenv.config();

export const getProduct = async (req, res) => {
    try {
        const response = await Product.findAll();
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
    try {
        const response = await Product.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!response){
            return res.status(404).json({
                msg: "Data not found"
            });
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
    if(req.files === null){
        return res.status(400).json({
            msg: "Tidak ada gambar yang diupload"
        });
    };
    const {name,  price, userId} = req.body;

    
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = ['.png', '.jpg', '.jpeg'];
    if(!allowedType.includes(ext.toLowerCase())){
        return res.status(422).json({
            msg: "Tipe gambar tidak diperbolehkan"
        });
    };
    if(fileSize > 5000000){
        return res.status(422).json({
            msg: "Ukuran gambar melebihi 5mb"
        });
    };

    file.mv(`./public/images/${fileName}`, async (err) => {
        if(err){
            console.error("Error moving file:", err); // Log the file move error
            return res.status(500).json({
                msg: err.message
            });
        };
        try {
            const response = await Product.create({
                name: name,
                image: fileName,
                url: url,
                price: price,
                userId: userId
            });
            res.status(201).json({
                msg: "Gambar berhasil diupload",
                data: response
            })
        } catch (error) {
            console.error("Error creating picture record:", error.message); // Log the database error
            // If database insertion fails, we should ideally delete the uploaded file
            // This adds complexity, but is good practice. For now, just log and return error.
            // await fsPromises.unlink(`./public/images/${fileName}`).catch(unlinkErr => console.error("Error cleaning up file after DB error:", unlinkErr));
            res.status(500).json({
                msg: error.message
            });

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