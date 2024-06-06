exports.action = function(data, callback){
	let client = setClient(data);
	info("AirQuality from:", data.client, "To:", client);
	getAirQuality (data, client);
	callback();

}

const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function getAirQuality(data, client) {
  try {
    const locationResponse = await fetch('http://ipinfo.io/json');
    const locationData = await locationResponse.json();
    const city = locationData.city; // Paris
    const region = locationData.region; // Île-de-France

    try {
      const url = `https://www.iqair.com/fr/france/${region.toLowerCase().replace('î', 'i')}/${city.toLowerCase()}`;
      const airQualityResponse = await fetch(url);

      if (airQualityResponse.status !== 200) {
        throw new Error(`La connexion a échoué, code erreur: ${airQualityResponse.status}`);
      }

      const html = await airQualityResponse.text();
      const $ = cheerio.load(html);
      const airQuality = $('span.aqi-status__text').text();
      const airIndice = $('p.aqi-value__value').text();

      Avatar.speak(`Le niveau de pollution de l’air à ${city.toLowerCase()} est ${airQuality}, Avec un indice de ${airIndice}`, client, () => {
        Avatar.Speech.end(client);
      });
    } catch (error) {
      Avatar.speak(`Je n'arrive pas à accéder au site: ${error.message}`, data.client, () => {
        Avatar.Speech.end(client);
      });
    }
  } catch (error) {
    Avatar.speak(`Je n'arrive pas à trouver la ville: ${error.message}`, data.client, () => {
      Avatar.Speech.end(client);
    });
  }
}

function setClient (data) {
	let client = data.client;
	if (data.action.room)
	client = (data.action.room != 'current') ? data.action.room : (Avatar.currentRoom) ? Avatar.currentRoom : Config.default.client;
    if (data.action.setRoom)
	client = data.action.setRoom;
	return client;
}