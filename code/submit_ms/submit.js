const amqp = require('amqplib');

const submit_problemQueue = 'submit_problem_queue';
const responseQueue = 'response_queue';
const deleteQueue='delete_queue'
let connection;
let channel = null;
const RECONNECT_INTERVAL = 5000; // 5 seconds

async function connectRabbitMQ() {
    //if (!channel) {
    const connection = await amqp.connect('amqp://rabbitmq', { //amqp://localhost'  when running on localhost
      heartbeat: 600 // Set the heartbeat interval to 10 seconds
  }); // Connect to RabbitMQ server
    connection.on('error', handleConnectionError);
    connection.on('close', handleConnectionClose);
    channel = await connection.createChannel(); // Create a channel
    await channel.assertQueue(submit_problemQueue, { durable: true }); // Assert queues
    await channel.assertQueue(responseQueue, { durable: true });
    await channel.assertQueue(deleteQueue, { durable: true });
    //}
}

function handleConnectionError(err) {
  console.error('Connection error:', err);
}

function handleConnectionClose() {
  console.error('Connection closed, reconnecting...');
  setTimeout(connectRabbitMQ, RECONNECT_INTERVAL);
}

async function sendProblemData(data) {
    await connectRabbitMQ();
    channel.sendToQueue(submit_problemQueue, Buffer.from(JSON.stringify(data))); // Send problem data
    console.log("Sent problem data to the solver.");
}

async function sendDeleteSignal() {
  await connectRabbitMQ();
  // Convert the message into a buffer
  const message = JSON.stringify({ delete: 'true'});

  // Send the message to the queue
  channel.sendToQueue(deleteQueue, Buffer.from(message));
  console.log("Sent delete signal.");
}

async function listenForSolutions() {
  await connectRabbitMQ();
  console.log("Awaiting responses...");
  return new Promise((resolve, reject) => {
    try{
      channel.consume(responseQueue, message => {
          if(message==null){
            resolve({solution: 'cancelled'});
            return;
          }
          const content = message.content.toString();
          channel.ack(message);
          resolve(content);
          channel.close();
      });}
      catch (error){reject (error)}
  });
}

async function deleteQueue1() {
  try {
      await connectRabbitMQ();

      // Delete responseQueue
      const responseQueueResult = await channel.deleteQueue(responseQueue);
      console.log(`Response queue deleted`, responseQueueResult);

      // Delete submit_problemQueue
      const submitProblemQueueResult = await channel.deleteQueue(submit_problemQueue);
      console.log(`Submit problem queue deleted`, submitProblemQueueResult);
      
      await channel.close();
      //await connection.close();

      return {
        responseQueueResult,
        submitProblemQueueResult
      };
  } catch (error) {
      console.error(`Failed to delete queues:`, error);
      throw error;
  }
}


module.exports = {
    sendProblemData,
    listenForSolutions,
    sendDeleteSignal,
    deleteQueue1
};
