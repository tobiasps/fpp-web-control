interface ButtonConfig {
    title: string;
    name: string;
    color?: string;
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
        { title: 'Default',             name: 'hvid',              type: 'sequence', color: '#999'},
        { title: 'Shockhvid',           name: 'shockhvid',         type: 'sequence-effect', color: '#999' },
        { title: 'Sommer i DK - Salsa', name: 'color_red_sparkle', type: 'sequence', color: 'darkred' },
        { title: 'Sexy Slange',         name: 'greenyellow',       type: 'sequence', color: 'darkgreen' },
        { title: 'Voksentøj',           name: 'redmagenta',        type: 'sequence', color: 'darkmagenta' },
        { title: 'Problemer',           name: 'hvidturkis',        type: 'sequence', color: 'darkturquoise' },
        { title: 'Spejlet',             name: 'pinkyellow',        type: 'sequence', color: 'gold' },
        { title: 'Orden og Lov',        name: 'fire',              type: 'sequence', color: 'darkorange' },
        { title: 'Du En Pige',          name: '178bank',           type: 'sequence', color: 'darkred' },
        { title: 'Natten er vores',     name: 'natten',            type: 'sequence', color: 'darkblue' },
        { title: 'Bitchin Betjent',     name: 'bitchin',           type: 'sequence', color: 'blue' },
        { title: 'Stop',                name: 'stop',              type: 'stop' },
    ],
}

export default config;