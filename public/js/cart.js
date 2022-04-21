$('.btn-order').on('click', (e) => {
	e.preventDefault()
	window.location.href = '/checkout'
})

$('.btn-cart').on('click', (e) => {
	e.preventDefault()
	window.location.href = '/products'
})

let cart_list = $('.cart__list')
let cart = undefined
let totalProduct = 0
let totalCost = 0

function renderCartEmpty() {
	$('.cart__info').attr('style', 'display:none')
	cart_list.html(`
		<div class='empty__cart'>
			<img src='../../public/images/EmptyCart.png' alt='EmptyCart' loading="lazy">
			<h2>
				Giỏ hàng của bạn còn trống!
			</h2>
			<a href='/products'>
				<button class='btn btn-small'>
					<span class='btn-txt-cart'>MUA NGAY</span>
				</button>
			</a>
		</div>
	`)
	$('.empty__cart').attr('style', 'width:150%')
}

function renderCart(products) {
	let html = ''

	for (let product of products) {
		html += `
			<table class='tb1' data-id="${product._id}">
				<tr class='tr1'>
					<td class='td1 cart__item__image'>
						<a href='/products/detail/${product.idProductCode._id}'>
						<img src='${product.idProductCode.images[0]}' alt='' loading="lazy">
						</a>	
					</td>
					<td class='td1 cart__item__info__name'>
						<a href='/products/detail/${product.idProductCode._id}'>${product.idProductCode.name
			} - ${product.color} - ${product.size}</a>
					</td>
					<td class='td1 product_quantity'>
						<div class='product__info__item__quantity'>
							<button class='product__info__item__quantity__btn dec__btn' onclick='decrementProduct(event)'>
								<i class='bx bx-minus'></i>
							</button>
							<div class='product__info__item__quantity__input'>
								${product.quantity}
							</div>
							<button class='product__info__item__quantity__btn inc__btn' onclick="incrementProduct(event)">
								<i class='bx bx-plus'></i>
							</button>
						</div>
					</td>
					<td class='td1 cart__item__info__cost'>
						${(product.idProductCode.cost * product.quantity).toLocaleString()}
					</td>
					<td class='td1'>
						<button class='cart__item__del' onclick="deleteProduct(event)">
						<i class='bx bx-trash'></i>
						</button>
					</td>
				</tr>
			</table>
        `

		totalProduct += product.quantity
		totalCost += product.idProductCode.cost * product.quantity
	}

	cart_list.html(html)
	setReview()
}

function setReview() {
	$('.total__product').html(formatTotalProduct(totalProduct))
	$('.total__cost').html(`${totalCost.toLocaleString()} VNĐ`)
}

function getProduct(id) {
	for (let product of cart.products) if (product._id == id) return product
}

async function incrementProduct(event) {
	event.preventDefault()

	const table = event.target.closest('table')
	const idProduct = table.getAttribute('data-id')
	const product = getProduct(idProduct)

	// call api
	let quantity = table.querySelector('.product__info__item__quantity__input')

	if (+quantity.innerHTML == product.total) {
		alert('Số lượng sản phẩm đã đạt lớn nhất!')
		return
	}

	const result = await $.ajax({
		url: '/cart/api/' + idProduct,
		type: 'PUT',
		data: { quantity: +quantity.innerHTML + 1 },
	})

	// console.log(result)
	// console.log(product)
	if (result.status == 'success') {
		totalProduct++
		totalCost += product.idProductCode.cost
		setReview()
		quantity.innerHTML++
		table.querySelector('.cart__item__info__cost').innerHTML = (
			+quantity.innerHTML * product.idProductCode.cost
		).toLocaleString()
	}
}

async function decrementProduct(event) {
	event.preventDefault()

	const table = event.target.closest('table')
	const idProduct = table.getAttribute('data-id')
	const product = getProduct(idProduct)

	// call api
	let quantity = table.querySelector('.product__info__item__quantity__input')

	if (+quantity.innerHTML == 1) {
		alert('Số lượng sản phẩm đã đạt nhỏ nhất!')
		return
	}

	const result = await $.ajax({
		url: '/cart/api/' + idProduct,
		type: 'PUT',
		data: { quantity: +quantity.innerHTML - 1 },
	})

	// console.log(result)
	if (result.status == 'success') {
		totalProduct--
		totalCost -= product.idProductCode.cost
		setReview()
		quantity.innerHTML--
		table.querySelector('.cart__item__info__cost').innerHTML = (
			+quantity.innerHTML * product.idProductCode.cost
		).toLocaleString()
	}
}

async function deleteProduct(event) {
	event.preventDefault()

	const table = event.target.closest('table')
	const idProduct = table.getAttribute('data-id')
	// const product = getProduct(idProduct)

	// call api
	const result = await $.ajax({
		url: '/cart/api/' + idProduct,
		type: 'delete',
	})
	const product = getProduct(idProduct)

	// console.log(result)
	if (result.status == 'success') {
		const quantity = +table.querySelector(
			'.product__info__item__quantity__input'
		).innerHTML
		totalProduct -= quantity
		totalCost -= product.idProductCode.cost * quantity
		setReview()
		table.remove()

		if (totalProduct == 0) renderCartEmpty()

		document.querySelector('.cover-num a.cart-num').innerHTML--
	}
}

async function getCart() {
	const result = await $.ajax({
		url: '/cart/api',
		type: 'GET',
	})

	// console.log(result.data.cart)
	if (result.status == 'fail' || result.data.cart.products.length == 0) {
		renderCartEmpty()
		return
	}

	cart = result.data.cart

	renderCart(cart.products)
}

getCart()

function changeCart() { }

function formatTotalProduct(quantity) {
	if (quantity < 10)
		return '0' + quantity
	else
		return quantity
}
