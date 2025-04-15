// src/config/configuration.ts
export default () => ({
    app: {
      port: parseInt(process.env.PORT ?? '3000', 10),
    },
  });
  