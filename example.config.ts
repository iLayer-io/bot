export default {
  config: () => ({
    chain: [
      {
        name: 'alloy',
        chain_id: 1234,
        rpc_url: 'http://127.0.0.1:8545',
        ws_url: 'ws://127.0.0.1:8545',
        start_block: 0,
        block_batch_size: 1000,
        max_tx_retry: 3,
        min_order_val: 1,
        max_order_val: 100000,
        profitability_threshold: 0.1,
        order_contract_address: '0x8ce361602B935680E8DeC218b820ff5056BeB7af',
        filler_poll_interval: 5000,
        tokens: [
          {
            name: 'USD Coin',
            symbol: 'USDC',
            type: 'ERC20',
            address: '0x123',
            decimals: 18,
            price_feed: 'xyz',
            display_decimals: 2,
            image: 'https://...',
          },
          {
            name: 'DAI',
            symbol: 'DAI',
            type: 'ERC20',
            address: '0x356',
            decimals: 18,
            price_feed: 'xyz',
            display_decimals: 2,
            image: 'https://...',
          },
        ],
      },
    ],
  }),
};
