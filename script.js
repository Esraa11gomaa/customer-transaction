document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/customers')
    .then(response => response.json())
    .then(customers => {
      fetch('http://localhost:3000/transactions')
        .then(response => response.json())
        .then(transactions => {
          initializeApp(customers, transactions);
      }).catch(error => console.error('Error fetching transactions:', error));
  }).catch(error => console.error('Error fetching customers:', error));

});

let customersData = [];
let transactionsData = [];

function initializeApp(customers, transactions) {
  customersData = customers;
  transactionsData = transactions;
  renderTransactionsTable(transactions);
}

function renderTransactionsTable(transactions) {
  const tableBody = document.getElementById('transactionsBody');
  tableBody.innerHTML = '';

  transactions.forEach(transaction => {
    const customer = customersData.map(c => c.id === transaction.customer_id);
    // console.log(customersData.map(customer => customer.name))
    const row = `
      <tr>
        <td>${transaction.customer_id}</td>
        <td>${customer ? customer.name:"-"}</td>
        <td>${transaction.date}</td>
        <td>${transaction.amount}</td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });

  renderChart(transactions);
  // Using map to extract the 'name' property from each object
  const namesArray = customersData.map(obj => obj.name);
  
  // Logging each name individually
  namesArray.forEach(name => {
    console.log(name);
  });
  

}


function groupTransactionsByDate(transactions) {
  return transactions.reduce((acc, transaction) => {
    const date = transaction.date;
    acc[date] = acc[date] ? acc[date] + transaction.amount : transaction.amount;
    return acc;
  }, {});
}

function filterTable() {
  const selectedCustomerId = document.getElementById('customerNameFilter').value.trim().toLowerCase();
  const selectedTransactionAmount = parseInt(document.getElementById('transactionAmountFilter').value);

  let filteredTransactions = transactionsData;

  if (selectedCustomerId !== '') {
    filteredTransactions = filteredTransactions.filter(transaction => {
      const customer = customersData.find(c => c.id === transaction.customer_id);
      return customer.name.toLowerCase().includes(selectedCustomerId);
      
    });
    
  }

  if (!isNaN(selectedTransactionAmount)) {
    filteredTransactions = filteredTransactions.filter(transaction => transaction.amount === selectedTransactionAmount);
  }

  renderTransactionsTable(filteredTransactions);
}



function renderChart(transactions) {
const ctx = document.getElementById('myChart').getContext('2d');

// Collect unique dates and calculate total amounts for each date
const uniqueDates = [...new Set(transactions.map(t => t.date))];
const data = uniqueDates.map(date => {
  const totalAmount = transactions.filter(t => t.date === date).reduce((acc, curr) => acc + curr.amount, 0);
  return { date, totalAmount };
});

// Prepare data for chart.js
const labels = data.map(d => d.date);
const amounts = data.map(d => d.totalAmount);

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: 'Total Amount',
            data: amounts,
            backgroundColor: 'rgba(2, 18, 37, 0.555)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
}