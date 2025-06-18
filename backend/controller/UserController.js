import User from '../models/UserModel.js';
import argon2 from 'argon2';
import path from 'path';
import { promises as fsPromises } from 'fs'
import dotenv from 'dotenv';

dotenv.config();

export const getUser = async (req, res) => {
    try {
        const response = await User.findAll({
            attributes:{
                exclude: ["password"]
            }
        });
        if(response.length === 0){
            return res.status(404).json({
                msg: "Data not found"
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
export const getUserById = async (req, res) => {
    try {
        const response = await User.findOne({
            attributes:{
                exclude: ["password"]
            },
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
export const addUser = async (req, res) => {
    const {name, email, role, password, confirmPassword} = req.body;
    if(password !== confirmPassword){
        return res.status(400).json({
            msg: "Password not match"
        });
    };
    const hassPass = await argon2.hash(password);

    try {
        await User.create({
            name: name,
            email: email,
            role: role,
            password: hassPass
        });
        res.status(201).json({
            msg: "Register success"
        });
    } catch (error) {
        res.status(400).json({
            msg: error.message
        });
        console.log(error.message);
    };
};
export const updateUser = async (req, res) => {
    // 1. Cari User berdasarkan UUID
    const user = await User.findOne({
        where: {
            uuid: req.params.id
        }
    });

    if (!user) {
        return res.status(404).json({
            msg: "User tidak ditemukan"
        });
    }

    // 2. Ambil data dari request body
    const { name, email, role, password, confirmPassword } = req.body;

    // 3. Penanganan Password
    let hashedPassword = user.password; // Default ke password lama

    if (password) { // Jika password baru diberikan (tidak kosong/null)
        if (password !== confirmPassword) {
            return res.status(400).json({
                msg: "Password dan konfirmasi password tidak cocok"
            });
        }
        hashedPassword = await argon2.hash(password);
    } else if (confirmPassword) { // Jika password kosong tapi confirmPassword ada
        return res.status(400).json({
            msg: "Password baru harus diisi jika ingin mengubah password"
        });
    }

    // 4. Penanganan Upload Gambar
    let newImageFileName = user.image; // Default ke nama file gambar lama
    let newImageUrl = user.url;         // Default ke URL gambar lama

    // Fungsi pembantu untuk melakukan update database
    // Didefinisikan di sini agar bisa diakses dari kedua cabang if/else (dengan atau tanpa file upload)
    const performUserUpdate = async () => {
        try {
            await User.update({
                name: name,
                email: email,
                role: role,
                password: hashedPassword,
                image: newImageFileName, // Gunakan nama file yang sudah disesuaikan
                url: newImageUrl         // Gunakan URL yang sudah disesuaikan
            }, {
                where: {
                    id: user.id // Lebih aman menggunakan ID database daripada UUID untuk update langsung
                                // atau jika model Sequelize Anda tidak menggunakan UUID sebagai primary key
                }
            });
            res.status(200).json({ msg: "Data berhasil diupdate" });
        } catch (dbError) {
            console.error("Error saat update data user di database:", dbError.message);
            res.status(500).json({ msg: dbError.message });
        }
    };

    // Cek apakah ada file gambar baru yang diupload
    if (req.files && req.files.file) { // Menggunakan 'file' sesuai nama field di form-data Anda
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const generatedFileName = file.md5 + ext;
        const allowedTypes = ['.png', '.jpg', '.jpeg'];

        if (!allowedTypes.includes(ext.toLowerCase())) {
            return res.status(422).json({ msg: "Tipe file tidak valid. Hanya PNG, JPG, JPEG yang diizinkan." });
        }
        if (fileSize > 5000000) { // 5 MB
            return res.status(422).json({ msg: "Ukuran gambar harus kurang dari 5 MB" });
        }

        const oldFilePath = `./public/images/${user.image}`; // Menggunakan 'user.image' dari data yang ditemukan
        const newFilePath = `./public/images/${generatedFileName}`;
        const newFileUrl = `${process.env.APP_URL}/images/${generatedFileName}`;

        // Pindahkan file baru
        file.mv(newFilePath, async (err) => {
            if (err) {
                console.error("Error saat memindahkan file:", err);
                return res.status(500).json({ msg: err.message });
            }

            // Hapus file lama jika ada dan bukan yang default/kosong
            if (user.image) { // Pastikan ada file lama yang tercatat di database
                try {
                    await fsPromises.unlink(oldFilePath);
                    console.log(`File lama berhasil dihapus: ${oldFilePath}`);
                } catch (unlinkError) {
                    if (unlinkError.code === 'ENOENT') {
                        // File lama tidak ditemukan, mungkin sudah dihapus atau tidak pernah ada
                        console.warn(`File lama tidak ditemukan untuk dihapus: ${oldFilePath}`);
                    } else {
                        // Error lain saat menghapus file lama
                        console.error(`Error saat menghapus file lama ${oldFilePath}:`, unlinkError);
                    }
                }
            }

            // Update variabel untuk nama file dan URL baru
            newImageFileName = generatedFileName;
            newImageUrl = newFileUrl;

            // Lanjutkan dengan update database setelah file diproses
            await performUserUpdate();
        });
    } else {
        // Jika tidak ada file baru diupload,
        // cek apakah ada permintaan untuk menghapus gambar (misalnya, jika client mengirim image: null atau image: "")
        // Ini tergantung pada bagaimana Anda ingin menangani "penghapusan" gambar dari sisi client.
        // Contoh: jika client mengirim image: "" (string kosong) untuk menghapus gambar
        if (image === "" || image === null) {
            if (user.image) { // Jika ada gambar lama yang tersimpan
                const oldFilePath = `./public/images/${user.image}`;
                try {
                    await fsPromises.unlink(oldFilePath);
                    console.log(`File lama berhasil dihapus karena permintaan pengosongan: ${oldFilePath}`);
                } catch (unlinkError) {
                    if (unlinkError.code === 'ENOENT') {
                        console.warn(`File lama tidak ditemukan saat pengosongan: ${oldFilePath}`);
                    } else {
                        console.error(`Error saat menghapus file lama ketika pengosongan: ${oldFilePath}:`, unlinkError);
                    }
                }
            }
            newImageFileName = null; // Set ke null di database
            newImageUrl = null;       // Set ke null di database
        }
        // Jika tidak ada file baru dan tidak ada permintaan pengosongan, biarkan newImageFileName dan newImageUrl tetap pada nilai lama

        // Langsung lakukan update database (tanpa proses upload/hapus file baru)
        await performUserUpdate();
    }
};
export const deleteUser = async (req, res) => {
    const response = await User.findOne({ 
        where: {
            uuid: req.params.id
        }
    });
    if(!response){
        return res.status(404).json({
            msg: "Data tidak ditemukan"
        });
    };
    const filePath = `process.env.PATH/${User.image}`;
    try {
        // Attempt to delete the file first
        await fsPromises.unlink(filePath); // Use promises version for consistency
        console.log(`File deleted: ${filePath}`);
    } catch (unlinkError) {
        // If the file doesn't exist, unlink will throw ENOENT.
        // We catch it and log it, but don't stop the process, as the database record should still be deleted.
        // Other errors during unlink should also be logged.
        if (unlinkError.code === 'ENOENT') {
            console.warn(`File not found for deletion: ${filePath}`);
        } else {
            console.error(`Error deleting file ${filePath}:`, unlinkError);
            // Depending on requirements, you might want to return an error here
            // if file deletion is critical. For now, we proceed to delete the DB record.
        }
    }

    try {
        // Delete the database record
        await User.destroy({ 
        where: {
            uuid: req.params.id
        }
    }); // Use the fetched picture instance for destroy
        res.status(200).json({
            msg: "Data berhasil dihapus"
        });
    } catch (dbError) {
        console.error("Error deleting picture record:", dbError.message); // Log the database error
        res.status(500).json({
            msg: dbError.message
        });
    };
};