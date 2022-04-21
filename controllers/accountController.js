const User = require('../models/userModel')
const Order = require('../models/OrderModel')
const Product = require('../models/productModel')
const ProductCode = require('../models/productCodeModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const imgbbUploader = require('imgbb-uploader')
const path = require('path')

// get account

module.exports.getAccount = async (req, res) => {
	try {
		if (!req.user) {
			return res.redirect('/auth/login')
		}

		let orders = await Order.find({ userId: req.user._id }).lean()

		for (let order of orders) {
			// console.log(order.products)
			for (let product of order.products) {
				// find productCode -> name
				//    console.log(product)
				const pro = await Product.findById(product.productId).lean()
				if (!pro) product.name = 'Sản phẩm đã bị xóa'
				else {
					const productCode = await ProductCode.findById(pro.idProductCode).lean()
					product.name = `${productCode.name} - ${pro.color} - ${pro.size}`
				}
			}
		}

		res.render('pages/account', {
			user: req.user,
			orders,
		})
	} catch (error) {
		res.redirect('/auth/login')
	}
}

//edit info account
module.exports.editInfoAccount = async (req, res) => {
	try {
		const user = { ...req.body }
		console.log(user)

		var decoded = jwt.verify(req.cookies.tokenId, process.env.TOKEN_KEY)
		const accountId = decoded.userId
		const account = await User.findByIdAndUpdate(accountId, {
			name: user.name,
			phoneNumber: user.phone,
			email: user.email,
		})
		if (account) {
			res.status(200).json({
				status: 'success',
				message: 'Đã update',
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
		var decoded = jwt.verify(req.cookies.tokenId, process.env.TOKEN_KEY)
		const accountId = decoded.userId
		const userAccount = await User.findById(accountId).select('+password')
		bcrypt.compare(user.oldPass, userAccount.password, (err, isPassword) => {
			if (err) throw err
			if (isPassword) {
				bcrypt.genSalt(10, (err, salt) =>
					bcrypt.hash(user.newPass, salt, (err, hash) => {
						if (err) throw err
						userAccount.password = hash
						userAccount.save()
					})
				)

				res.status(200).json({
					status: 'success',
					message: 'Đã update mật khẩu',
				})
			} else {
				res.json({
					status: 'fail',
					message: 'Mật khẩu cũ không đúng',
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

// edit avatar
module.exports.editAvatar = async (req, res, next) => {
	try {
		// update avatar
		if (req.file) {
			const upload = await imgbbUploader(process.env.IMGBB_KEY, req.file.path)
			req.body.avatar = upload.url
		}
		await User.updateOne({ _id: req.user._id }, req.body)

		res.status(200).json({
			status: 'success',
		})
	} catch (error) {
		res.status(500).json({
			status: 'fail',
			message: 'Lỗi server',
		})
	}
}

// cancelOrder
module.exports.cancelOrder = async (req, res) => {
	try {
		const order = await Order.findOne({
			_id: req.params.id,
			userId: req.user._id,
			status: 'waiting',
		})

		if (!order)
			return res.status(200).json({
				status: 'fail',
				message: 'Không tìm thấy order',
			})

		order.status = 'cancelled'
		await order.save()

		res.status(200).json({
			status: 'success',
			message: 'Hủy order thành công',
		})
	} catch (error) {
		res.status(500).json({
			status: 'fail',
			message: 'Lỗi server',
		})
	}
}
