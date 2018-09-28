import document from "document";
import clock from "clock";
import userActivity from "user-activity";
import { display } from "display";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import * as battery from "battery";
import * as heartMonitor from "hrm";
import * as util from "../common/utils";
import { locale } from "user-settings";

// Set up all necessary variables
let clockTextH   = document.getElementById("clockTextH");
let clockTextM   = document.getElementById("clockTextM");
let clockTextS   = document.getElementById("clockTextS");
let clockTextP   = document.getElementById("clockTextP");
clock.granularity = "seconds";
let date         = document.getElementById("date");

let dataTypes     = [ "steps", "distance", "calories",
                      "elevationGain", "activeMinutes" ];
let dataProgress  = [];
let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let getCurrentDataProgress = function(dataType) {
  let dataContainer = document.getElementById(dataType);
  return {
    dataType: dataType,
    dataContainer: dataContainer,
    arcBack: dataContainer.getElementById("arcBack"),
    arcFront: dataContainer.getElementById("arcFront"),
    dataCount: dataContainer.getElementById("dataCount"),
    dataIcon: dataContainer.getElementById("dataIcon"),
  }
}

for(var i=0; i < dataTypes.length; i++) {
  var currentData = dataTypes[i];
  dataProgress.push(getCurrentDataProgress(currentData));
}

// Refresh data, all other logic is in separate files
function refreshData(type) {
  let currentType = type.dataType;
  
  let currentDataProg = (userActivity.today.adjusted[currentType] || 0);
  let currentDataGoal = userActivity.goals[currentType];
  
  let currentDataArc = (currentDataProg / currentDataGoal) * 360;
  
  if (currentDataArc > 360) {
    currentDataArc = 360;
    type.arcFront.style.fill = "lightgreen";
    type.arcFront.arcWidth = 5;
  }
  else {
    if(currentType==="steps") {
      type.arcFront.style.fill = "lightblue";
    }
    if(currentType==="distance") {
      type.arcFront.style.fill = "green";    
    }
    if(currentType==="calories") {
      type.arcFront.style.fill = "orange";    
    }
    if(currentType==="elevationGain") {
      type.arcFront.style.fill = "red";    
    }
    if(currentType==="activeMinutes") {
      type.arcFront.style.fill = "yellow";    
    }
  }
  
  if(currentType==="distance") {
    currentDataProg = (currentDataProg * 0.000621371192).toFixed(2);
  }
  if(currentType==="steps") {
    if (currentDataArc===360) {
      type.dataCount.style.fill = "lightgreen";
      currentDataProg = currentDataProg - userActivity.goals[currentType];
      currentDataProg = `+${currentDataProg}`;
    }
    else {
      type.dataCount.style.fill = "lightblue";
    }
  }
  
  type.arcFront.sweepAngle = currentDataArc;
  type.dataCount.text = currentDataProg;
}

function refreshAllData() {
  for(var i=0; i<dataTypes.length; i++) {
    refreshData(dataProgress[i]);
  }
}

clock.ontick = evt => {
  let today = evt.date;
  let hours = today.getHours();
  let mins  = util.zeroPad(today.getMinutes());
  let secs  = util.zeroPad(today.getSeconds()); 
  
  if (hours < 13) {
    clockTextP.text = 'am';
  }
  if (hours > 12) {
    clockTextP.text = 'pm';
    hours -= 12;
  } else if (hours == 0) {
    hours += 12;
    clockTextP.text = 'am';
  }
  
  clockTextH.text = `${hours}`;
  clockTextM.text = `${mins}`;
  clockTextS.text = `${secs}`;

  let day      = today.getDate();
  let dow      = days[today.getDay()];
  date.text = dow + '  ' + day;
  
  battery.setLevel();
  
  refreshAllData();
}

heartMonitor.initialize();
