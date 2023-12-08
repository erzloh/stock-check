// Zweck: Überprüfen der Verfügbarkeit eines Produkts auf einer Website und Benachrichtigung per SMS, wenn das Produkt wieder verfügbar ist.
// Um diese App zu verwenden, müssen Sie ein Twilio-Konto erstellen und die erforderlichen Umgebungsvariablen einrichten.
// Autor: Eric Holzer
// Datum: 2023-12-08

// Importiere die benötigten Module
const axios		= require('axios');
const cheerio	= require('cheerio');
const cron		= require('node-cron');
const twilio	= require('twilio');

// Twilio-Konfiguration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const targetPhoneNumber = process.env.TARGET_PHONE_NUMBER;

// Definiere die URL der Website
const url = 'https://eu.craftdlondon.com/en-ch/products/flat-band-ring-silver-3mm?variant=46936623186228';

// Rufe die Website ab
async function checkAvailability() {
	try {
		const response		= await axios.get(url);
		const html			= response.data;
		const $				= cheerio.load(html);
		const buttonContent	= $('buy-buttons button').eq(0).text();

		if (buttonContent === 'Sold out') {
			console.log('Item ist ausverkauft :(');
		} else {
			console.log('Ring ist wieder verfügbar :D');
			sendNotification();
		}
	}
	catch (error) {
		console.error('Fehler beim Abrufen der Website:', error);
	}
}

// Funktion zum Senden einer Twilio-Benachrichtigung
function sendNotification() {
	twilioClient.messages
	  .create({
		body: 'Flat Band Ring (silver) 3mm ist wieder verfügbar! :D',
		from: twilioPhoneNumber,
		to: targetPhoneNumber,
	  })
	  .then(message => console.log('Benachrichtigung gesendet:', message.sid))
	  .catch(error => console.error('Fehler beim Senden der Benachrichtigung:', error.message));
  }

// Zeitplan für die Ausführung des Codes jede Stunde
cron.schedule('*/30 * * * * *', () => {
	console.log('Code wird jetzt ausgeführt.');
	checkAvailability();
  });