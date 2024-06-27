import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
  paper: {
    width: 'auto',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    [theme.breakpoints.up(620 + theme.spacing(6))]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(3)}px`,
  },
  avatar: {
    margin: theme.spacing(1),
    width: 192,
    height: 192,
    color: theme.palette.secondary.main,
  },
  form: {
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: `100%`,
  },
}));

const SignUp = () => {
  const classes = useStyles();
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            const myArray = [
              "women",
              "men"
            ];
            const img_gender = myArray[Math.floor(Math.random()*myArray.length)];
            const img_index = Math.floor(Math.random() * 100) + 1 ;
            const img_url = 'https://randomuser.me/api/portraits/' + img_gender + '/' + img_index.toString() + '.jpg';

            registerUser(username, email, password, latitude, longitude, img_url);
          },
          (error) => {
            console.error('Error getting location:', error);
            registerUser(username, email, password); // Register without location if location is denied
          }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      registerUser(username, email, password); // Register without location if geolocation is not supported
    }
  }

  const registerUser = (username, email, password, latitude, longitude, img_url) => {
    axios.post("https://3b57-155-33-133-48.ngrok-free.app/new-user", {
      username,
      email,
      password,
      geolocation: { latitude, longitude },
      img_url: img_url
    })
        .then((response) => {
          console.log('User registered:', response.data);
          saveSession(response.data); //
          history.push('/dashboard'); // Redirect to home page after successful registration
        })
        .catch((error) => {
          console.error('Error registering user:', error);
        });
  };

  const saveSession = (data) => {
    const sessionData = {
      userId: data.username,
      location: data.geolocation,
      inserted_id: data.inserted_id
    };
    localStorage.setItem('user', JSON.stringify(sessionData));
  };

  return (
      <React.Fragment>
        <Paper className={classes.paper} elevation={6}>
          <div className={classes.container}>
            <Typography component="h1" variant="h5">
              {'Register to Play'}
            </Typography>
            <form className={classes.form} onSubmit={handleSubmit} noValidate>
              <TextField
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label={'Username'}
                  name="username"
                  autoComplete="username"
                  autoFocus
              />
              <TextField
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label={'E-Mail'}
                  name="email"
                  autoComplete="email"
              />
              <TextField
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label={'Password'}
                  type="password"
                  id="password"
                  autoComplete="current-password"
              />
              <TextField
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password_confirm"
                  label={'Confirm Password'}
                  type="password"
                  id="password_confirm"
                  autoComplete="current-password"
              />
              <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
              >
                {'Send my current location'}
              </Button>
            </form>
          </div>
        </Paper>
      </React.Fragment>
  );
};

export default SignUp;
