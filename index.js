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
    console.log(req.body)
    if (!query) {
        const message = errorMessage('The message you sent was empty. Please try again.')
        res.json(message)
        return
    }

    const queries = query.split(',')

    const system = queries[0]
    const previousVersion = queries[1]
    const updatedVersion = queries[2]
    const reasoning = queries[3]

    const message = updateMessage(system, previousVersion, updatedVersion, reasoning)
    res.json(message)
})

