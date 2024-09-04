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

// endpoint where i can see all documents in the collection of the problem database
app.get('/problems', async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching problems', error });
  }
});


// endpoint where i can see the time needed for solution of a specific problem, run like this: ?id=YOUR_PROBLEM_ID
app.get('/problems/:id', async (req, res) => {
  const problemId = req.params.id;
  try {
    const problem = await Problem.findById(problemId).select('solution');
    if (problem) {
      const solution = problem.solution;
      if (solution.length === 0) {
        res.status(404).json({ message: 'Problem has not been solved yet' });
      } else {
        const timeTaken = solution.map(s => s.time_taken);
        res.json(timeTaken);
      }
    } else {
      res.status(404).json({ message: 'Problem not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching problem', error });
  }
});

//finds all problems and their solution time for a specific user
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

      if ((Array.isArray(problem.solution) && problem.solution.length === 1 && problem.solution[0] === "No solution found. Try different parameters.") || (problem.solution.length === 0)) {
        return;   
      }
      console.log(problem.solution);

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

        problem.solution.forEach(solution => {
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
    res.status(500).json({ message: 'Error fetching problems', error });
  }
});




// dummy chart endpoint, comment out the code below
/*app.get('/chart', async (req, res) => {
    try {
      const problems = await Problem.find();
      const labels = problems.map((_, index) => index + 1);
      const data = problems.map(problem => problem.solution.length);
  
      const configuration = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Number of Routes',
            data: data,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };
  
      const image = await chartJSNodeCanvas.renderToBuffer(configuration);
      res.set('Content-Type', 'image/png');
      res.send(image);
    } catch (error) {
      res.status(500).json({ message: 'Error generating chart', error });
    }
  });
  */

  // endpoint that gives a graph routes number - ascending order graph 
  app.get('/chart/:id', async (req, res) => {
    try {
        // Fetch the problem by ID
        const problem = await Problem.findById(req.params.id);

        if (!problem || !problem.solution || problem.solution.length === 0) {
            return res.status(404).json({ message: 'No solution found for this problem' });
        }

        // Extract routes from the problem's solution
        const routes = problem.solution[0].routes;

        if (!routes || routes.length === 0 || !routes[0].route || routes[0].route.length === 0) {
            return res.status(404).json({ message: 'No route data available to plot' });
        }

        // Log the route data to ensure it's correct
        console.log('Routes data:', routes[0].route);

        // Prepare data for the chart
        const data = routes[0].route.map((point, index) => ({ x: index, y: point }));

        const configuration = {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Routes',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom'
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };

        // Render the chart to a buffer
        const image = await chartJSNodeCanvas.renderToBuffer(configuration);
        res.set('Content-Type', 'image/png');
        res.send(image);
    } catch (error) {
        console.error('Error generating chart:', error);
        res.status(500).json({ message: 'Error generating chart', error });
    }
});



// endpoint that returns time taken and chart data (routes-ascending) order for a specific problem  
app.get('/problem-details/:id', async (req, res) => {
  const problemId = req.params.id;

  try {
    // Fetch the problem by ID
    const problem = await Problem.findById(problemId).select('solution');
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const solution = problem.solution;
    if (solution.length === 0) {
      return res.status(404).json({ message: 'Problem has not been solved yet' });
    }

    // Extract the time taken from the solution
    const timeTaken = solution.map(s => s.time_taken);

    // Extract routes from the solution for the chart
    const routes = solution[0].routes;
    if (routes.length === 0) {
      return res.status(404).json({ message: 'No routes available for the problem' });
    }

    // Prepare data for the chart
    const data = routes[0].route.map((point, index) => ({ x: index, y: point }));

    // Return time taken and chart data 
    // need to add cost, submission date, and change the chartData to actual data
    const response = {
      timeTaken: timeTaken,
      chartData: data
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching problem details', error });
  }
});

// data for chart: average time taken for each number of vehicles used by a user
app.get('/user-solutions/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Find all problems associated with the user
    const problems = await Problem.find({ usersid: userId }).select('solution');
    if (problems.length === 0) {
      return res.status(404).json({ message: 'No problems found for this user' });
    }

    // Flatten the solutions from all problems into a single array
    const solutions = problems.flatMap(problem => problem.solution);

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

    res.json(averageTimes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user solutions', error });
  }
});

// endpoint that uses index.html to load time taken and chart
app.get('/statistics', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
}); 
// Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });