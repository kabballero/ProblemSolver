const express = require('express');
const mongoose = require('mongoose');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const Problem = require('./problem');
const dbConnection = require('./database');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = 4000;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 600, height: 400 });

app.use(express.static('public')); // Serve static files from the "public" directory

// Connect to the database
dbConnection.then(() => {
  console.log('Connected to the database.');
}).catch((error) => {
  console.error('Error connecting to the database:', error);
});

//Fetch all problems in the database
app.get('/problems', async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching problems', error });
  }
});

//Fetch all problem parameters (time taken, solution etc) for all problems submitted by a specific user
app.get('/problems_time/:user_id', async (req, res) => {
  const userId = req.params.user_id;
  try {
    // Find all problems associated with the user
    const problems = await Problem.find({ usersid: userId });

    if (problems.length === 0) {
      return res.status(404).json({ message: 'No problems found for this user' });
    }

    // Grouping logic: Using a map to group by the five parameters
    const groupedProblems = {};

    problems.forEach(problem => {

      if (!(Array.isArray(problem.solution)) || (Array.isArray(problem.solution) && problem.solution?.length === 0) || (Array.isArray(problem.solution) && problem.solution?.length === 1 && (problem.solution[0] === "No solution found. Try different parameters."))) {
        return;   
      }
      const problemId = problem._id.toString();
      problem.problemsinput.forEach(input => {
        const key = `${problemId}-${input.locations.length}-${input.num_vehicles}-${input.depot}-${input.max_distance}-${JSON.stringify(input.locations)}`;

        if (!groupedProblems[key]) {
          groupedProblems[key] = {
            problem_id: problemId,
            num_locations: input.locations.length,
            num_vehicles: input.num_vehicles,
            depot: input.depot,
            max_distance: input.max_distance,
            locations: input.locations,
            time_taken: []
          };
        }

        problem.solution?.forEach(solution => {
          groupedProblems[key].time_taken.push(solution.time_taken);
        });
      });
    });

    // Prepare the response
    const response = Object.values(groupedProblems).map(group => {
      const randomTimeTaken = group.time_taken[Math.floor(Math.random() * group.time_taken.length)];
      return {
        problem_id: group.problem_id,
        num_locations: group.num_locations,
        num_vehicles: group.num_vehicles,
        depot: group.depot,
        max_distance: group.max_distance,
        locations: group.locations,
        time_taken: randomTimeTaken
      };
    });

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching problems', error });
  }
});


   //Generate a graph routes number - ascending order graph 
   app.get('/chart/:id', async (req, res) => {
    try {
        // Fetch the problem by ID
        const problem = await Problem.findById(req.params.id);

        if (!problem || !problem.solution || problem.solution.length === 0) {
            return res.status(404).json({ message: 'No solution found for this problem' });
        }

        // Extract routes from the problem's solution
        const routes = problem.solution[0].routes;
        const locations = problem.problemsinput[0].locations;

        if (!routes || routes.length === 0) {
            return res.status(404).json({ message: 'No route data available to plot' });
        }

        // Define different colors for each vehicle
        const colors = ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)'];

        // Prepare datasets for each vehicle
        const datasets = routes.map((route, index) => {
            const vehicleRoute = route.route;
            
            const data = vehicleRoute.map((pointIndex) => {
                const location = locations[pointIndex];
                return {
                    x: location.Longitude,  // X axis is the longitude
                    y: location.Latitude,   // Y axis is the latitude
                    node: pointIndex        // Store the node number for labeling
                };
            });

            return {
                label: `Vehicle ${route.vehicle_id} Route`,
                data: data,
                borderColor: colors[index % colors.length], // Assign a color from the list
                borderWidth: 2,
                fill: false,
                showLine: true,  // Connect the points with a line
                pointRadius: 5,  // Customize point size
                pointBackgroundColor: colors[index % colors.length],
            };
        });

        const configuration = {
            type: 'scatter',  // Use scatter chart for points
            data: {
                datasets: datasets
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Longitude'
                        }
                    },
                    y: {
                        beginAtZero: false,  // Latitude can be negative, so don’t start at 0
                        title: {
                            display: true,
                            text: 'Latitude'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const node = context.raw.node;
                                return `${node}: (${context.raw.x.toFixed(4)}, ${context.raw.y.toFixed(4)})`;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                    }
                }
            },
            plugins: [{
                // Plugin to draw custom node labels and highlight depot, and add arrows
                id: 'customLabelsAndArrows',
                afterDatasetsDraw: (chart) => {
                    const ctx = chart.ctx;
                    ctx.save();

                    // Iterate over each dataset
                    chart.data.datasets.forEach((dataset, datasetIndex) => {
                        const meta = chart.getDatasetMeta(datasetIndex);

                        // For each data point in the dataset
                        dataset.data.forEach((dataPoint, index) => {
                            const node = dataPoint.node;
                            const point = meta.data[index];  // Ensure we get the correct point

                            if (point) {  // Check if point exists
                                const posX = point.x;
                                const posY = point.y;

                                // Set text properties for labels
                                ctx.font = '12px Arial';
                                ctx.fillStyle = 'black';
                                ctx.textAlign = 'center';

                                // Draw the node number above the point
                                ctx.fillText(`${node}`, posX, posY - 10);  // Just the number

                                // Highlight the depot (node 0) with a larger point and label
                                if (node === 0) {
                                    ctx.beginPath();
                                    ctx.arc(posX, posY, 6, 0, 2 * Math.PI);  // Draw a larger circle
                                    ctx.fillStyle = 'yellow';  // Use a different color for the depot
                                    ctx.fill();
                                    ctx.stroke();
                                    ctx.closePath();
                                }

                                // Draw direction arrows between points, starting from depot (node 0)
                                // Draw direction arrows between points, starting from depot (node 0)
                                if (index < dataset.data.length - 1) {
                                    const nextPoint = meta.data[index + 1];  // Get the next point in the route
                                    if (nextPoint) {
                                        const arrowStartX = posX;
                                        const arrowStartY = posY;
                                        const arrowEndX = nextPoint.x;
                                        const arrowEndY = nextPoint.y;

                                        // Calculate the direction and shorten the line slightly so the arrowhead doesn't overlap the node
                                        const arrowLength = Math.sqrt((arrowEndX - arrowStartX) ** 2 + (arrowEndY - arrowStartY) ** 2);
                                        const shortenFactor = 6 / arrowLength;  // Shorten by 10 pixels
                                        const shortenedEndX = arrowEndX - (arrowEndX - arrowStartX) * shortenFactor;
                                        const shortenedEndY = arrowEndY - (arrowEndY - arrowStartY) * shortenFactor;

                                        // Draw the shortened line between points
                                        ctx.beginPath();
                                        ctx.moveTo(arrowStartX, arrowStartY);
                                        ctx.lineTo(shortenedEndX, shortenedEndY);  // Use the shortened endpoint
                                        ctx.strokeStyle = colors[datasetIndex % colors.length];
                                        ctx.lineWidth = 2;
                                        ctx.stroke();

                                        // Draw the arrowhead
                                        const angle = Math.atan2(arrowEndY - arrowStartY, arrowEndX - arrowStartX);
                                        const headLength = 10;  // Arrowhead length

                                        // Coordinates for arrowhead
                                        const arrowHeadX1 = shortenedEndX - headLength * Math.cos(angle - Math.PI / 6);
                                        const arrowHeadY1 = shortenedEndY - headLength * Math.sin(angle - Math.PI / 6);
                                        const arrowHeadX2 = shortenedEndX - headLength * Math.cos(angle + Math.PI / 6);
                                        const arrowHeadY2 = shortenedEndY - headLength * Math.sin(angle + Math.PI / 6);

                                        // Draw the arrowhead
                                        ctx.beginPath();
                                        ctx.moveTo(shortenedEndX, shortenedEndY);
                                        ctx.lineTo(arrowHeadX1, arrowHeadY1);
                                        ctx.lineTo(arrowHeadX2, arrowHeadY2);
                                        ctx.lineTo(shortenedEndX, shortenedEndY);
                                        ctx.fillStyle = colors[datasetIndex % colors.length];
                                        ctx.fill();
                                        ctx.closePath();
                                    }
                                }

                            }
                        });
                    });

                    ctx.restore();
                }
            }]
        };

        // Render the chart to a buffer (single image for all vehicles)
        const image = await chartJSNodeCanvas.renderToBuffer(configuration);
        
        // Set the content type and return the image as PNG
        res.set('Content-Type', 'image/png');
        res.send(image);
        
    } catch (error) {
        console.error('Error generating chart:', error);
        res.status(500).json({ message: 'Error generating chart', error });
    }
});

