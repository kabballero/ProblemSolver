# NTUA ECE SAAS 2024 PROJECT
  
## TEAM 11

Στην παρούσα εργασία ζητείται η ανάπτυξη μιας δικτυακής εφαρμογής λογισμικού που θα παρέχεται ως υπηρεσία (SaaS), το solveMyProblem. Με δεδομένες τις απαιτήσεις και τα ζητούμενα use cases, μας ζητείται η υλοποίηση μιας εφαρμογής, μέσω της οποίας χρήστες θα υποβάλλουν (δυνητικά) απαιτητικά προβλήματα της βιβλιοθήκης ORTools. Δηλαδή θα προσφέρεται η υπηρεσία εκτέλεσης των προβλημάτων και, ανάλογα με τους απαιτούμενους πόρους για το εκάστοτε πρόβλημα, θα χρεώνεται ο χρήστης. 
Ειδικότερα τα use cases είναι τα εξής: 
* Διαχείριση χρηστών
* Είσοδος με λογαριασμό Google
* Αγορά credits
* Υποβολή προβήματος προς επίλυση
* Διαχείριση εκτέλεσης της επίλυσης υποβληθέντων προβλημάτων
* Εμφάνιση λίστας προβλημάτων
* Εμφάνιση στατιστικών στοιχείων για την εκτέλεση/επίλυση προβλημάτων

Η υπηρεσία υλοποιεί την αρχιτεκτονική αρχή των microservices και γίνεται deployed μέσω Docker.

Το backend της εφαρμογής μας είναι υλοποιημένο με NodeJS και Python (το κομμάτι του solver για το ORTool πρόβλημα). Για το frontend χρησιμοποιήσαμε React, ενώ η επικοινωνία μεταξύ των microservices γίνεται μέσω RESTful APIs ή RabbitMQ.

##Φάκελοι

### (1) ai-log
Περιλαμβάνει καταγραφή της χρήσης εργαλειών ΑΙ στις φάσεις αρχιτεκτονική, σχεδίαση, κώδικας και deployment στα πλαίσια έρευνας του μαθήματος.

### (2) αρχιτεκτονική
Περιλαμβάνει τα uml diagrams που αντιστοιχούν στην υλοποίησή μας, τα οποία σχεδιάσαμε μέσω του Visual Paradigm.

### (3) code
Περιλαμβάνει τον κώδικα των microservices της εφαρμογής, καθώς και τα deployment scripts. Ειδικότερα έχουμε τα εξής:
* admin_ms: λειτουργικότητα του admin
* buy_ms: αγορά coins από τον χρήστη
* frontend_ms: το συνολικό frontend της εφαρμογής
* history_ms: λειτουργικότητα του ιστορικού
* login_ms: είσοδος χρηστών
* pay_ms: χρέωση του χρήστη
* solve_ms: επίλυση του προβλήματος
* statistics_ms: στατιστικά προβλημάτων για τον χρήστη
* submit_ms: υποβολή προβλήματος και επιστροφή λύσης

### (4) files
Περιλαμβάνει την εκφώνηση της εργασίας.

### (5) testing

### (6) data
Αρχεία εισόδου που αντιστοιχούν στο ORTool πρόβλημα Vehicle Routing Problem.
