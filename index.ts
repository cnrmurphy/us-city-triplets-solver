import axios, { all } from 'axios';
import jsdom from 'jsdom';

import readyCityData from './readyCityData';

async function getUSCitiesData() {
    const url = 'https://www.majorcitiesofworld.com/list-of-cities-in-united-states-of-america/';
    const response = await axios.get(url);
    const dom = new jsdom.JSDOM(response.data);
    const table = dom.window.document.querySelector('tbody');
    if (!table || !table.children) throw new Error('data table not iterable');
    const cells = table.querySelectorAll('td');
    const cities: string[] = [];
    for (let i = 0; i < cells.length; i += 3) {
        if (cells[i].textContent && cells[i].textContent !== null) {
            cities.push(cells[i].textContent!);
        }
    }

    return cities;
}

async function getTripletSets() {
    const url = 'https://www.sporcle.com/games/THEJMAN/uscities_triples';
    const response = await axios.get(url);
    const dom = new jsdom.JSDOM(response.data);
    const tables = dom.window.document.querySelectorAll('.gametable-col');
    const tripletSets: string[][] = [];
    for (const table of tables) {
        const set: string[] = [];
        const cells = table.querySelectorAll('.d_extra');
        for (const cell of cells) {
            set.push(cell.textContent!);
        }
        tripletSets.push(set);
    }
    return tripletSets;
}

(async () => {
    console.time();
    const data = await readyCityData();
    const tripletSets = await getTripletSets();
    const solutions = new Set<string>();

    for (const city of data) {
        const lookup = [...city.replace(' ', '').replace('.', '').toUpperCase()];
        let triplet = '';
        let triplets: string[] = [];
        while (lookup.length) {
            const char = lookup.shift();
            if (!char) break;
            triplet += char;
            if (triplet.length === 3) {
                triplets.push(triplet);
                triplet = '';
            }
        }

        let isPotentialSolution = true;
        for (let i = 0; i < triplets.length; ++i) {
            const isMember = tripletSets[i].includes(triplets[i]);
            if (!isMember) {
                isPotentialSolution = false;
            }
        }
        if (isPotentialSolution) solutions.add(city);
    }
    console.log(solutions);
    console.timeEnd();
})();
