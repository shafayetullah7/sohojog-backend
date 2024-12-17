export const AppConfig = {
    websocket: {
      namespace: '/chat',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'default_secret',
      expiresIn: '1h',
    },
    app: {
      port:  3000,
    },
  };
  