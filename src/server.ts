import { createServer } from "http"
import logger from './lib/logger'
import config from './lib/config'
import app from "./app"

const httpServer = createServer(app)

httpServer.listen(config.port, () => {
    logger.info(`Listening on port ${config.port}`)
})
