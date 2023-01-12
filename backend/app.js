const fs = require('fs');
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
mongoose.Promise = global.Promise;
const Goal = require('./models/goal');

const app = express();

const accessLogStream = fs.createWriteStream(
	path.join(__dirname, 'logs', 'access.log'),
	{ flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.json());

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.get('/backend/goals', async (req, res) => {
	console.log('TRYING TO FETCH GOALS');
	try {
		const goals = await Goal.find();
		res.status(200).json({
			goals: goals.map((goal) => ({
				id: goal.id,
				text: goal.text,
			})),
		});
		console.log('FETCHED GOALS');
	} catch (err) {
		console.error('ERROR FETCHING GOALS');
		console.error(err.message);
		res.status(500).json({ message: 'Failed to load goals.' });
	}
});

app.post('/backend/goals', async (req, res) => {
	console.log('TRYING TO STORE GOAL');
	const goalText = req.body.text;

	if (!goalText || goalText.trim().length === 0) {
		console.log('INVALID INPUT - NO TEXT');
		return res.status(422).json({ message: 'Invalid goal text.' });
	}

	const goal = new Goal({
		text: goalText,
	});

	try {
		await goal.save();
		res
			.status(201)
			.json({ message: 'Goal saved', goal: { id: goal.id, text: goalText } });
		console.log('STORED NEW GOAL');
	} catch (err) {
		console.error('ERROR FETCHING GOALS');
		console.error(err.message);
		res.status(500).json({ message: 'Failed to save goal.' });
	}
});

app.delete('/backend/goals/:id', async (req, res) => {
	console.log('TRYING TO DELETE GOAL');
	try {
		await Goal.deleteOne({ _id: req.params.id });
		res.status(200).json({ message: 'Deleted goal!' });
		console.log('DELETED GOAL');
	} catch (err) {
		console.error('ERROR FETCHING GOALS');
		console.error(err.message);
		res.status(500).json({ message: 'Failed to delete goal.' });
	}
});
async () => {
	console.log('Waiting to start connection...');
	await sleep(30000);
	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}
	console.log('wait over...');
};

var mongoUrl = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@mongodb:27017/course-goals?authSource=admin`;

var connectWithRetry = function () {
	return mongoose.connect(mongoUrl, function (err) {
		if (err) {
			console.error(
				'Failed to connect to mongo on startup - retrying in 5 sec',
				err
			);
			setTimeout(connectWithRetry, 5000);
		}
	});
};
connectWithRetry();
