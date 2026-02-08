# Brainstorming

This file is used to document your thoughts, approaches and research conducted across all tasks in the Technical Assessment.

## Firmware

## Spyder

1. When running the emulator, the client will occasionally recieve values in the incorrect format. This will be visible in the output of `streaming service` as well as the `ui`. Think about what is happening, and write additional code in `streaming-service` that prevents 'invalid' data from being sent to the frontend. What you wish to do with 'invalid' data is up to you, so long as it is justified in `brainstorming.md`.

When looking at the data received from the data emulator, there seems to be three main data types received: integer, float and this clearly invalid type in the form "#\u0000\u0000\u0000" or "\u0014\u0000\u0000\u0000". These can either have an additional character in front of them, or just the \u.... text.

A quick google search shows that these are escaped unicode strings. The character is supposed to represent an integer number, and the rest are null. This means that "#\u0000\u0000\u0000" is supposed to read 35 in decimal (u+0023 in hexidecimal).

This makes sense as the data is JSON sent over TCP, so it the data is being mistakenly read as a string rather than a number. 

This is still usable data so I should keep it, but needs to be converted into a number format to be usable. I can do this by first making use of the currently unused VehicleData interface in server.ts to parse the data into the variables 'battery_temperature' and 'timestamp'.

Then, I create a function to decode the battery_temperature value into a number type if the value is of string type, otherwise return if value is already a number. 

The function creates a buffer to read the unicode, then interprets the buffer using readInt32LE() with an offset of zero to read the whole string and returns the output.

I then create a new VehicleData, assign the decoded temperature and timestamp to it, then create a message using JSON.stringify()

I then send this to the frontend, which should fix the issue.

### After solving

The client is correctly only outputting valid numbers now, some integers and some floats. I manually checked the values of the received temperatures and the decoded temperatures to ensure they were consistent. E.g. received temperature is "#\u0000\u0000\u0000" which corresponds to decimal value 35 so I ensure the decoded temperature is 35.

The range and randomness of numbers outputted is very large (can sometimes jump from 20-80 to over 900), but that is outside the scope of this question and may need to be resolved later.

2. A safe operating range for the battery temperature is 20-80 degrees. Add a feature to the backend `streaming-service` so that each time the received battery temperature exceeds this range more than 3 times in 5 seconds, the current timestamp and a simple error message is printed to console.

## Cloud