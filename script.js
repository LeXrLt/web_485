document.addEventListener('DOMContentLoaded', () => {
    const macAddressInput = document.getElementById('macAddress');
    const fetchButton = document.getElementById('fetchButton');
    const messageArea = document.getElementById('messageArea');
    let pollingInterval;
    let currentMacAddress = '';

    // Function to fetch data from the API
    async function fetchData(macAddress) {
        if (!macAddress) {
            messageArea.innerHTML = '<p style="color: red;">Error: MAC address cannot be empty.</p>';
            return;
        }
        // Basic MAC address format validation (can be improved)
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (!macRegex.test(macAddress)) {
            messageArea.innerHTML = `<p style="color: red;">Error: Invalid MAC address format. Expected format like XX-XX-XX-XX-XX-XX or XX:XX:XX:XX:XX:XX</p>`;
            return;
        }

        messageArea.innerHTML = '<p>Fetching data...</p>';
        try {
            const response = await fetch(`https://third-party-api.ti-lian.com/local/v1/getSerialDevice?macAddress=${macAddress}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Assuming the API returns JSON

            // Display the data
            // This part might need adjustment based on the actual structure of the API response
            if (data && Object.keys(data).length > 0) {
                // Let's assume the data object itself is what we want to display
                // Or specific fields like data.message or data.devices
                // For now, we'll stringify the whole JSON object for inspection
                messageArea.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            } else {
                messageArea.innerHTML = '<p>No data received or data is empty.</p>';
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            messageArea.innerHTML = `<p style="color: red;">Error fetching data: ${error.message}</p>`;
        }
    }

    // Event listener for the fetch button
    fetchButton.addEventListener('click', () => {
        currentMacAddress = macAddressInput.value.trim();
        if (pollingInterval) {
            clearInterval(pollingInterval); // Clear existing interval if any
        }
        if (currentMacAddress) {
            fetchData(currentMacAddress); // Fetch immediately on click
            // Poll every 5 seconds (adjust as needed)
            pollingInterval = setInterval(() => fetchData(currentMacAddress), 5000);
        } else {
            messageArea.innerHTML = '<p style="color: red;">Please enter a MAC address.</p>';
        }
    });

    // Optional: You might want to stop polling if the user clears the input
    // or navigates away, but for simplicity, we'll keep it running
    // once a MAC address is submitted.
});
