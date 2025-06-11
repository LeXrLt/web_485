document.addEventListener('DOMContentLoaded', () => {
    const macAddressInput = document.getElementById('macAddress');
    const fetchButton = document.getElementById('fetchButton');
    const messageArea = document.getElementById('messageArea');
    const macErrorArea = document.getElementById('macError'); // Added for macError div
    let pollingInterval;
    let currentMacAddress = '';

    // Load MAC address from localStorage on page load
    const savedMacAddress = localStorage.getItem('savedMacAddress');
    if (savedMacAddress) {
        macAddressInput.value = savedMacAddress;
    }

    // Clear MAC error when user starts typing
    macAddressInput.addEventListener('input', () => {
        macErrorArea.textContent = '';
    });

    // Function to send a POST request to updateSerialDevice
    async function updateSerialDevice(macAddress) {
        try {
            const response = await fetch('https://web485.ti-lian.com/local/v1/updateSerialDevice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ macAddress: macAddress }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Assuming the response might not be JSON or we don't need to parse it for this call
            console.log('updateSerialDevice call successful');
        } catch (error) {
            console.error('Error calling updateSerialDevice:', error);
        }
    }

    // Function to fetch data from the API
    async function fetchData(macAddress) {
        // MAC address validation is now handled in the click listener before calling this
        messageArea.innerHTML = '<p>正在获取数据...</p>';
        try {
            const response = await fetch(`https://web485.ti-lian.com/local/v1/getSerialDevice?macAddress=${macAddress}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json(); // Renamed to responseData

            // Display the data based on new requirements
            if (responseData && responseData.code === "200" && responseData.data) {
                const dataMap = {
                    "2": "安全回路", // Safety Circuit
                    "4": "检修模式", // Maintenance Mode
                    "5": "厅门锁"  // Hall Door Lock
                };
                let htmlContent = '<ul>';
                for (const key in responseData.data) {
                    if (responseData.data.hasOwnProperty(key)) {
                        const displayName = dataMap[key] || key; // Use mapped name or original key
                        htmlContent += `<li>${displayName}: ${responseData.data[key]}</li>`;
                    }
                }
                htmlContent += '</ul>';
                messageArea.innerHTML = htmlContent;
            } else if (responseData && responseData.msg) {
                messageArea.innerHTML = `<p style="color: orange;">信息: ${responseData.msg}</p>`;
            } else {
                messageArea.innerHTML = '<p>未收到相关数据或数据格式不符合预期。</p>';
            }
        } catch (error) {
            console.error('获取数据时出错:', error);
            messageArea.innerHTML = `<p style="color: red;">获取数据时出错： ${error.message}</p>`;
        }
    }

    // Event listener for the fetch button
    fetchButton.addEventListener('click', () => {
        currentMacAddress = macAddressInput.value.trim();
        macErrorArea.textContent = ''; // Clear previous MAC errors

        if (pollingInterval) {
            clearInterval(pollingInterval);
        }

        if (!currentMacAddress) {
            macErrorArea.textContent = "错误：MAC地址不能为空。";
            messageArea.innerHTML = ''; // Clear main message area
            return;
        }

        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (!macRegex.test(currentMacAddress)) {
            macErrorArea.textContent = "错误：无效的MAC地址格式。请输入形如 5C-53-10-11-11-3A 的地址。";
            messageArea.innerHTML = ''; // Clear main message area
            return;
        }

        // If validation passes
        macErrorArea.textContent = ''; // Ensure error area is clear
        localStorage.setItem('savedMacAddress', currentMacAddress);
        updateSerialDevice(currentMacAddress);
        fetchData(currentMacAddress);
        pollingInterval = setInterval(() => fetchData(currentMacAddress), 1000);
    });

    // Optional: You might want to stop polling if the user clears the input
    // or navigates away, but for simplicity, we'll keep it running
    // once a MAC address is submitted.

});
