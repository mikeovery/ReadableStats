import document from "document";
import { battery } from "power";

const batData = document.getElementById("batteryLevel");
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

export function setLevel() {
  let charge = Math.round(battery.chargeLevel);
  batData.width = charge * 26 / 100;
  batData.style.fill = batteryLevelColor(charge);
  //batChrg.text = `${charge}%`;
}