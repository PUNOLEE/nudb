# nudb
main page: http://localhost:3000/signin
 ## Current Code
The current code is isolated in two separate folders
* client - The front-end react-app
* backend - The backend nodeJS service.

## To run the code
Make sure that you have npm and nodejs installed in your computer.

Make sure that you run ` ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456'; ` in mysql.
## 1. ReactJS Front-End App
### enter project folder
```
cd client
```
### install dependencies:
```
npm install
```
### start
```
npm start
```
## 2. NodeJS Back-End Service
### enter project folder
```
cd backend
```
### install dependencies:
```
npm install
```

### start
```
node index.js
```
