import axios from 'axios';
import * as fs from 'fs';

import * as util from 'util';

const writeFile = util.promisify(fs.writeFile);

/**
 * Query to fetch donor data from Dune Analytics
 *
  with base_table as (
    select
        blockchain,
        block_time,
        tx_hash,
        dest,
        donor,
        symbol,
        amount_raw,
        amount_usd,
        amount_eth,
        grant_round
    from query_2348452
    where grant_round != 'Others'
      and amount_usd is not null
      and amount_eth is not null
  )

  select
    donor as donor_address,
    count(tx_hash) as total_donations,
    sum(amount_usd) as total_donated_usd
  from base_table
  where blockchain = 'ethereum'
  group by donor
 */

const DUNE_API_KEY = 'your-dune-api-key'; // replace with your dune api key
const DUNE_ETH_DONOR_ADDRESS_URL =
  'https://api.dune.com/api/v1/query/3539974/results';

async function getDonorList(limit: number, offset: number): Promise<any> {
  const url = DUNE_ETH_DONOR_ADDRESS_URL + `?limit=${limit}&offset=${offset}`;

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
    console.log(error);
    throw new Error('Failed to fetch donor list');
  }
}

async function getGitcoinDonor(): Promise<void> {
  const entities = [];
  const limit = 1000;
  let offset = 0;
  let { rows, metadata } = await getDonorList(limit, offset);

  for (;;) {
    if (!rows || rows.length === 0 || !metadata) {
      break;
    }

    if (entities.length < metadata.total_row_count) {
      for (const row of rows) {
        const ownerEntity = {
          address: row.donor_address,
          total_donated_usd: row.total_donated_usd,
          total_donations: row.total_donations,
          blockchain: 'ethereum',
        };
        entities.push(ownerEntity);
      }
    }

    offset = offset + limit;
    const result = await getDonorList(limit, offset);
    rows = result.rows;
    metadata = result.metadata;
  }

  const csvData = ['address,total_donated_usd,total_donations,blockchain'];
  for (const entity of entities) {
    const csvRow = `${entity.address},${entity.total_donated_usd},${entity.total_donations},${entity.blockchain}`;
    csvData.push(csvRow);
  }
  const csvContent = csvData.join('\n');
  await writeFile('output.csv', csvContent, 'utf8');
}

async function main() {
  try {
    await getGitcoinDonor();
    console.log('CSV file created successfully.');
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

main();
