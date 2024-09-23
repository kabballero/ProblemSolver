import subprocess
import json
import pika

process = None

# Function to run the child process
def run_child_process():
    return subprocess.Popen(['python', 'main_program.py'])

def callback(ch, method, properties, body):
    global process
    try:
        data = json.loads(body)
        print(data)
        delete = data['delete']
        if delete=='true':
            print('terminating main program')
            process.kill()
            process.wait() 
            print("Restarting child process...")
            process = run_child_process()
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print('acknwoledged delete signal')
    except Exception as e:
        print(f"Error processing message from delete queue: {e}")

# Main loop to monitor the environment variable and restart the process
def monitor_and_restart():
    global process
    process = run_child_process()  # Start the child process

    try:
        connection_params = pika.ConnectionParameters(
        host='rabbitmq', #localhost to run locally, rabbitmq to run in containers
        heartbeat=600  # Increase the heartbeat timeout
        )

        connection = pika.BlockingConnection(connection_params) 
        channel = connection.channel()

        # Declare the queue from which to consume
        channel.queue_declare(queue='delete_queue', durable=True)

        # Set up consumer
        channel.basic_consume(
            queue='delete_queue',
            on_message_callback=callback,
            auto_ack=False
        )
        print("start listening for delete signals")
        channel.start_consuming()
    except KeyboardInterrupt:
        # Cleanup if the main process is interrupted (Ctrl+C)
        print("Shutting down...")
        process.terminate()
        process.wait()

if __name__ == "__main__":
    monitor_and_restart()
