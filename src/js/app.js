import {settings,select} from './settings.js'; //{} - aby wydobyć obiekty z pliku, kiedy importujemy kilka elementów i nie są domyślne
import Product from './components/Product.js'; //tyklo klasa obiekt funkcja mogą być importowane bez nawiasów
import Cart from './components/Cart.js';

const app = {
  initMenu: function(){ 
    const thisApp = this;
    /*console.log('thisApp.data:', thisApp.data);*/
    for(let productData in thisApp.data.products){ 
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){ 
    const thisApp = this;
    /*console.log(thisApp);*/
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products; //zapis do stałej adresu endopointu

    fetch(url)
      .then(function (RawResponse) {
        return RawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  init: function(){
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initData();
    
    thisApp.initCart();
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
    
};
  
app.init();


