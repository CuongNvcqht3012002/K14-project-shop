const urlSearchParams = new URLSearchParams(window.location.search)
const params = Object.fromEntries(urlSearchParams.entries())
var products, current, pages;
let type = [],
	color = [],
	size = [],
	page = 1,
	search = ''
	
if (params.type){ type = params.type.split(',')}
if (params.color){ color = params.color.split(',')}
if (params.size){ size = params.size.split(',')}
if (params.page) page = params.page
if (params.search) search = params.search

// //display filter box
$('.product-filter__toggle button').click(() => {
	$('.product-filter').addClass('active')
	$('.filter-overlay').addClass('active')
})
// // //hide filter box
$('.product-filter__close').click(() => {
	$('.filter-overlay').removeClass('active')
	$('.product-filter').removeClass('active')
})

$('.filter-overlay').click(() => {
	$('.product-filter').removeClass('active')
	$('.filter-overlay').removeClass('active')
})
// //display filter icon when scroll
window.addEventListener('scroll', () => {
	if (document.body.scrollTop > 75 || document.documentElement.scrollTop > 75) {
		$('.product-filter__toggle').addClass('sticky')
	} else {
		$('.product-filter__toggle').removeClass('sticky')
	}
})

// //delete all filter
$('.del-filter button').click(function () {
	// $('.custom-checkbox input').prop('checked', false)
	window.location.href = '/products'
})

// render follow page

function render(page) {
	$('.render-products').html('')
	$('.render-products').append('<div class="grid-rows"></div>')

    if(products.length == 0){
    	$('.product-content .grid-rows').append('<p style="font-size: 30px;">Không tìm thấy sản phẩm</p>')
		$('.pagination').html('');
	}else{
	products.forEach(product => {
		$('.product-content .grid-rows').append(`
            <div class="grid-col-3 md-grid-col-2">
                <div class="product-card pb-2">
                    <a href="/products/detail/${product._id}">
                        <div class="product-card__image">
                            <img src="${product.images[0]}" alt="" loading="lazy" />
                            <img src="${product.images[1]}" alt="" loading="lazy" />
                        </div>
                        <h3 class="product-card__name">${product.name}</h3>
                        <div class="product-card__price">${product.cost.toLocaleString()}</div>
                    </a>
                    <div class="product-card__btn">
                        <a href="/products/detail/${product._id}">
							<button class="btn btn-primary btn-small">
								<span class="btn-txt">Chọn mua</span>
								<span class="btn-icon">
									<i class="bx bx-cart bx-tada"></i>
								</span>
							</button>
						</a>
                    </div>
                </div>
            </div>
        `)
	})
		
	//pagination
	$('.pagination').html('');
	if(pages > 0){
		$('.pagination').append('<ul class="list-number__pages"></ul>');
		//first item
		if(current != 1){
			$('.list-number__pages').append(`
				<li>
					<a onclick="getProducts(${1})">First</a>
		  		</li>
			`)
		}

		//item
		var i = (Number(current) > 2 ? Number(current) - 1 : 1);
		if(i !== 1) {
			$('.list-number__pages').append(`
				<li class="disabled">
					<a>...</a>
				</li>
			`)
        }
		for(; i <= (Number(current) + 1) && i <= pages; i++) {
			if(i == current) {
				$('.list-number__pages').append(`
					<li class="active">
						<a onclick="getProducts(${i})">
						${i}
						</a>
					</li>`
				)
			} else {
				$('.list-number__pages').append(`
					<li>
						<a onclick="getProducts(${i})">
							${i}
						</a>
					</li>
				`)
			}
			if (i == Number(current) + 1 && i < pages) { 
				$('.list-number__pages').append(`
					<li class="disabled">
						<a>...</a>
					</li>
				`)
			}
		}

		//last item
		if(current != pages){
			$('.list-number__pages').append(`
				<li>
					<a onclick="getProducts(${pages})">Last</a>
		  		</li>
			`)
		}
	}

	}
	autoCheckInput()
}

$('.custom-checkbox input').change(async (e) => {
	// type
	type = []
	document
		.querySelectorAll('.product-filter-section__content.type input:checked')
		.forEach((item) => type.push(item.value))

	// refresh search = ''
	if(type.length > 0) search = ''

	// color
	color = []
	document
		.querySelectorAll('.product-filter-section__content.color input:checked')
		.forEach((item) => color.push(item.value))

	// size
	size = []
	document
		.querySelectorAll('.product-filter-section__content.size input:checked')
		.forEach((item) => size.push(item.value))
	
	page = 1
	getProducts(page)
})

function changeURL(url) {
	history.pushState(null, null, url)
}

function autoCheckInput() {
	// type
	type.forEach((item) => {
		$(`.product-filter-section__content.type input[value=${item}]`).prop(
			'checked',
			true
		)
	})
	// color
	color.forEach((item) => {
		$(`.product-filter-section__content.color input[value=${item}]`).prop(
			'checked',
			true
		)
	})
	// size
	size.forEach((item) => {
		$(`.product-filter-section__content.size input[value=${item}]`).prop(
			'checked',
			true
		)
	})
}

// // call api
async function getProducts(page) {
    showLazy()
	const url = `/products?page=${page}&type=${type}&color=${color}&size=${size}&search=${search}`
	const result = await $.ajax({
		url,
		type: 'post',
	})
	products = result.products;
	current = result.current;
	pages= result.pages;
    hideLazy()
	changeURL(`/products?search=${search}&page=${page}&type=${type}&color=${color}&size=${size}`)
	render(page)
}

getProducts(page)
