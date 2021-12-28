/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };


  class Product{  //deklaracja klasy, konstruktor
    constructor(id, data){
      const thisProduct = this; 

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu(); //wywołąnia
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      /*console.log('new produkt:',thisProduct);*/
    }

    renderInMenu(){ //metoda renderInMenu
      const thisProduct = this;

      /*generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /*create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /*find menu continer*/
      const menuContainer = document.querySelector(select.containerOf.menu);
      /*add element to menu*/
      menuContainer.appendChild(thisProduct.element); 
    }

    getElements(){  /*dostęp do elementów*/
      const thisProduct = this;
      thisProduct.dom = {};
    
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      /*console.log('getElements:', thisProduct.priceEle);*/
    }

    initAccordion(){
      const thisProduct = this;
      /*console.log(' thisProduct:', thisProduct.element);*/
      /* find the clickable trigger (the element that should react to clicking) */
      /*const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);*/
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      /*console.log('clickableTrigger:', thisProduct.accordionTrigger);*/
      /* START: add event listener to clickable trigger on event click */
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault(); // wyłącz domyślną akcję do zdarzenia
        /* find active product (product that has active class) */ 
        const activeProduct = document.querySelector(select.all.menuProductsActive); 
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(activeProduct != null && activeProduct != thisProduct.element) { 
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive); 
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm(){ 
      const thisProduct = this;
      /*console.log('initOrderFrom:');*/

      thisProduct.form.addEventListener('submit', function(event){ //nasłuchiwanie submita
        event.preventDefault(); //blokowanie  domyślnych akcji
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); 
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price; //tworzymy zmienną w której będziemy przechowywać cenę

      // for every category (param)...
      for(let paramId in thisProduct.data.params) { //przejście po kategoriach
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId]; 
        //console.log('paramId:',paramId); //paramId np coffee sauce topping crust
        /*console.log('param:',param);*/

        // for every option in this category
        for(let optionId in param.options) {  //przejście po opcjach
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          /*console.log(option);*/ //options np.red pepers
          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if(optionSelected) {
            // check if the option is not default
            if(option.default !== true) {
              // add option price to price variable
              price += option.price;
            }
          } else {
            // check if the option is default
            if(option.default == true) {
            // reduce price variable
              price -= option.price;
            }
          }
          /* find images for .paramId-optionId*/
          const optionImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          /*const optionSelected = formData[paramId] && formData[paramId].includes(optionId);*/
          //check if the image is found
          if (optionImage) {
            //console.log(optionImage);
            //if clicked
            if (optionSelected) {
              //show image
              optionImage.classList.add(classNames.menuProduct.imageVisible); //dodaję klasę active do  zdjęcia
              //hide image 
            } else { 
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      /*multiply price by amount*/
      price *= thisProduct.amountWidget.value;
      //console.log('amountWidget.value',thisProduct.amountWidget.value);
      // update calculated price in the HTML
      thisProduct.dom.priceElem.innerHTML = price;
      /*single price */
      thisProduct.priceSingle = price;
    }

    /*class instance amountWidget */
    initAmountWidget(){ 
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
    }

    /*information about the products in the basket */
    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {};

      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = thisProduct.data.price;
      productSummary.params =thisProduct.prepareCartProductParams();
      
      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); //-------------
      const params = {};
      //console.log('formData', formData);

      // for every category (param)...
      for(let paramId in thisProduct.data.params) { //przejście po kategoriach
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId]; 
        //console.log('paramId:',paramId); //paramId np coffee sauce topping crust
        /*console.log('param:',param);*/
        params[paramId] = {
          label: param.label,
          options: {}
        };
        // for every option in this category
        for(let optionId in param.options) {  //przejście po opcjach
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          /*console.log(option);*/ //options np.red pepers
          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      //console.log('params:', params);
      return params;
    }
  }


  class AmountWidget{
    constructor(element){  
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);
    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input); //referencje do inputów
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    /*setting quantity*/
    setValue(value){
      const thisWidget = this;
      //conversion
      const newValue = parseInt(value); 
      /*TODO:Add validation */
      if(thisWidget.value !== newValue && !isNaN(newValue)&& newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){ 
        thisWidget.value = newValue; 
        thisWidget.announce();
        //console.log('newValue:',newValue);
      }
      thisWidget.input.value = thisWidget.value;
    }

    /*Reaction to events*/
    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    /*creating an instance of the event class */
    announce(){
      const thisWidget = this;
      const event = new CustomEvent('updated',{
        bubbles:true
      }); 
      thisWidget.element.dispatchEvent(event);
    }
  }


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
      thisCart.dom.productList = element.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      
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
    }

    add(menuProduct){
      const thisCart = this;
      //console.log('adding product',menuProduct);
      /* generate  HTML based on template*/
      const generatedHTML = templates.cartProduct(menuProduct);
      /* create element DOM */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new cartProduct (menuProduct,generatedDOM));
      //console.log('thisCart.products', thisCart.products);
      thisCart.update();
    }

    update(){
      const thisCart = this;
      /*delivery price */
      let deliveryFee = 2; //cena dostawy
      /*total for items */
      let totalNumber = 0; //całkowita ilość sztuk
      /*for all */
      let subtotalPrice = 0; //zsumowana cena za wszystko

      for(const product of thisCart.products){
        totalNumber = totalNumber + product.amount;//zwiększanie ilości sztuk
        subtotalPrice = subtotalPrice + product.price;//sumowanie ceny za wszystko
        //console.log('thisCart.products:',product);
      }

      /*no product, no cost */
      if (totalNumber === 0){
        deliveryFee = 0;
        thisCart.totalPrice = 0;
      } else {
        /*price of everything + delivery*/
        thisCart.totalPrice = subtotalPrice + deliveryFee;//thisCart.totalPrice tworzymy właściwość total price aby można jej użyć na zewnątrz
      }

      for (let price of thisCart.dom.totalPrice){
        price.innerHTML = thisCart.totalPrice;
      }
      
      console.log('deliveryfee, totalNumber, subtotalPrice, totalPrice:',deliveryFee, totalNumber, subtotalPrice,thisCart.totalPrice);
      thisCart.dom.deliveryFee.innerHTML = deliveryFee; 
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
    }

    /*product removal*/
    remove(removableProduct){
      const thisCart = this;
      /*index download */
      const indexToBeRemoved = thisCart.products.indexOf(removableProduct);
      thisCart.products.splice(indexToBeRemoved, 1);
      removableProduct.dom.wrapper.remove();
      console.log(removableProduct.dom.wrapper);
      thisCart.update();
    }
  }


  class cartProduct {
    constructor(menuProduct, element){   
      const thisCartProduct =this; 
      
      thisCartProduct.id = menuProduct.id; 
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.getElements(element); 
      thisCartProduct.initAmountWidget();
      thisCartProduct.initAction();

      //console.log('CartProduct:', thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
      
      //console.log('thisCartProduct.dom:', thisCartProduct);
    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value; 
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        //console.log('thisCartProduct:',thisCartProduct.price);
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove',{
        bubbles:true,
        detail: {
          cartProduct:thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log('it works');
    }

    initAction(){
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
  }


  const app = {
    initMenu: function(){ 
      const thisApp = this;
      /*console.log('thisApp.data:', thisApp.data);*/
      for(let productData in thisApp.data.products){ 
        new Product(productData, thisApp.data.products[productData]); 
      }
    },

    initData: function(){ 
      const thisApp = this;
      /*console.log(thisApp);*/
      thisApp.data = dataSource; 
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    }
    
  };
  
  app.init();
}

