const idProductCode = (window.location.pathname).slice(17)
var listVariants = [];
var quantity = 1;
var color, size;
var idVariant;
$.ajax({
    url:`/products/detail?productCodeId=${idProductCode}`,
    type: 'POST',
})
.then(res => {
    listVariants = res.listVariants;
})
.catch(err => {
    console.log(err)
})

$(document).ready(function(){
// toggle expand product description
    $(".product-description__toggle").click(function(){
        $('.product-description').toggleClass('expand')
        $(this).toggleClass("expand");
     });
//select size and color
    $(".product-info-item-list__item").click(function(){
        quantity = 1;
        $('#quantity').val(quantity)
        $(this).addClass("active")
        $(this).siblings().removeClass('active')
        if($(this).children('input').attr('name') == 'color'){
            let currColor = $(this).children('input').val()
            color = currColor;
            const displayVariant = listVariants.filter(variant => variant.color === currColor)
            const displaySize = displayVariant.map(variant => variant.size)
            $('input[name="size"]').each(function(){
                    $(this).parent('.product-info-item-list__item').css('display','flex')
            })
            $('input[name="size"]').each(function(){
                if(displaySize.indexOf($(this).val()) == -1){
                    $(this).parent('.product-info-item-list__item').css('display','none')
                }
            })
        }
        if($(this).children('input').attr('name') == 'size'){
            $('.product-info-item-quantity__input input').val(1)
            let currSize = $(this).children('input').val()
            size = currSize;
            const displayVariant = listVariants.filter(variant => variant.size === currSize)
            const displayColor = displayVariant.map(variant => variant.color)
            $('input[name="color"]').each(function(){
                    $(this).parent('.product-info-item-list__item').css('display','flex')
            })
            $('input[name="color"]').each(function(){
                if(displayColor.indexOf($(this).val()) == -1){
                    $(this).parent('.product-info-item-list__item').css('display','none')
                }
            })
        }

        if(size && color){
            const currVariant = listVariants.filter(variant => variant.size === size && variant.color === color)
            idVariant = currVariant[0]._id
            $('#quantity').attr('max', currVariant[0].total);
        }
    })
//change main image
    $('.product-images-list__item img').click(function(){
        $('.product-images__main img').attr("src", $(this).attr("src"))
        $('.product-images__main figure').attr("style",`background-image:url("${$(this).attr('src')}")`)
    })
//set color 
    $('.product-info-item-list__item').each(function(){
        $(this).children('div').css("background-color",$(this).children('div').attr("color"))
    })

});

 //select quantity
 $('#quantity').val(quantity);
 function plusQuantity(n){
    quantity+= n;
    if(quantity < 1){
         quantity = 1
    }
     if(quantity > $('#quantity').attr('max')){
         quantity = $('#quantity').attr('max')
     }
    console.log(quantity)
    $('#quantity').val(quantity)
 }

async function addCart() {
        if(size == undefined){
            alert("Vui lòng chọn size!")
            return
        }
        if(color == undefined){
            alert("Vui lòng chọn color!")
            return
        }
        if(size && color){
            const data = await $.ajax({
                url: '/products/add',
                type: 'PUT',
                data: { idVariant, quantity},
            })
            if(data.status == 'success'){
                alert('Thêm vào giỏ hàng thành công!!')
            }
            if(data.isNew){
                let numCart = $('.cart-num').text()
                $('.cart-num').text(parseInt(numCart) + 1)
            }
        }
}

function buyNow() {
    window.location.href = '/cart'
}
 

// pure image zoom
function zoom(e){
    var zoomer = e.currentTarget;
    e.offsetX ? offsetX = e.offsetX : offsetX = e.touches[0].pageX
    e.offsetY ? offsetY = e.offsetY : offsetX = e.touches[0].pageX
    x = offsetX/zoomer.offsetWidth*100
    y = offsetY/zoomer.offsetHeight*100
    zoomer.style.backgroundPosition = x + '% ' + y + '%';
}