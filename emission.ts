var endrate = 1; // Adjust this constant for the rate of change
var death = 35;
var gaiarate = 0.75;
var meanTemperature = 20; // highest this year

while (meanTemperature < death) {

console.log("###### "+ meanTemperature +" ######");
var endemission = Math.exp(endrate * (death - meanTemperature)) - 1;
console.log("ENDCOIN  generated: " + endemission + " END Tokens");

var gaiaemission = Math.exp(gaiarate * (meanTemperature)) - 1;
console.log("GAIACOIN generated: " + gaiaemission + " GAIA Tokens");

var meanTemperature = meanTemperature + 0.5; // increment by 0.5 degree

}