import{templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element); //wywołania
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initTables();
  }

  getData(){ //pobiera dane z api
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate); //początek zakresu, konwersja na tekst
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate); //końcowa data za 2 tyg.

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getDate params',params);

    const urls = {
      bookings:       settings.db.url + '/' + settings.db.booking + '?' + params.bookings.join('&'), //wszystkie elementy tablicy booking mają zostać połączone za pomocą znaku &
      eventsCurrent:  settings.db.url + '/' + settings.db.event   + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event   + '?' + params.eventsRepeat.join('&'),
    };
    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponse){ 
        const bookingsResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventsRepeatResponse = allResponse[2];
        return Promise.all ([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings,eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings,eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};//obiek zajentości stolików

    for(let item of bookings){ 
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){ //pentla po wyrażeniach jednorazowych
      thisBooking.makeBooked(item.date, item.hour, item.duration,item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    //console.log(thisBooking.datePicker.maxDate);

    for(let item of eventsRepeat){ //pentla po wyrażeniach cyklicznych
      if(item.repeat == 'daily'){
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate,1)){ //addDays dodaje dzień
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration,item.table);
        }
      }
    }
    //console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date,hour, duration, table) {
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){ //jeśli obiekt nie istnieje o nazwie data
      thisBooking.booked[date] = {}; //stwórz go
    }

    const startHour = utils.hourToNumber(hour); //konwersja godziny z np.12:30 na 12:5

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5){
      //console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){ //jeśli tablica  z godz nie istnieje
        thisBooking.booked[date][hourBlock] = []; //stwórz ją
      }
      thisBooking.booked[date][hourBlock].push(table); //przypisanie stolika do godz
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value; 
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value); //wybrane przez urzytkownika
    //console.log(thisBooking.hour);



    let allAvailable = false; // dostępność stolików

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined' // jeśli dla tej daty nie ma obiektu
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'//lub dla daty i godziny nie ma tablicy
    ){
      allAvailable = true; //stoliki dosępne
    }
    for (let table of thisBooking.dom.tables){  //interacja po wszystkich stolikach
      let tableId = table.getAttribute(settings.booking.tableIdAttribute); //pobranie id stolika
      if(!isNaN(tableId)){ //sprawdzenie czy jest liczbą
        tableId = parseInt(tableId); //konwersja
      }
      if(
        !allAvailable //czy stolik zajęty
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) //cz w tym dniu o tej godz jest zajęty stolik o id
      ){
        table.classList.add(classNames.booking.tableBooked); //dodaj klase
      }else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
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
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper); 
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.form = element.querySelector(select.booking.form);
    console.log(select.booking.form);
    thisBooking.dom.floorPlan = element.querySelector(select.booking.floorPlan);
    thisBooking.dom.address = element.querySelector(select.cart.address);
    thisBooking.dom.phone = element.querySelector(select.cart.phone);
    thisBooking.dom.starters = element.querySelectorAll(select.booking.starters);
    
    
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount); //nowa instancja
    thisBooking.dom.peopleAmount.addEventListener('updated',function(){ //nasłuchiwanie na zmiany ilości osób
    });
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated',function(){
    });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker); 
    thisBooking.dom.datePicker.addEventListener('updated', function(){  // nasłuchiwanie data
    });
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker); 
    thisBooking.dom.hourPicker.addEventListener('updated',function(){  // nasłuchiwanie godzina
    });

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.deleteSelected();
      thisBooking.updateDOM();

    });

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
      
    });
    
  }

  initTables(){
    const thisBooking = this;
    thisBooking.dom.floorPlan.addEventListener('click', function (event) {
      event.preventDefault();

      const clicked = event.target;
      thisBooking.tableAttribute = clicked.getAttribute(settings.booking.tableIdAttribute);
      
      if (thisBooking.tableAttribute) { //jeśli kliknięty 
        thisBooking.clickedTable = parseInt(thisBooking.tableAttribute);
        const TableBooked = clicked.classList.contains(classNames.booking.tableBooked);
        const TableSelected = clicked.classList.contains(classNames.booking.tableSelected);
        
        if (!TableBooked && !TableSelected) {// niezarezerwowany nie wybrany
          thisBooking.deleteSelected();
          clicked.classList.add(classNames.booking.tableSelected);
          thisBooking.tableNumber = thisBooking.clickedTable;

        }
        
        else if (!TableBooked && TableSelected) { //wybrany wcześniej niezarezerwowany
          thisBooking.deleteSelected();
        }
        
        else if (TableBooked) { //jeśli zarezerwowany
          alert('This table is reserved');
        }
      }
    });
  }

  deleteSelected(){
    const thisBooking = this;
    
    const clickedTables = document.querySelectorAll('.selected');
    //console.log('clickedTables',clickedTables);
    for( let clicked of clickedTables){
      //console.log('click',clicked);
      clicked.classList.remove(classNames.booking.tableSelected); //usuń klasę
    }
    //console.log('clickedTables',thisBooking.clickedTables);
    delete thisBooking.clickedTable; 
  }

  sendBooking(){  //wysyła dane rezerwacji
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const reservation = {
      date: thisBooking.datePicker.value, 
      hour: thisBooking.hourPicker.value,
      table: thisBooking.clickedTable,
      duration: parseInt(thisBooking.peopleAmount.value), 
      ppl: parseInt(thisBooking.hoursAmount.value),
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    for (let starter of thisBooking.dom.starters) {    
      //console.log('starter',starter);
      if (starter.checked === true) { // jeśli zaznaczony dodaj
        reservation.starters.push(starter.value);
      }
    }

    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservation),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });


  }

}

export default Booking;