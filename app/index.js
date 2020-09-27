import document from "document";
import clock from "clock";
import userActivity from "user-activity";
import { display } from "display";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import * as battery from "./battery";
import * as heartMonitor from "./hrm";
import * as util from "../common/utils";
import { locale } from "user-settings";
import { me } from "appbit";

// Set up all necessary variables
let clockTextH   = document.getElementById("clockTextH");
let clockTextM   = document.getElementById("clockTextM");
let clockTextS   = document.getElementById("clockTextS");
let amCircle   = document.getElementById("amCircle");
let pmCircle   = document.getElementById("pmCircle");
let stepProg1   = document.getElementById("stepProg1");
let stepProg2   = document.getElementById("stepProg2");
clock.granularity = "seconds";
let date         = document.getElementById("date");
let Batt         = document.getElementById("Batt");
let Data         = document.getElementById("Data");
let AOD          = document.getElementById("AOD");

let dataTypes     = [ "steps", "distance", "calories",
                      "elevationGain", "activeZoneMinutes" ];
let dataProgress  = [];
let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let curstat = "";
let statidx = 0;

if ( display.aodAvailable) {
  if (display.aodEnabled) {
    console.log(me.permissions.granted("access_aod"));
    display.aodAllowed = true;  
  }
}

display.addEventListener("change", () => {
  console.log("aodActive: " + display.aodActive);
   if (display.aodActive) {
       console.log ("Always on Enabled")
       Batt.style.display = "none";
       Data.style.display = "none";
       AOD.style.display = "inline";
       clock.granularity = 'minutes';
       date.style.fill = "white";
       display.brightnessOverride = "dim";
   } else {
       console.log ("Always on Disabled")
       Batt.style.display = "inline";
       Data.style.display = "inline";
       clock.granularity = "seconds";
       display.brightnessOverride = "normal";
       date.style.fill = "yellow";
       AOD.style.display = "none";
   }
});


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
  let dataValid = 1;
  
  let currentDataProg = (userActivity.today.adjusted[currentType] || 0);
  let currentDataGoal = userActivity.goals[currentType];
  if (currentDataGoal.total != undefined)
  {
    currentDataProg = currentDataProg.total
    currentDataGoal = currentDataGoal.total
  }
  if (currentDataGoal == undefined)
  {
    currentDataGoal = 1;
    dataValid = 0;
  }
  
  let currentDataArc = (currentDataProg / currentDataGoal) * 360;
  if(currentType!="steps") {
    if (currentDataArc >= 360) {
      currentDataArc = 360;
      type.arcFront.style.fill = "lightgreen";
      type.arcFront.arcWidth = 5;
    }
    else {
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
    type.arcFront.sweepAngle = currentDataArc;
  }
  
  if(currentType==="distance") {
    currentDataProg = (currentDataProg * 0.000621371192).toFixed(2);
  }
  if(currentType==="steps") {
    if (currentDataProg >= currentDataGoal) {
      if (currentDataProg >= (currentDataGoal * 2)) {
        currentDataProg = currentDataProg - userActivity.goals[currentType];
        currentDataProg = `+${currentDataProg}`;
        stepProg1.width = 276;
        stepProg2.width = 276;
        stepProg1.style.fill = "lightgreen";
        stepProg2.style.fill = "lightgreen";
        type.dataCount.style.fill = "lightgreen";
      }
      else {
        currentDataProg = currentDataProg - userActivity.goals[currentType];
        currentDataProg = `+${currentDataProg}`;
        stepProg1.width = 276;
        stepProg2.width = (currentDataProg / currentDataGoal) * 276;
        stepProg1.style.fill = "lightgreen";
        stepProg2.style.fill = "lightblue";
        type.dataCount.style.fill = "lightgreen";          
      }
    }
    else {
      stepProg1.width = (currentDataProg / currentDataGoal) * 276;
      stepProg1.style.fill = "lightblue";
      stepProg2.width = (currentDataProg / currentDataGoal) * 276;
      stepProg2.style.fill = "lightblue";
      type.dataCount.style.fill = "lightblue";
    }
    
    if (dataValid == 1)
    {
      type.dataCount.text = currentDataProg;
    }
    else
    {
      type.dataCount.text = "";
    }
  }
  
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
  
  if (hours < 12) {
    amCircle.style.fill = 'yellow';
    pmCircle.style.fill = 'black';
  } else {
    amCircle.style.fill = 'black';
    pmCircle.style.fill = 'orangered';
  }
  if (hours > 12) {hours -= 12;}
  if (hours == 0) {hours = 12;}
  
  clockTextH.text = `${hours}`;
  clockTextM.text = `${mins}`;
  clockTextS.text = `${secs}`;

  let day      = today.getDate();
  let dow      = days[today.getDay()];
  date.text = dow + '   ' + day;
  
  battery.setLevel();
  
  if (display.aodActive == false) {
    refreshAllData();
  }
}

heartMonitor.initialize();
