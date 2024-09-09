import json
import pika
import time
import sys
import asyncio
from vrpSolver import main_solver  # Import your solver functions

RETRY_INTERVAL = 5  # Interval between reconnection attempts in seconds

def callback(ch, method, properties, body):
    try:
        data = json.loads(body)
        print(data)
        locations = data['locations']
        num_vehicles = int(data['num_vehicles'])
        depot = int(data['depot'])
        max_distance = int(data['max_distance'])

        # Solve the problem using the existing logic
        result = main_solver(locations, num_vehicles, depot, max_distance)
        print(result)
        if result ==None:
            result='No solution found. Try different parameters.'

        # Send the result back to another queue
        ch.basic_publish(
            exchange='',
            routing_key='response_queue',
            body=json.dumps(result)
        )
        print("Message published to response_queue")

        ch.basic_ack(delivery_tag=method.delivery_tag)
        print('acknwoledged')

    except Exception as e:
        print(f"Error processing message: {e}")

def main():
    # Setup connection and channel
    connection_params = pika.ConnectionParameters(
        host='rabbitmq', #localhost to run locally, rabbitmq to run in containers
        heartbeat=600  # Increase the heartbeat timeout
    )

    connection = pika.BlockingConnection(connection_params) 
    channel = connection.channel()

    # Declare the queue from which to consume
    channel.queue_declare(queue='submit_problem_queue', durable=True)

    # Set up consumer
    channel.basic_consume(
        queue='submit_problem_queue',
        on_message_callback=callback,
        auto_ack=False
    )

    #print('Waiting for messages. To exit press CTRL+C')
    try:
        print("trynig to consume")
        channel.start_consuming()
    except pika.exceptions.AMQPConnectionError as e:
        print(f"Connection error: {e}, retrying in {RETRY_INTERVAL} seconds...")
        time.sleep(RETRY_INTERVAL)
    except KeyboardInterrupt:
        channel.stop_consuming()
    if connection.is_open:
        connection.close()

if __name__ == "__main__":
    main()