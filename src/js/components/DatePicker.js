import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';
import {select, settings} from '../settings.js';

class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date())); //zamiana daty na string
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input); //referencje do pola
    thisWidget.initPlugin();
  }
  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(); //obecna data przypisana do daty minimalnej
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture); // (obecna data, dodana ilość dni)
    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate, //domyślna data na aktualną
      minDate: thisWidget.minDate, //na aktualną datę
      maxDate: thisWidget.maxDate, 
      locale: {
        firstDayOfWeek: 1 //pierwszy dień tygodnia poniedziałek
      },
      disable: [
        function(date) {  //nieczynna w poniedziałki
          return (date.getDay() === 1);
        }
      ],
      onChange: function(selectedDates, dateStr) {  //aktualizacja
        thisWidget.value = dateStr;
      },
    });
  }
  parseValue(value){
    return value;
  }

  isValid(){  //poprawna czy nie
    return true;
  }

  renderValue(){

  }
}

export default DatePicker;
