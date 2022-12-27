const {
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById
} = require('../../models/launches.model');

async function httpGetAllLaunches(req, res) {
    return res.status(200).json(await getAllLaunches())
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;

    if (!launch.mission || !launch.rocket
        || !launch.target || !launch.launchDate) {
        return res.status(400).json({
            error: "Missing required launch property",
        })
    }

    launch.launchDate = new Date(launch.launchDate);

    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'Invalid launch date',
        })
    }

    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const launchId = Number(req.params.id);

    const existedLaunch = await existsLaunchWithId(launchId)

    if (!existedLaunch) {
        return res.status(404).json({
            error: 'Launch not found',
        })
    }

    const aborted = abortLaunchById(launchId)
    if (!aborted) {
        return res.status(400).json({
            error: 'Launch is not aborted!'
        })
    }

    return res.status(200).json({
        ok: true
    });
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}