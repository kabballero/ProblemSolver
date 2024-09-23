/*
const amqp = require('amqplib');

async function sendProblemData(channel, queue, data) {
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
    console.log("Sent problem data to the solver.");
}

async function listenForSolutions(channel, queue) {
    console.log("Awaiting responses...");
    channel.consume(queue, message => {
        console.log("Received solution:", message.content.toString());
        channel.ack(message);
        // Optionally close connection here if only expecting a single message
        // connection.close();
    });
}

async function main() {
    const submit_problemQueue = 'submit_problem_queue';
    const responseQueue = 'response_queue';

    try {
        const connection = await amqp.connect('amqp://localhost'); //localhost if run locally
        const channel = await connection.createChannel();
        
        await channel.assertQueue(submit_problemQueue, { durable: false });
        await channel.assertQueue(responseQueue, { durable: false });

        // Example problem data
        const problemData = {
            locations: [
                {
                  "Latitude": 37.99983328183838,
                  "Longitude": 23.74317714798427
                },
                {
                  "Latitude": 37.966783510525985,
                  "Longitude": 23.778605533642235
                },
                {
                  "Latitude": 37.9990464764814,
                  "Longitude": 23.773251398190194
                },
                {
                  "Latitude": 37.974070236340665,
                  "Longitude": 23.737519890565082
                },
                {
                  "Latitude": 37.99763705556787,
                  "Longitude": 23.76632669971703
                },
                {
                  "Latitude": 37.987158185269436,
                  "Longitude": 23.760040398809927
                },
                {
                  "Latitude": 37.96565952612894,
                  "Longitude": 23.78044816563277
                },
                {
                  "Latitude": 38.00816194011881,
                  "Longitude": 23.743726736188382
                },
                {
                  "Latitude": 37.983474656462256,
                  "Longitude": 23.73256864917707
                },
                {
                  "Latitude": 37.96362413346355,
                  "Longitude": 23.77785820154608
                },
                {
                  "Latitude": 37.96581060070882,
                  "Longitude": 23.72133687257313
                },
                {
                  "Latitude": 37.97624293546459,
                  "Longitude": 23.740238201740137
                },
                {
                  "Latitude": 38.00566809733227,
                  "Longitude": 23.728089082692076
                },
                {
                  "Latitude": 38.00132387722171,
                  "Longitude": 23.75830400972441
                },
                {
                  "Latitude": 37.96320247915091,
                  "Longitude": 23.785174964462342
                },
                {
                  "Latitude": 37.965357705819066,
                  "Longitude": 23.74320004992697
                },
                {
                  "Latitude": 37.9692186084866,
                  "Longitude": 23.785110852487332
                },
                {
                  "Latitude": 37.98271697637991,
                  "Longitude": 23.73542153051244
                },
                {
                  "Latitude": 37.97230013076112,
                  "Longitude": 23.788423933330492
                },
                {
                  "Latitude": 37.97827880279073,
                  "Longitude": 23.75884558944574
                }
              ],
            num_vehicles: 5,
            depot: 0,
            max_distance: 20000
        };

        // Sending problem data
        await sendProblemData(channel, submit_problemQueue, problemData);

        // Listening for solutions
        await listenForSolutions(channel, responseQueue);

    } catch (error) {
        console.error("Error connecting to RabbitMQ:", error);
    }
}

main().catch(console.error);
*/

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

/*async function listenForSolutions() {
    await connectRabbitMQ();
    console.log("Awaiting responses...");
    channel.consume(responseQueue, message => {
        console.log("Received solution:", message.content.toString());
        channel.ack(message);
        // Optionally close connection here if only expecting a single message
        // connection.close();
    });
}*/

async function listenForSolutions() {
  await connectRabbitMQ();
  console.log("Awaiting responses...");
  return new Promise((resolve, reject) => {
    try{
      channel.consume(responseQueue, message => {
          console.log("Received solution:", message.content.toString());
          const content = message.content.toString();
          //console.log(content)
          channel.ack(message);
          //console.log(content);
          resolve(content);
          // Optionally close connection here if only expecting a single message
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
