/*=========================================================================================
	Item Name: Open Street Map Stand
    Module: scripts.js
	Version: 1.0
	Author: Sergey Patokin
    Last Update: 02.08.2024
	Author URL: https://sergeyforever.online/
    Landscape GeoJson Map: https://overpass-turbo.eu/#
    Landscape Depth Map: https://portal.opentopography.org/apidocs/#/Public/getGlobalDem
===========================================================================================*/


// Function to toggle the Arrow Widget
function toggleWidget(arrowID, widgetID) {

  const arrow = document.getElementById(arrowID);
  const widget = document.getElementById(widgetID);

  if (widget.classList.contains('active')) {
    widget.classList.remove('active');
    widget.style.animation = 'fadeOut 0.5s ease-in-out forwards';
    setTimeout(() => {
      widget.style.display = 'none';
    }, 500);
  } else {
    //widget.style.cursor = 'pointer';
    widget.style.display = 'block';
    widget.classList.add('active');
    widget.style.animation = 'fadeIn 0.5s ease-in-out forwards';
  }

  arrow.classList.toggle('active');

}

if(window.innerWidth > 1000) toggleWidget('arrow', 'widget');