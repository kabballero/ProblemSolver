const express = require('express');
const mongoose = require('mongoose');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const Problem = require('./problem');
const dbConnection = require('./database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const width = 600; // width of the chart
const height = 400; // height of the chart
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

// Connect to the database
dbConnection.then(() => {
  console.log('Connected to the database.');
}).catch((error) => {
  console.error('Error connecting to the database:', error);
});

app.get('/problems', async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching problems', error });
  }
});

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

app.get('/chart', async (req, res) => {
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
  
  app.get('/chart/:id', async (req, res) => {
    try {
        // Assuming you have some logic to fetch the problem by id
        const problem = await Problem.findById(req.params.id);

        // Extract routes from the problem's solution
        const routes = problem.solution[0].routes;

        // Prepare data for the chart
        const data = routes[0].route.map((point, index) => [index, point]);

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

        const image = await chartJSNodeCanvas.renderToBuffer(configuration);
        res.set('Content-Type', 'image/png');
        res.send(image);
    } catch (error) {
        res.status(500).json({ message: 'Error generating chart', error });
    }
});



  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });