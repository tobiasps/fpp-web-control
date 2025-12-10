class Logger {
    debug(message: any)  {
        this.log(message, 'DEBUG')
    }

    info(message: any)  {
        this.log(message, 'INFO')
    }

    error(message: any) {
        this.log(message, 'ERROR')
    }

    protected log(message: any, level?: string) {
        const timestamp = new Date().toISOString();

        switch (level || 'INFO') {
            case 'DEBUG':
                console.debug(`${timestamp} [${level}] ${message}`)
                break
            case 'ERROR':
                console.log(`${timestamp} [${level}] ${message}`)
                break
            case 'INFO':
            default:
                console.log(`${timestamp} [${level}] ${message}`)
                break
        }
    }
}

export default new Logger()