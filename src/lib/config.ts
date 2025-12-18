interface ButtonConfig {
    name: string;
    type: 'sequence' | 'sequence-effect' | 'effect' | 'stop';
}

interface Config {
    port: number;
    FPPUrl: string;
    // 8 predefined buttons for the /control page
    sequences: ButtonConfig[];
}

const config: Config = {
    port: parseInt(process.env.FPPCONTROL_SERVER_PORT || '8080', 10),
    FPPUrl: process.env.FPP_URL || 'http://fpp.local',
    // Adjust these as you like: type can be 'sequence' or 'effect'
    sequences: [
        { name: 'fire',          type: 'sequence' },
        { name: 'blandet',       type: 'sequence' },
        { name: 'Plasma Parts',  type: 'sequence' },
        { name: 'bitchinparts',  type: 'sequence' },
        { name: 'shockwave',     type: 'sequence-effect' },
        { name: 'shock4',        type: 'effect'   },
        { name: 'Another Effect',type: 'effect'   },
        { name: 'stop',          type: 'stop' },
    ],
}

export default config;