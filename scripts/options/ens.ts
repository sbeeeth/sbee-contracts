import axios from 'axios';
import * as fs from 'fs';

import * as util from 'util';

const writeFile = util.promisify(fs.writeFile);

/**
 * Query to fetch ENS data from Dune Analytics
 *
  select
   distinct address,name as unique_set_user
  from ens.set_name_latest
 */

const DUNE_API_KEY = 'your-dune-api-key'; // replace with your dune api key
const DUNE_ENS_URL = 'https://api.dune.com/api/v1/query/3540409/results';

async function getEnsList(limit: number, offset: number): Promise<any> {
  const url = DUNE_ENS_URL + `?limit=${limit}&offset=${offset}`;

  const apiKey = DUNE_API_KEY;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-Dune-API-Key': apiKey,
        accept: 'application/json',
      },
    });

    const { rows, metadata } = response.data?.result;

    return { rows, metadata };
  } catch (error) {
    throw new Error('Failed to fetch ens list');
  }
}

async function getEns(): Promise<void> {
  const entities = [];
  const limit = 2000;
  let offset = 0;

  let { rows, metadata } = await getEnsList(limit, offset);

  for (;;) {
    if (!rows || rows.length === 0 || !metadata) {
      break;
    }

    if (entities.length < metadata.total_row_count) {
      for (const row of rows) {
        const ownerEntity = {
          name: row.unique_set_user,
          address: row.address,
        };

        entities.push(ownerEntity);
      }
    }

    offset = offset + limit;
    const result = await getEnsList(limit, offset);
    rows = result.rows;
    metadata = result.metadata;
  }

  const csvData = ['name,address'];
  for (const entity of entities) {
    const csvRow = `${entity.name},${entity.address}`;
    csvData.push(csvRow);
  }
  const csvContent = csvData.join('\n');
  await writeFile('output.csv', csvContent, 'utf8');
}

async function main() {
  try {
    await getEns();
    console.log('CSV file created successfully.');
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

main();
