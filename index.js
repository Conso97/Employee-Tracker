const inquirer = require ("inquirer");

const mysql = required("mysql2")

const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: 'password',
      database: 'classlist_db'
    }
);

function askUserForAction() {
inquirer
    .prompt([

    ])
    .then((response) => {

        // Switch to correct action
    })
}

