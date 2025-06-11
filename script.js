document.addEventListener('DOMContentLoaded', () => {
    const macAddressInput = document.getElementById('macAddress');
    const fetchButton = document.getElementById('fetchButton');
    const messageArea = document.getElementById('messageArea');
    let pollingInterval;
    let currentMacAddress = '';

    // Function to send a POST request to updateSerialDevice
    async function updateSerialDevice(macAddress) {
        try {
            const response = await fetch('/local/v1/updateSerialDevice', {
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
        if (!macAddress) {
            messageArea.innerHTML = '<p style="color: red;">错误：MAC地址不能为空。</p>';
            return;
        }
        // Basic MAC address format validation (can be improved)
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (!macRegex.test(macAddress)) {
            messageArea.innerHTML = `<p style="color: red;">错误：无效的MAC地址格式。预期格式如 XX-XX-XX-XX-XX-XX 或 XX:XX:XX:XX:XX:XX</p>`;
            return;
        }

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
        if (pollingInterval) {
            clearInterval(pollingInterval); // Clear existing interval if any
        }
        if (currentMacAddress) {
            fetchData(currentMacAddress); // Fetch immediately on click
            // Poll every 5 seconds (adjust as needed)
            pollingInterval = setInterval(() => fetchData(currentMacAddress), 5000);
        } else {
            messageArea.innerHTML = '<p style="color: red;">请输入MAC地址。</p>';
        }
    });

    // Optional: You might want to stop polling if the user clears the input
    // or navigates away, but for simplicity, we'll keep it running
    // once a MAC address is submitted.

    // Initial call to updateSerialDevice on page load
    const initialMacAddress = macAddressInput.value.trim();
    updateSerialDevice(initialMacAddress || "");
});
