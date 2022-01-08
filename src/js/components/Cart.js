import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor (element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElement(element);
    thisCart.initActions();

    //console.log(element);
    //console.log('newCard', thisCart);
  }

  getElement(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    //access to html elements
    thisCart.dom.toggleTrigger= thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    
    //console.log('thisCart.dom.deliveryFee',thisCart.dom.deliveryFee);
  }

  initActions(){
    const thisCart = this;
    /*listening for events */
    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      /* toggle active class on thisCart.dom.wrapper */
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    /*if product quantity change update */
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct){
    const thisCart = this;
    //console.log('adding product',menuProduct);
    /* generate  HTML based on template*/
    const generatedHTML = templates.cartProduct(menuProduct);
    /* create element DOM */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct (menuProduct,generatedDOM));
    //console.log('add thisCart.products', thisCart.products);
    thisCart.update();
  }

  update(){
    const thisCart = this;
    /*delivery price */
    thisCart.deliveryFee = 2; //cena dostawy
    /*total for items */
    thisCart.totalNumber = 0; //całkowita ilość sztuk
    /*for all */
    thisCart.subtotalPrice = 0; //zsumowana cena za wszystko

    for(const product of thisCart.products){
      thisCart.totalNumber +=  product.amount;//zwiększanie ilości sztuk
      thisCart.subtotalPrice += product.price;//sumowanie ceny za wszystko
    //console.log('subtotalPrice',product.price);
    }

    /*no product, no cost */
    if (thisCart.totalNumber === 0){
      thisCart.deliveryFee = 0;
      thisCart.totalPrice = 0;
    } else {
    /*price of everything + delivery*/
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;//thisCart.totalPrice tworzymy właściwość total price aby można jej użyć na zewnątrz
    }
    
    for (let price of thisCart.dom.totalPrice){
      price.innerHTML = thisCart.totalPrice;
    }
    
    console.log('deliveryfee, totalNumber, subtotalPrice, totalPrice:',thisCart.deliveryFee, thisCart.totalNumber, thisCart.subtotalPrice, thisCart.totalPrice);
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee; 
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
  }

  /*product removal*/
  remove(removableProduct){
    const thisCart = this;
    /*index download */
    const indexToBeRemoved = thisCart.products.indexOf(removableProduct);
    thisCart.products.splice(indexToBeRemoved, 1);
    removableProduct.dom.wrapper.remove();
    //console.log(removableProduct.dom.wrapper);
    thisCart.update();
  }

  /*collecting and sending */
  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value, 
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };
    console.log('phone',payload.phone);
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
    /*sending*/
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', //wysłanie danych w postaci JSON
      },
      /*change the playback format */
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }
}

export default Cart;