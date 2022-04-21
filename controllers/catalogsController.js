const Product = require('../models/productModel')
const ProductCode = require('../models/productCodeModel')
const Cart = require('../models/CartModel')
const { render } = require('ejs')
const { removeVI } = require('jsrmvi')

module.exports.getProductDetail = async (req, res) => {
	const idProductCode = req.params.id
	try {
		const productCode = await ProductCode.findById(idProductCode).lean()
		const products = await Product.find({
			idProductCode,
		}).lean()

		var total = 0; 
		products.map((product) => total += product.total)
		// console.log(total)
		var sizes = products.map((e) => e.size)
		var colors = products.map((e) => e.color)
		//get all product
		const allProductCodes = await ProductCode.find().lean()
		const arr = Array.from(Array(allProductCodes.length).keys())
		var moreIndexes = getRandom(arr, 8)
		function getRandom(arr, n) {
			var result = new Array(n),
				len = arr.length,
				taken = new Array(len)
			if (n > len)
				throw new RangeError('getRandom: more elements taken than available')
			while (n--) {
				var x = Math.floor(Math.random() * len)
				result[n] = arr[x in taken ? taken[x] : x]
				taken[x] = --len in taken ? taken[len] : len
			}
			return result
		}
		return res.render('pages/product_detail', {
			moreIndexes,
			products: allProductCodes,
			product: productCode,
			sizes: [...new Set(sizes)],
			colors: [...new Set(colors)],
			total
		})
	} catch (error) {
		res.status(500).json({
			status: 'fail',
			message: 'Lỗi server',
		})
	}
}

//get total quantity
module.exports.getVariantTotal = async (req, res) => {
	try {
		const color = req.query.color
		const size = req.query.size
		const idProductCode = req.query.idProductCode
		const currProduct = await Product.findOne({ idProductCode, color, size }).lean()
		if (currProduct) {
			res.send({
				total: currProduct.total,
			})
		} else {
			res.send({
				total: 0,
			})
		}
	} catch (error) {
		res.status(500).json({
			status: 'fail',
			message: 'Lỗi server',
		})
	}
}

module.exports.getAllInfoProduct = async (req, res) => {
	try {
		const idProductCode = req.query.productCodeId
		const listVariants = await Product.find({ idProductCode }).lean()
		res.send({
			listVariants,
		})
	} catch (error) {
		res.status(500).json({
			status: 'fail',
			message: 'Lỗi server',
		})
	}
}

module.exports.addToCart = async (req, res) => {
	try {
		// console.log(req.user)
		const userId = req.user._id
		const productId = req.body.idVariant
		const quantity = req.body.quantity
		const hasCart = await Cart.findOne({ userId })
		if (hasCart) {
			const listProductId = hasCart.products.map((product) => product.productId)
			const hasVariant = listProductId.indexOf(productId)
			if (hasVariant !== -1) {
				const cart = await Cart.findOneAndUpdate(
					{ userId, 'products.productId': productId },
					// {products: {$elemMatch: {productId: productId}}}
					{ $inc: { 'products.$.quantity': quantity } }
				)
				res.status(200).json({
					message: 'thêm vào giỏ hàng thành công',
					data: cart,
					status: 'success',
					isNew: false,
				})
			} else {
				const cart = await Cart.findOneAndUpdate(
					{ userId },
					{ $push: { products: { productId, quantity } } }
				)
				res.status(200).json({
					message: 'thêm vào giỏ hàng thành công',
					data: cart,
					status: 'success',
					isNew: true,
				})
			}
		} else {
			const cart = await Cart.create({
				userId,
				products: [{ productId, quantity }],
			})

			res.status(200).json({
				message: 'thêm vào giỏ hàng thành công',
				data: cart,
				status: 'success',
				isNew: true,
			})
		}
	} catch (error) {
		res.status(500).json({
			status: 'fail',
			message: 'Lỗi server',
		})
	}
}

module.exports.getFilter = async (req, res) => {
	try {
		//get all type
		const productCodes = await ProductCode.find().lean()
		const types = productCodes.map((productCode) => productCode.type)
		var uniqueTypes = [...new Set(types)]

		//get all color
		const products = await Product.find().lean()
		const colors = products.map((product) => product.color)
		var uniqueColors = [...new Set(colors)]

		//get all size
		const sizes = products.map((product) => product.size)
		var uniqueSizes = [...new Set(sizes)]

		res.render('pages/product', {
			types: uniqueTypes,
			colors: uniqueColors,
			sizes: uniqueSizes,
		})
	} catch (error) {
		res.status(500).json({
			status: 'fail',
			message: 'Lỗi server',
		})
	}
}

module.exports.renderProduct = async (req, res) => {
	try {
		let { page, size, color, type, search } = req.query
		const option = { replaceSpecialCharacters: false }

		type = type.split(',')
		size = size.split(',')
		color = color.split(',')

		type = type[0] == '' ? [] : type
		color = color[0] == '' ? [] : color
		size = size[0] == '' ? [] : size

		search = removeVI(search, option)

		// filter follow search
		let productCodes = await ProductCode.find().lean()
		productCodes = productCodes.filter((item) => {
			return (
				removeVI(item.name, option).includes(search) ||
				item.type.includes(search)
			)
		})

		// find follow type
		if (type.length > 0)
			productCodes = productCodes.filter((item) => type.includes(item.type))

		// find follow color
		// tìm tất cả các products thuộc các productCode trên
		let products = []
		for (let code of productCodes) {
			const pro = await Product.find({ idProductCode: code._id }).lean()
			products.push(...pro)
		}

		if (color.length > 0)
			products = products.filter((pro) => {
				return color.includes(pro.color)
			})
		if (size.length > 0)
			products = products.filter((pro) => {
				return size.includes(pro.size)
			})

		productCodes = productCodes.filter((code) => {
			for (let i = 0; i < products.length; i++)
				if (products[i].idProductCode == code._id) return true
		})
		// pagination
		let perPage = 3 // số lượng sản phẩm xuất hiện trên 1 page
		let totalPages = Math.ceil(productCodes.length / perPage)
		let begin = (page - 1) * perPage
		let end = page * perPage
		productCodes = productCodes.slice(begin, end)

		// console.log(378, productCodes.length)
		res.status(200).json({
			status: 'success',
			products: productCodes, //sản phẩm trên một page
			current: page, //page hiện tại
			pages: totalPages, // tổng số các page
		})
	} catch (error) {
		res.status(500).json({
			status: 'fail',
			message: 'Lỗi server',
		})
	}
}
