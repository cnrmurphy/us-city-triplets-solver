import fs from 'node:fs';

export default async function readCityData(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(__dirname + '/US.txt');
        let result: string[] = [];
        readStream.on('data', (chunk) => {
            const parsed = chunk.toString();
            if (parsed.includes('\n')) {
                const lines = parsed.split('\n');
                for (const line of lines) {
                    const parts = line.split('\t');
                    const name = parts[1];
                    if (name && name.trim().replace(' ', '').replace('-', '').replace('.', '').length === 9) {
                        result.push(name);
                    }
                }
            }
        });
        readStream.on('end', () => {
            resolve(result);
        });
    });
}
