export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
  },
  // Add your own config values here
  chains: [
    {
      name: "anvil",
      chain_id: 1,
      ws_url: "wss://example.ws.url",
      start_block: 0,
      block_batch_size: 1000,
      max_tx_retry: 3,
      min_order_val: 0.1,
      max_order_val: 1000,
      profitability_threshold: 0.02,
      order_hub_contract_address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      order_spoke_contract_address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      private_key_environment_variable: "PRIVATE_KEY_ANVIL",
      rpc_url_environment_variable: "RPC_URL_ANVIL",
      filler_poll_interval: 1000,
      tokens: [
        {
          name: "Input Token",
          symbol: "INPUT",
          type: "native",
          address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
          decimals: 18,
          price_feed: "0x1234567890123456789012345678901234567890",
          display_decimals: 4,
          image: "https://example.com/token-image.png"
        },
        {
          name: "Output Token",
          symbol: "OUTPUT",
          type: "native",
          address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
          decimals: 18,
          price_feed: "0x1234567890123456789012345678901234567890",
          display_decimals: 4,
          image: "https://example.com/token-image.png"
        }
      ]
    },
    {
      name: "arbitrum",
      chain_id: 42161,
      chain_eid: 30110,
      order_hub_user: "0x25726f2124bE5723C0DeA47D9786b8d52EeF12b5",
      order_hub_contract_address: "0x58C0CEF0EAa9Fc48DE66b09009e59aae2d117150",
      order_spoke_contract_address: "0x7c4e9f318550b4d12c39506f09657da43c6713ed",
      private_key_environment_variable: "PRIVATE_KEY_ARBITRUM",
      rpc_url_environment_variable: "RPC_URL_ARBITRUM",
      tokens: [
        {
          name: "USDC",
          symbol: "USDC",
          type: "native",
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          decimals: 6,
          price_feed: "",
          display_decimals: 4,
          image: "https://example.com/token-image.png"
        },
        {
          name: "WETH",
          symbol: "WETH",
          type: "native",
          address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
          decimals: 18,
          price_feed: "",
          display_decimals: 4,
          image: "https://example.com/token-image.png"
        }
        // Add more tokens as needed
      ]
    },
    {
      name: "base",
      chain_id: 8453,
      chain_eid: 30184,
      order_hub_user: "0x25726f2124bE5723C0DeA47D9786b8d52EeF12b5",
      order_hub_contract_address: "0x58C0CEF0EAa9Fc48DE66b09009e59aae2d117150",
      order_spoke_contract_address: "0x7c4e9f318550b4d12c39506f09657da43c6713ed",
      private_key_environment_variable: "PRIVATE_KEY_BASE",
      rpc_url_environment_variable: "RPC_URL_BASE",
      tokens: [
        {
          name: "USDC",
          symbol: "USDC",
          type: "native",
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          decimals: 6,
          price_feed: "",
          display_decimals: 4,
          image: "https://example.com/token-image.png"
        },
        {
          name: "WETH",
          symbol: "WETH",
          type: "native",
          address: "0x4200000000000000000000000000000000000006",
          decimals: 18,
          price_feed: "",
          display_decimals: 4,
          image: "https://example.com/token-image.png"
        }
        // Add more tokens as needed
      ]
    }
    // Add more chains as needed
  ]
});
