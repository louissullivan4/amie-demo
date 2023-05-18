// import modules   
const express = require('express');
const {google} = require('googleapis');
// personal keys available in config.js
const keys = require('./config.js');

// initialize app
const app = express();
const port = 5000;

app.get ('/', (_, res) => {
    res.send('Hello Amie!');
});

// Google Calendar API credentials (excluded from git)
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_PRIVATE_KEY = keys.private_key;
const GOOGLE_CLIENT_EMAIL = keys.client_email;
const GOOGLE_PROJECT_NUMBER = keys.project_number;
const GOOGLE_CALENDAR_ID = keys.calender_id;

// set up with JWT credentials (email, keyFile, key and scopes)
const jwtCreds = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    null,
    GOOGLE_PRIVATE_KEY,
    SCOPES
);

// create a calender api object using JWT credentials
const calendar = google.calendar({
    version: 'v3',
    project: GOOGLE_PROJECT_NUMBER,
    auth: jwtCreds
});

// get events from google calendar
app.get('/events', (_, res) => {
    console.log('Fetching events from Google Calendar')
    calendar.events.list({
        calendarId: GOOGLE_CALENDAR_ID,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, response) => {
        if (err) {
            console.log(`Error fetching events: ${err}`);
            return res.status(500).send(`Error occurred while fetching: ${err}`);
        }
        const events = response.data.items;
        console.log(`Received ${events.length} events`)
        console.log(events);
        // save events summary, start and end dates to an array
        const amieEvents = events.map((event) => {
            return {
                summary: event.summary,
                start: event.start.dateTime || event.start.date,
                end: event.end.dateTime || event.end.date,
            };
        });
        console.log("Here's the data for Amie import...")
        console.log(amieEvents);
        return res.send(events);
    }
    );
});

app.listen(port, () => console.log(`Listening on port ${port}`));  