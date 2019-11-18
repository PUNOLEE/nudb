import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Paper from "@material-ui/core/Paper";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Checkbox from "@material-ui/core/Checkbox";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import { BrowserRouter, Route, Redirect, Link } from "react-router-dom";
const axios = require("axios");
const moment = require("moment");

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300
  },
  paperRoot: {
    width: "100%",
    maxWidth: 500,
    minWidth: 200,
    backgroundColor: theme.palette.background.paper
  },
  block: {
    display: "block"
  },
  inline: {
    display: "inline"
  }
}));

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Route exact path="/">
          <div />
        </Route>
        <div className="signin">
          <Route path="/signin" component={Signin} />
        </div>
        <div className="menu">
          <Route path="/menu" component={MyMenu} />
          <Route path="/menu/transcript" component={Transcript} />
          <Route path="/menu/personal" component={Personal}></Route>
          <Route path="/menu/enroll" component={Enroll}></Route>
          <Route path="/menu/withdraw" component={Withdraw}></Route>
        </div>
      </div>
    </BrowserRouter>
  );
}

function Signin() {
  const classes = useStyles();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(false);
  const handleSignin = () => {
    axios
      .get(`http://localhost:4000/signin?studentID=${id}&password=${password}`)
      .then(function(response) {
        // handle success
        setMessage(response.data.success);
        if (response.data.code === 200) {
          setRedirect(true);
        }
      })
      .catch(function(error) {
        // handle error
        setMessage(error.data.failed);
      });
  };
  return (
    <>
      {redirect ? (
        <Redirect to={{ pathname: "/menu", state: { id: id } }} />
      ) : (
        <form className={classes.container} noValidate autoComplete="off">
          <TextField
            required
            id="standard-required"
            label="StudentID"
            margin="normal"
            className={classes.textField}
            value={id}
            onChange={e => setId(e.target.value)}
          />
          <TextField
            required
            id="standard-password-input"
            label="Password"
            type="password"
            margin="normal"
            className={classes.textField}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Typography variant="caption" color="secondary">
            {message}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSignin()}
          >
            Log In
          </Button>
        </form>
      )}
    </>
  );
}

function MyMenu(props) {
  const { location } = props;
  const id = location.state.id;
  const year = moment().year();
  const semester = moment([Number(moment().year()), 9, 1]).isBefore(moment())
    ? "Q2"
    : "Q1";
  return (
    <div className="menulist">
      <div className="header">
        <Typography variant="subtitle1">Current Semester:</Typography>
        <Typography variant="subtitle2">
          {year}
          {semester}
        </Typography>
      </div>
      <MenuList>
        <MenuItem>
          <Link to={{ pathname: "/menu/transcript", state: { id: id } }}>
            Transcript
          </Link>
        </MenuItem>
        <MenuItem>
          <Link
            to={{
              pathname: "/menu/enroll",
              state: { id: id, year: year, semester: semester }
            }}
          >
            Enroll
          </Link>
        </MenuItem>
        <MenuItem>
          <Link
            to={{
              pathname: "/menu/withdraw",
              state: { id: id, year: year, semester: semester }
            }}
          >
            Withdraw
          </Link>
        </MenuItem>
        <MenuItem>
          <Link to={{ pathname: "/menu/personal", state: { id: id } }}>
            Personal Details
          </Link>
        </MenuItem>
        <MenuItem>
          <Link to="/signin">Log out</Link>
        </MenuItem>
      </MenuList>
    </div>
  );
}

