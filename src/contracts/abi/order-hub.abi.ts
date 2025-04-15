export const OrderHubABI = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_owner",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_router",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_trustedForwarder",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_maxOrderDeadline",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "_timeBuffer",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "ORDER_REQUEST_TYPEHASH",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "ORDER_TYPEHASH",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "TOKEN_TYPEHASH",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "allowInitializePath",
        "inputs": [
            {
                "name": "origin",
                "type": "tuple",
                "internalType": "struct Origin",
                "components": [
                    {
                        "name": "srcEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "sender",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "nonce",
                        "type": "uint64",
                        "internalType": "uint64"
                    }
                ]
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "createOrder",
        "inputs": [
            {
                "name": "request",
                "type": "tuple",
                "internalType": "struct Root.OrderRequest",
                "components": [
                    {
                        "name": "deadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "nonce",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "order",
                        "type": "tuple",
                        "internalType": "struct Root.Order",
                        "components": [
                            {
                                "name": "user",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "filler",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "inputs",
                                "type": "tuple[]",
                                "internalType": "struct Root.Token[]",
                                "components": [
                                    {
                                        "name": "tokenType",
                                        "type": "uint8",
                                        "internalType": "enum Root.Type"
                                    },
                                    {
                                        "name": "tokenAddress",
                                        "type": "bytes32",
                                        "internalType": "bytes32"
                                    },
                                    {
                                        "name": "tokenId",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    },
                                    {
                                        "name": "amount",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    }
                                ]
                            },
                            {
                                "name": "outputs",
                                "type": "tuple[]",
                                "internalType": "struct Root.Token[]",
                                "components": [
                                    {
                                        "name": "tokenType",
                                        "type": "uint8",
                                        "internalType": "enum Root.Type"
                                    },
                                    {
                                        "name": "tokenAddress",
                                        "type": "bytes32",
                                        "internalType": "bytes32"
                                    },
                                    {
                                        "name": "tokenId",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    },
                                    {
                                        "name": "amount",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    }
                                ]
                            },
                            {
                                "name": "sourceChainEid",
                                "type": "uint32",
                                "internalType": "uint32"
                            },
                            {
                                "name": "destinationChainEid",
                                "type": "uint32",
                                "internalType": "uint32"
                            },
                            {
                                "name": "sponsored",
                                "type": "bool",
                                "internalType": "bool"
                            },
                            {
                                "name": "primaryFillerDeadline",
                                "type": "uint64",
                                "internalType": "uint64"
                            },
                            {
                                "name": "deadline",
                                "type": "uint64",
                                "internalType": "uint64"
                            },
                            {
                                "name": "callRecipient",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "callData",
                                "type": "bytes",
                                "internalType": "bytes"
                            },
                            {
                                "name": "callValue",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    }
                ]
            },
            {
                "name": "permits",
                "type": "bytes[]",
                "internalType": "bytes[]"
            },
            {
                "name": "signature",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "options",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct MessagingReceipt",
                "components": [
                    {
                        "name": "guid",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "nonce",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "fee",
                        "type": "tuple",
                        "internalType": "struct MessagingFee",
                        "components": [
                            {
                                "name": "nativeFee",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "lzTokenFee",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    }
                ]
            }
        ],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "domainSeparator",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "eip712Domain",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "fields",
                "type": "bytes1",
                "internalType": "bytes1"
            },
            {
                "name": "name",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "version",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "chainId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "verifyingContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "salt",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "extensions",
                "type": "uint256[]",
                "internalType": "uint256[]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "endpoint",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract ILayerZeroEndpointV2"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "estimateBridgingFee",
        "inputs": [
            {
                "name": "dstEid",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "payload",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "options",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getOrderId",
        "inputs": [
            {
                "name": "order",
                "type": "tuple",
                "internalType": "struct Root.Order",
                "components": [
                    {
                        "name": "user",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "filler",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "inputs",
                        "type": "tuple[]",
                        "internalType": "struct Root.Token[]",
                        "components": [
                            {
                                "name": "tokenType",
                                "type": "uint8",
                                "internalType": "enum Root.Type"
                            },
                            {
                                "name": "tokenAddress",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "tokenId",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "amount",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    },
                    {
                        "name": "outputs",
                        "type": "tuple[]",
                        "internalType": "struct Root.Token[]",
                        "components": [
                            {
                                "name": "tokenType",
                                "type": "uint8",
                                "internalType": "enum Root.Type"
                            },
                            {
                                "name": "tokenAddress",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "tokenId",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "amount",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    },
                    {
                        "name": "sourceChainEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "destinationChainEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "sponsored",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "primaryFillerDeadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "deadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "callRecipient",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "callData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callValue",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            },
            {
                "name": "nonce",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "hashOrder",
        "inputs": [
            {
                "name": "order",
                "type": "tuple",
                "internalType": "struct Root.Order",
                "components": [
                    {
                        "name": "user",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "filler",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "inputs",
                        "type": "tuple[]",
                        "internalType": "struct Root.Token[]",
                        "components": [
                            {
                                "name": "tokenType",
                                "type": "uint8",
                                "internalType": "enum Root.Type"
                            },
                            {
                                "name": "tokenAddress",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "tokenId",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "amount",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    },
                    {
                        "name": "outputs",
                        "type": "tuple[]",
                        "internalType": "struct Root.Token[]",
                        "components": [
                            {
                                "name": "tokenType",
                                "type": "uint8",
                                "internalType": "enum Root.Type"
                            },
                            {
                                "name": "tokenAddress",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "tokenId",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "amount",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    },
                    {
                        "name": "sourceChainEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "destinationChainEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "sponsored",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "primaryFillerDeadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "deadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "callRecipient",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "callData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callValue",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "hashOrderRequest",
        "inputs": [
            {
                "name": "request",
                "type": "tuple",
                "internalType": "struct Root.OrderRequest",
                "components": [
                    {
                        "name": "deadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "nonce",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "order",
                        "type": "tuple",
                        "internalType": "struct Root.Order",
                        "components": [
                            {
                                "name": "user",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "filler",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "inputs",
                                "type": "tuple[]",
                                "internalType": "struct Root.Token[]",
                                "components": [
                                    {
                                        "name": "tokenType",
                                        "type": "uint8",
                                        "internalType": "enum Root.Type"
                                    },
                                    {
                                        "name": "tokenAddress",
                                        "type": "bytes32",
                                        "internalType": "bytes32"
                                    },
                                    {
                                        "name": "tokenId",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    },
                                    {
                                        "name": "amount",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    }
                                ]
                            },
                            {
                                "name": "outputs",
                                "type": "tuple[]",
                                "internalType": "struct Root.Token[]",
                                "components": [
                                    {
                                        "name": "tokenType",
                                        "type": "uint8",
                                        "internalType": "enum Root.Type"
                                    },
                                    {
                                        "name": "tokenAddress",
                                        "type": "bytes32",
                                        "internalType": "bytes32"
                                    },
                                    {
                                        "name": "tokenId",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    },
                                    {
                                        "name": "amount",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    }
                                ]
                            },
                            {
                                "name": "sourceChainEid",
                                "type": "uint32",
                                "internalType": "uint32"
                            },
                            {
                                "name": "destinationChainEid",
                                "type": "uint32",
                                "internalType": "uint32"
                            },
                            {
                                "name": "sponsored",
                                "type": "bool",
                                "internalType": "bool"
                            },
                            {
                                "name": "primaryFillerDeadline",
                                "type": "uint64",
                                "internalType": "uint64"
                            },
                            {
                                "name": "deadline",
                                "type": "uint64",
                                "internalType": "uint64"
                            },
                            {
                                "name": "callRecipient",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "callData",
                                "type": "bytes",
                                "internalType": "bytes"
                            },
                            {
                                "name": "callValue",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    }
                ]
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "isComposeMsgSender",
        "inputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct Origin",
                "components": [
                    {
                        "name": "srcEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "sender",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "nonce",
                        "type": "uint64",
                        "internalType": "uint64"
                    }
                ]
            },
            {
                "name": "",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "_sender",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "isTrustedForwarder",
        "inputs": [
            {
                "name": "forwarder",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "lzReceive",
        "inputs": [
            {
                "name": "_origin",
                "type": "tuple",
                "internalType": "struct Origin",
                "components": [
                    {
                        "name": "srcEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "sender",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "nonce",
                        "type": "uint64",
                        "internalType": "uint64"
                    }
                ]
            },
            {
                "name": "_guid",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "_message",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "_executor",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_extraData",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "maxOrderDeadline",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "nextNonce",
        "inputs": [
            {
                "name": "",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "nonce",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "nonce",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "oAppVersion",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "senderVersion",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "receiverVersion",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "onERC1155BatchReceived",
        "inputs": [
            {
                "name": "operator",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "from",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "ids",
                "type": "uint256[]",
                "internalType": "uint256[]"
            },
            {
                "name": "values",
                "type": "uint256[]",
                "internalType": "uint256[]"
            },
            {
                "name": "data",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes4",
                "internalType": "bytes4"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "onERC1155Received",
        "inputs": [
            {
                "name": "operator",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "from",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "id",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "value",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "data",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes4",
                "internalType": "bytes4"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "onERC721Received",
        "inputs": [
            {
                "name": "operator",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "from",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "data",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes4",
                "internalType": "bytes4"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "orders",
        "inputs": [
            {
                "name": "orderId",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "status",
                "type": "uint8",
                "internalType": "enum Root.Status"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "peers",
        "inputs": [
            {
                "name": "eid",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "outputs": [
            {
                "name": "peer",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [

        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "requestNonces",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "nonce",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "outputs": [
            {
                "name": "used",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "setDelegate",
        "inputs": [
            {
                "name": "_delegate",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setMaxOrderDeadline",
        "inputs": [
            {
                "name": "newMaxOrderDeadline",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setPeer",
        "inputs": [
            {
                "name": "_eid",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "_peer",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setTimeBuffer",
        "inputs": [
            {
                "name": "newTimeBuffer",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "supportsInterface",
        "inputs": [
            {
                "name": "interfaceId",
                "type": "bytes4",
                "internalType": "bytes4"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "timeBuffer",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "trustedForwarder",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "validateOrderRequest",
        "inputs": [
            {
                "name": "request",
                "type": "tuple",
                "internalType": "struct Root.OrderRequest",
                "components": [
                    {
                        "name": "deadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "nonce",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "order",
                        "type": "tuple",
                        "internalType": "struct Root.Order",
                        "components": [
                            {
                                "name": "user",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "filler",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "inputs",
                                "type": "tuple[]",
                                "internalType": "struct Root.Token[]",
                                "components": [
                                    {
                                        "name": "tokenType",
                                        "type": "uint8",
                                        "internalType": "enum Root.Type"
                                    },
                                    {
                                        "name": "tokenAddress",
                                        "type": "bytes32",
                                        "internalType": "bytes32"
                                    },
                                    {
                                        "name": "tokenId",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    },
                                    {
                                        "name": "amount",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    }
                                ]
                            },
                            {
                                "name": "outputs",
                                "type": "tuple[]",
                                "internalType": "struct Root.Token[]",
                                "components": [
                                    {
                                        "name": "tokenType",
                                        "type": "uint8",
                                        "internalType": "enum Root.Type"
                                    },
                                    {
                                        "name": "tokenAddress",
                                        "type": "bytes32",
                                        "internalType": "bytes32"
                                    },
                                    {
                                        "name": "tokenId",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    },
                                    {
                                        "name": "amount",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    }
                                ]
                            },
                            {
                                "name": "sourceChainEid",
                                "type": "uint32",
                                "internalType": "uint32"
                            },
                            {
                                "name": "destinationChainEid",
                                "type": "uint32",
                                "internalType": "uint32"
                            },
                            {
                                "name": "sponsored",
                                "type": "bool",
                                "internalType": "bool"
                            },
                            {
                                "name": "primaryFillerDeadline",
                                "type": "uint64",
                                "internalType": "uint64"
                            },
                            {
                                "name": "deadline",
                                "type": "uint64",
                                "internalType": "uint64"
                            },
                            {
                                "name": "callRecipient",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "callData",
                                "type": "bytes",
                                "internalType": "bytes"
                            },
                            {
                                "name": "callValue",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    }
                ]
            },
            {
                "name": "signature",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "withdrawOrder",
        "inputs": [
            {
                "name": "order",
                "type": "tuple",
                "internalType": "struct Root.Order",
                "components": [
                    {
                        "name": "user",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "filler",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "inputs",
                        "type": "tuple[]",
                        "internalType": "struct Root.Token[]",
                        "components": [
                            {
                                "name": "tokenType",
                                "type": "uint8",
                                "internalType": "enum Root.Type"
                            },
                            {
                                "name": "tokenAddress",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "tokenId",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "amount",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    },
                    {
                        "name": "outputs",
                        "type": "tuple[]",
                        "internalType": "struct Root.Token[]",
                        "components": [
                            {
                                "name": "tokenType",
                                "type": "uint8",
                                "internalType": "enum Root.Type"
                            },
                            {
                                "name": "tokenAddress",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "tokenId",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "amount",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    },
                    {
                        "name": "sourceChainEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "destinationChainEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "sponsored",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "primaryFillerDeadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "deadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "callRecipient",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "callData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callValue",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            },
            {
                "name": "orderNonce",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "EIP712DomainChanged",
        "inputs": [

        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ERC1155BatchReceived",
        "inputs": [
            {
                "name": "operator",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "from",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "ids",
                "type": "uint256[]",
                "indexed": false,
                "internalType": "uint256[]"
            },
            {
                "name": "values",
                "type": "uint256[]",
                "indexed": false,
                "internalType": "uint256[]"
            },
            {
                "name": "data",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ERC1155Received",
        "inputs": [
            {
                "name": "operator",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "from",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "id",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "value",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "data",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ERC721Received",
        "inputs": [
            {
                "name": "operator",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "from",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "data",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "MaxOrderDeadlineUpdated",
        "inputs": [
            {
                "name": "oldDeadline",
                "type": "uint64",
                "indexed": true,
                "internalType": "uint64"
            },
            {
                "name": "newDeadline",
                "type": "uint64",
                "indexed": true,
                "internalType": "uint64"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OrderCreated",
        "inputs": [
            {
                "name": "orderId",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "nonce",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            },
            {
                "name": "order",
                "type": "tuple",
                "indexed": false,
                "internalType": "struct Root.Order",
                "components": [
                    {
                        "name": "user",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "filler",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "inputs",
                        "type": "tuple[]",
                        "internalType": "struct Root.Token[]",
                        "components": [
                            {
                                "name": "tokenType",
                                "type": "uint8",
                                "internalType": "enum Root.Type"
                            },
                            {
                                "name": "tokenAddress",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "tokenId",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "amount",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    },
                    {
                        "name": "outputs",
                        "type": "tuple[]",
                        "internalType": "struct Root.Token[]",
                        "components": [
                            {
                                "name": "tokenType",
                                "type": "uint8",
                                "internalType": "enum Root.Type"
                            },
                            {
                                "name": "tokenAddress",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "tokenId",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "amount",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    },
                    {
                        "name": "sourceChainEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "destinationChainEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "sponsored",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "primaryFillerDeadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "deadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "callRecipient",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "callData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callValue",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            },
            {
                "name": "caller",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OrderSettled",
        "inputs": [
            {
                "name": "orderId",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "order",
                "type": "tuple",
                "indexed": true,
                "internalType": "struct Root.Order",
                "components": [
                    {
                        "name": "user",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "filler",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "inputs",
                        "type": "tuple[]",
                        "internalType": "struct Root.Token[]",
                        "components": [
                            {
                                "name": "tokenType",
                                "type": "uint8",
                                "internalType": "enum Root.Type"
                            },
                            {
                                "name": "tokenAddress",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "tokenId",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "amount",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    },
                    {
                        "name": "outputs",
                        "type": "tuple[]",
                        "internalType": "struct Root.Token[]",
                        "components": [
                            {
                                "name": "tokenType",
                                "type": "uint8",
                                "internalType": "enum Root.Type"
                            },
                            {
                                "name": "tokenAddress",
                                "type": "bytes32",
                                "internalType": "bytes32"
                            },
                            {
                                "name": "tokenId",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "amount",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    },
                    {
                        "name": "sourceChainEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "destinationChainEid",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "sponsored",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "primaryFillerDeadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "deadline",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "callRecipient",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "callData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callValue",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OrderWithdrawn",
        "inputs": [
            {
                "name": "orderId",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "caller",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "PeerSet",
        "inputs": [
            {
                "name": "eid",
                "type": "uint32",
                "indexed": false,
                "internalType": "uint32"
            },
            {
                "name": "peer",
                "type": "bytes32",
                "indexed": false,
                "internalType": "bytes32"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "TimeBufferUpdated",
        "inputs": [
            {
                "name": "oldTimeBufferVal",
                "type": "uint64",
                "indexed": true,
                "internalType": "uint64"
            },
            {
                "name": "newTimeBufferVal",
                "type": "uint64",
                "indexed": true,
                "internalType": "uint64"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "InsufficientGasValue",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "InvalidDeadline",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "InvalidDelegate",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "InvalidDestinationEndpoint",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "InvalidEndpointCall",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "InvalidOrderInputApprovals",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "InvalidOrderSignature",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "InvalidShortString",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "InvalidSourceChain",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "LzTokenUnavailable",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "NativeTransferFailed",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "NoPeer",
        "inputs": [
            {
                "name": "eid",
                "type": "uint32",
                "internalType": "uint32"
            }
        ]
    },
    {
        "type": "error",
        "name": "NotEnoughNative",
        "inputs": [
            {
                "name": "msgValue",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "OnlyEndpoint",
        "inputs": [
            {
                "name": "addr",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "OnlyPeer",
        "inputs": [
            {
                "name": "eid",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "sender",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ]
    },
    {
        "type": "error",
        "name": "OrderCannotBeFilled",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OrderCannotBeWithdrawn",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OrderDeadlinesMismatch",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OrderExpired",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OrderPrimaryFillerExpired",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OwnableInvalidOwner",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "OwnableUnauthorizedAccount",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "PermitFailure",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "RequestExpired",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "RequestNonceReused",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "SafeERC20FailedOperation",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "StringTooLong",
        "inputs": [
            {
                "name": "str",
                "type": "string",
                "internalType": "string"
            }
        ]
    },
    {
        "type": "error",
        "name": "UnsupportedTransfer",
        "inputs": [

        ]
    }
]