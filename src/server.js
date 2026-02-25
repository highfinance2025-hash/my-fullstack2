const mongoose = require('mongoose');
const Redis = require('ioredis'); // ✅ اضافه کردن ماژول ioredis
const config = require('./config/env.config');
const logger = require('./utils/logger');
const app = require('./app');

const startServer = async () => {
  try {
    // 1️⃣ اتصال به MongoDB
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('✅ MongoDB Connected Successfully');
    logger.info('✅ MongoDB Connected');

    // 2️⃣ اتصال به Redis
    if (process.env.REDIS_URL) {
      try {
        const redis = new Redis(process.env.REDIS_URL);
        redis.on('connect', () => {
          console.log('✅ Redis Connected Successfully');
          logger.info('✅ Redis Connected');
        });
        redis.on('error', (err) => {
          console.error('❌ Redis Error:', err.message);
          logger.error(`❌ Redis Error: ${err.message}`);
        });
      } catch (redisErr) {
        console.error('❌ Redis Connection Failed:', redisErr.message);
      }
    } else {
      console.warn('⚠️ Warning: REDIS_URL not found in environment variables.');
    }

    // 3️⃣ روشن کردن سرور
    const PORT = config.port || 3000;
    
    app.listen(PORT, () => {
      console.log('------------------------------------------------');
      console.log(`🚀 Server is live at http://localhost:${PORT}`);
      console.log('------------------------------------------------');
      logger.info(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
    logger.error(`❌ Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

// ⚠️ نکته امنیتی برای ویندوز
if (process.platform === 'win32') {
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on('SIGINT', () => process.emit('SIGINT'));
}

// هندل کردن خاموش شدن صحیح
process.on('SIGINT', () => {
  mongoose.connection.close(false).then(() => {
    console.log('🔌 Server shut down gracefully');
    process.exit(0);
  });
});

startServer();
