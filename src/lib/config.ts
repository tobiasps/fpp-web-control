interface Config {
    port: number;
    FPPUrl: string;
    sequences: string[]; // 9 predefined sequence names for the /control page
}

const config: Config = {
    port: parseInt(process.env.FPPCONTROL_SERVER_PORT || '8080', 10),
    FPPUrl: process.env.FPP_URL || 'http://fpp.local',
    // Placeholder names; adjust via environment or edit as needed
    sequences: [
        'fire', 'blandet', 'Plasma Parts',
        'bitchinparts', 'shockwave', 'seq6',
        'seq7', 'seq8'
    ],
}

export default config;