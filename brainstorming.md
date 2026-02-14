# Brainstorming

This file is used to document your thoughts, approaches and research conducted across all tasks in the Technical Assessment.

## Firmware

## Spyder

### Question 1

> When running the emulator, the client will occasionally recieve values in the incorrect format. This will be visible in the output of `streaming service` as well as the `ui`. Think about what is happening, and write additional code in `streaming-service` that prevents 'invalid' data from being sent to the frontend. What you wish to do with 'invalid' data is up to you, so long as it is justified in `brainstorming.md`.

When looking at the data received from the data emulator, there seems to be three main data types received: integer, float and this clearly invalid type in the form `#\u0000\u0000\u0000` or `\u0014\u0000\u0000\u0000`. These can either have an additional character in front of them, or just the \u.... text.

A quick google search shows that these are escaped unicode strings. The character is supposed to represent an integer number, and the rest are null. This means that `#\u0000\u0000\u0000` is supposed to read 35 in decimal (u+0023 in hexidecimal).

This makes sense as the data is JSON sent over TCP, so it the data is being mistakenly read as a string rather than a number. 

This is still usable data so I should keep it, but needs to be converted into a number format to be usable. I can do this by first making use of the currently unused `VehicleData` interface in server.ts to parse the data into the variables `battery_temperature` and `timestamp`.

Then, I create a function to decode the battery_temperature value into a number type if the value is of string type, otherwise return if value is already a number. 

The function creates a buffer to read the unicode, then interprets the buffer into a number to output.

I then create a new VehicleData, assign the decoded temperature and timestamp to it, then create a message by converting it to a string.

I then send this to the frontend, which should fix the issue.

#### After solving

The client is correctly only outputting valid numbers now, some integers and some floats. I manually checked the values of the received temperatures and the decoded temperatures to ensure they were consistent. E.g. received temperature is "#\u0000\u0000\u0000" which corresponds to decimal value 35 so I ensure the decoded temperature is 35.

The range and randomness of numbers outputted is very large (can sometimes jump from 20-80 to over 900), but that is outside the scope of this question and may need to be resolved later.

### Question 2

> A safe operating range for the battery temperature is 20-80 degrees. Add a feature to the backend `streaming-service` so that each time the received battery temperature exceeds this range more than 3 times in 5 seconds, the current timestamp and a simple error message is printed to console.

The intuitive method is to store the last 5 seconds of data, and with each new data point remove the oldest one. If there are three or more data points lower than 20 or greater than 80, print an error message.

Looking at `battery-emulator.ts`, I can see that it sends data every 500 milliseconds. One way to approach this would be to simply take the last 10 data points, but this assumes that the time intervals between data is *always* 500 milliseconds. 

This is an incorrect assumption as there are delays and inconsistencies over the network, and even inconsistencies in the sensor itself in real life.

A better approach is to use the time stamps in the messages themselves to calculate which data points to keep. Let me ask Claude if there is a more optimal approach.

Claude responded that I should use a sliding window approach to count events where the temperatures are out of range. 

This means that as each temperature reading is received, it checks if it is out of range, and if so it adds it to an out of range list. In that list, it will continuously check the timestamps to ensure it is less than 5 seconds. If an event is older than 5 seconds, it is removed from the list.

This makes sense, as it uses much less memory - it only needs to store the out of range events rather than all data points in the last 5 seconds.

Also, it prevents alert spam, as with my previous approach an error would be logged every time that there were more than 3 events in the last 5 seconds, which could easily lead to the console being spammed.

I will implement this sliding window approach.

#### After solving

Coding up the sliding window was not very complicated, and was pretty intuitive. I did have some trouble ensuring that the `outOfRange` array was updating and removing old elements correctly, and I did this by printing the contents of the array and checking that the element was removed from the array after 5 seconds.

I also had some debating in what format I should output the time, and I eventually decide to output using `.toISOString` for a universal time format, as well as the raw `timestamp` value.

In hindsight, if this were a real project I would have to bring all the functionality into a separate class to not clog up the server file. As it is the final backend question, I will leave it for now but complete it later if I have time.

### Question 3

> Currently the connect/disconnect button in the top right corner of the ui (frontend) does not update when data is streamed in via streaming service. Why is this occurring and what can be done to rectify this?

Pretty simple, looking at the effect hook to handle WebSocket connection state changes, there are no dependencies. This means it only activates once on startup, and doesn't change when `readyState` changes. I just need to add `readyState` to the dependencies array.

#### After solving

Working as intended, checked by running `docker compose down` and `docker compose up` to disconnect and reconnect the streaming service, and watching the badge change according to the connection status.

### Question 4


> The NextJS frontend is currently very basic. **Using primarily tailwindCSS and Shadcn/ui components**, extend the frontend by completing the following:
>
> - Ensure the data displayed from `streaming-service` is correct to **3 decimal places** instead of being unbounded as it is currently.
> - Ensure the battery temperature value changes colours based on the current temperature (E.g. changing to red when the safe temperature range is exceeded).
> - Safe operating ranges are defined below
>     | Range | Colour |
>     |---------------------------------|--------|
>     | Safe (20-80) | Green |
>     | Nearing unsafe (20-25 or 75-80) | Yellow |
>     | Unsafe (<20 or >80) | Red |
>   - You may extend `globals.css` and `tailwind.config.js` where you see fit to implement these colours, or can elect to use another method (although the former is preferred).
> - Create three additional features in the provided system. **These should involve visible changes in the `ui` but do not have to exclusively involve the ui** (E.g. error messages interface, light-mode toggle, graphing data).
>   - To implement these, you may alter the streaming service payload if necessary.
>   - You may use components other than those mentioned above if they can be justified in your `brainstorming.md` file (E.g. additional charting libraries, notifications (toast) libraries etc).
>   - You are free to make more than three additional features if you're feeling creative!

I will split this question in to two main parts: the battery temperature display and the additional features.

The main part that needs to be changed for the first part is the `Numeric` function in `numeric.tsx`. The decimal place is easy, I can use JavaScript's built in `toFixed()` method to round to 3 dp.

For the colour, I will use the given `cn()` function. This allows me to apply styles conditionally (in this case, depending on what range the value is in) and utilises twMerge to resolve Tailwind conflicts.

I can utilise `--success` and `--destrutive` for green and red respectively, but will need to add a class for warning.




## Cloud