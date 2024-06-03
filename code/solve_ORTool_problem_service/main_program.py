import json
import pika
from vrpSolver import main_solver  # Import your solver functions

def callback(ch, method, properties, body):
    data = json.loads(body)
    locations = data['locations']
    num_vehicles = int(data['num_vehicles'])
    depot = int(data['depot'])
    max_distance = int(data['max_distance'])

    # Solve the problem using the existing logic
    result = main_solver(locations, num_vehicles, depot, max_distance)

    if result ==None:
        result='No solution found. Try different parameters.'

    # Send the result back to another queue
    ch.basic_publish(
        exchange='',
        routing_key='response_queue',
        body=json.dumps(result)
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)

def main():
    # Setup connection and channel
    connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq')) #localhost to run locally, rabbitmq to run in containers
    channel = connection.channel()

    # Declare the queue from which to consume
    channel.queue_declare(queue='submit_problem_queue')

    # Set up consumer
    channel.basic_consume(
        queue='submit_problem_queue',
        on_message_callback=callback,
        auto_ack=False
    )

    print('Waiting for messages. To exit press CTRL+C')
    try:
        print(1)
        channel.start_consuming()
        print(2)
    except KeyboardInterrupt:
        channel.stop_consuming()
    connection.close()

if __name__ == "__main__":
    main()
