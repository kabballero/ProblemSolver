// order_service.js
const amqp = require('amqplib');
const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost'; // default to localhost if env var is not set
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672; // default to 5672 if env var is not set

async function connect() {
    const conn = await amqp.connect(`amqp://${RABBITMQ_HOST}:${RABBITMQ_PORT}`);
    const channel = await conn.createChannel();

    const orderQueue = 'order_queue';
    await channel.assertQueue(orderQueue, { durable: true });

    console.log("Order Service is waiting for messages in %s. To exit press CTRL+C", orderQueue);

    channel.consume(orderQueue, async function(msg) {
        const order = JSON.parse(msg.content.toString());
        console.log("Received order:", order);

        // Check inventory_service
        await channel.assertExchange('inventory_exchange', 'direct', { durable: true });
        channel.publish('inventory_exchange', 'inventory_service.check', Buffer.from(JSON.stringify(order)));

        channel.ack(msg);
    });
}

connect().catch(error => console.error(error));
