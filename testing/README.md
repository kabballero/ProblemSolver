# Testing folder

Based on the stress testing results, solveME works perfectly for a load of up to around 200 users. 

The api calls that were tested (with up to 200 threads) were related to browsing the frontend (fetching the statistics table, 
fetching the statistics graph, fetching the history of submitted problems), paying with credits, buying credits, logging in and submitting problems.

The test script can be run from the cli of JMeter like this: $ jmeter -n -t solveME_stress_tests.jmx -l solveME_stress_tests.jtl

Apache JMeter can be downloaded here: https://jmeter.apache.org/download_jmeter.cgi

It requires Java 8+. The executable .bat script can be found in a location similar to: apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat
