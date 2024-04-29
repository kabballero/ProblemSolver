Orders project: simulates the ordeing of an object -> check inventory if its available -> send notification if the order succeded

3 microservices: order, inventory, notification, each one has its own Dockerfile and node-modules. We create a general docker compose that will set up the 3 containers + a container for the rabbit mq server. It sets a local network for the containers so they can communicate (127.0.0.2-5).
wait-for-it.sh is a script that the 3 containers run when they are being set up,because we need the rabbitmq server to be up and running before they are.
By default rabbit mq runs on port 5672. You can reach rabbit mq management interface in localhost:15672, defaulr credentials guest, guest. There you can observe the queues, the exchnages, the traffic in the channels etc. You can also simulate sendind a message from a producer to a consumer (exchanges -> pick exchange -> publish message in json format).

You just run in the orders directory: docker-compose up --build  and the system is ready to send and receive messages.
