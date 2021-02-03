/**
 * 
 */

const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const PORT = process.env.PORT || 5000

const rawBodyBuffer = (req, res, buf, encoding) => {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8')
    }
}

app.use(
    bodyParser.urlencoded({
        verify: rawBodyBuffer,
        extended: true
    })
)

app.use(
    bodyParser.json(
        {
            verify: rawBodyBuffer
        }
    )
)

const server = app.listen(PORT)
console.log(`Running on port: ${PORT}`)

const updateMessage = (system, previousVersion, updatedVersion, reasoning) => {
    return {
        response_type: 'in_channel',
        blocks: [
            {
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `:shipit: *${system} updated !*`
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*From* version *${previousVersion}* to *${updatedVersion}*`
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*Reason*: ${reasoning}`
                        }
                    }
                ]
            }
        ]
    }
}

const errorMessage = (error) => {
    return {
        response_type : 'in_channel',
        blocks: [
            {
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*An error occured*"
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "plain_text",
                            "text": `:cry: ${error}`,
                            "emoji": true
                        }
                    }
                ]
            }
        ]
    }
}

app.post('/update', async (req, res) => {
    const query = req.body.text

    if (!query) {
        const message = errorMessage('The message you sent was empty. Please try again.')
        res.json(message)
        return
    }

    const queries = query.split(',')

    const system = queries[0]
    if(!system) {
        const message = errorMessage('You need to include the name of the updated system. Please try again.')
        res.json(message)
        return
    }

    const previousVersion = queries[1]
    if(!previousVersion) {
        const message = errorMessage('You need to include the previous version of the app. Please try again.')
        res.json(message)
        return
    }

    const updatedVersion = queries[2]
    if(!updatedVersion) {
        const message = errorMessage('You need to include the new version of the app. Please try again.')
        res.json(message)
        return
    }

    const reasoning = queries[3]
    if(!reasoning) {
        const message = errorMessage('You need to include the reasoning / description of the update. Please try again.')
        res.json(message)
        return
    }

    const message = updateMessage(system, previousVersion, updatedVersion, reasoning)
    res.json(message)
})

