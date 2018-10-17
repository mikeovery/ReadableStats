import document from "document";
import { battery } from "power";

const batDataR = document.getElementById("batteryLevelRed");
const batDataA = document.getElementById("batteryLevelAmber");
const batDataG = document.getElementById("batteryLevelGreen");
const batChrg = document.getElementById("batChrg");

function batteryLevelColor(percentage) {
  let batColor = 'fb-red';
  if (percentage >= 25) {
    batColor = 'fb-peach';
  } 
  if (percentage >= 50) { 
    batColor = 'fb-green';
  }
  return batColor;
}

function batteryFill(percentage, maxval, minval, range, multiplier) {
  let batFill = range;
  if (percentage < maxval) {
      batFill = ((percentage - minval) * multiplier) * range / 100;
  }
  return batFill;
}

export function setLevel() {
  let charge = Math.round(battery.chargeLevel);
  batDataR.width = batteryFill(charge, 25, 0, 69, 4);
  batDataA.width = batteryFill(charge, 50, 25, 69, 4);
  batDataG.width = batteryFill(charge, 100, 50, 138, 2);
  
  batDataR.style.fill = 'fb-red';
  batDataA.style.fill = 'fb-peach';
  batDataG.style.fill = 'fb-green';
  
  //batteryLevelColor(charge);
  //batChrg.text = `${charge}%`;
}