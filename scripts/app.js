
(function() {
  'use strict';


  var injectedOposiciones = {
    oposiciones: [
      { key: 'policia', label: 'POLICIA NACIONAL', icon: 'policia-nacional', plazas: 934 },
      { key: 'prisiones', label: 'FUNCIONARIO DE PRISIONES', icon: 'funcionario-prisiones', plazas: 285 },
      { key: 'magisterio', label: 'MAGISTERIO', icon: 'magisterio', plazas: 426 }, 
      { key: 'justicia', label: 'CUERPO DE TRAMITACION PROCESAL Y ADMINISTRATIVA', icon: 'justicia', plazas: 426 },
      { key: 'administrativo', label: 'GENERAL ADMINISTRATIVO DE LA ADMINISTRACION DEL ESTADO', icon: 'administrativo', plazas: 1245 }
    ]
  };
  
  var weatherAPIUrlBase = 'https://publicdata-weather.firebaseio.com/';

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  /* Event listener for refresh button */
  document.getElementById('butRefresh').addEventListener('click', function() {
    app.updateForecasts();
  });

  /* Event listener for add new city button */
  document.getElementById('butAdd').addEventListener('click', function() {
    // Open/show the add new city dialog
    app.toggleAddDialog(true);
  });

  /* Event listener for add city button in add city dialog */
  document.getElementById('butAddCity').addEventListener('click', function() {
    var select = document.getElementById('selectCityToAdd');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var label = selected.textContent;
    app.getForecast(key, label);
    app.selectedCities.push({key: key, label: label});
    app.toggleAddDialog(false);
  });

  /* Event listener for cancel button in add city dialog */
  document.getElementById('butAddCancel').addEventListener('click', function() {
    app.toggleAddDialog(false);
  });


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function (data) {
    for (var i = 0; i < data.oposiciones.length; i++) {
      var card = app.visibleCards[data.oposiciones[i].key];
      if (!card) {
        card = app.cardTemplate.cloneNode(true);
        card.classList.remove('cardTemplate');
        card.querySelector('.location').textContent = data.oposiciones[i].label;
        card.removeAttribute('hidden');
        app.container.appendChild(card);
        app.visibleCards[data.oposiciones[i].key] = card;
      }
      card.querySelector('.current .icon').classList.add(data.oposiciones[i].icon);
      card.querySelector('.current .plazas .value').textContent = data.oposiciones[i].plazas;
    }
    
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };


  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  // Gets a forecast for a specific city and update the card with the data
  app.getForecast = function(key, label) {
    var url = weatherAPIUrlBase + key + '.json';
    // Make the XHR to get the data, then update the card
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          response.key = key;
          response.label = label;
          app.updateForecastCard(response);
        }
      }
    };
    request.open('GET', url);
    request.send();
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateForecasts = function() {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function(key) {
      app.getForecast(key);
    });
  };

  app.updateForecastCard(injectedOposiciones);

})();
