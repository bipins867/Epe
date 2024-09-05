// Fetch and display counts of cases
document.addEventListener('DOMContentLoaded', function () {
    // axios.get('/api/caseCounts')
    //     .then(response => {
    //         const { openCases, pendingCases, closedCases } = response.data;
    //         document.getElementById('openCasesCount').textContent = openCases || 0;
    //         document.getElementById('pendingCasesCount').textContent = pendingCases || 0;
    //         document.getElementById('closedCasesCount').textContent = closedCases || 0;
    //     })
    //     .catch(error => {
    //         console.error('Error fetching case counts:', error);
    //     });
});

document.getElementById('openCasesBtn').addEventListener('click', function () {
    // Axios call to fetch open cases
    axios.get('/api/openCases')
        .then(response => {
            console.log('Open Cases:', response.data);
        })
        .catch(error => {
            console.error('Error fetching open cases:', error);
        });
});

document.getElementById('pendingCasesBtn').addEventListener('click', function () {
    // Axios call to fetch pending cases
    axios.get('/api/pendingCases')
        .then(response => {
            console.log('Pending Cases:', response.data);
        })
        .catch(error => {
            console.error('Error fetching pending cases:', error);
        });
});

document.getElementById('closedCasesBtn').addEventListener('click', function () {
    // Axios call to fetch closed cases
    axios.get('/api/closedCases')
        .then(response => {
            console.log('Closed Cases:', response.data);
        })
        .catch(error => {
            console.error('Error fetching closed cases:', error);
        });
});
