import json
import os
import sys
import time
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from math import radians, sin, cos, sqrt, atan2
import pika

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great-circle distance between two points on the Earth's surface."""
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = 6371 * c  # Earth radius in kilometers
    return int(round(1000 * distance))

def calculate_distance_matrix(locations):
    """Calculate distance matrix based on Manhattan distance."""
    num_locations = len(locations)
    distance_matrix = [[0]*num_locations for _ in range(num_locations)]

    for i in range(num_locations):
        for j in range(num_locations):
            lat1, lon1 = locations[i]['Latitude'], locations[i]['Longitude']
            lat2, lon2 = locations[j]['Latitude'], locations[j]['Longitude']
            distance_matrix[i][j] = haversine_distance(lat1, lon1, lat2, lon2)
    return distance_matrix

def create_data_model(locations, num_vehicles, depot):
    """Stores the data for the problem."""
    data = {}
    data["distance_matrix"] = calculate_distance_matrix(locations)
    #print(data)
    data["num_vehicles"] = num_vehicles
    data["depot"] = depot
    return data

def return_solution(data, manager, routing, solution, time_taken):
    print('in return solution')
    """Returns solution as a dictionary."""
    results = {
        'objective': solution.ObjectiveValue(),
        'routes': [],
        'max_route_distance': 0,
        'time_taken': time_taken
    }
    
    for vehicle_id in range(data["num_vehicles"]):
        route_info = {
            'vehicle_id': vehicle_id,
            'route': [],
            'distance': 0
        }
        index = routing.Start(vehicle_id)
        while not routing.IsEnd(index):
            route_info['route'].append(manager.IndexToNode(index))
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_info['distance'] += routing.GetArcCostForVehicle(previous_index, index, vehicle_id)
        route_info['route'].append(manager.IndexToNode(index))  # add the depot end
        results['routes'].append(route_info)
        results['max_route_distance'] = max(route_info['distance'], results['max_route_distance'])
    
    return results


def main_solver(locations, num_vehicles, depot, max_distance):
    print(max_distance)
    # Instantiate the data problem.
    data = create_data_model(locations, num_vehicles, depot)
    # Create the routing index manager.
    manager = pywrapcp.RoutingIndexManager(
        len(data["distance_matrix"]), data["num_vehicles"], data["depot"]
    )

    # Create Routing Model.
    routing = pywrapcp.RoutingModel(manager)

    # Create and register a transit callback.
    def distance_callback(from_index, to_index):
        """Returns the distance between the two nodes."""
        # Convert from routing variable Index to distance matrix NodeIndex.
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data["distance_matrix"][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)

    # Define cost of each arc.
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Add Distance constraint.
    dimension_name = "Distance"
    routing.AddDimension(
        transit_callback_index,
        0,  # no slack
        max_distance,  # vehicle maximum travel distance
        True,  # start cumul to zero
        dimension_name,
    )
    distance_dimension = routing.GetDimensionOrDie(dimension_name)
    distance_dimension.SetGlobalSpanCostCoefficient(100)

    # Setting first solution heuristic.
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    print('starting time')
    #start_time = time.time()
    # Solve the problem.
    solution =routing.SolveWithParameters(search_parameters)
    #end_time = time.time()
    print('finisging time')
    sys.stdout.flush() 
    time_taken = 0 #end_time - start_time
    if solution:
        result_dict = return_solution(data, manager, routing, solution, time_taken)
    else:
        print("No solution found.")
        result_dict = None

    return result_dict
