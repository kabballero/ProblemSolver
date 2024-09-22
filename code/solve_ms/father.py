import subprocess
import os
import time
from dotenv import load_dotenv
from pathlib import Path

# Path to the .env file located in another folder
env_path = Path('../.env')

# Load the .env file into the environment
load_dotenv(dotenv_path=env_path)

# Function to run the child process
def run_child_process():
    return subprocess.Popen(['python', 'main_program.py'])

# Main loop to monitor the environment variable and restart the process
def monitor_and_restart():
    process = run_child_process()  # Start the child process

    try:
        while True:
            # Load the environment variable each time (in case the file changes)
            load_dotenv(dotenv_path=env_path, override=True)  # Reload the .env file to get updated values

            # Check the environment variable
            condition = os.getenv('QUEUE_DELETED')

            if condition == 'true':  # If the variable is "true", kill and restart the process
                print("Condition met, terminating the child process...")
                process.kill()  # Terminate the child process
                process.wait()  # Wait for it to fully stop
                print("Child process terminated.")

                # Restart the child process
                print("Restarting child process...")
                process = run_child_process()

                # Reset the environment variable to "false"
                os.environ['KILL_CHILD'] = 'false'

                # Optionally write the change back to the .env file
                with open(env_path, 'w') as f:
                    f.write('QUEUE_DELETED=false\n')

                print("Environment variable reset to 'false'.")

            time.sleep(5)  # Sleep for 5 seconds before checking again

    except KeyboardInterrupt:
        # Cleanup if the main process is interrupted (Ctrl+C)
        print("Shutting down...")
        process.terminate()
        process.wait()

if __name__ == "__main__":
    monitor_and_restart()
