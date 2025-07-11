const { writeFileSync } = require('fs');
const { createEvent } = require('ics');
const path = require('path');

const generateICSFile = async ({ movieName, startTime, endTime, location, bookingId }) => {
  return new Promise((resolve, reject) => {
    const event = {
      start: [
        startTime.getFullYear(),
        startTime.getMonth() + 1,
        startTime.getDate(),
        startTime.getHours(),
        startTime.getMinutes()
      ],
      duration: { hours: 2 }, // or calculate from movie length
      title: `${movieName} - Movie Show`,
      description: `Enjoy your movie! Booking ID: ${bookingId}`,
      location,
      status: 'CONFIRMED',
      busyStatus: 'BUSY'
    };

    createEvent(event, (error, value) => {
      if (error) return reject(error);

      const filePath = path.join(__dirname, `../tickets/${bookingId}.ics`);
      writeFileSync(filePath, value);
      resolve(filePath);
    });
  });
};

module.exports = generateICSFile;
