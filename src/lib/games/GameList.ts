
export interface GameInfo {
    name: string;
    description: string;
    author: string;
    imageURL: string;
    url: string;
}


export const gameList: GameInfo[] = [
    {
        name: 'Tic-Tac-Toe ULTIMATE',
        description: 'Play the ultimate version of Tic-Tac-Toe!',
        author: 'rafalou38',
        imageURL: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Ultimate_tic-tac-toe_tie.png',
        url: '/play/ttt-ultimate',
    },
    {
        name: 'Tic-Tac-Toe',
        description: 'Play classic Tic-Tac-Toe!',
        author: 'rafalou38',
        imageURL: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Tictactoe.png',
        url: '/play/ttt',
    },
    {
        name: 'Clicker Race',
        description: 'The faster you click, the faster you win.',
        author: 'rafalou38',
        imageURL: '/images/game-thumbnails/click-race.png',
        url: '/play/click-race',
    },
    {
        name: 'Capture Wars',
        description: 'Battle to capture the most territories in this strategy game!',
        author: 'rafalou38',
        imageURL: '/images/game-thumbnails/capture.png',
        url: '/play/capture',
    },
    {
        name: 'Ship Battle',
        description: 'Engage in a naval battle in this classic game!',
        author: 'Aneyx',
        imageURL: '/images/game-thumbnails/battleship.png',
        url: '/play/batlleship',
    },
    {
        name: 'Shooter',
        description: 'Test your shooting skills in this action-packed game!',
        author: 'Aneyx',
        imageURL: '/images/game-thumbnails/Shooter.png',
        url: '/play/shooter',
    },
    {
        name: 'Puissance 4',
        description: 'Connect four in a row in this strategic game!',
        author: 'rafalou38',
        imageURL: '/images/game-thumbnails/p4.png',
        url: '/play/puissance4',
    },
];