try {
    // Replace the getRequest call with fetch
    const response = await fetch("getServerInfo");

    // Check if the response is okay (status in the range 200-299)
    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Extract and store data from the response
    const socketPort = data.socketPort;
    const nodeEnv = data.nodeEnv;
    localStorage.setItem("socketPort", socketPort);
    localStorage.setItem("nodeEnv", nodeEnv);
} catch (err) {
    console.log(err);
}
