const inquirer = require ("inquirer");

const mysql = require("mysql2")

const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: 'Malaika911',
      database: 'employee_db'
    }
);

// options of command line actions
const userActions = [
    {
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "Add Employee", 
            "Update Employee Role",
            "View All Roles",
            "Add Role",
            "View All Departments",
            "Add Department",
            "Quit"
        ],
        name: "selectAction",
    }
];

function viewEmployees() {

    db.query(`SELECT * FROM employees `, function(err, response) {

        console.table(response);
        return askUserForAction();
    });
}

function viewAllRoles() {
    db.query(`SELECT * FROM roles`, function(err, response) {

        console.table(response);
        return askUserForAction();
    });
}

function viewAllDepartments() {
    db.query(`SELECT * FROM departments`, function(err, response) {

        console.table(response);
        return askUserForAction();
    });
    
}

const askUserForAction = () => {
    return inquirer
    .prompt(userActions)
    .then((response) => {

        // Switch to correct action
        switch(response.selectAction) {
            case "View All Employees":
                return viewEmployees()
            case "Add Employee":
                return createEmployee();
            case "Update Employee Role":
                return updateEmployeeRole();
            case "View All Roles":
                return viewAllRoles();
            case "Add Role":
                return createRole();
            case "View All Departments":
                return viewAllDepartments();
            case "Add Department":
                return createDepartment();
            case "Quit":
                console.log("Exiting...");
                process.exit(0);
            default:
                console.log("Requested Action not recognized");
        }
    });
}

const roleQuestions = [
    {
        type: "input",
        message: "What is the name of the role?",
        name: "roleName" 
    },
    {
        type: "input",
        message: "What is the salary of the role?",
        name: "roleSalary" 
    }
];

function createRole() {
    //Get all existing departments 
    db.query(`SELECT * FROM departments`, function(err, response) {

        var depts = []; 
        for (var i = 0; i < response.length; i++) {
            depts.push(response[i].name); // save department names
        }

        var roleDept = [{
            type: "list",
            message: "Which department does the role belong to?",
            choices: depts,
            name: "departmentForRole",
        }];

        return inquirer
        .prompt(roleQuestions.concat(roleDept))
        .then((roleResponse) => {
            // add role details to the DB
            var dbQuery =  `INSERT INTO roles (title, department, salary) VALUES (?, ?, ?)`;
            db.query(dbQuery, 
                [roleResponse.roleName, roleResponse.departmentForRole, roleResponse.roleSalary]
                , function(err, res) {

                return askUserForAction();
            });
        });
    });
}

const departmentQuestions = [
    {
        type: "input",
        message: "What is the name of the department?",
        name: "departmentName" 
    }
];

function createDepartment() {

    //'inquirer.prompt' for department info 
    return inquirer
    .prompt(departmentQuestions)
    .then((response) => {

        var name = response.departmentName;

        //Add new department to database
        var dbQuery =  `INSERT INTO departments (name) VALUES (?)`;
        db.query(dbQuery, name, function(err, response) {

            if (err !== null) {
                console.log("Caught error: " + String(err));
                return;
            }

            return askUserForAction();
        });

    });
}

const employeeQuestions = [
    {
        type: "input",
        message: "What is the employee's first name?",
        name: "firstName" 
    },
    {
        type: "input",
        message: "What is the employee's last name?",
        name: "lastName" 
    },
];

function createEmployee() {
    // Get existing roles to display in command options
    db.query(`SELECT * FROM roles`, function(err, response) {

        if (err !== null) {
            console.log("Caught error: " + String(err));
            return;
        }

        var titles = [];
        for (var i = 0; i < response.length; i++) {
            titles.push(response[i].title); // select role titles
        }
        
        var employeeDetails = [
            {
                type: "list",
                message: "What is the employee's role?",
                choices: titles,
                name: "employeeRole",
            },
            {
                type: "list",
                message: "What is the employee's manager?",
                choices: [
                    "None",
                    "John Doe",
                    "Mike Chan", 
                    "Ashley Rodriquez",
                    "Kevin Tupik",
                    "Kunal Singh",
                    "Malia Brown"
                ],
                name: "employeeManager",
            }
        ];

        return inquirer
        .prompt(employeeQuestions.concat(employeeDetails))
        .then((empResponse) => {
            
            // get selected role details 
            var empRole = null;

            for (var i = 0; i < response.length; i++) {
                if (response[i].title === empResponse.employeeRole) {
                    empRole = response[i];
                }
            }

            employeeManager = empResponse.employeeManager !== 'None' ? empResponse.employeeManager : null;
            
            // Add new employee with role information to database
            var dbQuery = `INSERT INTO employees (first_name, last_name, title, department, salary, manager) VALUES (?, ?, ?, ?, ?, ?)`;
            db.query(dbQuery, 
                [
                    empResponse.firstName, empResponse.lastName, empResponse.employeeRole, 
                    empRole.department, empRole.salary, employeeManager
                ]
                , function(err, response) {
                
                    if (err !== null) {
                        console.log("Caught error: " + String(err));
                        return;
                    }

                    console.log(`Added ${empResponse.firstName} ${empResponse.lastName} to database`);
                    return askUserForAction();
            });
        });
    });
}

function updateEmployeeRole() {

    // Get existing employees to display in command options
    db.query(`SELECT * FROM employees`, function(err, empResponse) {

        if (err !== null) {
            console.log("Caught error: " + String(err));
            return;
        }

        console.table(empResponse);
        var names = [];
        for (var i = 0; i < empResponse.length; i++) {
            // display name as 'first_name second_name'
            names.push(empResponse[i].first_name + ' ' + empResponse[i].last_name);
        }

        // Get existing roles to display in command options
        db.query(`SELECT * FROM roles`, function(err, roleResponse) {

            if (err !== null) {
                console.log("Caught error: " + String(err));
                return;
            }

            var roles = [];
            for (var i = 0; i < roleResponse.length; i++) {
                roles.push(roleResponse[i].title);
            }
        
            var employeeUpdateQuestion = [
                {
                    type: "list",
                    message: "Which employee's name do you want to update?",
                    choices: names,
                    name: "employeeToUpdate",
                },
                {
                    type: "list",
                    message: "Which role do you want to assign the selected employee?",
                    choices: roles,
                    name: "updatedEmployeeRole" 
                }
            ];

            return inquirer
            .prompt(employeeUpdateQuestion)
            .then((inqEmpResponse) => {
                // Find selected employee information
                var emp = null;

                for (var i = 0; i < empResponse.length; i++) {
                    if (empResponse[i].first_name + ' ' + empResponse[i].last_name === inqEmpResponse.employeeToUpdate) {
                        emp = empResponse[i];
                    }
                }
            
                // Find selected role information
                var newRole = null;
                for (var i = 0; i < roleResponse.length; i++) {
                    if (roleResponse[i].title === inqEmpResponse.updatedEmployeeRole) {
                        newRole = roleResponse[i];
                    }
                }
            
                // update existing employee with newly selected role
                var dbQuery = `UPDATE employees 
                  SET title = "${newRole.title}", department = "${newRole.department}", salary = ${newRole.salary} 
                  WHERE first_name = "${emp.first_name}" AND last_name = "${emp.last_name}" AND manager="${emp.manager}"`;
                console.log(dbQuery);
                db.query(dbQuery, function(err, response) {
                    console.log("Updated Employee's role");
                    return askUserForAction();
                });
            });
        });   
    });
}

askUserForAction()
    .catch((error) => {
        console.log(error);
    });