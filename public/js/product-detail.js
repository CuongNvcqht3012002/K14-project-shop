const idProductCode = window.location.pathname.slice(17)
var listVariants = []
var quantity = 1
var color, size
var idVariant;
$('input#has_bought').prop('checked', false)

$.ajax({
	url: `/products/detail?productCodeId=${idProductCode}`,
	type: 'POST',
})
	.then((res) => {
		listVariants = res.listVariants
	})
	.catch((err) => {
		console.log(err)
	})

$(document).ready(function () {
	// toggle expand product description
	$('.product-description__toggle').click(function () {
		$('.product-description').toggleClass('expand')
		$(this).toggleClass('expand')
	})
	//show all color and size
	$('.show-all-variants').click(function(){
		$('.product-info-item-list__item').each(function () {
			$(this).removeClass('active');
			$(this).css('display','flex')
		})
	})

	//select size and color
	$('.product-info-item-list__item').click(function () {
		quantity = 1
		$('#quantity').val(quantity)
		$(this).addClass('active')
		$(this).siblings().removeClass('active')
		if ($(this).children('input').attr('name') == 'color') {
			let currColor = $(this).children('input').val()
			let totalVariantWithColor = 0;
			listVariants.map(variant => variant.color === currColor ? totalVariantWithColor += variant.total : totalVariantWithColor)
			$('.product-info-item__variant').text('Còn ' + totalVariantWithColor + ' sản phẩm')
			color = currColor
			const displayVariant = listVariants.filter(
				(variant) => variant.color === currColor
			)
			const displaySize = displayVariant.map((variant) => variant.size)
			$('input[name="size"]').each(function () {
				$(this).parent('.product-info-item-list__item').css('display', 'flex')
			})
			$('input[name="size"]').each(function () {
				if (displaySize.indexOf($(this).val()) == -1) {
					$(this).parent('.product-info-item-list__item').css('display', 'none')
				}
			})
		}
		if ($(this).children('input').attr('name') == 'size') {
			$('.product-info-item-quantity__input input').val(1)
			let currSize = $(this).children('input').val()
			let totalVariantWithSize = 0;
			listVariants.map(variant => variant.size === currSize ? totalVariantWithSize += variant.total : totalVariantWithSize)
			$('.product-info-item__variant').text('Còn ' + totalVariantWithSize + ' sản phẩm')
			size = currSize
			const displayVariant = listVariants.filter(
				(variant) => variant.size === currSize
			)
			const displayColor = displayVariant.map((variant) => variant.color)
			$('input[name="color"]').each(function () {
				$(this).parent('.product-info-item-list__item').css('display', 'flex')
			})
			$('input[name="color"]').each(function () {
				if (displayColor.indexOf($(this).val()) == -1) {
					$(this).parent('.product-info-item-list__item').css('display', 'none')
				}
			})
		}

		if (size && color) {
			const currVariant = listVariants.filter(
				(variant) => variant.size === size && variant.color === color
			)
			idVariant = currVariant[0]._id
			$('#quantity').attr('max', currVariant[0].total)
			$('.product-info-item__variant').text('Còn ' + currVariant[0].total + ' sản phẩm')
		}
	})
	//change main image
	$('.product-images-list__item img').click(function () {
		$('.product-images__main img').attr('src', $(this).attr('src'))
		$('.product-images__main figure').attr(
			'style',
			`background-image:url("${$(this).attr('src')}")`
		)
	})
	//set color
	$('.product-info-item-list__item').each(function () {
		$(this)
			.children('div')
			.css('background-color', $(this).children('div').attr('color'))
	})
})

//select quantity
$('#quantity').val(quantity)
function plusQuantity(n) {
	quantity += n
	if (quantity < 1) {
		quantity = 1
	}
	if (quantity > $('#quantity').attr('max')) {
		quantity = $('#quantity').attr('max')
	}
	// console.log(quantity)
	$('#quantity').val(quantity)
}

async function addCart() {
	if (size == undefined) {
		alert('Vui lòng chọn size!')
		return
	}
	if (color == undefined) {
		alert('Vui lòng chọn color!')
		return
	}

	if (size && color) {
		const data = await $.ajax({
			url: '/products/add',
			type: 'PUT',
			data: { idVariant, quantity },
		}).fail((err) => {
			const result = confirm('Vui lòng đăng nhập trước khi mua hàng')
			if (result) window.location.href = '/auth/login'

			return
		})
		if (data.status == 'success') {
			$('input#has_bought').prop('checked', true)
			alert('Thêm vào giỏ hàng thành công!!')
			if (data.isNew == true) {
				let numCart = $('.cart-num').text()
				if (numCart == '') {
					$('.cover-num').append('<a href="/cart" class="cart-num">1</a>')
				} else {
					$('.cart-num').text(parseInt(numCart) + 1)
				}
			}
		}
	}
}

function buyNow() {
	if($('input#has_bought').prop( "checked" ) == false){
		alert('Vui lòng thêm vào giỏ trước khi thanh toán')
	}else{
		window.location.href = '/cart'
	}
}

// pure image zoom
function zoom(e) {
	var zoomer = e.currentTarget
	e.offsetX ? (offsetX = e.offsetX) : (offsetX = e.touches[0].pageX)
	e.offsetY ? (offsetY = e.offsetY) : (offsetX = e.touches[0].pageX)
	x = (offsetX / zoomer.offsetWidth) * 100
	y = (offsetY / zoomer.offsetHeight) * 100
	zoomer.style.backgroundPosition = x + '% ' + y + '%'
}
