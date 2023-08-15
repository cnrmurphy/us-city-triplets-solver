use std::{fs, collections::HashSet};

fn main() {
    let locations = collect_locations();
    let triplets = get_triplets();
    let mut potential_solutions: HashSet<String> = HashSet::new();
    for location in locations {
        let (original, formatted) = location;
        let chunks = to_chunks(formatted, 3);
        assert!(chunks.len() == 3);
        let mut is_potential_solution = false;
        for (idx, chunk) in chunks.iter().enumerate() {
            if triplets[idx].contains(&chunk) {
                is_potential_solution = true;
            } else {
                is_potential_solution = false;
                break;
            }
        }

        if is_potential_solution {
            potential_solutions.insert(original);
        }
    }

    for ps in potential_solutions {
        println!("{ps}");
    }
}

pub fn to_chunks(str: String, chunk_size: usize) -> Vec<String> {
    let mut chunks: Vec<String> = Vec::new();
    let mut remaining = str;
    loop {
        match remaining.char_indices().nth(chunk_size) {
            Some((offset, _)) => {
                let (a, b) = remaining.split_at(offset);
                chunks.push(a.to_string());
                remaining = b.to_string();
            },
            None => {
                chunks.push(remaining);
                return chunks
            }
        }
    }
}

fn collect_locations() -> Vec<(String, String)> {
    let file_contents = fs::read_to_string("data/US.txt")
        .expect("could not open file");
    let lines = file_contents.lines();
    let mut matches: Vec<(String, String)> = Vec::new();

    for line in lines {
        let parts: Vec<&str> = line.split("\t").collect();
        let location = parts[2];
        let formatted = location.replace(" ", "")
            .replace(".", "")
            .replace("-", "")
            .to_uppercase();

        if formatted.len() == 9 {
            matches.push((location.to_string(), formatted.to_string()));
        }
    }
    matches
}

fn get_triplets() -> [Vec<String>; 3] {
    let response = reqwest::blocking::get("https://www.sporcle.com/games/THEJMAN/uscities_triples")
        .unwrap()
        .text()
        .unwrap();
    let mut result: [Vec<String>; 3] = [Vec::new(), Vec::new(), Vec::new()];
    let document = scraper::Html::parse_document(&response);
    let selector = scraper::Selector::parse(".gametable-col").unwrap();
    let cols = document.select(&selector).map(|x| x.inner_html());
    for (idx, col) in cols.enumerate() {
        let document = scraper::Html::parse_document(&col);
        let selector = scraper::Selector::parse(".d_extra").unwrap();
        let rows = document.select(&selector).map(|x| x.inner_html());
        for row in rows {
            result[idx].push(row);
        }
    }
    return result;
}