function Transcript(props) {
  const classes = useStyles();
  const { location } = props;
  const [transcript, setTranscript] = useState([]);
  useEffect(() => {
    axios
      .get(`http://localhost:4000/courses?studentID=${location.state.id}`)
      .then(function(response) {
        // handle success
        setTranscript(response.data.data);
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  }, [location]);
  return (
    <List className={classes.paperRoot}>
      {transcript.length !== 0
        ? transcript.map(
            ({
              UoSCode,
              UoSName,
              Year,
              Semester,
              Enrollment,
              MaxEnrollment,
              Name,
              Grade
            }) => {
              return (
                <ListItem alignItems="flex-start" key={UoSCode}>
                  <ListItemText
                    primary={`${UoSCode} ${UoSName} , ${Year} , ${Semester}`}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                        >
                          {`Instructor Name: ${Name}`}
                        </Typography>
                        {`  Grade - ${Grade}`}
                        <Typography
                          component="span"
                          variant="body2"
                          className={classes.block}
                          color="textPrimary"
                        >
                          {` Enrollment: ${Enrollment} / ${MaxEnrollment}`}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              );
            }
          )
        : null}
    </List>
  );
}

function Enroll(props) {
  const classes = useStyles();
  const { location } = props;
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [checked, setChecked] = useState({});

  useEffect(() => {
    axios
      .get(
        `http://localhost:4000/currentCourses?year=${location.state.year}&semester=${location.state.semester}`
      )
      .then(function(response) {
        // handle success
        setCourses(response.data.data);
      })
      .catch(function(error) {
        // handle error
        setMessage(error);
      });
  }, [location]);

  const enroll = () => {
    if (Object.entries(checked).length === 0) {
      setMessage("You didn't select a class!");
    } else {
      axios
        .get(
          `http://localhost:4000/enroll?studentID=${location.state.id}&code=${checked.UoSCode}&year=${checked.Year}&semester=${checked.Semester}`
        )
        .then(function(response) {
          // handle success
          setMessage(response.data.data[1][0]["@MESSAGE"]);
        })
        .catch(function(error) {
          // handle error
          setMessage(error);
        });
    }
  };
  return (
    <div>
      <div className="page-header">
        <Typography variant="h6" className={classes.inline}>
          Enroll a class
        </Typography>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() => enroll()}
        >
          Confirm
        </Button>
      </div>
      <Typography variant="caption" color="secondary">
        {message}
      </Typography>
      <List className={classes.paperRoot}>
        {courses.length !== 0
          ? courses.map(
              ({
                UoSCode,
                UoSName,
                Enrollment,
                MaxEnrollment,
                Semester,
                Year
              }) => (
                <ListItem
                  key={`${UoSCode}-${Year}-${Semester}`}
                  dense
                  button
                  onClick={() => {
                    if (checked.UoSCode && checked.UoSCode === UoSCode) {
                      setChecked({});
                    } else {
                      setChecked({
                        UoSCode,
                        Year,
                        Semester
                      });
                    }
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={
                        checked.UoSCode === UoSCode &&
                        checked.Year === Year &&
                        checked.Semester === Semester
                      }
                      tabIndex={-1}
                      disableRipple
                      inputProps={{
                        "aria-labelledby": `checkbox-list-label-${UoSCode}-${Year}-${Semester}`
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${UoSCode} ${UoSName}, ${Year},${Semester}`}
                    secondary={`${Enrollment}/${MaxEnrollment}`}
                  />
                </ListItem>
              )
            )
          : null}
      </List>
    </div>
  );
}

function Withdraw(props) {
  const classes = useStyles();
  const { location } = props;
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [checked, setChecked] = useState({});

  useEffect(() => {
    axios
      .get(
        `http://localhost:4000/unfinishedCourses?studentID=${location.state.id}`
      )
      .then(function(response) {
        // handle success
        setCourses(response.data.data);
      })
      .catch(function(error) {
        // handle error
        setMessage(error);
      });
  }, [location]);

  const withdraw = () => {
    if (Object.entries(checked).length === 0) {
      setMessage("You didn't select a class!");
    } else {
      axios
        .get(
          `http://localhost:4000/withdraw?studentID=${location.state.id}&code=${checked.UoSCode}&year=${checked.Year}&semester=${checked.Semester}`
        )
        .then(function(response) {
          // handle success
          setMessage(response.data.data[1][0]["@MESSAGE"]);
        })
        .catch(function(error) {
          // handle error
          setMessage(error);
        });
    }
  };

  return (
    <div className="withdraw">
      <div className="page-header">
        <Typography variant="h6" className={classes.inline}>
          Withdraw a class
        </Typography>
        <Button variant="contained" color="primary" className={classes.button} onClick={() => withdraw()}>
          Confirm
        </Button>
      </div>
      <Typography variant="caption" color="secondary">
        {message}
      </Typography>
      <List className={classes.paperRoot}>
        {courses.length !== 0
          ? courses.map(({ UoSCode, UoSName, Semester, Year }) => (
              <ListItem
                key={UoSCode}
                dense
                button
                onClick={() => {
                  if (checked.UoSCode && checked.UoSCode === UoSCode) {
                    setChecked({});
                  } else {
                    setChecked({
                      UoSCode,
                      Year,
                      Semester
                    });
                  }}}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={
                      checked.UoSCode === UoSCode &&
                      checked.Year === Year &&
                      checked.Semester === Semester
                    }
                    tabIndex={-1}
                    disableRipple
                    inputProps={{
                      "aria-labelledby": `checkbox-list-label-${UoSCode}-${Year}-${Semester}`
                    }}
                  />
                </ListItemIcon>
                <ListItemText primary={`${UoSCode} ${UoSName}, ${Year},${Semester}`} />
              </ListItem>
            ))
          : null}
      </List>
    </div>
  );
}

function Personal(props) {
  const classes = useStyles();
  const { location } = props;
  const id = location.state.id;
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState("");
  const [info, setInfo] = useState({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    axios
      .get(`http://localhost:4000/personal?studentID=${location.state.id}`)
      .then(function(response) {
        // handle success
        setInfo(response.data.data);
        setLoaded(true);
        setPassword(response.data.data.Password);
        setAddress(response.data.data.Address);
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  }, [location]);
  const save = () => {
    axios
      .get(
        `http://localhost:4000/save?studentID=${location.state.id}&address=${address}&password=${password}`
      )
      .then(function(response) {
        // handle success
        setMessage(response.data);
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  };
  return (
    <Paper>
      <form className={classes.container} noValidate autoComplete="off">
        <TextField
          id="id-read-only-input"
          label="StudentID"
          margin="normal"
          className={classes.textField}
          value={id}
        />
        <TextField
          id="name-read-only-input"
          label="Name"
          margin="normal"
          className={classes.textField}
          value={loaded ? info.Name : ""}
        />
        <TextField
          id="standard-password-input"
          label="Password"
          type="password"
          margin="normal"
          className={classes.textField}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <TextField
          id="margin-normal"
          label="Address"
          margin="normal"
          className={classes.textField}
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
        <Typography variant="caption" color="secondary">
          {message}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => save()}>
          Save
        </Button>
      </form>
    </Paper>
  );
}
export default App;