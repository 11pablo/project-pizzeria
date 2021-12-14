/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{  //deklaracja klasy - konstruktor
    constructor(id, data){
      const thisProduct = this; //na metodę app

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu(); // uruchomi funkcję po utworzeniu instancji

      console.log('new produkt:',thisProduct);
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
  }

  const app = {
    initMenu: function(){ //deklaracja metody app init menu
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      for(let productData in thisApp.data.products){ 
        new Product(productData, thisApp.data.products[productData]); //tworzenie nowej instancji dla karzdego produktu, przkazujemy nazwę włąściwości(produktu) ale i obiekt kktury się pod nią kryje
      }
      
      /*const testProduct = new Product();
      console.log('testProduct:', testProduct);*/
    },

    initData: function(){ //metoda przygotowywuje dostęp do danych z obiektu dataSource
      const thisApp = this;
      console.log(thisApp);
      thisApp.data = dataSource; //przez referencje
      

      
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    }
  };
  
  app.init();
}