// Helper function to create chart configuration
const createChartConfig = (labels, data) => {
  return {
    type: 'bar', // You can choose 'line' or 'bar' or any other chart type
    data: {
      labels: labels, // X-axis labels (number of vehicles)
      datasets: [{
        label: 'Average Time Taken (in seconds)',
        data: data, // Y-axis data (average time taken)
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Customize as per your needs
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Number of Vehicles',
            font: {
              size: 16
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Average Time Taken (in seconds)',
            font: {
              size: 16
            }
          },
          beginAtZero: true
        }
      }
    }
  };
};

//Generates and returns chart for user solutions
app.get('/user-solutions-chart/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Find all problems associated with the user
    const problems = await Problem.find({ usersid: userId }).select('solution');
    if (problems.length === 0) {
      return res.status(404).json({ message: 'No problems found for this user' });
    }

    // Flatten the solutions from all problems into a single array
    const solutions = problems
    .filter(problem => 
      (Array.isArray(problem.solution) && 
      problem.solution?.length === 1 && 
      problem.solution[0] != "No solution found. Try different parameters." &&
      Array.isArray(problem.solution[0].routes))
    )
    .flatMap(problem => problem.solution[0]);

    if (solutions.length === 0) {
      return res.status(404).json({ message: 'No solutions found for this user' });
    }

    // Group solutions by number of vehicles and calculate average time_taken
    const groupedSolutions = solutions.reduce((acc, solution) => {
      const numVehicles = solution.routes.length;
      if (!acc[numVehicles]) {
        acc[numVehicles] = { total_time: 0, count: 0 };
      }
      acc[numVehicles].total_time += solution.time_taken;
      acc[numVehicles].count++;
      return acc;
    }, {});

    // Calculate average time_taken for each number of vehicles
    const averageTimes = Object.entries(groupedSolutions).map(([numVehicles, { total_time, count }]) => ({
      vehicles: parseInt(numVehicles),
      average_time_taken: total_time / count
    }));

    // Sort data by the number of vehicles
    averageTimes.sort((a, b) => a.vehicles - b.vehicles);

    // Prepare data for chart
    const labels = averageTimes.map(item => item.vehicles); // X-axis: number of vehicles
    const data = averageTimes.map(item => item.average_time_taken); // Y-axis: average time taken

    // Create the chart configuration
    const configuration = createChartConfig(labels, data);

    // Generate the chart as a buffer
    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    // Set the response type as image/png and send the chart image
    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error fetching user solutions:', error);
    res.status(500).json({ message: 'Error fetching user solutions', error });
  }
});

// Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });