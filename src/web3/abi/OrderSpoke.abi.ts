export const abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_router',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'MAX_RETURNDATA_COPY_SIZE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'endpoint',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract ILayerZeroEndpointV2',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'estimateFee',
    inputs: [
      {
        name: 'dstEid',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'payload',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'options',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'executor',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract Executor',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'fillOrder',
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        internalType: 'struct Root.Order',
        components: [
          {
            name: 'user',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'filler',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'inputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type',
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32',
              },
              {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'amount',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'outputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type',
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32',
              },
              {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'amount',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'sourceChainEid',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'destinationChainEid',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'sponsored',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'primaryFillerDeadline',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'deadline',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'callRecipient',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'callData',
            type: 'bytes',
            internalType: 'bytes',
          },
        ],
      },
      {
        name: 'orderNonce',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'fundingWallet',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'maxGas',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'gasValue',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'options',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct MessagingReceipt',
        components: [
          {
            name: 'guid',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'nonce',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'fee',
            type: 'tuple',
            internalType: 'struct MessagingFee',
            components: [
              {
                name: 'nativeFee',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'lzTokenFee',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getOrderId',
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        internalType: 'struct Root.Order',
        components: [
          {
            name: 'user',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'filler',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'inputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type',
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32',
              },
              {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'amount',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'outputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type',
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32',
              },
              {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'amount',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'sourceChainEid',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'destinationChainEid',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'sponsored',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'primaryFillerDeadline',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'deadline',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'callRecipient',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'callData',
            type: 'bytes',
            internalType: 'bytes',
          },
        ],
      },
      {
        name: 'nonce',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'oAppVersion',
    inputs: [],
    outputs: [
      {
        name: 'senderVersion',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'receiverVersion',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ordersFilled',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'peers',
    inputs: [
      {
        name: 'eid',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    outputs: [
      {
        name: 'peer',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setDelegate',
    inputs: [
      {
        name: '_delegate',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setPeer',
    inputs: [
      {
        name: '_eid',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: '_peer',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'sweep',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'OrderFilled',
    inputs: [
      {
        name: 'orderId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'order',
        type: 'tuple',
        indexed: true,
        internalType: 'struct Root.Order',
        components: [
          {
            name: 'user',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'filler',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'inputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type',
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32',
              },
              {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'amount',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'outputs',
            type: 'tuple[]',
            internalType: 'struct Root.Token[]',
            components: [
              {
                name: 'tokenType',
                type: 'uint8',
                internalType: 'enum Root.Type',
              },
              {
                name: 'tokenAddress',
                type: 'bytes32',
                internalType: 'bytes32',
              },
              {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'amount',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'sourceChainEid',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'destinationChainEid',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'sponsored',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'primaryFillerDeadline',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'deadline',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'callRecipient',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'callData',
            type: 'bytes',
            internalType: 'bytes',
          },
        ],
      },
      {
        name: 'caller',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'receipt',
        type: 'tuple',
        indexed: false,
        internalType: 'struct MessagingReceipt',
        components: [
          {
            name: 'guid',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'nonce',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'fee',
            type: 'tuple',
            internalType: 'struct MessagingFee',
            components: [
              {
                name: 'nativeFee',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'lzTokenFee',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PeerSet',
    inputs: [
      {
        name: 'eid',
        type: 'uint32',
        indexed: false,
        internalType: 'uint32',
      },
      {
        name: 'peer',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PositiveSlippage',
    inputs: [
      {
        name: 'orderId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'receivedAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TokenSweep',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'caller',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'ExternalCallFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidDelegate',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidEndpointCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LzTokenUnavailable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NoPeer',
    inputs: [
      {
        name: 'eid',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
  },
  {
    type: 'error',
    name: 'NotEnoughNative',
    inputs: [
      {
        name: 'msgValue',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'OnlyPeer',
    inputs: [
      {
        name: 'eid',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'sender',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'OrderCannotBeFilled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OrderExpired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RestrictedToPrimaryFiller',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'UnsupportedTransfer',
    inputs: [],
  },
] as const;
