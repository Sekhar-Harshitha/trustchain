// server/blockchain/validator.js
const crypto = require('crypto');

const validateChain = (blockchain) => {
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i - 1];

    // Recompute current block hash
    const recomputedHash = crypto
      .createHash('sha256')
      .update(
        currentBlock.index +
        currentBlock.timestamp +
        JSON.stringify(currentBlock.data) +
        currentBlock.previousHash +
        currentBlock.nonce
      )
      .digest('hex');

    if (currentBlock.hash !== recomputedHash) {
      return { valid: false, tamperedAt: currentBlock.index };
    }

    if (currentBlock.previousHash !== previousBlock.hash) {
      return { valid: false, tamperedAt: currentBlock.index };
    }
  }
  return { valid: true, tamperedAt: null };
};

module.exports = { validateChain };
