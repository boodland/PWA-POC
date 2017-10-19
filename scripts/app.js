
(function() {
  'use strict';


  var injectedOposiciones = [
      { key: 'policia', label: 'POLICIA NACIONAL', icon: 'policia-nacional', plazas: 934 },
      { key: 'prisiones', label: 'FUNCIONARIO DE PRISIONES', icon: 'funcionario-prisiones', plazas: 285 },
      { key: 'magisterio', label: 'MAGISTERIO', icon: 'magisterio', plazas: 426 }, 
      { key: 'justicia', label: 'CUERPO DE TRAMITACION PROCESAL Y ADMINISTRATIVA', icon: 'justicia', plazas: 729 },
      { key: 'administrativo', label: 'GENERAL ADMINISTRATIVO DE LA ADMINISTRACION DEL ESTADO', icon: 'administrativo', plazas: 1245 }
  ];
  
  var preparadoresAPIUrlBase = 'https://randomuser.me/api/?results=';

  var app = {
    isLoading: false,
    visibleCards: {},
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container')
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  /* Event listener for refresh button */
  document.getElementById('butRefresh').addEventListener('click', function() {
    app.updateOposiciones();
  });

  /* Event listener for add new city button */
  document.getElementById('butAdd').addEventListener('click', function() {
    // Open/show the add new city dialog
    app.toggleAddDialog(true);
  });

  /* Event listener for add city button in add city dialog */
  document.getElementById('butAddOposicion').addEventListener('click', function() {
    var select = document.getElementById('selectOposicionToAdd');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    app.getOposicion(key);
    app.toggleAddDialog(false);
  });

   /* Event listener for remove city button in add city dialog */
  document.getElementById('butRemoveOposicion').addEventListener('click', function() {
    var select = document.getElementById('selectOposicionToAdd');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var card = app.visibleCards[key];
    if (card) {
      card.remove();
      delete app.visibleCards[key];
    }
    app.removeUnselectedOposicion(key);
    app.toggleAddDialog(false);
  });

  /* Event listener for cancel button in add city dialog */
  document.getElementById('butAddCancel').addEventListener('click', function() {
    app.toggleAddDialog(false);
  });

  document.addEventListener('DOMContentLoaded', function () {
    app.loadSelectedOposiciones();
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
  app.updateOposicionCard = function (data) {
    var card = app.visibleCards[data.key];
    if (!card) {
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.querySelector('.title').textContent = data.label;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[data.key] = card;
    }
    card.querySelector('.oposicion-container .icon').classList.add(data.icon);
    card.querySelector('.oposicion-container .plazas .value').textContent = data.plazas;
    var preparadores = card.querySelectorAll('.preparador');
    for (var i = 0; i < preparadores.length; i++){
      preparadores[i].querySelector('.icon').style.backgroundImage = "url('" + data.preparadores[i].picture.medium + "')";
      preparadores[i].querySelector('.prep-name').textContent = data.preparadores[i].name.first;
      preparadores[i].querySelector('.location').textContent = data.preparadores[i].location.city;
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
  app.getOposicion = function (key) {
    var oposicion = injectedOposiciones.find(opo=>opo.key === key);
    var url = preparadoresAPIUrlBase + '3';
    // Make the XHR to get the data, then update the card
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          oposicion.preparadores = response.results;
          app.saveSelectedOposicion(oposicion);
          app.updateOposicionCard(oposicion);
        }
      }
    };
    request.open('GET', url);
    request.send();
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateOposiciones = function() {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function(key) {
      app.getOposicion(key);
    });
  };

  app.saveSelectedOposicion = function (oposicion) {
    localforage.setItem(oposicion.key, oposicion);
  };

  app.removeUnselectedOposicion = function (key, order) {
    localforage.removeItem(key);
  }

  app.loadSelectedOposiciones = function () {
    localforage.iterate(function (value, key, iterationNumber) {
      app.updateOposicionCard(value);
    })
  };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker
      .register('./service-worker.js')
      .then(function() { 
         console.log('Service Worker Registered'); 
       });
    });
  }
  
})();
