document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('booking-form');
    const nameInput = document.getElementById('name');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const guestsInput = document.getElementById('guests');
    const submitButton = document.getElementById('submit-button');
    const messageBox = document.getElementById('message-box');

    bookingForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (validateForm()) {
            submitBooking();
        }
    });

    function validateForm() {
        let valid = true;
        messageBox.textContent = '';

        if (nameInput.value.trim() === '') {
            valid = false;
            messageBox.textContent += 'Please enter your name.\n';
        }
        if (dateInput.value === '') {
            valid = false;
            messageBox.textContent += 'Please select a date.\n';
        }
        if (timeInput.value === '') {
            valid = false;
            messageBox.textContent += 'Please select a time.\n';
        }
        if (guestsInput.value <= 0) {
            valid = false;
            messageBox.textContent += 'Please enter a valid number of guests.\n';
        }

        return valid;
    }

    function submitBooking() {
        const bookingData = {
            name: nameInput.value,
            date: dateInput.value,
            time: timeInput.value,
            guests: guestsInput.value
        };

        // Simulate a successful booking submission
        setTimeout(() => {
            messageBox.textContent = 'Booking successful! We look forward to seeing you.';
            bookingForm.reset();
        }, 1000);
    }
});