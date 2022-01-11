import{select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget { //AmountWidget (dziedzicząca) jest rozszerzenie klasy baseWidget 
  constructor(element) {  
    super(element,settings.amountWidget.defaultValue); // oznacza konstruktor klasy nadrzędnej BaseWidget
    const thisWidget = this;
    thisWidget.getElements(element);
    
    thisWidget.initActions();

    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input); //referencje do inputów
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    thisWidget.value = settings.amountWidget.defaultValue; 
  }

  

  isValid(value) { //sprawdza czy podana wartość jest prawidłowa
    return !isNaN(value) //sprawdza czy value nie jest nie liczbą
     && value >= settings.amountWidget.defaultMin 
     && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){ //wyświetlenie bierzącej wartości value
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  /*Reaction to events*/
  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function () {
      thisWidget.value(thisWidget.dom.input.value); 
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  /*creating an instance of the event class */
  announce(){
    const thisWidget = this;
    const event = new Event('updated',{
      bubbles:true
    }); 
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default AmountWidget;