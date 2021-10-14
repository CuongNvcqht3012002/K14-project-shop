let detailProducts = []
let lisData = undefined
let totalProduct = 0
let totalPrice = 0

let addCartInfo = () => {
	document.querySelector('.cart__info__txt').innerHTML += `
  <p>
      Bạn đang có
      <span>${totalProduct}</span>
      sản phẩm trong giỏ hàng
  </p>
  <div class="cart__info__txt__price">
      <span>Thành tiền:</span>
      <span>${totalPrice} VNĐ</span>
  </div>
  `
}
let i = 0
let addCartList = (product, index) => {
	i++
	document.querySelector('.cart__list').innerHTML += `
    <div class="cart__item">
    <div class="cart__item__image">
        <img src="${product.idProductCode.images[0]}" alt="">
    </div>
      <div class="cart__item__info">
          <div class="cart__item__info__name">
              <a href="${product._id}">${product.idProductCode.name}</a>
          </div>
          <div class="cart__item__info__price">${
						product.idProductCode.cost * listData[index].quantity
					}</div>
          <div class="cart__item__info__quantity">
              <div class="product__info__item__quantity">
                  <div class="product__info__item__quantity__btn dec__btn">
                      <i class="bx bx-minus"></i>
                  </div>
                  <div class="product__info__item__quantity__input">${
										listData[index].quantity
									}</div>
                  <div class="product__info__item__quantity__btn inc__btn">
                      <i class="bx bx-plus"></i>
                  </div>
              </div>
          </div>
          <div class="cart__item__del">
              <i class="bx bx-trash"></i>
          </div>
      </div>
    </div>
    `
	totalPrice += product.idProductCode.cost * listData[index].quantity
	// console.log(totalPrice)
	if (i == listData.length) {
		addCartInfo()
		i = 0
	}
}

async function render() {
	// bien du lieu
	listData = JSON.parse(localStorage.getItem('listData')) || []

	listData.forEach((item) => {
		totalProduct += item.quantity
	})
	// console.log(totalProduct)

	listData.forEach(async (item, index) => {
		const result = await $.ajax({
			url: `/products/api/${item.productId}`,
			type: 'GET',
		})

		detailProducts.push(result)
		// console.log(result)
		addCartList(result.data.product, index)
	})
}

// console.log(98, totalPrice)
render()

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }


const btn_order = document.querySelector('.btn-order')
btn_order.addEventListener('click', (e) => {
	e.preventDefault()
	window.location.href = '/checkout'

    // call api -> dang nhap
    // check cookies
    // console.log(document.cookie)
    // const tokenId = getCookie('tokenId')
    // // console.log(tokenId)

    // if(!tokenId) {
    //     window.location.href = '/users/login'
    // }
})



/*
+ Đã đăng nhập -> ấn chọn sản phẩm -> lưu vào cart db, vào trang cart, product ton kho -> render + đọc bảng cart -> ấn đặt hàng -> render trang đặt hàng


+ Chưa đăng nhập -> ấn chọn sản phẩm, số lượng (thông tin sản phẩm, total) -> lưu vào localStorage -> vào trang cart + đọc local -> login(nhận local + id) => lưu cart -> ấn đặt hàng 
*/






const btn_cart = document.querySelector('.btn-cart')
btn_cart.addEventListener('click', (e) => {
	e.preventDefault()
	window.location.href = '/'
})