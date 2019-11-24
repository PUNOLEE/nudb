const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const app = express();
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "project3-nudb",
  insecureAuth: true,
  charset: "utf8mb4",
  multipleStatements: true
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});
app.use(cors());
app.get("/", (req, res) => {
  res.send("go to /menu to see courses");
});
app.get("/signin", (req, res) => {
  const { studentID, password } = req.query;
  const SELECT_CURRENT_STUDENT = `select * from student where Id=${studentID}`;
  connection.query(SELECT_CURRENT_STUDENT, (err, results) => {
    if (err) {
      return res.send({
        code: 400,
        failed: "Error ocurred!"
      });
    } else {
      if (results.length > 0) {
        if (results[0].Password === password) {
          return res.send({
            code: 200,
            success: "Login sucessfully!"
          });
        } else {
          return res.send({
            code: 201,
            success: "Wrong password!"
          });
        }
      } else {
        return res.send({
          code: 204,
          success: "Id does not exist!"
        });
      }
    }
  });
});
app.get("/courses", (req, res) => {
  const { studentID } = req.query;
  const SELECT_CURRENT_COURSE = `select * from transcript natural join uosoffering u inner join faculty f on u.InstructorId=f.Id natural join unitofstudy where StudId=${studentID}`;
  connection.query(SELECT_CURRENT_COURSE, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      return res.json({
        data: results
      });
    }
  });
});

app.get("/personal", (req, res) => {
  const { studentID } = req.query;
  const SELECT_CURRENT_PERSON = `select * from student where Id=${studentID}`;
  connection.query(SELECT_CURRENT_PERSON, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      return res.json({
        data: results[0]
      });
    }
  });
});

app.get("/save", (req, res) => {
  const { studentID, address, password } = req.query;
  const UPDATE_CURRENT_PERSON = `update student set Password='${password}',Address='${address}' where Id=${studentID}`;
  connection.query(UPDATE_CURRENT_PERSON, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send("Successfully saved!");
    }
  });
});

app.get("/currentCourses", (req, res) => {
  const { year, semester } = req.query;
  let SELECT_CURRENT_ENROLL_COURSES =
    "select * from uosoffering natural join unitofstudy ";
  if (semester === "Q1") {
    SELECT_CURRENT_ENROLL_COURSES += `where Semester>='${semester}' and Year=${year}`;
  } else {
    SELECT_CURRENT_ENROLL_COURSES += `where (Semester='${semester}' and Year=${year}) or (Year=${Number(
      year
    ) + 1} and Semester='Q1')`;
  }
  connection.query(SELECT_CURRENT_ENROLL_COURSES, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      return res.json({
        data: results
      });
    }
  });
});

app.get("/unfinishedCourses", (req, res) => {
  const { studentID, semester, year } = req.query;
  let SELECT_CURRENT_ENROLL_COURSES = `select * from transcript natural join unitofstudy where StudId=${studentID} AND Grade is null`;
  if (semester === "Q1") {
    SELECT_CURRENT_ENROLL_COURSES += ` and Semester>='${semester}' and Year>=${year}`;
  } else {
    SELECT_CURRENT_ENROLL_COURSES += ` and ((Semester='${semester}' and Year=${year}) or (Year=${Number(
      year
    ) + 1} and Semester>='Q1'))`;
  }
  connection.query(SELECT_CURRENT_ENROLL_COURSES, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      return res.json({
        data: results
      });
    }
  });
});

app.get("/enroll", (req, res) => {
  const { studentID, code, semester, year } = req.query;
  const ENROLL = `call enroll(?,?,?,?,@MESSAGE);select @MESSAGE;`;
  connection.query(
    ENROLL,
    [Number(studentID), code, semester, Number(year)],
    (err, results) => {
      if (err) {
        return res.send(err);
      } else {
        return res.json({
          data: results
        });
      }
    }
  );
});

app.get("/withdraw", (req, res) => {
  const { studentID, code, semester, year } = req.query;
  const WITHDRAW = `call withdraw(?,?,?,?,@MESSAGE);SELECT @MESSAGE,(select @warning from temp_mess) AS w;`;
  connection.query(
    WITHDRAW,
    [Number(studentID), code, semester, Number(year)],
    (err, results) => {
      if (err) {
        return res.send(err);
      } else {
        return res.json({
          data: results
        });
      }
    }
  );
});

app.listen(4000, () => {
  console.log(`server listening `);
});
