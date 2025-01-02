let availableDates = [];

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle");
  const popupCloseBtn = document.getElementById("popup-close");
  const chooseBtn = document.getElementById("chooseBtn");
  const popup = document.getElementById("popup");
  const clearBtn = document.querySelector(".btn-clear");
  const selectBtn = document.querySelector(".btn-select");
  const dateInput = document.querySelector(".date");
  const roomContainer = document.getElementById("roomContainer");

  //   Nav toggle
  navToggle.addEventListener("click", () => {
    const navMenu = document.getElementById("nav-menu");
    navMenu.classList.toggle("show-menu");
  });

  //   Popup close
  popupCloseBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  chooseBtn.addEventListener("click", () => {
    popup.classList.toggle("hidden");
  });
  // Clear the date input and room information
  clearBtn.addEventListener("click", () => {
    dateInput._flatpickr.clear();
    roomContainer.innerHTML = "";
  });

  selectBtn.addEventListener("click", () => {
    const selectedDates = dateInput._flatpickr.selectedDates;
    if (selectedDates.length === 2) {
      const checkin = selectedDates[0].toISOString().split("T")[0];
      const checkout = selectedDates[1].toISOString().split("T")[0];

      fetch(
        `https://api.travelcircus.net/hotels/17080/quotes?locale=de_DE&checkin=${checkin}&checkout=${checkout}&party=%7B%22adults%22:2,%22children%22:%5B%5D%7D&domain=de`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Room Availability Response:", data); // Log the entire response to understand its structure

          if (data.error) {
            console.error("API Error:", data.error);
            alert(data.error.message); // Display error message to the user
            return;
          }

          // Log the keys of the data object to see what properties are available
          console.log("Data keys:", Object.keys(data));

          // Extract data from _embedded object
          const embeddedData = data._embedded;
          console.log("Embedded Data:", embeddedData);

          if (!embeddedData) {
            console.error("Error: embeddedData is undefined");
            alert("No rooms available for the selected dates."); // Display message to the user
            return;
          }

          const hotelQuotes = embeddedData.hotel_quotes;
          if (hotelQuotes && hotelQuotes.length > 0) {
            roomContainer.innerHTML = ""; // Clear previous room information
            hotelQuotes.forEach((quote) => {
              console.log("Quote:", quote); // Log each quote to understand its structure
              console.log(`Room: ${quote.name}, Price: ${quote.full_price}`);

              // Create HTML elements to display room information
              const roomElement = document.createElement("div");
              roomElement.classList.add("room");

              const roomName = document.createElement("h2");
              roomName.textContent = quote.name;

              const roomPrice = document.createElement("p");
              roomPrice.textContent = `Price: ${quote.full_price} ${quote.currency_symbol}`;

              roomElement.appendChild(roomName);
              roomElement.appendChild(roomPrice);
              roomContainer.appendChild(roomElement);
            });
          } else {
            console.error("Error: hotelQuotes is undefined or empty");
            alert("No rooms available for the selected dates."); // Display message to the user
          }
        })
        .catch((error) => {
          console.error("Error fetching room availability data:", error);
          alert("An error occurred while fetching room availability data."); // Display error message to the user
        });
    } else {
      alert("Please select a check-in and check-out date.");
    }
  });

  fetch(
    "https://api.travelcircus.net/hotels/17080/checkins?E&party=%7B%22adults%22:2,%22children%22:%5B%5D%7D&domain=de&date_start=2025-01-01&date_end=2025-06-31"
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("API Response:", data);

      const hotelAvailabilities = data._embedded.hotel_availabilities;
      if (hotelAvailabilities && hotelAvailabilities.length > 0) {
        availableDates = hotelAvailabilities.map((item) => ({
          date: item.date,
          price: item.price,
        }));

        console.log("Available Dates:", availableDates);
      } else {
        console.error("Error: hotelAvailabilities is undefined or empty");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
});

flatpickr(".date", {
  altInput: true,
  altFormat: "F j, Y",
  dateFormat: "Y-m-d",
  enableTime: false,
  mode: "range",
  minDate: "today",
  maxDate: new Date().fp_incr(180), // 180 days from now
  onDayCreate: (dObj, dStr, fp, dayElem) => {
    const date = dayElem.dateObj.toISOString().split("T")[0];
    const availableDate = availableDates.find((d) => d.date === date);
    if (availableDate) {
      const priceElem = document.createElement("span");
      priceElem.classList.add("price");
      priceElem.textContent = `${availableDate.price} €`;
      dayElem.appendChild(priceElem);
    }
  },
});
