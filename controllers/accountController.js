const User = require('../models/userModel');
const Product = require('../models/productModel')
const ProductCode = require('../models/productCodeModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

// get account

module.exports.getAccount = async (req, res) => {
    try {
        //giai ma token
        var decoded = jwt.verify(req.cookies.tokenId, process.env.TOKEN_KEY);
        //doc id
        const accountId = decoded.userId;
        //tim id trong db
        var account = await User.findById(accountId);

        if (!account)
            return res.status(400).json({
                status: 'fail',
                message: 'Không tìm thấy trang',
            })
        res.render('pages/account', { user: account })
    } catch (error) {
        // res.status(500).json({
        //     status: 'fail',
        //     message: 'Lỗi server',
        // }) 
        res.redirect('/users/login')
    }
}

//edit info account
module.exports.editInfoAccount = async (req, res) => {
    try {
        const user = { ...req.body }
        var decoded = jwt.verify(req.cookies.tokenId, process.env.TOKEN_KEY);
        const accountId = decoded.userId;
        const account = await User.findByIdAndUpdate(accountId, { name: user.name, phoneNumber: user.phone, email: user.email })
        if (account) {
            res.status(200).json({
                status: 'success',
                message: "Đã update"
            })
        }

    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: 'Lỗi server',
        })
    }
}

//edit password account
module.exports.editPasswordAccount = async (req, res) => {
    try {
        const user = { ...req.body }
        var decoded = jwt.verify(req.cookies.tokenId, process.env.TOKEN_KEY);
        const accountId = decoded.userId;
        const userAccount = await User.findById( accountId ).select('+password')
        bcrypt.compare(user.oldPass, userAccount.password,(err, isPassword) => {
            if (err) throw err;
            if (isPassword) {
                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(user.newPass, salt, (err, hash) => {
                        if (err) throw err;
                        userAccount.password = hash;
                        userAccount.save();
                    })
                );
                
                res.status(200).json({
                    status: 'success',
                    message: "Đã update mật khẩu"
                })
            
            } else {
                // console.log('pass ko đung')
                res.json({
                    status: 'fail',
                    message: "Mat khau cũ không đúng"
                })
            }
        })
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: 'Lỗi server',
        })
    }
}