import {select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


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
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
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

    thisProduct.dom.form.addEventListener('submit', function(event){ //nasłuchiwanie submita
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
    const formData = utils.serializeFormToObject(thisProduct.dom.form); 
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
    /*single price */
    thisProduct.priceSingle = price; 
    /*multiply price by amount*/
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
    //console.log('amountWidget.value, price',thisProduct.amountWidget.value,price);
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
    //app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart',{
      bubbles:true,
      detail:{
        product:thisProduct,
      }
    });
    thisProduct.element.dispatchEvent(event);
  }

  /*information about the products in the basket */
  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {};

    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    productSummary.params =thisProduct.prepareCartProductParams();
    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
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

export default Product; //eksport obiektu czy klasy jako domyślnej