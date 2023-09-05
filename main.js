//alert("JS is ready!")
var link = document.querySelector("link[rel~='icon']");
link.href = 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Color_icon_red.svg';

//get offer product 
const apiPopular = "https://blank-sunglasses.com/products/john.js";


//Code goes in DOM fully loaded
document.addEventListener("readystatechange", (event) => {
console.log("%cDOM fully loaded and parsed",  'color: blue');
 if (event.target.readyState === "complete") {
    initApp();
  }
});

function initApp(){
	setOfferProduct();
	makeScrolableShop();
}

function makeScrolableShop(){
	//get products
	//check page number in pagination
	let currentPage = 1;
	console.log("currentPage reseted", currentPage);
	
	var paginationNav = document.getElementsByClassName("Pagination__Nav")[0];
	if(paginationNav != null){
		paginationNav.style.display = "none";
	
	let pageSize = parseInt(paginationNav.lastChild.previousSibling.innerHTML);
		
	//dynamically adding url for new products 
	currentPage++;

	//sort changed
	var sort = document.getElementsByClassName("Popover__ValueList")[1];
	sort.childNodes.forEach((button) => {
			button.addEventListener('click', function(){
				currentPage = 1;
				console.log("sort clicked")
			})	
	});
		
	var collectionInnnerScroll = document.getElementsByClassName("CollectionInner__Products")[0];
	document.addEventListener('scroll', function (event) {
		throttle(() => {
		//scroll after past half products
		console.log(currentPage, window.scrollY,collectionInnnerScroll.offsetHeight, document.body.offsetHeight, window.innerHeight , window.pageYOffset )
		//remove pagination        				
		var paginationNav2 = document.getElementsByClassName("Pagination__Nav")[0];
        paginationNav2.style.display = "none";

		if(window.scrollY  >= collectionInnnerScroll.offsetHeight/2)
		{
        	//call more products
        	if(currentPage <= pageSize){
        		let urlNew = paginationNav2.firstChild.nextSibling.href;
				
        		//dynamically adding url for new products 
				urlNew = replaceUrlParam(urlNew, "page", currentPage);
				
        		console.log("scroll bottom", currentPage, pageSize,urlNew);
				addMoreProductsToGrid(urlNew);
			
				currentPage++;
        	}
        }
	}, 1000);
	});
	}
}


function parseHTML(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content;
}

var throttleTimer;
const throttle = (callback, time) => {
  if (throttleTimer) return;
  throttleTimer = true;
  setTimeout(() => {
    callback();
    throttleTimer = false;
  }, time);
};

