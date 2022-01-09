import {settings,select, classNames} from './settings.js'; //{} - aby wydobyć obiekty z pliku, kiedy importujemy kilka elementów i nie są domyślne
import Product from './components/Product.js'; //tyklo klasa obiekt funkcja mogą być importowane bez nawiasów
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function(){
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;// odnalezienie kontenera wszystkich stron, dzięki children odnalezione wszystkie dzieci(order Booking)
    thisApp.navLinks = document.querySelectorAll(select.nav.links); //odnalezienie wszystkich linków
    
    const idFromHash = window.location.hash.replace('#/',''); //wydobycie hash i podmiana #/
    //console.log('idFromHash',idFromHash);
    
    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    //console.log('pageMatchingHash',pageMatchingHash);
    thisApp.activatePage(pageMatchingHash); //aktywacja strony domyślnej dzięki metodzie, pierwszą znalezioną w thisApp.pages
    //console.log('thisApp.pages:', thisApp.pages[0].id);


    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        //get page id from href attribute 
        const id = clickedElement.getAttribute('href').replace('#',''); //wydobycie id z atrybutu href klikniętego elementu i podmiana # na pusty ciąg znaków
        //console.log(clickedElement,id);
        //run thisApp.activatePage with that id 
        thisApp.activatePage(id);

        //change URL hash 
        window.location.hash  = '#/' + id; //zmiana hash /- po to aby nie odnajdywał podobnyh id i nie przewijał strony
      });
    }
  },

  activatePage:function(pageId){
    const thisApp = this;
    //add class "active" to matching pages, remove from non-matching 
    for(let page of thisApp.pages){ // przejście po kontenerach stron
      page.classList.toggle(classNames.pages.active, page.id == pageId); //dodaje i usuwa klasę active w zalerzności od warunku page.id == pageId
    }
    //add class "active" to matching links, remove from non-matching 
    for(let link of thisApp.navLinks){ // przejście po kontenerach stron
      link.classList.toggle(  //dodaje i usuwa klasę (zdefiniowaną w className.nav.active) active w zalerzności od warunku 
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId //warunek
      ); 
      //console.log(link.classList);
    }

  },

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
    //console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  init: function(){
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initPages();

    thisApp.initData();
    
    thisApp.initCart();
    thisApp.initBooking();
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

  initBooking: function(){
    const thisApp = this;
    thisApp.bookingWrapper = document.querySelector(select.containerOf.booking);
    thisApp.bookingWidget = new Booking(thisApp.bookingWrapper); 

  }
    
};
  
app.init();


