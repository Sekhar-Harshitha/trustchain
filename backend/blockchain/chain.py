import hashlib
import json
from datetime import datetime

class Block:
    def __init__(self, index, data, previous_hash):
        self.index = index
        self.timestamp = datetime.now().isoformat()
        self.data = data
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.compute_hash()

    def compute_hash(self):
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

    def to_dict(self):
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
            "hash": self.hash
        }

class Blockchain:
    def __init__(self):
        self.chain = [self._create_genesis()]

    def _create_genesis(self):
        return Block(0, {"message": "TrustChain Genesis - Fraud Detection Active"}, "0")

    def add_block(self, data):
        prev = self.chain[-1]
        block = Block(len(self.chain), data, prev.hash)
        self.chain.append(block)
        return block

    def is_valid(self):
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i-1]
            if curr.hash != curr.compute_hash():
                return False, curr.index
            if curr.previous_hash != prev.hash:
                return False, curr.index
        return True, None

    def get_chain_data(self):
        return [block.to_dict() for block in self.chain]

BLOCKCHAIN = Blockchain()
