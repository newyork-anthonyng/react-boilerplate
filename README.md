# Getting started
```bash
# Clone repository
git clone --depth 1 https://github.com/newyork-anthonyng/react-boilerplate.git <YOUR_PROJECT_NAME>

# Download dependencies
npm run setup

# Set up environment variables
cp example.env .env

# Start mongodb
mongod --dbpath=/Users/<YOUR_USER_NAME>/data/db

# Start development server
npm run start
```

# Deploying
```bash
heroku create

git push heroku master
```
[See Heroku deployment documentation here.](https://devcenter.heroku.com/articles/deploying-nodejs)
