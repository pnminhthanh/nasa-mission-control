const axios = require('axios');

const launches = require('./launches.mongo')
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function saveLaunch(launch) {
    try {
        await launches.findOneAndUpdate({
            flightNumber: launch.flightNumber
        }, launch, {
            upsert: true
        })
    } catch (error) {
        console.error(error)
    }
}

async function populateDatabase() {
    try {
        console.log('Downloading launches data...')
        const response = await axios.post(SPACEX_API_URL, {
            query: {},
            options: {
                pagination: false,
                populate: [
                    {
                        path: 'rocket',
                        select: {
                            name: 1
                        }
                    },
                    {
                        path: 'payloads',
                        select: {
                            customers: 1
                        }
                    }
                ]
            }
        });

        if (response.status !== 200) {
            console.error('Problem downloading launches data')
            throw new Error('Error downloading launches data')
        }

        const launchDocs = response.data.docs;
        launchDocs.forEach(launchDoc => {
            const payloads = launchDoc['payloads'];
            const customer = payloads.flatMap((payload) => {
                return payload['customers'];
            })
            const launch = {
                flightNumber: launchDoc['flight_number'],
                mission: launchDoc['name'],
                rocket: launchDoc['rocket']['name'],
                launchDate: launchDoc['date_local'],
                upcoming: launchDoc['upcoming'],
                success: launchDoc['success'],
                customers: customer,
            }
            saveLaunch(launch)
        });
        console.log('Finish download launches data!')
    } catch (error) {
        console.log(error)
    }
}

async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });
    if (firstLaunch) {
        console.log('Launch data already loaded');
    } else {
        await populateDatabase();
    }
}

async function findLaunch(filter) {
    return await launches.findOne(filter)
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId
    });
}

async function getAllLaunches(skip, limit) {
    return await launches
        .find({}, { '_id': 0, '__v': 0 })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);
}

async function getLatestFlightNumber() {
    const launch = await launches
        .findOne()
        .sort('-flightNumber');

    if (!launch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return launch.flightNumber;
}


async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    })

    if (!planet) {
        throw new Error('No matching planet found!')
    }

    const latestLaunchNumber = (await getLatestFlightNumber()) + 1;

    const newLaunch = Object.assign(launch, {
        upcoming: true,
        success: true,
        customers: ['ZTM', 'NASA'],
        flightNumber: latestLaunchNumber
    })

    await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
    const aborted = await launches.updateOne({
        flightNumber: launchId
    },
        {
            upcoming: false,
            success: false
        }
    )
    return aborted.modifiedCount === 1;
}

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
    loadLaunchesData
}