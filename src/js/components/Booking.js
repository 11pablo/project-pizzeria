import{templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element); //wywołania
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;
    //generate HTML based on template
    const generatedHTML = templates.bookingWidget();// generowanie kodu za pomocą szablonu t.b
    //create an empty object
    thisBooking.dom = {};
    //add wrapper to the object
    thisBooking.dom.wrapper = element;
    //change innerHTML to generatedHTML 
    thisBooking.dom.wrapper.innerHTML = generatedHTML;//zmiana zawartości wrappera na wygenerowany szablon

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);//dostęp do inputów
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount); //nowa instancja
    thisBooking.dom.peopleAmount.addEventListener('updated',function(){ //nasłuchiwanie na zmiany ilości osób
    });
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated',function(){
    });
  }

}

export default Booking;