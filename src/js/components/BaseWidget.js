class BaseWidget { //klasa nadrzędna
  constructor(wrapperElement,initialValue){ //element dom z widgetem, początkowa wartość widgetu
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
    //console.log('wrapperElement,initialValue', wrapperElement, initialValue);
  }

  get value(){ // metoda wykonywana przy prubie odczytu value, żeczywista wartość nie może być przechowywana we właściwości  thisWidget.value potrzebna inna nazwa, zagrożenie pętlą
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  /*setting quantity*/
  set value(value){ //wykonywana w trakcie pruby ustawienia wartości
    const thisWidget = this;
    //conversion
    const newValue = thisWidget.parseValue(value); 
    /*TODO:Add validation */
    if(thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)){ //jeśli nowa wartość nie równa starej to 
      thisWidget.correctValue = newValue; 
      thisWidget.announce();
    //console.log('newValue:',newValue);
    }
    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;
    thisWidget.value = value;
  }

  parseValue(value) { //przekształca na odpowiedni typ lub format liczbowy
    return parseInt(value);
  }

  isValid(value) { //sprawdza czy podana wartość jest prawidłowa
    return !isNaN(value); //sprawdza czy value nie jest nie liczbą
  }

  renderValue(){ //wyświetlenie bierzącej wartości value
    const thisWidget = this;
    console.log('value', thisWidget.value);
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce(){
    const thisWidget = this;
    const event = new CustomEvent('updated',{
      bubbles:true
    }); 
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;