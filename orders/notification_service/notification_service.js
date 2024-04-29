// notification_service.js
const amqp = require('amqplib');
const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost'; // default to localhost if env var is not set
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672; // default to 5672 if env var is not set

async function connect() {
    const conn = await amqp.connect(`amqp://${RABBITMQ_HOST}:${RABBITMQ_PORT}`);
    const channel = await conn.createChannel();

    const notificationQueue = 'notification_queue';
    await channel.assertQueue(notificationQueue, { durable: true });

    console.log("Notification Service is waiting for messages in %s. To exit press CTRL+C", notificationQueue);

    channel.consume(notificationQueue, function(msg) {
        const notificationInfo = JSON.parse(msg.content.toString());
        console.log("Sending notification to:", notificationInfo);

        // Here would be the logic to send an email or another type of notification
        channel.ack(msg);
    });
}

connect().catch(error => console.error(error));
