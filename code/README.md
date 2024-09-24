# Code folder

Run like this:

Start the docker engine -> Move to /code directory -> Run docker-compose down (to remove previous container/image data) -> Run docker-compose up --build

Frontend shows up at localhost:3000

Rabbitmq management is running on localhost:15672 (credentials: guest, guest).

Important: Make sure the wait-for-it.sh scripts are in LF encoding and not in CRLF encoding. You can check it in the editor options of the file. To make sure script encoding is not converted from LF to CRLF when running git clone from Windows, run git config --global core.autocrlf false.

Three changes are necessary when running locally (on solve_ms/main_program.py, solve_ms/father.py and on submit_ms/submit.js)
