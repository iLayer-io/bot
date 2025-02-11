export default {
  config: () => ({
    chain: [
      {
        name: 'Foundry',
        private_key:
          '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
        chain_id: 1234,
        rpc_url: 'http://127.0.0.1:8545',
        ws_url: 'ws://127.0.0.1:8545',
        start_block: 0,
        block_batch_size: 1000,
        max_tx_retry: 3,
        min_order_val: 1,
        max_order_val: 100000,
        profitability_threshold: 0.1,
        order_hub_contract_address:
          '0xA15BB66138824a1c7167f5E85b957d04Dd34E468',
        order_spoke_contract_address:
          '0xb19b36b1456E65E3A6D514D3F715f204BD59f431',
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
