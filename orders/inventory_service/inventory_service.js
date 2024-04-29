// inventory_service.js
const amqp = require('amqplib');
const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost'; // default to localhost if env var is not set
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672; // default to 5672 if env var is not set

async function connect() {
    const conn = await amqp.connect(`amqp://${RABBITMQ_HOST}:${RABBITMQ_PORT}`);
    const channel = await conn.createChannel();

    const inventoryQueue = 'inventory_queue';
    await channel.assertQueue(inventoryQueue, { durable: true });
    await channel.assertExchange('inventory_exchange', 'direct', { durable: true });
    await channel.bindQueue(inventoryQueue, 'inventory_exchange', 'inventory_service.check');

    console.log("Inventory Service is waiting for messages in %s. To exit press CTRL+C", inventoryQueue);

    channel.consume(inventoryQueue,  async function(msg) {
        const content = JSON.parse(msg.content.toString());
        console.log("Processing inventory_service for:", content);

        // Simulate inventory_service check
        const inventoryStatus = { orderId: content.id, status: 'available' };

        // Respond to Order Service about inventory_service status

        await channel.assertExchange('order_exchange', 'direct', { durable: true });
        channel.publish('order_exchange', 'order.confirmed', Buffer.from(JSON.stringify(inventoryStatus)));

        // Acknowledge the message as processed successfully
        channel.ack(msg);
    });
}

connect().catch(error => console.error(error));
