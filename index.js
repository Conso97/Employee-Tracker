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

const departmentQuestions = [
    {
        type: "input",
        message: "What is the name of the department?",
        name: "departmentName" 
    }
];

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


function askUserForAction() {
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
                return;
            default:
                console.log("Requested Action not recognized");
        }
    });
}

function viewEmployees() {

    db.query(`SELECT * FROM employees `, function(err, response) {

        console.table(response);
        return askUserForAction();
    });
}

function createEmployee() {
    db.query(`SELECT * FROM roles`, function(err, response) {

        console.table(response);
        var titles = [];
        for (var i = 0; i < response.length; i++) {
            titles.push(response[i].title);
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
            
            // get role details 
            var empRole = null;

            for (var i = 0; i < response.length; i++) {
                if (response[i].title === empResponse.employeeRole) {
                    empRole = response[i];
                }
            }

            var dbQuery = `INSERT INTO employees (first_name, last_name, title, department, salary, manager) VALUES (?, ?, ?, ?, ?, ?)`;
            db.query(dbQuery, 
                [
                    empResponse.firstName, empResponse.lastName, empResponse.employeeRole, 
                    empRole.department, empRole.salary, empResponse.employeeManager
                ]
                , function(err, response) {

                return askUserForAction();
            });
        });
    });
}

function updateEmployeeRole() {

    db.query(`SELECT * FROM employees`, function(err, response) {

        console.table(response);
        var names = [];
        for (var i = 0; i < response.length; i++) {
            names.push(response[i].first_name + ' ' + response[i].last_name);
        }

        db.query(`SELECT * FROM roles`, function(err, roleResponse) {

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
            .then((empResponse) => {
                var emp = null;

                for (var i = 0; i < response.length; i++) {
                    if (response[i].first_name + ' ' + response[i].last_name === empResponse.employeeToUpdate) {
                        emp = response[i];
                    }
                }
                console.log(emp);
            
                var newRole = null;
                for (var i = 0; i < roleResponse.length; i++) {
                    if (roleResponse[i].title === empResponse.updatedEmployeeRole) {
                        newRole = roleResponse[i];
                    }
                }
            
                var dbQuery = `UPDATE employees 
                  SET title = "${newRole.title}", department = "${newRole.department}", salary = ${newRole.salary} 
                  WHERE first_name = "${emp.first_name}" AND last_name = "${emp.last_name}" AND manager="${emp.manager}"`;
                console.log(dbQuery);
                db.query(dbQuery, function(err, response) {

                    return askUserForAction();
                });
            });
        });   
    });
}

function viewAllRoles() {
    db.query(`SELECT * FROM roles`, function(err, response) {

        console.table(response);
        return askUserForAction();
    });
}

function createRole() {
    //Get all existing departments 
    db.query(`SELECT * FROM departments`, function(err, response) {

        var depts = [];
        for (var i = 0; i < response.length; i++) {
            depts.push(response[i].name);
        }

        var roleDept = [{
            type: "list",
            message: "Which department does the role belong to?",
            choices: depts,
            name: "departmentForRole",
        }];

        //'inquirer.prompt' for department info 
        return inquirer
        .prompt(roleQuestions.concat(roleDept))
        .then((roleResponse) => {
            var dbQuery =  `INSERT INTO roles (title, department, salary) VALUES (?, ?, ?)`;
            db.query(dbQuery, 
                [roleResponse.roleName, roleResponse.departmentForRole, roleResponse.roleSalary]
                , function(err, res) {

                return askUserForAction();
            });
        });
    });


}

function viewAllDepartments() {
    db.query(`SELECT * FROM departments`, function(err, response) {

        console.table(response);
        return askUserForAction();
    });
    
}

function createDepartment() {

    //'inquirer.prompt' for department info 
    return inquirer
    .prompt(departmentQuestions)
    .then((response) => {

        var name = response.departmentName;

        //THEN INSERT INTO department () VALUES
        var dbQuery =  `INSERT INTO departments (name) VALUES (?)`;
        db.query(dbQuery, name, function(err, response) {

            return askUserForAction();
        });

    });
}


askUserForAction();
    // .then(() => {
    //     console.log("Exiting...");
    // })
    // .catch((error) => {
    //     console.log(error);
    //     if (error.isTtyError) {
    //     //Prompt couldn't be rendered in the current environment 
    //     } else {
    //     //Something else went wrong
    //     }
    // });