const Web3 = require('web3');

// Use the latest WebSocket provider initialization
const provider = new Web3.providers.WebsocketProvider('wss://eth-mainnet.alchemyapi.io/v2/hqiDpGkurRiW-yz0TalCoh1-8gNBx-lB');
const web3 = new Web3(provider);

provider.on('connect', () => {
    console.log('WebSocket connection established.');
});

provider.on('error', (e) => {
    console.error('WebSocket connection error:', e);
});

provider.on('end', (e) => {
    console.error('WebSocket connection closed:', e);
});

const beaconDepositContract = '0x00000000219ab540356cBB839Cbe05303d7705Fa';

async function trackDeposits() {
    const subscription = web3.eth.subscribe('logs', {
        address: beaconDepositContract,
    }, function(error, result) {
        if (!error) {
            console.log('New deposit event detected:', result);
        } else {
            console.error('Error:', error);
        }
    });

    subscription.on('data', async function(log) {
        const txReceipt = await web3.eth.getTransactionReceipt(log.transactionHash);
        const block = await web3.eth.getBlock(txReceipt.blockNumber);

        const deposit = {
            blockNumber: txReceipt.blockNumber,
            blockTimestamp: block.timestamp,
            fee: web3.utils.fromWei(txReceipt.gasUsed.toString(), 'ether'),
            transactionHash: log.transactionHash,
            sender: log.address,
        };

        console.log('Deposit Details:', deposit);
    });
}

trackDeposits();