function replaceUrlParam(url, paramName, paramValue)
{
    if (paramValue == null) {
        paramValue = '';
    }
    var pattern = new RegExp('\\b('+paramName+'=).*?(&|#|$)');
    if (url.search(pattern)>=0) {
        return url.replace(pattern,'$1' + paramValue + '$2');
    }
    url = url.replace(/[?#]$/,'');
    return url + (url.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue;
}

const loadMoreProducts = (url) =>
{
	return new Promise((resolve, reject) => {
    const httpReq = new XMLHttpRequest();
    httpReq.open("GET", url, true);
    httpReq.onreadystatechange = () => {
      if (httpReq.readyState === 4) {
        httpReq.status === 200
          ? resolve(httpReq.responseText)
          : reject(new Error("Error " + url));
      }
    };
    httpReq.send();
  });
}

function addMoreProductsToGrid(urlCollection){
	
	loadMoreProducts(urlCollection)
	.then((moreProducts) =>
	{
		//extract products from page
		var fromPos = moreProducts.indexOf('<div class="ProductList ProductList--grid ProductList--removeMargin Grid" data-mobile-count="2" data-desktop-count="4">');
		var toPos = moreProducts.indexOf('<div class="Pagination  Text--subdued">');
		var productListHtml = moreProducts.substring(fromPos+119, toPos-19); //+119
		
		const parser = new DOMParser(),
		dom = parser.parseFromString(productListHtml, "text/html");
		
		var productsGrid = document.getElementsByClassName("ProductList ProductList--grid ProductList--removeMargin Grid")[0];
		productsGrid.removeAttribute('data-desktop-count');
		
		for(let i = 0;i<dom.body.childNodes.length;i++){
			let product = dom.body.childNodes[i];
			
			product.firstChild.style = "visibility: inherit; opacity: 1; transform: matrix(1, 0, 0, 1, 0, 0)";

			productsGrid.appendChild(product.cloneNode(true));
		}

	});
}

function setOfferProduct(){
// Select the node that will be observed for mutations
var targetNode = document.getElementById("sidebar-cart");

var observer = new MutationObserver(mutationRecords => {
  var offerProduct = document.getElementById("most-popular-product-offer");
  
  if(document.getElementsByClassName("Cart__Empty Heading u-h5")[0] == null)
  {
  	console.log("--- CART IS FULL",offerProduct);
  	if(offerProduct != null)
  		offerProduct.style.display = "none";
  }else
  {
  	console.log("--- CART IS EMPTY ",offerProduct);
  	if(offerProduct != null)
  		offerProduct.style.display = "block";
  }
});

// observe everything except attributes
observer.observe(targetNode, {
	childList: true, // observe direct children
	subtree: true, // and lower descendants too
	characterDataOldValue: true // pass old data to callback
});


getPopularProduct(apiPopular)
  .then((popular) => {
var contentDrawer =  document.getElementsByClassName("Drawer Drawer--fromRight")[0];

var mostPopularFragment = createFragment(`
<div id="most-popular-product-offer" class="MostPopular_ProductOffer">
<div class="Drawer__Content" style="height: 200px;">
    <div class="Drawer__Container">
        <p class="Heading u-h5" style="text-align: center; margin-top: 5px;">Most popular</p>

        <div class="Cart__ItemList">
            <div class="CartItemWrapper">
                <div class="CartItem">
                    <div class="CartItem__ImageWrapper AspectRatio">
                        <div class="AspectRatio" style="--aspect-ratio: 1;">
                            <img id="most-popular-img" class="CartItem__Image" src="${popular.featured_image}" alt="${popular.title}" />
                        </div>
                    </div>

                    <form method="post" action="/cart/add" id="form_most_popular" accept-charset="UTF-8" enctype="multipart/form-data">
                        <input type="hidden" name="form_type" value="product" />
                        <input type="hidden" name="utf8" value="✓" />
                        <input id="qty_product" name="quantity" type="hidden" value="1">
                        <div class="MostPopularItem__Info">
                            <h2 class="CartItem__Title Heading">
                                <a href="${popular.url}">${popular.title}.</a>
                            </h2>

                            <!--<div class="CartItem__Meta Heading Text--subdued"><p class="CartItem__Variant">Black</p>-->

                            <div class="CartItem__PriceList">
                                <span class="CartItem__Price Price">KM ${(popular.price/100).toFixed(2)}</span>
                            </div>
                            <!--</div>-->

                            <select id="select-most-popular" name="id" title="Variant"> </select>

                            <div class="CartItem__Actions Heading Text--subdued" style="text-align: center;">
                                <div class="CartItem__QuantitySelector">
                                    <div class="QuantitySelector">
                                        <a class="QuantitySelector__Button Link Link--primary MostPopular_Quantity" id="qty_popular_minus" title="">
                                            <svg class="Icon Icon--minus" role="presentation" viewBox="0 0 16 2">
                                                <path d="M1,1 L15,1" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="square"></path>
                                            </svg>
                                        </a>

                                        <input type="text" name="updates[]" id="qty_popular_show" class="QuantitySelector__CurrentQuantity" pattern="[0-9]*" />

                                        <a class="QuantitySelector__Button Link Link--primary MostPopular_Quantity" id="qty_popular_plus" title="">
                                            <svg class="Icon Icon--plus" role="presentation" viewBox="0 0 16 16">
                                                <g stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="square">
                                                    <path d="M8,1 L8,15"></path>
                                                    <path d="M1,8 L15,8"></path>
                                                </g>
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                <div class="ProductForm__BuyButtons">
                                    <button type="submit" data-use-primary-button="true" class="ProductForm__AddToCart Button Button--primary Button--full MostPopular_Button" data-action="add-to-cart"><span>Add to cart</span></button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
`);
    
contentDrawer.insertBefore(mostPopularFragment, contentDrawer.childNodes[2])

//populate variants for offer product

var selectVariant = document.getElementById('select-most-popular');
popular.variants.forEach((variant) =>  {
var opt = document.createElement('option');
opt.value = variant.id;
opt.innerHTML = variant.title;
selectVariant.appendChild(opt);
});

selectVariant.addEventListener("click", function() {
	var val = selectVariant.options[selectVariant.selectedIndex].value;
	var variantImg =  popular.variants.find(x => x.id.toString() === val).featured_image.src;
	document.getElementById("most-popular-img").src = variantImg;
});


//set quantiy 
let counter = 1;
let qtyShow = document.getElementById('qty_popular_show');
let qtyMinus = document.getElementById('qty_popular_minus');
let qtyPlus = document.getElementById('qty_popular_plus');
let qtyProduct = document.getElementById('qty_product'); 
qtyShow.value = counter;

qtyPlus.addEventListener("click",()=>{
    counter++;
    qtyShow.value = counter;
    qtyProduct.value = counter; 
});
qtyMinus.addEventListener("click",()=>{
	if(counter > 1){
    	counter--;
	}
    qtyShow.value = counter;
    qtyProduct.value = counter; 
});
})
	
}

const getPopularProduct = (url) => {
  return new Promise((resolve, reject) => {
    const httpReq = new XMLHttpRequest();
    httpReq.open("GET", url, true);
    httpReq.onreadystatechange = () => {
      if (httpReq.readyState === 4) {
        httpReq.status === 200
          ? resolve(JSON.parse(httpReq.responseText))
          : reject(new Error("Error " + url));
      }
    };
    httpReq.send();
  });
};

function createFragment(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}
