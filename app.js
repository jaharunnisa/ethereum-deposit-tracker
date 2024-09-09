const Web3 = require('web3');  // Import Web3 library
const fs = require('fs');  // Import File System module

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY'));


// Beacon Deposit Contract address
const contractAddress = '0x00000000219ab540356cBB839Cbe05303d7705Fa';

// Function to track deposits
const trackDeposits = () => {
  web3.eth.subscribe('logs', { address: contractAddress })
    .on('data', async (result) => {
      try {
        // Fetch transaction details
        const tx = await web3.eth.getTransaction(result.transactionHash);
        const block = await web3.eth.getBlock(tx.blockNumber);

        // Prepare deposit data
        const depositData = {
          blockNumber: tx.blockNumber,
          blockTimestamp: block.timestamp,
          fee: web3.utils.fromWei(tx.gasPrice, 'ether'),
          hash: tx.hash,
          pubkey: tx.from
        };

        // Print deposit details to the console
        console.log('New Deposit:', depositData);

        // Save deposit details to a log file
        fs.appendFileSync('deposits_log.txt', JSON.stringify(depositData) + '\n');
      } catch (fetchError) {
        console.error('Error fetching transaction details:', fetchError);
      }
    })
    .on('error', (error) => {
      console.error('Subscription error:', error.message);
      fs.appendFileSync('error_log.txt', `${new Date().toISOString()} - Subscription error: ${error.message}\n`);
    });
};

// Start tracking deposits
try {
  trackDeposits();
} catch (error) {
  fs.appendFileSync('error_log.txt', `${new Date().toISOString()} - Failed to start tracking deposits: ${error.message}\n`);
}

